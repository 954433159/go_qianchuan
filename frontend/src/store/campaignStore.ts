import { create } from 'zustand'

export interface Campaign {
  id: string
  name: string
  status: string
  budget: number
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  roi: number
  created_at: string
  updated_at: string
}

export interface CampaignFilters {
  status?: string
  dateRange?: [string, string]
  searchQuery?: string
  [key: string]: string | number | [string, string] | undefined
}

export interface SortConfig {
  field: keyof Campaign
  order: 'asc' | 'desc'
}

interface CampaignStore {
  // 状态
  campaigns: Campaign[]
  selectedIds: string[]
  filters: CampaignFilters
  sorting: SortConfig
  isLoading: boolean
  
  // Actions
  setCampaigns: (campaigns: Campaign[]) => void
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  
  // 选择操作
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  
  // 筛选和排序
  setFilters: (filters: Partial<CampaignFilters>) => void
  clearFilters: () => void
  setSorting: (sorting: SortConfig) => void
  
  // 批量操作
  batchUpdateStatus: (ids: string[], status: string) => void
  batchDelete: (ids: string[]) => void
  
  // 加载状态
  setLoading: (isLoading: boolean) => void
  
  // Computed getters
  getSelectedCampaigns: () => Campaign[]
  getFilteredCampaigns: () => Campaign[]
  getCampaignById: (id: string) => Campaign | undefined
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  // 初始状态
  campaigns: [],
  selectedIds: [],
  filters: {},
  sorting: { field: 'created_at', order: 'desc' },
  isLoading: false,
  
  // Actions 实现
  setCampaigns: (campaigns) => set({ campaigns }),
  
  addCampaign: (campaign) => set((state) => ({
    campaigns: [campaign, ...state.campaigns],
  })),
  
  updateCampaign: (id, updates) => set((state) => ({
    campaigns: state.campaigns.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
  })),
  
  deleteCampaign: (id) => set((state) => ({
    campaigns: state.campaigns.filter((c) => c.id !== id),
    selectedIds: state.selectedIds.filter((sid) => sid !== id),
  })),
  
  // 选择操作
  toggleSelect: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((sid) => sid !== id)
      : [...state.selectedIds, id],
  })),
  
  selectAll: () => set((state) => ({
    selectedIds: state.campaigns.map((c) => c.id),
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
    campaigns: state.campaigns.map((c) =>
      ids.includes(c.id) ? { ...c, status } : c
    ),
  })),
  
  batchDelete: (ids) => set((state) => ({
    campaigns: state.campaigns.filter((c) => !ids.includes(c.id)),
    selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid)),
  })),
  
  // 加载状态
  setLoading: (isLoading) => set({ isLoading }),
  
  // Computed getters
  getSelectedCampaigns: () => {
    const { campaigns, selectedIds } = get()
    return campaigns.filter((c) => selectedIds.includes(c.id))
  },
  
  getFilteredCampaigns: () => {
    const { campaigns, filters, sorting } = get()
    let result = [...campaigns]
    
    // 应用筛选
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status)
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(query)
      )
    }
    
    if (filters.dateRange) {
      const [start, end] = filters.dateRange
      result = result.filter((c) => {
        const date = new Date(c.created_at)
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
      
      return sorting.order === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
    
    return result
  },
  
  getCampaignById: (id) => {
    return get().campaigns.find((c) => c.id === id)
  },
}))
