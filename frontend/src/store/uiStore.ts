import { create } from 'zustand'

interface UIStore {
  // 侧边栏状态
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // 全局搜索
  globalSearchOpen: boolean
  globalSearchQuery: string
  setGlobalSearchOpen: (open: boolean) => void
  setGlobalSearchQuery: (query: string) => void
  
  // 模态框状态
  activeModal: string | null
  modalData: Record<string, unknown> | null
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  
  // 通知/提示
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // 页面布局
  pageLayout: 'card' | 'table'
  setPageLayout: (layout: 'card' | 'table') => void
  
  // 筛选面板
  filterPanelOpen: boolean
  toggleFilterPanel: () => void
  setFilterPanelOpen: (open: boolean) => void
  
  // 快速操作面板
  quickActionsPanelOpen: boolean
  toggleQuickActionsPanel: () => void
  setQuickActionsPanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  // 侧边栏状态
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ 
    isSidebarCollapsed: !state.isSidebarCollapsed 
  })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  
  // 全局搜索
  globalSearchOpen: false,
  globalSearchQuery: '',
  setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
  
  // 模态框状态
  activeModal: null,
  modalData: null,
  openModal: (modalId, data) => set({ 
    activeModal: modalId, 
    modalData: data || null 
  }),
  closeModal: () => set({ 
    activeModal: null, 
    modalData: null 
  }),
  
  // 通知/提示
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: `notification-${Date.now()}-${Math.random()}`,
      },
    ],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  clearNotifications: () => set({ notifications: [] }),
  
  // 页面布局
  pageLayout: 'card',
  setPageLayout: (layout) => set({ pageLayout: layout }),
  
  // 筛选面板
  filterPanelOpen: false,
  toggleFilterPanel: () => set((state) => ({ 
    filterPanelOpen: !state.filterPanelOpen 
  })),
  setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),
  
  // 快速操作面板
  quickActionsPanelOpen: false,
  toggleQuickActionsPanel: () => set((state) => ({ 
    quickActionsPanelOpen: !state.quickActionsPanelOpen 
  })),
  setQuickActionsPanelOpen: (open) => set({ quickActionsPanelOpen: open }),
}))
