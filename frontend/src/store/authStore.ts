import { create } from 'zustand'
import { getCurrentUser, logout as apiLogout } from '@/api/auth'

interface User {
  id: number
  name: string
  email?: string
  advertiserId?: number
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  
  // Actions
  setAuth: (user: User) => void
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  
  setAuth: (user) => set({ isAuthenticated: true, user }),
  
  fetchUser: async () => {
    console.log('🔵 fetchUser: Starting...')
    console.log('🔵 fetchUser: Current cookies:', document.cookie)
    set({ loading: true })
    try {
      console.log('🔵 fetchUser: Calling getCurrentUser API...')
      const user = await getCurrentUser()
      console.log('✅ fetchUser: User data received:', user)
      set({ isAuthenticated: true, user, loading: false })
    } catch (error) {
      console.error('❌ fetchUser: Failed to get user', error)
      const errorObj = error as { response?: { data?: unknown; status?: number } }
      console.error('  - Error details:', {
        message: error instanceof Error ? error.message : String(error),
        response: errorObj.response?.data,
        status: errorObj.response?.status,
      })
      console.error('  - Current URL:', window.location.href)
      console.error('  - Referrer:', document.referrer)
      set({ isAuthenticated: false, user: null, loading: false })
      throw error
    }
  },
  
  logout: async () => {
    try {
      await apiLogout()
      set({ isAuthenticated: false, user: null })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  },
  
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}))
