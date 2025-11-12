import { apiClient } from './client'

/**
 * 关键词管理API
 * 包含关键词包、否定词、推荐词等功能
 */

// ========== 关键词包 ==========

export interface KeywordPackage {
  id: number
  name: string
  keyword_count: number
  match_type: 'EXACT' | 'PHRASE' | 'BROAD'
  status: 'ENABLE' | 'DISABLE'
  create_time: string
  update_time: string
}

export interface KeywordPackageListParams {
  advertiser_id: number
  page?: number
  page_size?: number
  filtering?: {
    keyword_package_ids?: number[]
    status?: string[]
  }
}

export interface KeywordPackageListResponse {
  list: KeywordPackage[]
  total: number
  page: {
    page: number
    page_size: number
  }
}

/**
 * 获取关键词包列表
 */
export const getKeywordPackageList = async (
  params: KeywordPackageListParams
): Promise<KeywordPackageListResponse> => {
  const { data } = await apiClient.get('/qianchuan/keyword/package/list', { params })
  return data
}

// ========== 关键词推荐 ==========

export interface KeywordRecommendation {
  keyword: string
  relevance_score: number
  competition_level: 'HIGH' | 'MEDIUM' | 'LOW'
  suggested_bid?: number
}

export interface KeywordRecommendParams {
  advertiser_id: number
  query?: string
  product_id?: number
  limit?: number
}

/**
 * 获取关键词推荐
 */
export const getKeywordRecommendations = async (
  params: KeywordRecommendParams
): Promise<KeywordRecommendation[]> => {
  const { data } = await apiClient.get('/qianchuan/keyword/recommend', { params })
  return data
}

// ========== 关键词合规校验 ==========

export interface KeywordComplianceCheckParams {
  advertiser_id: number
  keywords: string[]
}

export interface KeywordComplianceResult {
  keyword: string
  is_compliant: boolean
  reason?: string
}

/**
 * 检查关键词合规性
 */
export const checkKeywordCompliance = async (
  params: KeywordComplianceCheckParams
): Promise<KeywordComplianceResult[]> => {
  const { data } = await apiClient.post('/qianchuan/keyword/compliance/check', params)
  return data
}

// ========== 关键词包创建/更新 ==========

export interface CreateKeywordPackageParams {
  advertiser_id: number
  name: string
  keywords: string[]
  match_type: 'EXACT' | 'PHRASE' | 'BROAD'
}

export interface UpdateKeywordPackageParams {
  advertiser_id: number
  keyword_package_id: number
  name?: string
  keywords?: string[]
  match_type?: 'EXACT' | 'PHRASE' | 'BROAD'
  opt_status?: 'ENABLE' | 'DISABLE'
}

/**
 * 创建关键词包
 */
export const createKeywordPackage = async (
  params: CreateKeywordPackageParams
): Promise<{ keyword_package_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/keyword/package/create', params)
  return data
}

/**
 * 更新关键词包
 */
export const updateKeywordPackage = async (
  params: UpdateKeywordPackageParams
): Promise<{ keyword_package_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/keyword/package/update', params)
  return data
}

// ========== 否定词 ==========

export interface NegativeKeyword {
  id: number
  keyword: string
  level: 'CAMPAIGN' | 'AD'
  create_time: string
}

export interface NegativeKeywordListParams {
  advertiser_id: number
  campaign_id?: number
  ad_id?: number
}

/**
 * 获取否定词列表
 */
export const getNegativeKeywordList = async (
  params: NegativeKeywordListParams
): Promise<NegativeKeyword[]> => {
  const { data } = await apiClient.get('/qianchuan/keyword/negative/list', { params })
  return data
}

export interface UpdateNegativeKeywordsParams {
  advertiser_id: number
  campaign_id?: number
  ad_id?: number
  negative_keywords: string[]
}

/**
 * 全量更新否定词
 */
export const updateNegativeKeywords = async (
  params: UpdateNegativeKeywordsParams
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post('/qianchuan/keyword/negative/update', params)
  return data
}

// ========== 系统推荐词 ==========

export interface SystemRecommendKeyword {
  keyword: string
  category: string
  heat_score: number
  suggested_bid: number
}

export interface SystemRecommendParams {
  advertiser_id: number
  category?: string
  limit?: number
}

/**
 * 获取系统推荐关键词
 */
export const getSystemRecommendKeywords = async (
  params: SystemRecommendParams
): Promise<SystemRecommendKeyword[]> => {
  const { data } = await apiClient.get('/qianchuan/keyword/system/recommend', { params })
  return data
}
