import { apiClient } from './client'
import { Creative, PaginatedResponse } from './types'

export interface CreativeListParams {
  advertiser_id: number
  page?: number
  page_size?: number
  filtering?: {
    creative_ids?: number[]
    ad_ids?: number[]
    creative_material_mode?: string[]
  }
}

export interface CreateCreativeParams {
  advertiser_id: number
  ad_id: number
  creative_material_mode: 'CUSTOM' | 'PROGRAMMATIC'
  title: string
  image_ids?: string[]
  video_id?: string
  third_party_id?: string
}

export interface UpdateCreativeParams {
  advertiser_id: number
  creative_id: number
  title?: string
  image_ids?: string[]
  video_id?: string
}

export const getCreativeList = async (
  params: CreativeListParams
): Promise<PaginatedResponse<Creative>> => {
  const { data } = await apiClient.get('/qianchuan/creative/list', { params })
  return data
}

export const getCreativeDetail = async (
  advertiserId: number,
  creativeId: number
): Promise<Creative> => {
  const { data } = await apiClient.get('/qianchuan/creative/get', {
    params: { advertiser_id: advertiserId, creative_id: creativeId }
  })
  return data
}

export const createCreative = async (
  params: CreateCreativeParams
): Promise<{ creative_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/creative/create', params)
  return data
}

export const updateCreative = async (
  params: UpdateCreativeParams
): Promise<{ creative_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/creative/update', params)
  return data
}

export interface UpdateCreativeStatusParams {
  advertiser_id: number
  creative_ids: number[]
  opt_status: 'ENABLE' | 'DISABLE' | 'DELETE'
}

/**
 * 批量更新创意状态
 * @param params - 状态更新参数
 * @returns 更新结果
 */
export const updateCreativeStatus = async (
  params: UpdateCreativeStatusParams
): Promise<{ creative_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/creative/update-status', params)
  return data
}
