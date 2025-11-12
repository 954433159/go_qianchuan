import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getActivityList, Activity } from '../activity'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('Activity API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getActivityList', () => {
    it('fetches activity list successfully', async () => {
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'campaign_status',
          title: '广告计划状态更新',
          description: '广告计划 #12345 已启用',
          status: 'success',
          resource_id: 12345,
          resource_type: 'campaign',
          created_at: '2025-01-10T10:00:00Z',
        },
        {
          id: 2,
          type: 'ad_status',
          title: '广告状态更新',
          description: '广告 #67890 已暂停',
          status: 'warning',
          resource_id: 67890,
          resource_type: 'ad',
          created_at: '2025-01-10T09:00:00Z',
        },
      ]

      const mockResponse = {
        data: {
          list: mockActivities,
          total: 2,
          page: {
            page: 1,
            page_size: 10,
          },
        },
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await getActivityList({ page: 1, page_size: 10 })

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/activity/list', {
        params: { page: 1, page_size: 10 },
      })
      expect(result.list).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.list[0]).toEqual(mockActivities[0])
    })

    it('fetches activity list with type filter', async () => {
      const mockResponse = {
        data: {
          list: [
            {
              id: 1,
              type: 'campaign_status',
              title: '广告计划状态更新',
              description: '广告计划 #12345 已启用',
              status: 'success',
              resource_id: 12345,
              resource_type: 'campaign',
              created_at: '2025-01-10T10:00:00Z',
            },
          ],
          total: 1,
          page: { page: 1, page_size: 10 },
        },
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await getActivityList({ 
        page: 1, 
        page_size: 10, 
        type: 'campaign_status' 
      })

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/activity/list', {
        params: { page: 1, page_size: 10, type: 'campaign_status' },
      })
      expect(result.list).toHaveLength(1)
      expect(result.list[0].type).toBe('campaign_status')
    })

    it('fetches activity list without parameters', async () => {
      const mockResponse = {
        data: {
          list: [],
          total: 0,
          page: { page: 1, page_size: 10 },
        },
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await getActivityList()

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/activity/list', {
        params: undefined,
      })
      expect(result.list).toHaveLength(0)
    })

    it('handles API errors gracefully', async () => {
      const errorMessage = 'Network error'
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      await expect(getActivityList()).rejects.toThrow(errorMessage)
    })

    it('validates activity data structure', async () => {
      const mockActivity: Activity = {
        id: 1,
        type: 'creative_upload',
        title: '创意上传完成',
        description: '视频创意 #11111 上传成功',
        status: 'success',
        resource_id: 11111,
        resource_type: 'creative',
        created_at: '2025-01-10T08:00:00Z',
      }

      const mockResponse = {
        data: {
          list: [mockActivity],
          total: 1,
          page: { page: 1, page_size: 10 },
        },
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await getActivityList()

      const activity = result.list[0]
      expect(activity).toHaveProperty('id')
      expect(activity).toHaveProperty('type')
      expect(activity).toHaveProperty('title')
      expect(activity).toHaveProperty('description')
      expect(activity).toHaveProperty('status')
      expect(activity).toHaveProperty('resource_id')
      expect(activity).toHaveProperty('resource_type')
      expect(activity).toHaveProperty('created_at')
    })

    it('validates activity status enum', async () => {
      const statuses: Array<'success' | 'error' | 'warning'> = ['success', 'error', 'warning']

      for (const status of statuses) {
        const mockResponse = {
          data: {
            list: [
              {
                id: 1,
                type: 'test',
                title: 'Test',
                description: 'Test',
                status,
                resource_id: 1,
                resource_type: 'campaign',
                created_at: '2025-01-10T10:00:00Z',
              },
            ],
            total: 1,
            page: { page: 1, page_size: 10 },
          },
        }

        vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

        const result = await getActivityList()
        expect(result.list[0].status).toBe(status)
      }
    })

    it('validates resource_type enum', async () => {
      const resourceTypes: Array<'campaign' | 'ad' | 'creative'> = ['campaign', 'ad', 'creative']

      for (const resourceType of resourceTypes) {
        const mockResponse = {
          data: {
            list: [
              {
                id: 1,
                type: 'test',
                title: 'Test',
                description: 'Test',
                status: 'success',
                resource_id: 1,
                resource_type: resourceType,
                created_at: '2025-01-10T10:00:00Z',
              },
            ],
            total: 1,
            page: { page: 1, page_size: 10 },
          },
        }

        vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

        const result = await getActivityList()
        expect(result.list[0].resource_type).toBe(resourceType)
      }
    })
  })
})
