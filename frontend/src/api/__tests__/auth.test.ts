import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authApi from '../auth'
import apiClient from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exchangeOAuthCode', () => {
    it('should exchange OAuth code successfully', async () => {
      const mockResponse = { success: true }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authApi.exchangeOAuthCode('test_code_123')

      expect(apiClient.post).toHaveBeenCalledWith('/oauth/exchange', { code: 'test_code_123', state: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('should handle exchange failure', async () => {
      const mockError = new Error('Exchange failed')
      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(authApi.exchangeOAuthCode('invalid_code')).rejects.toThrow('Exchange failed')
    })

    it('should send code in request body', async () => {
      const code = 'oauth_code_xyz'
      await authApi.exchangeOAuthCode(code).catch(() => {})

      expect(apiClient.post).toHaveBeenCalledWith('/oauth/exchange', { code, state: undefined })
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user info', async () => {
      const mockUser = {
        id: 123,
        name: 'Test User',
        email: 'test@example.com',
        advertiserId: 456,
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockUser)

      const result = await authApi.getCurrentUser()

      expect(apiClient.get).toHaveBeenCalledWith('/user/info')
      expect(result).toEqual(mockUser)
    })

    it('should handle user with no email', async () => {
      const mockUser = {
        id: 123,
        name: 'Test User',
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockUser)

      const result = await authApi.getCurrentUser()

      expect(result.email).toBeUndefined()
      expect(result.id).toBe(123)
    })

    it('should handle unauthorized error', async () => {
      const mockError = new Error('Unauthorized')
      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(authApi.getCurrentUser()).rejects.toThrow('Unauthorized')
    })

    it('should return complete user object', async () => {
      const completeUser = {
        id: 999,
        name: 'Full User',
        email: 'full@example.com',
        advertiserId: 888,
      }
      vi.mocked(apiClient.get).mockResolvedValue(completeUser)

      const result = await authApi.getCurrentUser()

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('advertiserId')
    })
  })

  describe('logout', () => {
    it('should send logout request', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ success: true })

      await authApi.logout()

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout')
    })

    it('should handle logout errors', async () => {
      const mockError = new Error('Logout failed')
      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(authApi.logout()).rejects.toThrow('Logout failed')
    })

    it('should call logout endpoint only once', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ success: true })

      await authApi.logout()

      expect(apiClient.post).toHaveBeenCalledTimes(1)
    })
  })

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockResponse = { success: true }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authApi.refreshSession()

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh')
      expect(result).toEqual(mockResponse)
    })

    it('should handle expired refresh token', async () => {
      const mockError = new Error('Refresh token expired')
      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(authApi.refreshSession()).rejects.toThrow('Refresh token expired')
    })

    it('should call refresh endpoint correctly', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ success: true })

      await authApi.refreshSession()

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh')
      expect(apiClient.post).toHaveBeenCalledTimes(1)
    })

    it('should handle network errors during refresh', async () => {
      const networkError = new Error('Network Error')
      vi.mocked(apiClient.post).mockRejectedValue(networkError)

      await expect(authApi.refreshSession()).rejects.toThrow('Network Error')
    })
  })

  describe('API Integration', () => {
    it('should use apiClient for all requests', () => {
      const code = 'test_code'
      
      authApi.exchangeOAuthCode(code).catch(() => {})
      expect(apiClient.post).toHaveBeenCalled()

      authApi.getCurrentUser().catch(() => {})
      expect(apiClient.get).toHaveBeenCalled()

      authApi.logout().catch(() => {})
      expect(apiClient.post).toHaveBeenCalled()

      authApi.refreshSession().catch(() => {})
      expect(apiClient.post).toHaveBeenCalled()
    })

    it('should maintain consistent error handling', async () => {
      const errors = [
        'Authentication failed',
        'Session expired',
        'Network error',
      ]

      for (const errorMsg of errors) {
        vi.mocked(apiClient.post).mockRejectedValue(new Error(errorMsg))
        await expect(authApi.exchangeOAuthCode('code')).rejects.toThrow(errorMsg)
      }
    })
  })

  describe('Type Safety', () => {
    it('should return correctly typed user object', async () => {
      const mockUser = {
        id: 1,
        name: 'Typed User',
        email: 'typed@example.com',
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockUser)

      const user = await authApi.getCurrentUser()

      // TypeScript type checks
      expect(typeof user.id).toBe('number')
      expect(typeof user.name).toBe('string')
      if (user.email) {
        expect(typeof user.email).toBe('string')
      }
    })

    it('should handle optional fields correctly', async () => {
      const minimalUser = {
        id: 1,
        name: 'Minimal User',
      }
      vi.mocked(apiClient.get).mockResolvedValue(minimalUser)

      const user = await authApi.getCurrentUser()

      expect(user.id).toBeDefined()
      expect(user.name).toBeDefined()
      expect(user.email).toBeUndefined()
      expect(user.advertiserId).toBeUndefined()
    })
  })
})
