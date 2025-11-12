import { Component, ErrorInfo, ReactNode } from 'react'
import Button from './ui/Button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { captureException } from '@/config/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary - React错误边界组件
 * 捕获子组件树中的JavaScript错误，记录错误并显示降级UI
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到日志服务
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // 上报错误到Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    
    // 调用外部重置回调
    this.props.onReset?.()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6">
            {/* 错误图标 */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* 错误标题 */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                出错了
              </h1>
              <p className="text-muted-foreground">
                抱歉，应用程序遇到了一个错误。我们已经记录了这个问题。
              </p>
            </div>

            {/* 错误详情（仅开发环境） */}
            {import.meta.env.DEV && this.state.error && (
              <details className="bg-muted rounded-lg p-4 text-sm">
                <summary className="cursor-pointer font-medium text-foreground mb-2">
                  错误详情（开发模式）
                </summary>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="text-destructive">错误消息：</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-destructive">堆栈跟踪：</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-words text-muted-foreground overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-destructive">组件堆栈：</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-words text-muted-foreground overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="default"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 用于函数组件的错误边界Hook包装器
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
