import { captureException, captureMessage } from '@/config/sentry'

/**
 * 统一日志工具类
 * 开发环境：输出到console
 * 生产环境：上报到Sentry或静默
 */
class Logger {
  private isDev = import.meta.env.DEV

  /**
   * 调试日志 - 仅开发环境显示
   */
  log(...args: unknown[]) {
    if (this.isDev) {
      console.log(...args)
    }
  }

  /**
   * 信息日志 - 仅开发环境显示
   */
  info(...args: unknown[]) {
    if (this.isDev) {
      console.info(...args)
    }
  }

  /**
   * 警告日志 - 开发环境console，生产环境上报
   */
  warn(message: string, context?: Record<string, unknown>) {
    if (this.isDev) {
      console.warn(message, context)
    } else {
      captureMessage(message, 'warning', context)
    }
  }

  /**
   * 错误日志 - 始终上报到Sentry
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    if (this.isDev) {
      console.error(message, error, context)
    }
    
    // 生产环境始终上报错误
    if (error instanceof Error) {
      captureException(error, { message, ...context })
    } else {
      captureMessage(message, 'error', { error, ...context })
    }
  }

  /**
   * API请求日志
   */
  api(method: string, url: string, status?: number, duration?: number) {
    if (this.isDev) {
      const statusColor = status && status < 400 ? '✅' : '❌'
      const durationText = duration ? ` (${duration}ms)` : ''
      console.log(`${statusColor} ${method.toUpperCase()} ${url} ${status || ''}${durationText}`)
    }
  }

  /**
   * 性能日志
   */
  perf(label: string, duration: number) {
    if (this.isDev) {
      console.log(`⏱️  [Performance] ${label}: ${duration.toFixed(2)}ms`)
    } else if (duration > 1000) {
      // 生产环境仅上报慢操作
      captureMessage(`Slow operation: ${label}`, 'warning', { duration })
    }
  }

  /**
   * 用户行为日志
   */
  action(action: string, details?: Record<string, unknown>) {
    if (this.isDev) {
      console.log(`👤 [Action] ${action}`, details)
    }
    // 可选：上报用户行为到分析系统
  }

  /**
   * 调试分组开始
   */
  group(label: string) {
    if (this.isDev) {
      console.group(label)
    }
  }

  /**
   * 调试分组结束
   */
  groupEnd() {
    if (this.isDev) {
      console.groupEnd()
    }
  }

  /**
   * 表格输出
   */
  table(data: unknown) {
    if (this.isDev) {
      console.table(data)
    }
  }
}

export const logger = new Logger()

// 默认导出
export default logger
