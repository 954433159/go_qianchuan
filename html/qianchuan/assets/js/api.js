/**
 * 千川平台统一 API 请求层
 * 提供 fetch 封装、超时控制、错误处理、重试逻辑
 * v2.0 - 2025-11-11
 */

// ========================================
// 配置常量
// ========================================
const API_CONFIG = {
  baseURL: 'https://api.oceanengine.com/open_api/qianchuan', // 千川 API 基础地址
  timeout: 30000, // 30秒超时
  retryCount: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
  mockMode: true // 是否启用 Mock 模式（开发环境）
};

// ========================================
// 错误类定义
// ========================================
class APIError extends Error {
  constructor(message, code, response) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.response = response;
    this.timestamp = new Date().toISOString();
  }
}

// ========================================
// 工具函数
// ========================================

/**
 * 带超时的 fetch
 */
function fetchWithTimeout(url, options, timeout = API_CONFIG.timeout) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new APIError('请求超时', 'TIMEOUT')), timeout)
    )
  ]);
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取 Access Token
 */
function getAccessToken() {
  return localStorage.getItem('qc_access_token') || '';
}

/**
 * 设置 Access Token
 */
function setAccessToken(token) {
  localStorage.setItem('qc_access_token', token);
}

/**
 * 清除 Access Token
 */
function clearAccessToken() {
  localStorage.removeItem('qc_access_token');
}

/**
 * 跳转到错误页面
 */
function redirectToError(type, message, code) {
  const params = new URLSearchParams({ type, message, code });
  window.location.href = `./error.html?${params.toString()}`;
}

// ========================================
// 核心请求函数
// ========================================

/**
 * 统一请求方法
 * @param {string} endpoint - API 端点（相对路径）
 * @param {Object} options - 请求选项
 * @param {string} options.method - HTTP 方法
 * @param {Object} options.params - URL 查询参数
 * @param {Object} options.data - 请求体数据
 * @param {Object} options.headers - 自定义请求头
 * @param {boolean} options.auth - 是否需要认证（默认 true）
 * @param {boolean} options.retry - 是否启用重试（默认 true）
 * @param {number} options.retryCount - 自定义重试次数
 * @returns {Promise} API 响应数据
 */
async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    params = {},
    data = null,
    headers = {},
    auth = true,
    retry = true,
    retryCount = API_CONFIG.retryCount
  } = options;

  // 构建完整 URL
  let url = API_CONFIG.baseURL + endpoint;
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  // 构建请求头
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  // 添加认证头
  if (auth) {
    const token = getAccessToken();
    if (!token) {
      throw new APIError('未找到访问令牌', 'NO_TOKEN');
    }
    requestHeaders['Access-Token'] = token;
  }

  // 构建请求配置
  const fetchOptions = {
    method,
    headers: requestHeaders,
    credentials: 'include'
  };

  // 添加请求体
  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(data);
  }

  // 执行请求（带重试逻辑）
  let lastError;
  for (let attempt = 0; attempt <= (retry ? retryCount : 0); attempt++) {
    try {
      // Mock 模式
      if (API_CONFIG.mockMode) {
        console.log('[API Mock]', method, url, { params, data });
        await delay(500); // 模拟网络延迟
        return mockAPIResponse(endpoint, method, data);
      }

      // 发起请求
      const response = await fetchWithTimeout(url, fetchOptions);

      // 处理 HTTP 错误
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}`,
          errorData.code || response.status,
          response
        );
      }

      // 解析响应
      const result = await response.json();

      // 检查业务错误
      if (result.code !== 0) {
        throw new APIError(
          result.message || '请求失败',
          result.code,
          result
        );
      }

      // 返回数据
      return result.data;

    } catch (error) {
      lastError = error;

      // 不重试的情况
      if (!retry || attempt >= retryCount) {
        break;
      }

      // Token 失效不重试
      if (error.code === 401 || error.code === 'NO_TOKEN') {
        break;
      }

      // 客户端错误不重试
      if (error.code >= 400 && error.code < 500) {
        break;
      }

      // 延迟后重试
      console.warn(`[API] 重试 ${attempt + 1}/${retryCount}:`, error.message);
      await delay(API_CONFIG.retryDelay * (attempt + 1));
    }
  }

  // 所有重试失败，抛出错误
  throw lastError;
}

// ========================================
// 便捷方法
// ========================================

const api = {
  /**
   * GET 请求
   */
  get(endpoint, params = {}, options = {}) {
    return request(endpoint, { ...options, method: 'GET', params });
  },

  /**
   * POST 请求
   */
  post(endpoint, data = {}, options = {}) {
    return request(endpoint, { ...options, method: 'POST', data });
  },

  /**
   * PUT 请求
   */
  put(endpoint, data = {}, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', data });
  },

  /**
   * DELETE 请求
   */
  delete(endpoint, params = {}, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE', params });
  },

  /**
   * PATCH 请求
   */
  patch(endpoint, data = {}, options = {}) {
    return request(endpoint, { ...options, method: 'PATCH', data });
  }
};

// ========================================
// 全局错误处理
// ========================================

/**
 * 设置全局错误处理器
 */
function setupGlobalErrorHandler() {
  window.addEventListener('unhandledrejection', event => {
    const error = event.reason;

    if (error instanceof APIError) {
      console.error('[API Error]', error);

      // 根据错误类型处理
      switch (error.code) {
        case 'NO_TOKEN':
        case 401:
          // Token 失效，跳转到授权页
          clearAccessToken();
          redirectToError('unauthorized', '登录已过期，请重新授权', error.code);
          break;

        case 403:
          // 无权限
          redirectToError('forbidden', '您没有权限执行此操作', error.code);
          break;

        case 'TIMEOUT':
          // 超时
          redirectToError('timeout', '请求超时，请稍后重试', error.code);
          break;

        case 500:
        case 502:
        case 503:
          // 服务器错误
          redirectToError('server', '服务器错误，请稍后重试', error.code);
          break;

        default:
          // 通用错误
          if (typeof error.code === 'string' && error.code.startsWith('NETWORK')) {
            redirectToError('network', '网络连接失败，请检查网络', error.code);
          }
      }

      event.preventDefault();
    }
  });
}

// ========================================
// Mock 数据（开发环境）
// ========================================

/**
 * Mock API 响应
 */
function mockAPIResponse(endpoint, method, data) {
  // 根据端点返回 Mock 数据
  if (endpoint.includes('/advertiser/info')) {
    return {
      id: 1234567890,
      name: '测试广告主',
      balance: 10000.50,
      status: 'active'
    };
  }

  if (endpoint.includes('/ad/get')) {
    return {
      list: [
        { id: 1, name: '推广计划1', status: 'enable', budget: 500 },
        { id: 2, name: '推广计划2', status: 'disable', budget: 1000 }
      ],
      page_info: {
        total_count: 2,
        page: 1,
        page_size: 10
      }
    };
  }

  if (endpoint.includes('/report/')) {
    return {
      list: [
        {
          date: '2025-11-11',
          cost: 1234.56,
          show: 10000,
          click: 500,
          convert: 50
        }
      ]
    };
  }

  // 默认成功响应
  return {
    success: true,
    message: 'Mock 数据返回成功'
  };
}

// ========================================
// 初始化
// ========================================

// 设置全局错误处理
setupGlobalErrorHandler();

// 导出到全局
window.QC_API = {
  api,
  request,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  APIError,
  API_CONFIG
};

// 兼容旧代码
window.api = api;
