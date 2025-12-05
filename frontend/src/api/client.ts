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
  _refreshAttempts?: number // Token刷新尝试次数
}

// Token刷新状态
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []
const MAX_REFRESH_ATTEMPTS = 3 // 最大刷新次数

// CSRF Token管理
let csrfToken: string | null = null

// 设置CSRF Token
function setCSRFToken(token: string) {
  csrfToken = token
  logger.log('CSRF Token set:', token)
}

// 获取CSRF Token
function getCSRFToken(): string | null {
  return csrfToken
}

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
    // 自动添加CSRF Token（对于修改类请求）
    const method = config.method?.toUpperCase()
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const token = getCSRFToken()
      if (token) {
        config.headers['X-CSRF-Token'] = token
      }
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
    // 捕获并存储服务器返回的CSRF Token
    const csrfTokenFromResponse = response.headers['x-csrf-token']
    if (csrfTokenFromResponse) {
      setCSRFToken(csrfTokenFromResponse)
    }
    
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
        case 501: {
          // 功能暂未实现
          logger.warn(`功能暂未实现: ${config?.url}`, { url: config?.url, status })
          // 从响应中获取hint字段作为替代方案
          const responseData = error.response?.data as { hint?: string; message?: string }
          const hint = responseData?.hint
          const message = responseData?.message || '功能暂未实现'
          
          // 触发全局toast事件（由App.tsx监听）
          window.dispatchEvent(new CustomEvent('global-toast', { 
            detail: { 
              type: 'warning', 
              message: hint ? `${message}（${hint}）` : message 
            } 
          }))
          
          // 同时将hint附加到error中，供页面级catch使用
          if (hint) {
            (error as Error & { hint?: string }).hint = hint
          }
          break
        }
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
  // 只重试幂等方法，避免重复提交写操作
  const method = error.config?.method?.toUpperCase()
  const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']
  
  if (!method || !idempotentMethods.includes(method)) {
    return false
  }
  
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
  // 检查刷新尝试次数，防止死循环
  config._refreshAttempts = (config._refreshAttempts || 0) + 1
  
  if (config._refreshAttempts > MAX_REFRESH_ATTEMPTS) {
    logger.error('Token refresh exceeded max attempts, redirecting to login')
    window.location.href = '/login'
    throw new Error('认证失败，请重新登录')
  }
  
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
        
        // 重置刷新计数器，重新发送原请求
        config._skipAuthRefresh = true
        config._refreshAttempts = 0 // 刷新成功后重置计数器
        return apiClient.request(config)
      } else {
        throw new Error(data?.message || 'Token refresh failed')
      }
    } catch (refreshError) {
      isRefreshing = false
      refreshSubscribers = []
      // 刷新失败后，如果达到最大尝试次数，直接跳转登录
      if (config._refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        logger.error('Token refresh failed after max attempts', refreshError)
        window.location.href = '/login'
      }
      throw refreshError
    }
  }
  
  // 如果正在刷新，将请求加入队列
  return new Promise((resolve, _reject) => {
    subscribeTokenRefresh((_token: string) => {
      config._skipAuthRefresh = true
      config._refreshAttempts = 0 // 刷新成功后重置计数器
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
