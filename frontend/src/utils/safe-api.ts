import { withLoading } from '@/store/loadingStore'
import { toast } from '@/components/ui/Toast'

/**
 * 安全 API 调用封装
 * 自动处理 loading 状态与 toast 提示
 * 
 * @param fn - 异步函数
 * @param opts - 配置选项
 * @returns Promise<T>
 * 
 * @example
 * await safeApi(
 *   () => updateStatus({ id: 1, status: 'ENABLE' }),
 *   { 
 *     loadingText: '正在启用...',
 *     success: '启用成功',
 *     failure: '启用失败，请稍后重试'
 *   }
 * )
 */
export async function safeApi<T>(
  fn: () => Promise<T>,
  opts?: {
    loadingText?: string
    success?: string
    failure?: string
    showSuccess?: boolean // 默认 true（有 success 时）
  }
): Promise<T> {
  try {
    const result = await withLoading(fn, opts?.loadingText)
    
    // 成功提示（默认启用）
    if (opts?.success && (opts?.showSuccess !== false)) {
      toast.success(opts.success)
    }
    
    return result
  } catch (e: unknown) {
    // 失败提示
    if (opts?.failure) {
      toast.error(opts.failure)
    }
    
    throw e
  }
}
