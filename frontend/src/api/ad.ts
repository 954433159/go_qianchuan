import { apiClient } from './client'
import { Ad, PaginatedResponse } from './types'

export interface AdListParams {
  advertiser_id: number
  page?: number
  page_size?: number
  filtering?: {
    ad_ids?: number[]
    campaign_ids?: number[]
    status?: string[]
  }
}

export interface CreateAdParams {
  advertiser_id: number
  campaign_id: number
  ad_name: string
  delivery_setting: {
    budget: number
    budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
    start_time: string
    end_time?: string
    schedule_type: 'SCHEDULE_FROM_NOW' | 'SCHEDULE_START_END'
  }
  audience: {
    gender: 'NONE' | 'MALE' | 'FEMALE'
    age: string[]
    region: string[]
    interest_tags?: string[]
    action_tags?: string[]
    device_brand_ids?: string[]
    platform?: string[]
    network?: string[]
    carrier?: string[]
    audience_package_ids?: number[]
  }
  creative_material_mode: 'CUSTOM' | 'PROGRAMMATIC'
}

export interface UpdateAdParams {
  advertiser_id: number
  ad_id: number
  ad_name?: string
  delivery_setting?: {
    budget?: number
    budget_mode?: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
  }
}

export interface AdStatusParams {
  advertiser_id: number
  ad_ids: number[]
  opt_status: 'ENABLE' | 'DISABLE' | 'DELETE'
}

export const getAdList = async (
  params: AdListParams
): Promise<PaginatedResponse<Ad>> => {
  const { data } = await apiClient.get('/qianchuan/ad/list', { params })
  return data
}

export const getAdDetail = async (
  advertiserId: number,
  adId: number
): Promise<Ad> => {
  const { data } = await apiClient.get('/qianchuan/ad/get', {
    params: { advertiser_id: advertiserId, ad_id: adId }
  })
  return data
}

export const createAd = async (
  params: CreateAdParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/ad/create', params)
  return data
}

export const updateAd = async (
  params: UpdateAdParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/ad/update', params)
  return data
}

export const updateAdStatus = async (
  params: AdStatusParams
): Promise<{ ad_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/ad/status/update', params)
  return data
}

// ==================== 广告计划高级功能 ====================

// 批量更新出价
export interface UpdateAdBidParams {
  advertiser_id: number
  ad_ids: number[]
  bid: number
}

export const updateAdBid = async (
  params: UpdateAdBidParams
): Promise<{ ad_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/ad/bid/update', params)
  return data
}

// 批量更新预算
export interface UpdateAdBudgetParams {
  advertiser_id: number
  ad_ids: number[]
  budget: number
  budget_mode?: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
}

export const updateAdBudget = async (
  params: UpdateAdBudgetParams
): Promise<{ ad_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/ad/budget/update', params)
  return data
}

// 更新ROI目标
export interface UpdateAdRoiGoalParams {
  advertiser_id: number
  ad_id: number
  roi_goal: number
}

export const updateAdRoiGoal = async (
  params: UpdateAdRoiGoalParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/ad/update/roi-goal', params)
  return data
}

// 更新投放时间
export interface UpdateAdScheduleDateParams {
  advertiser_id: number
  ad_id: number
  start_time: string
  end_time?: string
}

export const updateAdScheduleDate = async (
  params: UpdateAdScheduleDateParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/ad/schedule/date/update', params)
  return data
}

// 更新投放时段
export interface UpdateAdScheduleTimeParams {
  advertiser_id: number
  ad_id: number
  schedule_time: string // "000000-235959" 或自定义时段
}

export const updateAdScheduleTime = async (
  params: UpdateAdScheduleTimeParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/ad/schedule/time/update', params)
  return data
}

// 更新投放时长
export interface UpdateAdScheduleFixedRangeParams {
  advertiser_id: number
  ad_id: number
  schedule_fixed_range: number // 投放时长（小时）
}

export const updateAdScheduleFixedRange = async (
  params: UpdateAdScheduleFixedRangeParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/ad/schedule/fixed-range/update', params)
  return data
}

// 更新地域定向
export interface UpdateAdRegionParams {
  advertiser_id: number
  ad_id: number
  region: string[]
  region_type?: 'REGION' | 'CITY' | 'BUSINESS_DISTRICT'
}

export const updateAdRegion = async (
  params: UpdateAdRegionParams
): Promise<{ ad_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/ad/region/update', params)
  return data
}

// ==================== 审核和状态查询 ====================

// 审核建议
export interface RejectReason {
  reject_reason: string
  reject_detail?: string
}

export const getAdRejectReason = async (
  advertiserId: number,
  adId: number
): Promise<RejectReason[]> => {
  const { data } = await apiClient.get('/qianchuan/ad/reject-reason', {
    params: { advertiser_id: advertiserId, ad_id: adId }
  })
  return data?.list || []
}

// 学习期状态
export interface LearningStatus {
  ad_id: number
  learning_phase: 'LEARNING' | 'LEARNED' | 'FAILED'
  learning_stage?: string
}

export const getAdLearningStatus = async (
  advertiserId: number,
  adIds: number[]
): Promise<LearningStatus[]> => {
  const { data } = await apiClient.get('/qianchuan/ad/learning-status', {
    params: { advertiser_id: advertiserId, ad_ids: adIds.join(',') }
  })
  return data?.list || []
}

// 成本保障状态
export interface CompensateStatus {
  ad_id: number
  compensate_status: 'ENABLED' | 'DISABLED'
  compensate_amount?: number
}

export const getAdCompensateStatus = async (
  advertiserId: number,
  adIds: number[]
): Promise<CompensateStatus[]> => {
  const { data } = await apiClient.get('/qianchuan/ad/compensate-status', {
    params: { advertiser_id: advertiserId, ad_ids: adIds.join(',') }
  })
  return data?.list || []
}

// 低效计划列表
export const getLowQualityAds = async (
  advertiserId: number
): Promise<number[]> => {
  const { data } = await apiClient.get('/qianchuan/ad/low-quality', {
    params: { advertiser_id: advertiserId }
  })
  return data?.ad_ids || []
}

// ==================== 智能建议工具 ====================

// 建议出价
export interface SuggestBidParams {
  advertiser_id: number
  campaign_id?: number
  delivery_setting?: {
    budget: number
    budget_mode: string
  }
  audience?: Record<string, any>
}

export interface SuggestBidResult {
  suggested_bid: number
  bid_range: {
    min: number
    max: number
  }
}

export const getSuggestBid = async (
  params: SuggestBidParams
): Promise<SuggestBidResult> => {
  const { data } = await apiClient.post('/qianchuan/ad/suggest-bid', params)
  return data
}

// 建议ROI目标
export interface SuggestRoiGoalParams {
  advertiser_id: number
  campaign_id?: number
  delivery_setting?: Record<string, any>
}

export interface SuggestRoiGoalResult {
  suggested_roi_goal: number
  roi_range: {
    min: number
    max: number
  }
}

export const getSuggestRoiGoal = async (
  params: SuggestRoiGoalParams
): Promise<SuggestRoiGoalResult> => {
  const { data } = await apiClient.post('/qianchuan/ad/suggest-roi-goal', params)
  return data
}

// 建议预算
export interface SuggestBudgetParams {
  advertiser_id: number
  campaign_id?: number
  delivery_setting?: Record<string, any>
}

export interface SuggestBudgetResult {
  suggested_budget: number
  budget_range: {
    min: number
    max: number
  }
}

export const getSuggestBudget = async (
  params: SuggestBudgetParams
): Promise<SuggestBudgetResult> => {
  const { data } = await apiClient.post('/qianchuan/ad/suggest-budget', params)
  return data
}

// 预估效果
export interface EstimateEffectParams {
  advertiser_id: number
  campaign_id?: number
  delivery_setting: Record<string, any>
  audience: Record<string, any>
  bid: number
  budget: number
}

export interface EstimateEffectResult {
  estimated_impressions: number
  estimated_clicks: number
  estimated_conversions: number
  estimated_cost: number
}

export const getEstimateEffect = async (
  params: EstimateEffectParams
): Promise<EstimateEffectResult> => {
  const { data } = await apiClient.post('/qianchuan/ad/estimate-effect', params)
  return data
}

// 在投计划配额信息
export interface AdQuota {
  ad_quota: number
  ad_quota_used: number
  ad_quota_available: number
}

export const getAdQuota = async (
  advertiserId: number
): Promise<AdQuota> => {
  const { data } = await apiClient.get('/qianchuan/ad/quota', {
    params: { advertiser_id: advertiserId }
  })
  return data
}
