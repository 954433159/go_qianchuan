import { apiClient } from './client'

/**
 * 全域推广（Uni Promotion）API
 * 新版推广模式，支持多场景智能投放
 */

// ==================== 全域推广计划管理 ====================

// 全域推广计划信息
export interface UniPromotionAd {
  ad_id: number
  advertiser_id: number
  campaign_id?: number
  ad_name: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED'
  opt_status: string
  marketing_goal: 'LIVE' | 'PRODUCT' | 'FANS' | 'BRAND'
  marketing_scene: string[]
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
  roi_goal?: number
  delivery_setting?: Record<string, any>
  create_time: string
  modify_time?: string
}

// 全域授权初始化
export interface AuthInitParams {
  advertiser_id: number
  aweme_id?: string
}

export const authInit = async (
  params: AuthInitParams
): Promise<void> => {
  await apiClient.post('/qianchuan/uni-promotion/auth-init', params)
}

// 新建全域推广计划
export interface CreateUniPromotionParams {
  advertiser_id: number
  ad_name: string
  marketing_goal: 'LIVE' | 'PRODUCT' | 'FANS' | 'BRAND'
  marketing_scene: string[]
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
  roi_goal?: number
  aweme_id?: string
  product_id?: string
  delivery_setting?: {
    start_time: string
    end_time?: string
  }
}

export const createUniPromotion = async (
  params: CreateUniPromotionParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/uni-promotion/create', params)
  return data
}

// 编辑全域推广计划
export interface UpdateUniPromotionParams {
  advertiser_id: number
  ad_id: number
  ad_name?: string
  budget?: number
  budget_mode?: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
  roi_goal?: number
}

export const updateUniPromotion = async (
  params: UpdateUniPromotionParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/uni-promotion/update', params)
  return data
}

// 更改全域推广计划状态
export interface UpdateUniPromotionStatusParams {
  advertiser_id: number
  ad_ids: number[]
  opt_status: 'ENABLE' | 'DISABLE' | 'DELETE'
}

export const updateUniPromotionStatus = async (
  params: UpdateUniPromotionStatusParams
): Promise<{ ad_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/uni-promotion/status/update', params)
  return data
}

// 获取全域推广列表
export interface GetUniPromotionListParams {
  advertiser_id: number
  filtering?: {
    ad_ids?: number[]
    status?: string[]
    marketing_goal?: string[]
  }
  page?: number
  page_size?: number
}

export const getUniPromotionList = async (
  params: GetUniPromotionListParams
): Promise<{ list: UniPromotionAd[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/uni-promotion/list', { params })
  return data
}

// 获取全域推广计划详情
export const getUniPromotionDetail = async (
  advertiserId: number,
  adId: number
): Promise<UniPromotionAd> => {
  const { data } = await apiClient.get('/qianchuan/uni-promotion/detail', {
    params: { advertiser_id: advertiserId, ad_id: adId }
  })
  return data
}

// ==================== 全域推广素材管理 ====================

// 获取全域推广计划下素材
export interface UniPromotionMaterial {
  material_id: string
  material_type: 'IMAGE' | 'VIDEO'
  url: string
  status: string
  create_time: string
}

export interface GetUniPromotionMaterialParams {
  advertiser_id: number
  ad_id: number
}

export const getUniPromotionMaterial = async (
  params: GetUniPromotionMaterialParams
): Promise<UniPromotionMaterial[]> => {
  const { data } = await apiClient.get('/qianchuan/uni-promotion/material/get', { params })
  return data?.list || []
}

// 删除全域推广计划下素材
export interface DeleteUniPromotionMaterialParams {
  advertiser_id: number
  ad_id: number
  material_ids: string[]
}

export const deleteUniPromotionMaterial = async (
  params: DeleteUniPromotionMaterialParams
): Promise<void> => {
  await apiClient.post('/qianchuan/uni-promotion/material/delete', params)
}

// ==================== 全域推广高级功能 ====================

// 获取可投全域推广抖音号列表
export interface AuthorizedAwemeForUni {
  aweme_id: string
  aweme_name: string
  aweme_avatar: string
  is_authorized: boolean
}

export const getAuthorizedAwemeForUni = async (
  advertiserId: number
): Promise<AuthorizedAwemeForUni[]> => {
  const { data } = await apiClient.get('/qianchuan/uni-promotion/aweme/authorized', {
    params: { advertiser_id: advertiserId }
  })
  return data?.list || []
}

// 更新商品全域推广计划名称
export interface UpdateUniPromotionNameParams {
  advertiser_id: number
  ad_id: number
  ad_name: string
}

export const updateUniPromotionName = async (
  params: UpdateUniPromotionNameParams
): Promise<void> => {
  await apiClient.post('/qianchuan/uni-promotion/ad/name/update', params)
}

// 更新全域推广计划预算
export interface UpdateUniPromotionBudgetParams {
  advertiser_id: number
  ad_ids: number[]
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
}

export const updateUniPromotionBudget = async (
  params: UpdateUniPromotionBudgetParams
): Promise<{ ad_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/uni-promotion/ad/budget/update', params)
  return data
}

// 更新全域推广控成本计划支付ROI目标
export interface UpdateUniPromotionRoiGoalParams {
  advertiser_id: number
  ad_ids: number[]
  roi_goal: number
}

export const updateUniPromotionRoiGoal = async (
  params: UpdateUniPromotionRoiGoalParams
): Promise<{ ad_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/uni-promotion/ad/roi-goal/update', params)
  return data
}

// 更新全域推广计划投放时间
export interface UpdateUniPromotionScheduleParams {
  advertiser_id: number
  ad_ids: number[]
  start_time: string
  end_time?: string
}

export const updateUniPromotionSchedule = async (
  params: UpdateUniPromotionScheduleParams
): Promise<{ ad_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/uni-promotion/ad/schedule-date/update', params)
  return data
}
