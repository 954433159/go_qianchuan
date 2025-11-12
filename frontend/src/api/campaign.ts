import { apiClient } from './client'
import { Campaign, PaginatedResponse } from './types'

export interface CampaignListParams {
  advertiser_id: number
  page?: number
  page_size?: number
  filtering?: {
    campaign_ids?: number[]
    status?: string[]
  }
}

export interface CreateCampaignParams {
  advertiser_id: number
  name: string
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE'
  landing_type: 'LINK' | 'APP' | 'MICRO_GAME' | 'DPA'
}

export interface UpdateCampaignParams {
  advertiser_id: number
  campaign_id: number
  name?: string
  budget?: number
  budget_mode?: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE'
}

export interface CampaignStatusParams {
  advertiser_id: number
  campaign_ids: number[]
  opt_status: 'ENABLE' | 'DISABLE' | 'DELETE'
}

export const getCampaignList = async (
  params: CampaignListParams
): Promise<PaginatedResponse<Campaign>> => {
  const { data } = await apiClient.get('/qianchuan/campaign/list', { params })
  return data
}

export const getCampaignDetail = async (
  advertiserId: number,
  campaignId: number
): Promise<Campaign> => {
  const { data } = await apiClient.get('/qianchuan/campaign/get', {
    params: { advertiser_id: advertiserId, campaign_id: campaignId }
  })
  return data
}

export const createCampaign = async (
  params: CreateCampaignParams
): Promise<{ campaign_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/campaign/create', params)
  return data
}

export const updateCampaign = async (
  params: UpdateCampaignParams
): Promise<{ campaign_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/campaign/update', params)
  return data
}

export const updateCampaignStatus = async (
  params: CampaignStatusParams
): Promise<{ campaign_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/campaign/status/update', params)
  return data
}
