import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  loadingText: string
  setLoading: (loading: boolean, text?: string) => void
  startLoading: (text?: string) => void
  stopLoading: () => void
}

/**
 * 全局Loading状态管理
 * 用于显示全局loading状态，例如API调用时
 */
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingText: '加载中...',
  
  setLoading: (loading: boolean, text?: string) => 
    set({ 
      isLoading: loading, 
      loadingText: text || '加载中...' 
    }),
  
  startLoading: (text?: string) => 
    set({ 
      isLoading: true, 
      loadingText: text || '加载中...' 
    }),
  
  stopLoading: () => 
    set({ 
      isLoading: false 
    }),
}))

/**
 * 便捷方法 - 异步操作包装器
 * 自动处理loading状态
 */
export async function withLoading<T>(
  fn: () => Promise<T>,
  loadingText?: string
): Promise<T> {
  const { startLoading, stopLoading } = useLoadingStore.getState()
  
  try {
    startLoading(loadingText)
    const result = await fn()
    return result
  } finally {
    stopLoading()
  }
}
