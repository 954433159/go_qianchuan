/**
 * Toast Hook - 统一使用 Toast.tsx 的实现
 * 提供便捷的 toast 调用方法
 */
import { toast as toastFn, useToastStore } from '@/components/ui/Toast'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  message: string
  duration?: number
}

/**
 * useToast hook - 返回 toast 方法集合
 */
export function useToast() {
  return {
    success: (message: string, duration?: number) => toastFn.success(message, duration),
    error: (message: string, duration?: number) => toastFn.error(message, duration),
    warning: (message: string, duration?: number) => toastFn.warning(message, duration),
    info: (message: string, duration?: number) => toastFn.info(message, duration),
    toasts: useToastStore.getState().toasts,
  }
}

// 便捷方法 - 可直接导入使用
export const showSuccess = (message: string, duration?: number) => {
  toastFn.success(message, duration)
}

export const showError = (message: string, duration?: number) => {
  toastFn.error(message, duration)
}

export const showWarning = (message: string, duration?: number) => {
  toastFn.warning(message, duration)
}

export const showInfo = (message: string, duration?: number) => {
  toastFn.info(message, duration)
}

// 导出 toast 对象供直接调用
export { toast } from '@/components/ui/Toast'
