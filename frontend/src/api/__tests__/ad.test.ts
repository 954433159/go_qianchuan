import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as adApi from '../ad'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '../client'

describe('Ad API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Ad Operations', () => {
    it('should get ad list', async () => {
      const mockResponse = {
        data: {
          list: [
            { id: 1, name: 'Ad 1', status: 'ACTIVE' },
            { id: 2, name: 'Ad 2', status: 'PAUSED' },
          ],
          total: 2,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await adApi.getAdList({
        advertiser_id: 123456,
        page: 1,
        page_size: 10,
      })

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/ad/list', {
        params: {
          advertiser_id: 123456,
          page: 1,
          page_size: 10,
        },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should get ad detail', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Ad 1', budget: 1000 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await adApi.getAdDetail(123456, 1)

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/ad/get', {
        params: { advertiser_id: 123456, ad_id: 1 },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should create ad', async () => {
      const mockResponse = {
        data: { ad_id: 12345 },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const params: adApi.CreateAdParams = {
        advertiser_id: 123456,
        campaign_id: 789,
        ad_name: 'Test Ad',
        delivery_setting: {
          budget: 1000,
          budget_mode: 'BUDGET_MODE_DAY',
          start_time: '2025-11-11 00:00:00',
          schedule_type: 'SCHEDULE_FROM_NOW',
        },
        audience: {
          gender: 'NONE',
          age: ['AGE_24_30'],
          region: ['110000'],
        },
        creative_material_mode: 'CUSTOM',
      }

      const result = await adApi.createAd(params)

      expect(apiClient.post).toHaveBeenCalledWith('/qianchuan/ad/create', params)
      expect(result).toEqual(mockResponse.data)
    })

    it('should update ad status', async () => {
      const mockResponse = {
        data: { ad_ids: [1, 2, 3] },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.updateAdStatus({
        advertiser_id: 123456,
        ad_ids: [1, 2, 3],
        opt_status: 'ENABLE',
      })

      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('Batch Update Operations', () => {
    it('should batch update ad bid', async () => {
      const mockResponse = {
        data: { ad_ids: [1, 2, 3] },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.updateAdBid({
        advertiser_id: 123456,
        ad_ids: [1, 2, 3],
        bid: 5.5,
      })

      expect(apiClient.post).toHaveBeenCalledWith('/qianchuan/ad/bid/update', {
        advertiser_id: 123456,
        ad_ids: [1, 2, 3],
        bid: 5.5,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should batch update ad budget', async () => {
      const mockResponse = {
        data: { ad_ids: [1, 2] },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.updateAdBudget({
        advertiser_id: 123456,
        ad_ids: [1, 2],
        budget: 2000,
        budget_mode: 'BUDGET_MODE_DAY',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/qianchuan/ad/budget/update', {
        advertiser_id: 123456,
        ad_ids: [1, 2],
        budget: 2000,
        budget_mode: 'BUDGET_MODE_DAY',
      })
      expect(result.ad_ids).toHaveLength(2)
    })

    it('should update ad ROI goal', async () => {
      const mockResponse = {
        data: { ad_id: 1 },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.updateAdRoiGoal({
        advertiser_id: 123456,
        ad_id: 1,
        roi_goal: 3.5,
      })

      expect(result.ad_id).toBe(1)
    })

    it('should update ad region targeting', async () => {
      const mockResponse = {
        data: { ad_id: 1 },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.updateAdRegion({
        advertiser_id: 123456,
        ad_id: 1,
        region: ['110000', '310000'],
        region_type: 'CITY',
      })

      expect(result.ad_id).toBe(1)
    })
  })

  describe('Status and Audit Queries', () => {
    it('should get ad reject reason', async () => {
      const mockResponse = {
        data: {
          list: [
            { reject_reason: 'Invalid content', reject_detail: 'Contains prohibited words' },
          ],
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await adApi.getAdRejectReason(123456, 1)

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/ad/reject-reason', {
        params: { advertiser_id: 123456, ad_id: 1 },
      })
      expect(result).toHaveLength(1)
      expect(result[0]?.reject_reason).toBe('Invalid content')
    })

    it('should get ad learning status', async () => {
      const mockResponse = {
        data: {
          list: [
            { ad_id: 1, learning_phase: 'LEARNING', learning_stage: 'STAGE_1' },
            { ad_id: 2, learning_phase: 'LEARNED' },
          ],
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await adApi.getAdLearningStatus(123456, [1, 2])

      expect(result).toHaveLength(2)
      expect(result[0]?.learning_phase).toBe('LEARNING')
      expect(result[1]?.learning_phase).toBe('LEARNED')
    })

    it('should get ad compensate status', async () => {
      const mockResponse = {
        data: {
          list: [
            { ad_id: 1, compensate_status: 'ENABLED', compensate_amount: 100 },
          ],
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await adApi.getAdCompensateStatus(123456, [1])

      expect(result[0]?.compensate_status).toBe('ENABLED')
      expect(result[0]?.compensate_amount).toBe(100)
    })

    it('should get low quality ads', async () => {
      const mockResponse = {
        data: { ad_ids: [1, 2, 3] },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await adApi.getLowQualityAds(123456)

      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('Smart Suggestion Tools', () => {
    it('should get suggest bid', async () => {
      const mockResponse = {
        data: {
          suggested_bid: 6.5,
          bid_range: { min: 5.0, max: 10.0 },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.getSuggestBid({
        advertiser_id: 123456,
        campaign_id: 789,
        delivery_setting: {
          budget: 1000,
          budget_mode: 'BUDGET_MODE_DAY',
        },
      })

      expect(result.suggested_bid).toBe(6.5)
      expect(result.bid_range.min).toBe(5.0)
      expect(result.bid_range.max).toBe(10.0)
    })

    it('should get suggest ROI goal', async () => {
      const mockResponse = {
        data: {
          suggested_roi_goal: 4.2,
          roi_range: { min: 3.0, max: 6.0 },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.getSuggestRoiGoal({
        advertiser_id: 123456,
        campaign_id: 789,
      })

      expect(result.suggested_roi_goal).toBe(4.2)
    })

    it('should get suggest budget', async () => {
      const mockResponse = {
        data: {
          suggested_budget: 2000,
          budget_range: { min: 1000, max: 5000 },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.getSuggestBudget({
        advertiser_id: 123456,
      })

      expect(result.suggested_budget).toBe(2000)
    })

    it('should get estimate effect', async () => {
      const mockResponse = {
        data: {
          estimated_impressions: 10000,
          estimated_clicks: 500,
          estimated_conversions: 50,
          estimated_cost: 1000,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await adApi.getEstimateEffect({
        advertiser_id: 123456,
        delivery_setting: {},
        audience: {},
        bid: 5.5,
        budget: 1000,
      })

      expect(result.estimated_impressions).toBe(10000)
      expect(result.estimated_clicks).toBe(500)
      expect(result.estimated_conversions).toBe(50)
    })

    it('should get ad quota', async () => {
      const mockResponse = {
        data: {
          ad_quota: 100,
          ad_quota_used: 60,
          ad_quota_available: 40,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await adApi.getAdQuota(123456)

      expect(result.ad_quota).toBe(100)
      expect(result.ad_quota_available).toBe(40)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      await expect(adApi.getAdList({ advertiser_id: 123456 })).rejects.toThrow('Network error')
    })

    it('should handle invalid parameters', async () => {
      const invalidParams = {
        advertiser_id: 0, // Invalid
        ad_ids: [],
        bid: -1, // Invalid
      }

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid parameters'))

      await expect(adApi.updateAdBid(invalidParams)).rejects.toThrow('Invalid parameters')
    })
  })
})
