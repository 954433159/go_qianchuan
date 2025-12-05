import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Import after mocking
import * as advertiserApi from '../advertiser'

describe('Advertiser API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAdvertiserList', () => {
    it('should fetch advertiser list', async () => {
      const mockList = [
        { id: 1, name: 'Advertiser 1' },
        { id: 2, name: 'Advertiser 2' },
      ]
      vi.mocked(apiClient.get).mockResolvedValue(mockList)

      const result = await advertiserApi.getAdvertiserList()

      expect(apiClient.get).toHaveBeenCalledWith('/advertiser/list', { params: undefined })
      expect(result).toEqual(mockList)
    })

    it('should handle empty list', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([])

      const result = await advertiserApi.getAdvertiserList()

      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'))

      await expect(advertiserApi.getAdvertiserList()).rejects.toThrow('API Error')
    })
  })

  describe('getAdvertiserInfo', () => {
    it('should fetch advertiser info by ID', async () => {
      const mockInfo = {
        id: 123,
        name: 'Test Advertiser',
        balance: 10000,
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockInfo)

      const result = await advertiserApi.getAdvertiserInfo(123)

      expect(apiClient.get).toHaveBeenCalledWith('/advertiser/info', {
        params: { advertiser_id: 123 },
      })
      expect(result).toEqual(mockInfo)
    })

    it('should handle non-existent advertiser', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Not Found'))

      await expect(advertiserApi.getAdvertiserInfo(999)).rejects.toThrow('Not Found')
    })

    it('should pass correct params format', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({})

      await advertiserApi.getAdvertiserInfo(456)

      const callArgs = vi.mocked(apiClient.get).mock.calls[0]
      expect(callArgs[1]).toEqual({ params: { advertiser_id: 456 } })
    })
  })

  describe('getAccountBudget', () => {
    it('should fetch advertiser budget', async () => {
      const mockBudget = {
        advertiser_id: 123,
        budget: 5000,
        budget_mode: 'BUDGET_MODE_DAY' as const,
      }
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBudget })

      const result = await advertiserApi.getAccountBudget(123)

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/advertiser/budget/get', {
        params: { advertiser_id: 123 },
      })
      expect(result).toEqual(mockBudget)
    })

    it('should handle budget query errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Budget unavailable'))

      await expect(advertiserApi.getAccountBudget(123)).rejects.toThrow('Budget unavailable')
    })
  })

  describe('updateAccountBudget', () => {
    it('should update advertiser budget', async () => {
      const budgetData = {
        advertiser_id: 123,
        budget: 8000,
        budget_mode: 'BUDGET_MODE_DAY' as const,
      }
      vi.mocked(apiClient.post).mockResolvedValue({ success: true })

      await advertiserApi.updateAccountBudget(budgetData)

      expect(apiClient.post).toHaveBeenCalledWith('/qianchuan/advertiser/budget/update', budgetData)
    })

    it('should validate budget data', async () => {
      const invalidData = {
        advertiser_id: 123,
        budget: -100,
        budget_mode: 'BUDGET_MODE_DAY' as const,
      }
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid budget'))

      await expect(advertiserApi.updateAccountBudget(invalidData)).rejects.toThrow('Invalid budget')
    })

    it('should handle update failures', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Update failed'))

      await expect(advertiserApi.updateAccountBudget({ 
        advertiser_id: 1, 
        budget: 100,
        budget_mode: 'BUDGET_MODE_DAY' 
      }))
        .rejects.toThrow('Update failed')
    })
  })

  describe('getAuthorizedAwemeList', () => {
    it('should fetch authorized Aweme accounts', async () => {
      const mockData = {
        list: [
          { aweme_id: '1', aweme_name: 'Account 1', aweme_avatar: '', auth_status: 'AUTHORIZED' as const },
          { aweme_id: '2', aweme_name: 'Account 2', aweme_avatar: '', auth_status: 'AUTHORIZED' as const },
        ],
        total: 2,
      }
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })

      const result = await advertiserApi.getAuthorizedAwemeList(123)

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/advertiser/aweme/authorized', {
        params: { advertiser_id: 123, page: 1, page_size: 20 },
      })
      expect(result).toEqual(mockData)
    })

    it('should handle empty Aweme list', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { list: [], total: 0 } })

      const result = await advertiserApi.getAuthorizedAwemeList(123)

      expect(result).toEqual({ list: [], total: 0 })
    })
  })

  describe('Error Handling', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Network Error')
      vi.mocked(apiClient.get).mockRejectedValue(networkError)

      await expect(advertiserApi.getAdvertiserList()).rejects.toThrow('Network Error')
    })

    it('should propagate API errors', async () => {
      const apiError = new Error('API Error: 500')
      vi.mocked(apiClient.post).mockRejectedValue(apiError)

      await expect(advertiserApi.updateAccountBudget({ 
        advertiser_id: 1, 
        budget: 100,
        budget_mode: 'BUDGET_MODE_DAY' 
      }))
        .rejects.toThrow('API Error: 500')
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      vi.mocked(apiClient.get).mockRejectedValue(timeoutError)

      await expect(advertiserApi.getAdvertiserInfo(123)).rejects.toThrow('Request timeout')
    })
  })

  describe('Request Format', () => {
    it('should use correct HTTP methods', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({})
      vi.mocked(apiClient.post).mockResolvedValue({})

      // GET methods
      await advertiserApi.getAdvertiserList().catch(() => {})
      await advertiserApi.getAdvertiserInfo(1).catch(() => {})
      expect(apiClient.get).toHaveBeenCalled()

      // POST methods
      await advertiserApi.updateAccountBudget({ 
        advertiser_id: 1, 
        budget: 100, 
        budget_mode: 'BUDGET_MODE_DAY' 
      }).catch(() => {})
      expect(apiClient.post).toHaveBeenCalled()
    })

    it('should send params in query string for GET', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({})

      await advertiserApi.getAdvertiserInfo(123)

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: expect.any(Object) })
      )
    })

    it('should send data in body for POST', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      const data = { advertiser_id: 123, budget: 5000, budget_mode: 'BUDGET_MODE_DAY' as const }
      await advertiserApi.updateAccountBudget(data)

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ advertiser_id: 123, budget: 5000 })
      )
    })
  })
})
