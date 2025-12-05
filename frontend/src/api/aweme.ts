import { apiClient } from './client'

/**
 * 随心推（Aweme Order）API
 * 用于短视频推广订单管理
 */

// ==================== 随心推订单管理 ====================

// 随心推订单信息
export interface AwemeOrder {
  order_id: string
  advertiser_id: number
  aweme_id: string
  item_id: string
  order_name: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DELETED'
  opt_status: string
  budget: number
  budget_mode: 'BUDGET_MODE_TOTAL'
  delivery_mode: 'DELIVERY_MODE_STANDARD' | 'DELIVERY_MODE_ACCELERATE'
  delivery_setting: {
    start_time: string
    end_time?: string
    schedule_type: string
  }
  audience_targeting?: Record<string, any>
  create_time: string
  modify_time?: string
}

// 创建随心推订单
export interface CreateAwemeOrderParams {
  advertiser_id: number
  aweme_id: string
  item_id: string
  order_name: string
  budget: number
  delivery_mode: 'DELIVERY_MODE_STANDARD' | 'DELIVERY_MODE_ACCELERATE'
  delivery_setting: {
    start_time: string
    end_time?: string
  }
  audience_targeting?: {
    gender?: 'NONE' | 'MALE' | 'FEMALE'
    age?: string[]
    region?: string[]
    interest_tags?: string[]
  }
  external_action?: string
  roi_goal?: number
}

export const createAwemeOrder = async (
  params: CreateAwemeOrderParams
): Promise<AwemeOrder> => {
  const { data } = await apiClient.post('/qianchuan/aweme/order/create', params)
  return data
}

// 获取随心推订单列表
export interface GetAwemeOrderListParams {
  advertiser_id: number
  aweme_id?: string
  filtering?: {
    order_ids?: string[]
    status?: string[]
  }
  page?: number
  page_size?: number
}

export const getAwemeOrderList = async (
  params: GetAwemeOrderListParams
): Promise<{ list: AwemeOrder[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/aweme/order/get', { params })
  return data
}

// 获取随心推订单详情
export const getAwemeOrderDetail = async (
  advertiserId: number,
  orderId: string
): Promise<AwemeOrder> => {
  const { data } = await apiClient.get('/qianchuan/aweme/order/detail/get', {
    params: { advertiser_id: advertiserId, order_id: orderId }
  })
  return data
}

// 终止随心推订单
export interface TerminateAwemeOrderParams {
  advertiser_id: number
  order_ids: string[]
}

export const terminateAwemeOrder = async (
  params: TerminateAwemeOrderParams
): Promise<{ order_ids: string[] }> => {
  const { data } = await apiClient.post('/qianchuan/aweme/order/terminate', params)
  return data
}

// 追加随心推订单预算
export interface AddAwemeOrderBudgetParams {
  advertiser_id: number
  order_id: string
  add_budget: number
}

export const addAwemeOrderBudget = async (
  params: AddAwemeOrderBudgetParams
): Promise<void> => {
  await apiClient.post('/qianchuan/aweme/order/budget/add', params)
}

// ==================== 随心推辅助工具 ====================

// 获取随心推可投视频列表
export interface AwemeVideoItem {
  item_id: string
  title: string
  cover_url: string
  duration: number
  create_time: string
  is_promotable: boolean
}

export interface GetAwemeVideoListParams {
  advertiser_id: number
  aweme_id: string
  cursor?: number
  count?: number
}

export const getAwemeVideoList = async (
  params: GetAwemeVideoListParams
): Promise<{ list: AwemeVideoItem[]; cursor: number; has_more: boolean }> => {
  const { data } = await apiClient.get('/qianchuan/aweme/video/get', { params })
  return data
}

// 获取随心推投放效果预估
export interface EstimateProfitParams {
  advertiser_id: number
  aweme_id: string
  item_id: string
  budget: number
  delivery_mode: string
  external_action: string
}

export interface EstimateProfit {
  estimated_views: number
  estimated_clicks: number
  estimated_conversions: number
  estimated_roi?: number
}

export const getEstimateProfit = async (
  params: EstimateProfitParams
): Promise<EstimateProfit> => {
  const { data } = await apiClient.post('/qianchuan/aweme/estimate', params)
  return data
}

// 获取随心推短视频建议出价
export interface SuggestAwemeBidParams {
  advertiser_id: number
  aweme_id: string
  external_action: string
}

export const getSuggestAwemeBid = async (
  params: SuggestAwemeBidParams
): Promise<{ suggested_bid: number }> => {
  const { data } = await apiClient.post('/qianchuan/aweme/suggest/bid', params)
  return data
}

// 获取随心推ROI建议出价
export interface SuggestAwemeRoiGoalParams {
  advertiser_id: number
  aweme_id: string
  external_action: string
}

export const getSuggestAwemeRoiGoal = async (
  _params: SuggestAwemeRoiGoalParams
): Promise<{ suggested_roi_goal: number }> => {
  // TODO: Backend endpoint not implemented yet
  // Should be: POST /qianchuan/aweme/suggest/roi-goal
  throw new Error('ROI建议功能暂未实现，请联系管理员')
}

// 查询随心推使用中订单配额信息
export interface AwemeOrderQuota {
  quota: number
  quota_used: number
  quota_available: number
}

export const getAwemeOrderQuota = async (
  advertiserId: number
): Promise<AwemeOrderQuota> => {
  const { data } = await apiClient.get('/qianchuan/aweme/quota', {
    params: { advertiser_id: advertiserId }
  })
  return data
}

// 获取建议延长时长
export interface SuggestDeliveryTimeParams {
  advertiser_id: number
  order_id: string
}

export const getSuggestDeliveryTime = async (
  _params: SuggestDeliveryTimeParams
): Promise<{ suggested_delivery_time: number }> => {
  // TODO: Backend endpoint not implemented yet
  throw new Error('延长时长建议功能暂未实现，请联系管理员')
}

// 获取随心推兴趣标签
export interface InterestKeyword {
  id: string
  name: string
  num?: number
}

export const getAwemeInterestKeywords = async (
  _advertiserId: number
): Promise<InterestKeyword[]> => {
  // TODO: Backend endpoint not implemented yet
  // This should use the general interest keyword API from tools handler
  // Fallback to tools API or return empty for now
  throw new Error('随心推兴趣标签功能暂未实现，请使用定向工具中的兴趣关键词功能')
}
