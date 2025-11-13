// 分页信息
export interface PageInfo {
  page: number
  page_size: number
  total_count: number
  total_page: number
}

// 广告主信息
export interface Advertiser extends Record<string, unknown> {
  id: number
  name: string
  company: string
  role: string
  status: 'ENABLE' | 'DISABLE'
  balance: number
  create_time: string
}

// 广告组信息
export interface Campaign extends Record<string, unknown> {
  id: number
  advertiser_id: number
  name: string
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
  status: string
  opt_status: string
  create_time: string
  modify_time: string
  stat?: StatData
}

// 受众信息
export interface AudienceData {
  gender?: 'NONE' | 'MALE' | 'FEMALE'
  age?: string[]
  district?: string[]
  region?: string[]
  interest_tags?: string[]
  action_tags?: string[]
  device_brand_ids?: string[]
  platform?: string[]
  network?: string[]
  carrier?: string[]
  audience_package_ids?: number[]
}

// 广告计划信息
export interface Ad extends Record<string, unknown> {
  id: number
  campaign_id: number
  advertiser_id: number
  name: string
  status: string
  opt_status: string
  budget: number
  bid: number
  create_time: string
  modify_time?: string
  creative_material_mode?: 'CUSTOM' | 'PROGRAMMATIC'
  learning_phase?: Record<string, unknown>
  budget_mode?: Record<string, unknown>
  delivery_setting?: {
    budget: number
    budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
    start_time?: string
    end_time?: string
    schedule_type?: 'SCHEDULE_FROM_NOW' | 'SCHEDULE_START_END'
  }
  audience?: AudienceData
  stat?: StatData
}

// 创意信息
export interface Creative extends Record<string, unknown> {
  id: number
  ad_id: number
  advertiser_id?: number
  title: string
  status: string
  image_mode: string
  creative_material_mode: string
  material_type?: 'IMAGE' | 'VIDEO'
  audit_status?: 'PASSED' | 'PENDING' | 'REJECTED' | 'REJECT'
  audit_reject_reason?: string
  third_party_id?: string
  // 素材URL
  image_url?: string
  image_urls?: string[]
  video_url?: string
  video_id?: string
  image_ids?: unknown[]
  // 统计数据
  stat_cost?: number
  show_cnt?: number
  click_cnt?: number
  convert_cnt?: number
  impressions?: number
  clicks?: number
  conversions?: number
  ctr?: number
  cvr?: number
  // 时间信息
  create_time: string
  modify_time?: string
}

// 素材信息
export interface Material extends Record<string, unknown> {
  id: string
  material_id: number
  filename: string
  url: string
  size: number
  width: number
  height: number
  duration?: number
  format: string
  signature: string
  create_time: string
}

// 文件信息（用于上传/预览）
export interface FileInfo {
  file_id: string
  filename: string
  file_url: string
  cover_url?: string  // 视频封面图
  width?: number
  height?: number
  size: number
  duration?: number  // 视频时长(秒)
  format?: string    // 文件格式
  poster_url?: string // 海报图URL
  create_time?: string
}

// 统计数据
export interface StatData {
  cost?: number
  show_cnt?: number
  click_cnt?: number
  convert_cnt?: number
  ctr?: number
  avg_click_cost?: number
  convert_rate?: number
  roi?: number
}

// 报表数据
export interface ReportData {
  stat_cost: number
  show_cnt: number
  click_cnt: number
  ctr: number
  pay_order_count: number
  pay_order_amount: number
  create_order_roi: number
}

// OAuth参数
export interface OAuthParams {
  app_id: string
  state: string
  scope: string
  redirect_uri: string
}

// 请求响应包装
export interface ListResponse<T> {
  list: T[]
  page_info: PageInfo
}

// 分页响应类型（别名）
export type PaginatedResponse<T> = ListResponse<T>
