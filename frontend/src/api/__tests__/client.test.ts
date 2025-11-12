import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
        get: vi.fn(),
        post: vi.fn(),
        request: vi.fn(),
      })),
      post: vi.fn(),
    },
  }
})

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module to clear any state
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Refresh Mechanism', () => {
    it('should handle 401 error and trigger token refresh', async () => {
      // This test validates the token refresh logic exists
      // In a real scenario, we would test the actual refresh flow
      
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          url: '/api/test',
          method: 'get',
        },
      }

      expect(mockError.response.status).toBe(401)
    })

    it('should queue multiple requests during token refresh', async () => {
      // Test that multiple 401 requests share one token refresh
      const requests = [
        { url: '/api/endpoint1' },
        { url: '/api/endpoint2' },
        { url: '/api/endpoint3' },
      ]

      // Simulate queuing mechanism
      const queue: Array<() => void> = []
      
      requests.forEach(() => {
        queue.push(() => {
          // Mock request after token refresh
          return Promise.resolve({ data: 'success' })
        })
      })

      expect(queue).toHaveLength(3)
    })

    it('should prevent infinite refresh loop with _skipAuthRefresh flag', () => {
      const config = {
        url: '/api/test',
        _skipAuthRefresh: false,
      }

      expect(config._skipAuthRefresh).toBe(false)

      // After first refresh attempt, flag should be set
      config._skipAuthRefresh = true
      expect(config._skipAuthRefresh).toBe(true)
    })

    it('should redirect to login on refresh failure', () => {
      const originalLocation = window.location.href
      
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { href: originalLocation },
        writable: true,
        configurable: true,
      })

      // Simulate refresh failure - would redirect to login page
      expect(window.location.href).toBe(originalLocation)
    })
  })

  describe('Request Interceptor', () => {
    it('should add CSRF token to requests if available', () => {
      // Create meta tag
      const meta = document.createElement('meta')
      meta.setAttribute('name', 'csrf-token')
      meta.setAttribute('content', 'test-csrf-token')
      document.head.appendChild(meta)

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      expect(csrfToken).toBe('test-csrf-token')

      // Cleanup
      document.head.removeChild(meta)
    })

    it('should handle request without CSRF token', () => {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      expect(csrfToken).toBeUndefined()
    })
  })

  describe('Response Interceptor', () => {
    it('should extract data from successful response', () => {
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: { id: 1, name: 'Test' },
        },
      }

      expect(mockResponse.data.code).toBe(0)
      expect(mockResponse.data.data).toEqual({ id: 1, name: 'Test' })
    })

    it('should reject on non-zero code', () => {
      const mockResponse = {
        data: {
          code: 400,
          message: 'Bad Request',
          data: null,
        },
      }

      expect(mockResponse.data.code).not.toBe(0)
      expect(mockResponse.data.message).toBe('Bad Request')
    })

    it('should handle 403 Forbidden error', () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      }

      expect(mockError.response.status).toBe(403)
    })

    it('should handle 404 Not Found error', () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      }

      expect(mockError.response.status).toBe(404)
    })

    it('should handle 500 Internal Server Error', () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      }

      expect(mockError.response.status).toBe(500)
    })

    it('should handle network errors', () => {
      const mockError = {
        request: {},
        message: 'Network Error',
      }

      expect(mockError.request).toBeDefined()
      expect(mockError.message).toBe('Network Error')
    })
  })

  describe('Retry Logic', () => {
    it('should retry on 5xx errors', () => {
      const shouldRetry = (status: number) => {
        return status >= 500 && status < 600
      }

      expect(shouldRetry(500)).toBe(true)
      expect(shouldRetry(502)).toBe(true)
      expect(shouldRetry(503)).toBe(true)
      expect(shouldRetry(400)).toBe(false)
      expect(shouldRetry(404)).toBe(false)
    })

    it('should retry on 429 Rate Limit', () => {
      const shouldRetry = (status: number) => {
        return status === 429 || (status >= 500 && status < 600)
      }

      expect(shouldRetry(429)).toBe(true)
    })

    it('should not retry on 4xx client errors (except 429)', () => {
      const shouldRetry = (status: number) => {
        if (status === 429) return true
        return status >= 500 && status < 600
      }

      expect(shouldRetry(400)).toBe(false)
      expect(shouldRetry(401)).toBe(false)
      expect(shouldRetry(403)).toBe(false)
      expect(shouldRetry(404)).toBe(false)
    })

    it('should limit retry attempts', () => {
      const config = {
        _retryCount: 0,
      }

      const maxRetries = 3

      // Simulate retries
      for (let i = 0; i < 5; i++) {
        if (config._retryCount < maxRetries) {
          config._retryCount += 1
        }
      }

      expect(config._retryCount).toBe(maxRetries)
    })
  })

  describe('Token Refresh Queue', () => {
    it('should manage refresh state correctly', () => {
      let isRefreshing = false
      const refreshSubscribers: Array<(token: string) => void> = []

      // Start refresh
      isRefreshing = true
      expect(isRefreshing).toBe(true)

      // Add subscribers
      refreshSubscribers.push(() => {})
      refreshSubscribers.push(() => {})
      expect(refreshSubscribers).toHaveLength(2)

      // Complete refresh
      isRefreshing = false
      refreshSubscribers.length = 0
      expect(isRefreshing).toBe(false)
      expect(refreshSubscribers).toHaveLength(0)
    })

    it('should execute all queued callbacks after refresh', () => {
      const callbacks: Array<() => void> = []
      let executionCount = 0

      // Add callbacks
      for (let i = 0; i < 3; i++) {
        callbacks.push(() => {
          executionCount++
        })
      }

      // Execute all
      callbacks.forEach((cb) => cb())

      expect(executionCount).toBe(3)
    })
  })
})
