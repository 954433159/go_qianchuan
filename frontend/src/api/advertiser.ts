import apiClient from './client'
import { Advertiser, ListResponse } from './types'

// 获取广告主列表
export const getAdvertiserList = (params?: {
  page?: number
  page_size?: number
}): Promise<ListResponse<Advertiser>> => {
  return apiClient.get('/advertiser/list', { params })
}

// 获取广告主详情
export const getAdvertiserInfo = (advertiserId: number) => {
  return apiClient.get<Advertiser>(`/advertiser/info`, {
    params: { advertiser_id: advertiserId }
  })
}

// 更新广告主信息
export const updateAdvertiser = (advertiserId: number, data: Partial<Advertiser>) => {
  return apiClient.post('/advertiser/update', {
    advertiser_id: advertiserId,
    ...data
  })
}

// ==================== 账户关系获取 ====================

// 获取千川账户下已授权抖音号
export interface AuthorizedAweme {
  aweme_id: string
  aweme_name: string
  aweme_avatar: string
  auth_status: 'AUTHORIZED' | 'UNAUTHORIZED'
  auth_time?: string
}

export const getAuthorizedAwemeList = async (
  advertiserId: number,
  page = 1,
  pageSize = 20
): Promise<{ list: AuthorizedAweme[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/advertiser/aweme/authorized', {
    params: { advertiser_id: advertiserId, page, page_size: pageSize }
  })
  return data
}

// 获取抖音号授权列表
export interface AwemeAuthInfo {
  aweme_id: string
  aweme_name: string
  auth_type: 'PRODUCT' | 'LIVE' | 'VIDEO'
  auth_status: 'AUTHORIZED' | 'UNAUTHORIZED'
}

export const getAwemeAuthList = async (
  advertiserId: number
): Promise<AwemeAuthInfo[]> => {
  const { data } = await apiClient.get('/qianchuan/advertiser/aweme/auth-list', {
    params: { advertiser_id: advertiserId }
  })
  return data?.list || []
}

// 获取店铺账户关联的广告账户列表
export interface ShopAdvertiser {
  advertiser_id: number
  advertiser_name: string
  shop_id: string
  shop_name: string
  relation_type: 'OWNER' | 'AUTHORIZED'
}

export const getShopAdvertiserList = async (
  shopId: string
): Promise<ShopAdvertiser[]> => {
  const { data } = await apiClient.get('/qianchuan/shop/advertiser/list', {
    params: { shop_id: shopId }
  })
  return data?.list || []
}

// 获取代理商账户关联的广告账户列表
export interface AgentAdvertiser extends Record<string, unknown> {
  advertiser_id: number
  advertiser_name: string
  company: string
  status: string
}

export const getAgentAdvertiserList = async (
  agentId: number,
  page = 1,
  pageSize = 100
): Promise<{ list: AgentAdvertiser[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/agent/advertiser/select', {
    params: { agent_id: agentId, page, page_size: pageSize }
  })
  return data
}

// 广告主添加抖音号
export interface AwemeAuthParams {
  advertiser_id: number
  aweme_id: string
  auth_type: 'PRODUCT' | 'LIVE' | 'VIDEO'
}

export const addAwemeAuth = async (
  params: AwemeAuthParams
): Promise<boolean> => {
  const { data } = await apiClient.post('/qianchuan/tools/aweme/auth', params)
  return data?.success || false
}

// 店铺新客定向授权
export interface ShopAuthParams {
  advertiser_id: number
  shop_id: string
}

export const authorizeShop = async (
  params: ShopAuthParams
): Promise<void> => {
  await apiClient.post('/qianchuan/tools/shop/auth', params)
}

// ==================== 账户详细信息 ====================

// 获取代理商信息
export interface AgentInfo {
  agent_id: number
  agent_name: string
  company: string
  contact: string
  email?: string
}

export const getAgentInfo = async (
  agentId: number
): Promise<AgentInfo> => {
  const { data } = await apiClient.get('/qianchuan/agent/info', {
    params: { agent_id: agentId }
  })
  return data
}

// 获取店铺账户信息
export interface ShopInfo {
  shop_id: string
  shop_name: string
  shop_type: string
  status: string
  create_time: string
}

export const getShopInfo = async (
  shopIds: string[]
): Promise<ShopInfo[]> => {
  const { data } = await apiClient.get('/qianchuan/shop/get', {
    params: { shop_ids: shopIds.join(',') }
  })
  return data?.list || []
}

// 获取广告账户基础信息
export interface PublicInfo {
  advertiser_id: number
  advertiser_name: string
  company: string
  role: string
  status: string
}

export const getAdvertiserPublicInfo = async (
  advertiserIds: number[]
): Promise<PublicInfo[]> => {
  const { data } = await apiClient.get('/qianchuan/advertiser/public-info', {
    params: { advertiser_ids: advertiserIds.join(',') }
  })
  return data?.list || []
}

// 获取广告账户全量信息
export interface FullAdvertiserInfo extends PublicInfo {
  balance: number
  budget: number
  create_time: string
  industry: string
  contact: string
}

export const getAdvertiserFullInfo = async (
  advertiserIds: number[]
): Promise<FullAdvertiserInfo[]> => {
  const { data } = await apiClient.get('/qianchuan/advertiser/info', {
    params: { advertiser_ids: advertiserIds.join(',') }
  })
  return data?.list || []
}

// 获取账户类型
export interface AdvertiserType {
  advertiser_id: number
  type: 'SHOP' | 'AGENT' | 'BRAND'
  type_name: string
}

export const getAdvertiserType = async (
  advertiserIds: number[]
): Promise<AdvertiserType[]> => {
  const { data } = await apiClient.get('/qianchuan/advertiser/type', {
    params: { advertiser_ids: advertiserIds.join(',') }
  })
  return data?.list || []
}

// ==================== 账户预算管理 ====================

// 获取账户日预算
export interface AccountBudget {
  advertiser_id: number
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE'
}

export const getAccountBudget = async (
  advertiserId: number
): Promise<AccountBudget> => {
  const { data } = await apiClient.get('/qianchuan/advertiser/budget/get', {
    params: { advertiser_id: advertiserId }
  })
  return data
}

// 更新账户日预算
export interface UpdateAccountBudgetParams {
  advertiser_id: number
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE'
}

export const updateAccountBudget = async (
  params: UpdateAccountBudgetParams
): Promise<void> => {
  await apiClient.post('/qianchuan/advertiser/budget/update', params)
}
