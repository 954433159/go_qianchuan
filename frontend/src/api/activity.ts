import { apiClient } from './client'

export interface Activity {
  id: number
  type: string
  title: string
  description: string
  status: 'success' | 'error' | 'warning'
  resource_id: number
  resource_type: 'campaign' | 'ad' | 'creative'
  created_at: string
}

export interface ActivityListParams {
  page?: number
  page_size?: number
  type?: string
}

export interface ActivityListResponse {
  list: Activity[]
  total: number
  page: {
    page: number
    page_size: number
  }
}

export const getActivityList = async (
  params?: ActivityListParams
): Promise<ActivityListResponse> => {
  const { data } = await apiClient.get('/qianchuan/activity/list', { params })
  return data
}
