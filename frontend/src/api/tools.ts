import { apiClient } from './client'

/**
 * 千川SDK工具类API
 * 对齐后端9个实际可用的API端点
 */

// ============ 行业定向 ============

export interface Industry {
  id: number
  name: string
  level: number
  parent_id?: number
}

export interface IndustryParams {
  level?: number
  type?: string
}

/**
 * 获取行业列表
 * GET /qianchuan/tools/industry
 */
export const getIndustry = async (
  params?: IndustryParams
): Promise<Industry[]> => {
  const { data } = await apiClient.get('/qianchuan/tools/industry', { params })
  return data?.list || []
}

// ============ 兴趣定向 ============

export interface Interest {
  id: string
  name: string
  num?: number // 覆盖人数
}

/**
 * 获取兴趣类目
 * GET /qianchuan/tools/interest/category
 */
export const getInterestCategory = async (): Promise<Interest[]> => {
  const { data } = await apiClient.get('/qianchuan/tools/interest/category')
  return data?.list || []
}

export interface InterestKeywordParams {
  query_words: string
}

/**
 * 获取兴趣关键词
 * POST /qianchuan/tools/interest/keyword
 */
export const getInterestKeyword = async (
  params: InterestKeywordParams
): Promise<Interest[]> => {
  const { data } = await apiClient.post('/qianchuan/tools/interest/keyword', params)
  return data?.list || []
}

// ============ 行为定向 ============

export interface Action {
  id: string
  name: string
  num?: number // 覆盖人数
  days?: number // 行为天数（向后兼容）
}

export interface ActionCategoryParams {
  action_scene: string[]
  action_days: number
}

/**
 * 获取行为类目
 * POST /qianchuan/tools/action/category
 */
export const getActionCategory = async (
  params: ActionCategoryParams
): Promise<Action[]> => {
  const { data } = await apiClient.post('/qianchuan/tools/action/category', params)
  return data?.list || []
}

export interface ActionKeywordParams {
  query_words: string
  action_scene: string[]
  action_days: number
}

/**
 * 获取行为关键词
 * POST /qianchuan/tools/action/keyword
 */
export const getActionKeyword = async (
  params: ActionKeywordParams
): Promise<Action[]> => {
  const { data } = await apiClient.post('/qianchuan/tools/action/keyword', params)
  return data?.list || []
}

// ============ 抖音达人定向 ============

export interface AwemeCategory {
  id: number
  name: string
  level: number
  parent_id?: number
}

export interface AwemeCategoryParams {
  behaviors?: string[]
}

/**
 * 获取抖音类目列表
 * POST /qianchuan/tools/aweme/category
 */
export const getAwemeCategory = async (
  params?: AwemeCategoryParams
): Promise<AwemeCategory[]> => {
  const { data } = await apiClient.post('/qianchuan/tools/aweme/category', params || {})
  return data?.list || []
}

export interface AwemeAuthor {
  id: string
  name: string
  avatar?: string
  follower_count?: number
}

export interface AwemeAuthorParams {
  label_ids: number[]
  behaviors?: string[]
}

/**
 * 获取抖音达人信息
 * POST /qianchuan/tools/aweme/author
 */
export const getAwemeAuthorInfo = async (
  params: AwemeAuthorParams
): Promise<AwemeAuthor[]> => {
  const { data } = await apiClient.post('/qianchuan/tools/aweme/author', params)
  return data?.list || []
}

// ============ 动态创意词包 ============

export interface CreativeWord {
  id: string
  name: string
  word_list?: string[]
}

export interface CreativeWordParams {
  creative_word_ids?: string[]
}

/**
 * 获取动态创意词包
 * POST /qianchuan/tools/creative/word
 */
export const getCreativeWord = async (
  params?: CreativeWordParams
): Promise<CreativeWord[]> => {
  const { data } = await apiClient.post('/qianchuan/tools/creative/word', params || {})
  return data?.list || []
}

// ============ 前端常量数据（不需要API调用） ============

export interface AgeRange {
  value: string
  label: string
}

/**
 * 获取年龄段列表（前端常量）
 */
export const getAgeRanges = (): AgeRange[] => {
  return [
    { value: 'AGE_BELOW_18', label: '18岁以下' },
    { value: 'AGE_18_23', label: '18-23岁' },
    { value: 'AGE_24_30', label: '24-30岁' },
    { value: 'AGE_31_40', label: '31-40岁' },
    { value: 'AGE_41_49', label: '41-49岁' },
    { value: 'AGE_ABOVE_50', label: '50岁以上' },
  ]
}

export interface Gender {
  value: string
  label: string
}

/**
 * 获取性别列表（前端常量）
 */
export const getGenders = (): Gender[] => {
  return [
    { value: 'GENDER_MALE', label: '男性' },
    { value: 'GENDER_FEMALE', label: '女性' },
    { value: 'GENDER_UNLIMITED', label: '不限' },
  ]
}

// ============ 平台定向 ============

export interface Platform {
  value: string
  label: string
}

/**
 * 获取平台列表
 */
export const getPlatforms = (): Platform[] => {
  return [
    { value: 'IOS', label: 'iOS' },
    { value: 'ANDROID', label: 'Android' },
  ]
}

// ============ 网络定向 ============

export interface Network {
  value: string
  label: string
}

/**
 * 获取网络类型列表
 */
export const getNetworks = (): Network[] => {
  return [
    { value: 'WIFI', label: 'WiFi' },
    { value: '2G', label: '2G' },
    { value: '3G', label: '3G' },
    { value: '4G', label: '4G' },
    { value: '5G', label: '5G' },
  ]
}

// ============ 运营商定向 ============

export interface Carrier {
  value: string
  label: string
}

/**
 * 获取运营商列表
 */
export const getCarriers = (): Carrier[] => {
  return [
    { value: 'MOBILE', label: '中国移动' },
    { value: 'UNICOM', label: '中国联通' },
    { value: 'TELECOM', label: '中国电信' },
  ]
}

// ============ 人群包管理 ============

export interface Audience extends Record<string, unknown> {
  id: number
  advertiser_id: number
  name: string
  description?: string
  cover_num: number // 覆盖人数
  status: string
  tags_type?: string
  upload_type?: string
  create_time?: string
  modify_time?: string
}

export interface AudienceListParams {
  advertiser_id?: number // 向后兼容，实际不需要（从 session 获取）
  retargeting_tags_type?: number
  offset?: number
  limit?: number
  page?: number // 向后兼容，将转换为 offset
  page_size?: number // 向后兼容，将转换为 limit
}

/**
 * 获取人群包列表
 * GET /qianchuan/tools/audience/list
 */
export const getAudienceList = async (
  params?: AudienceListParams
): Promise<{ list: Audience[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/tools/audience/list', { params })
  return {
    list: data?.list || [],
    total: data?.total || 0
  }
}

// ============ 临时容器性存根（为旧组件提供支持） ============
// 这些函数将调用新API或返回空数据，建议更新组件使用新API

export interface Region {
  id: string
  name: string
  level: number
  parent_id?: string
}

export interface RegionListParams {
  advertiser_id: number
  level?: number
  parent_id?: string
}

/**
 * @deprecated 后端未实现，返回空数据
 */
export const getRegionList = async (_params: RegionListParams): Promise<Region[]> => {
  console.warn('getRegionList: API未实现，请使用其他定向方式')
  return []
}

export interface InterestListParams {
  advertiser_id: number
  keyword?: string
}

/**
 * @deprecated 请使用 getInterestCategory 或 getInterestKeyword
 */
export const getInterestList = async (_params: InterestListParams): Promise<Interest[]> => {
  console.warn('getInterestList: 请使用 getInterestCategory 替代')
  return await getInterestCategory()
}

/**
 * @deprecated 请使用 getInterestKeyword
 */
export const searchInterest = async (params: InterestListParams): Promise<Interest[]> => {
  if (!params.keyword) return []
  return await getInterestKeyword({ query_words: params.keyword })
}

export interface ActionListParams {
  advertiser_id: number
  keyword?: string
}

/**
 * @deprecated 请使用 getActionCategory
 */
export const getActionList = async (_params: ActionListParams): Promise<Action[]> => {
  console.warn('getActionList: 请使用 getActionCategory 并提供 action_scene 和 action_days')
  return []
}

/**
 * @deprecated 请使用 getActionKeyword
 */
export const searchAction = async (params: ActionListParams): Promise<Action[]> => {
  if (!params.keyword) return []
  console.warn('searchAction: 请使用 getActionKeyword 并提供 action_scene 和 action_days')
  return []
}

export interface DeviceBrand {
  id: string
  name: string
}

export interface DeviceBrandListParams {
  advertiser_id: number
  platform?: 'IOS' | 'ANDROID'
}

/**
 * @deprecated 后端未实现
 */
export const getDeviceBrandList = async (_params: DeviceBrandListParams): Promise<DeviceBrand[]> => {
  console.warn('getDeviceBrandList: API未实现')
  return []
}

export interface CreateAudienceParams {
  advertiser_id: number
  name: string
  description?: string
  upload_type: 'FILE' | 'API'
  data?: string[]
}

export interface UpdateAudienceParams {
  advertiser_id: number
  audience_id: number
  name?: string
  description?: string
}

/**
 * 创建人群包
 */
export const createAudience = async (params: CreateAudienceParams): Promise<{ audience_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/dmp/audience/create', params)
  return data
}

/**
 * 更新人群包
 */
export const updateAudience = async (params: UpdateAudienceParams): Promise<{ audience_id: number }> => {
  const { data } = await apiClient.post('/qianchuan/dmp/audience/update', params)
  return data
}

/**
 * 删除人群包
 */
export const deleteAudience = async (advertiserId: number, audienceIds: number[]): Promise<{ audience_ids: number[] }> => {
  const { data } = await apiClient.post('/qianchuan/dmp/audience/delete', {
    advertiser_id: advertiserId,
    audience_ids: audienceIds
  })
  return data
}
