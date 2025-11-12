import * as Sentry from '@sentry/react'

/**
 * 初始化Sentry错误监控
 * 仅在生产环境启用
 */
export function initSentry() {
  // 仅在生产环境启用Sentry
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENV || 'production',
      
      // 性能监控配置
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // 性能监控采样率 (10%)
      tracesSampleRate: 0.1,
      
      // Session回放采样率
      replaysSessionSampleRate: 0.1, // 正常会话10%
      replaysOnErrorSampleRate: 1.0, // 错误会话100%
      
      // 错误过滤 - 忽略某些已知错误
      beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
        const error = hint.originalException
        
        // 忽略网络超时错误（已有重试机制）
        if (error instanceof Error && error.message.includes('timeout')) {
          return null
        }
        
        // 忽略取消的请求
        if (error instanceof Error && error.message.includes('cancel')) {
          return null
        }
        
        return event
      },
      
      // 忽略特定URL的错误
      ignoreErrors: [
        // 浏览器扩展错误
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'http://tt.epicplay.com',
        "Can't find variable: ZiteReader",
        'jigsaw is not defined',
        'ComboSearch is not defined',
        'atomicFindClose',
        'fb_xd_fragment',
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        'conduitPage',
      ],
      
      // 忽略特定域名的错误
      denyUrls: [
        // Chrome扩展
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        // Firefox扩展
        /^resource:\/\//i,
      ],
    })
    
    // 设置用户上下文
    const userStr = localStorage.getItem('qianchuan_user_info')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        Sentry.setUser({
          id: String(user.id || user.advertiser_id),
          username: user.name,
          email: user.email,
        })
      } catch (e) {
        // 忽略解析错误
      }
    }
    
    console.log('✅ Sentry initialized')
  } else {
    console.log('ℹ️ Sentry disabled (dev mode or no DSN)')
  }
}

/**
 * 捕获异常并上报到Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    })
  } else {
    console.error('Exception captured:', error, context)
  }
}

/**
 * 捕获消息并上报到Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    })
  } else {
    console.log(`[${level}] ${message}`, context)
  }
}

/**
 * 添加面包屑记录用户行为
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    })
  }
}

/**
 * 设置错误上下文标签
 */
export function setTag(key: string, value: string) {
  if (import.meta.env.PROD) {
    Sentry.setTag(key, value)
  }
}

/**
 * 设置错误上下文
 */
export function setContext(name: string, context: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.setContext(name, context)
  }
}
