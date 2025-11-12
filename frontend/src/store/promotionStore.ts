import { create } from 'zustand'

export interface Promotion {
  id: string
  campaign_id: string
  name: string
  status: string
  learning_status: string
  budget_mode: string
  budget: number
  bid: number
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cvr: number
  roi: number
  targeting_info: {
    age_range?: string[]
    gender?: string
    regions?: string[]
    interests?: string[]
  }
  creative_ids: string[]
  created_at: string
  updated_at: string
}

export interface PromotionFilters {
  campaign_id?: string
  status?: string
  learning_status?: string
  budget_mode?: string
  dateRange?: [string, string]
  searchQuery?: string
}

export interface SortConfig {
  field: keyof Promotion
  order: 'asc' | 'desc'
}

interface PromotionStore {
  // 状态
  promotions: Promotion[]
  selectedIds: string[]
  filters: PromotionFilters
  sorting: SortConfig
  isLoading: boolean
  
  // Actions
  setPromotions: (promotions: Promotion[]) => void
  addPromotion: (promotion: Promotion) => void
  updatePromotion: (id: string, updates: Partial<Promotion>) => void
  deletePromotion: (id: string) => void
  
  // 选择操作
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  
  // 筛选和排序
  setFilters: (filters: Partial<PromotionFilters>) => void
  clearFilters: () => void
  setSorting: (sorting: SortConfig) => void
  
  // 批量操作
  batchUpdateStatus: (ids: string[], status: string) => void
  batchUpdateBudget: (ids: string[], budget: number) => void
  batchUpdateBid: (ids: string[], bid: number) => void
  batchDelete: (ids: string[]) => void
  
  // 加载状态
  setLoading: (isLoading: boolean) => void
  
  // Computed getters
  getSelectedPromotions: () => Promotion[]
  getFilteredPromotions: () => Promotion[]
  getPromotionById: (id: string) => Promotion | undefined
  getPromotionsByCampaignId: (campaignId: string) => Promotion[]
  getLearningPromotions: () => Promotion[]
}

export const usePromotionStore = create<PromotionStore>((set, get) => ({
  // 初始状态
  promotions: [],
  selectedIds: [],
  filters: {},
  sorting: { field: 'created_at', order: 'desc' },
  isLoading: false,
  
  // Actions 实现
  setPromotions: (promotions) => set({ promotions }),
  
  addPromotion: (promotion) => set((state) => ({
    promotions: [promotion, ...state.promotions],
  })),
  
  updatePromotion: (id, updates) => set((state) => ({
    promotions: state.promotions.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
  })),
  
  deletePromotion: (id) => set((state) => ({
    promotions: state.promotions.filter((p) => p.id !== id),
    selectedIds: state.selectedIds.filter((sid) => sid !== id),
  })),
  
  // 选择操作
  toggleSelect: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((sid) => sid !== id)
      : [...state.selectedIds, id],
  })),
  
  selectAll: () => set((state) => ({
    selectedIds: state.promotions.map((p) => p.id),
  })),
  
  clearSelection: () => set({ selectedIds: [] }),
  
  // 筛选和排序
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  
  clearFilters: () => set({ filters: {} }),
  
  setSorting: (sorting) => set({ sorting }),
  
  // 批量操作
  batchUpdateStatus: (ids, status) => set((state) => ({
    promotions: state.promotions.map((p) =>
      ids.includes(p.id) ? { ...p, status } : p
    ),
  })),
  
  batchUpdateBudget: (ids, budget) => set((state) => ({
    promotions: state.promotions.map((p) =>
      ids.includes(p.id) ? { ...p, budget } : p
    ),
  })),
  
  batchUpdateBid: (ids, bid) => set((state) => ({
    promotions: state.promotions.map((p) =>
      ids.includes(p.id) ? { ...p, bid } : p
    ),
  })),
  
  batchDelete: (ids) => set((state) => ({
    promotions: state.promotions.filter((p) => !ids.includes(p.id)),
    selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid)),
  })),
  
  // 加载状态
  setLoading: (isLoading) => set({ isLoading }),
  
  // Computed getters
  getSelectedPromotions: () => {
    const { promotions, selectedIds } = get()
    return promotions.filter((p) => selectedIds.includes(p.id))
  },
  
  getFilteredPromotions: () => {
    const { promotions, filters, sorting } = get()
    let result = [...promotions]
    
    // 应用筛选
    if (filters.campaign_id) {
      result = result.filter((p) => p.campaign_id === filters.campaign_id)
    }
    
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status)
    }
    
    if (filters.learning_status) {
      result = result.filter((p) => p.learning_status === filters.learning_status)
    }
    
    if (filters.budget_mode) {
      result = result.filter((p) => p.budget_mode === filters.budget_mode)
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query)
      )
    }
    
    if (filters.dateRange) {
      const [start, end] = filters.dateRange
      result = result.filter((p) => {
        const date = new Date(p.created_at)
        return date >= new Date(start) && date <= new Date(end)
      })
    }
    
    // 应用排序
    result.sort((a, b) => {
      const aVal = a[sorting.field]
      const bVal = b[sorting.field]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sorting.order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'object' || typeof bVal === 'object') {
        return 0
      }
      
      return sorting.order === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
    
    return result
  },
  
  getPromotionById: (id) => {
    return get().promotions.find((p) => p.id === id)
  },
  
  getPromotionsByCampaignId: (campaignId) => {
    return get().promotions.filter((p) => p.campaign_id === campaignId)
  },
  
  getLearningPromotions: () => {
    return get().promotions.filter((p) => p.learning_status === 'LEARNING')
  },
}))
