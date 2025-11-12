import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '../constants/config'
import { logger } from '../utils/logger'
import { captureException, addBreadcrumb } from '../config/sentry'

// API响应统一格式
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 请求配置扩展（用于重试）
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
  _skipAuthRefresh?: boolean // 跳过认证刷新（避免死循环）
  _skipResponseInterceptor?: boolean // 跳过响应拦截器（用于Token刷新接口）
}

// Token刷新状态
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

// 创建Axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // 自动携带Cookie
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加CSRF token等
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    
    return config
  },
  (error) => {
    logger.error('Request error', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 如果请求标记了跳过响应拦截器，直接返回原始响应
    const config = response.config as RetryConfig
    if (config._skipResponseInterceptor) {
      return response
    }
    
    const data: ApiResponse = response.data
    
    // 统一处理业务错误码
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    // 返回修改后的response，使用data.data作为response.data
    response.data = data.data
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig

    // 自动重试逻辑（仅重试网络错误或5xx错误）
    if (config && shouldRetry(error)) {
      config._retryCount = config._retryCount || 0

      if (config._retryCount < API_CONFIG.RETRY_TIMES) {
        config._retryCount += 1
        
        // 延迟重试
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * (config._retryCount || 1))
        )

        logger.log(`Retrying request (${config._retryCount}/${API_CONFIG.RETRY_TIMES}):`, config.url)
        
        // 记录重试面包屑
        addBreadcrumb(`API Retry: ${config.url}`, 'http', {
          url: config.url,
          method: config.method,
          attempt: config._retryCount,
        })
        
        return apiClient.request(config)
      }
    }
    
    // 处理HTTP错误
    if (error.response) {
      const status = error.response.status
      
      switch (status) {
        case 401:
          // 尝试刷新token（仅对非登录页面）
          if (!window.location.pathname.includes('/login') && config && !config._skipAuthRefresh) {
            try {
              await handleTokenRefresh(config, error)
            } catch (refreshError) {
              // Token刷新失败，跳转到登录页
              logger.error('Token refresh failed, redirecting to login', refreshError)
              window.location.href = '/login'
            }
          } else if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
          break
        case 403:
          logger.warn('无权限访问', { url: config?.url, status })
          break
        case 404:
          logger.warn('请求资源不存在', { url: config?.url, status })
          break
        case 500:
          logger.error('服务器错误', error, { url: config?.url, status })
          captureException(error as Error, { url: config?.url, status })
          break
        case 502:
        case 503:
        case 504:
          logger.error('服务暂时不可用', error, { url: config?.url, status })
          break
        default:
          logger.error(`请求失败: ${status}`, error, { url: config?.url, status })
      }
    } else if (error.request) {
      logger.error('网络错误，请检查网络连接', error)
    } else {
      logger.error('请求配置错误', error)
    }
    
    return Promise.reject(error)
  }
)

// 判断是否应该重试
function shouldRetry(error: AxiosError): boolean {
  // 网络错误
  if (!error.response) {
    return true
  }

  // 5xx服务器错误
  const status = error.response.status
  if (status >= 500 && status < 600) {
    return true
  }

  // 429 请求过多（Rate Limit）
  if (status === 429) {
    return true
  }

  return false
}

// 处理Token刷新
async function handleTokenRefresh(config: RetryConfig, _error: AxiosError) {
  if (!isRefreshing) {
    isRefreshing = true
    
    try {
      // 调用刷新token接口（跳过响应拦截器以获取原始响应）
      const { data } = await apiClient.post('/auth/refresh', {}, {
        _skipResponseInterceptor: true,
        _skipAuthRefresh: true
      } as RetryConfig)
      
      // 此处data为原始ApiResponse格式
      if (data && data.code === 0) {
        // Token刷新成功，通知所有等待的请求
        isRefreshing = false
        onRefreshed(data.data.access_token)
        refreshSubscribers = []
        
        // 重新发送原请求
        config._skipAuthRefresh = true
        return apiClient.request(config)
      } else {
        throw new Error(data?.message || 'Token refresh failed')
      }
    } catch (refreshError) {
      isRefreshing = false
      refreshSubscribers = []
      throw refreshError
    }
  }
  
  // 如果正在刷新，将请求加入队列
  return new Promise((resolve, _reject) => {
    subscribeTokenRefresh((_token: string) => {
      config._skipAuthRefresh = true
      resolve(apiClient.request(config))
    })
  })
}

// 订阅Token刷新
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

// Token刷新完成，执行所有等待的请求
function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
}

export { apiClient }
export default apiClient
