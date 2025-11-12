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
    set({ loading: true })
    try {
      const user = await getCurrentUser()
      set({ isAuthenticated: true, user, loading: false })
    } catch (error) {
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
