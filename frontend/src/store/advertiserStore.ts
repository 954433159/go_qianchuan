import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Advertiser {
  id: number
  name: string
  role: 'ADVERTISER' | 'AGENT'
  status: 'ENABLE' | 'DISABLE'
  balance?: number
  currency?: string
  company_name?: string
  industry?: string
  created_at?: string
}

interface AdvertiserStore {
  // 当前选中的广告主
  currentAdvertiser: Advertiser | null
  // 广告主列表
  advertisers: Advertiser[]
  
  // Actions
  setCurrentAdvertiser: (advertiser: Advertiser | null) => void
  setAdvertisers: (advertisers: Advertiser[]) => void
  addAdvertiser: (advertiser: Advertiser) => void
  updateAdvertiser: (id: number, updates: Partial<Advertiser>) => void
  removeAdvertiser: (id: number) => void
  clearAdvertisers: () => void
}

export const useAdvertiserStore = create<AdvertiserStore>()(
  persist(
    (set) => ({
      currentAdvertiser: null,
      advertisers: [],
      
      setCurrentAdvertiser: (advertiser) => 
        set({ currentAdvertiser: advertiser }),
      
      setAdvertisers: (advertisers) => 
        set({ advertisers }),
      
      addAdvertiser: (advertiser) => 
        set((state) => ({ 
          advertisers: [...state.advertisers, advertiser] 
        })),
      
      updateAdvertiser: (id, updates) => 
        set((state) => ({
          advertisers: state.advertisers.map((adv) =>
            adv.id === id ? { ...adv, ...updates } : adv
          ),
          currentAdvertiser: 
            state.currentAdvertiser?.id === id
              ? { ...state.currentAdvertiser, ...updates }
              : state.currentAdvertiser
        })),
      
      removeAdvertiser: (id) => 
        set((state) => ({
          advertisers: state.advertisers.filter((adv) => adv.id !== id),
          currentAdvertiser: 
            state.currentAdvertiser?.id === id 
              ? null 
              : state.currentAdvertiser
        })),
      
      clearAdvertisers: () => 
        set({ advertisers: [], currentAdvertiser: null })
    }),
    {
      name: 'advertiser-storage',
      partialize: (state) => ({
        currentAdvertiser: state.currentAdvertiser,
        advertisers: state.advertisers
      })
    }
  )
)
