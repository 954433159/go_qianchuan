/**
 * 业务实体类型定义
 */

import { AdStatus, AuditStatus, DeliveryStatus } from './api'

// 广告主
export interface Advertiser {
  advertiser_id: number
  advertiser_name: string
  company: string
  role: string
  status: string
  created_time: string
  updated_time?: string
}

// 广告组
export interface Campaign {
  campaign_id: number
  campaign_name: string
  advertiser_id: number
  landing_type: string
  budget: number
  budget_mode: string
  status: AdStatus
  delivery_status?: DeliveryStatus
  created_time: string
  updated_time?: string
  modify_time?: string
}

// 广告计划
export interface Ad {
  ad_id: number
  ad_name: string
  advertiser_id: number
  campaign_id: number
  status: AdStatus
  delivery_status?: DeliveryStatus
  audit_status?: AuditStatus
  delivery_mode: string
  budget: number
  bid: number
  roi_goal?: number
  start_time: string
  end_time: string
  created_time: string
  updated_time?: string
  modify_time?: string
}

// 创意
export interface Creative {
  creative_id: number
  creative_name: string
  advertiser_id: number
  ad_id: number
  image_id?: string
  video_id?: string
  title: string
  description?: string
  status: AdStatus
  audit_status?: AuditStatus
  audit_reject_reason?: string
  created_time: string
  updated_time?: string
}

// 文件/素材
export interface Material {
  material_id: string
  advertiser_id: number
  file_name: string
  file_type: 'image' | 'video'
  file_url: string
  file_size: number
  width?: number
  height?: number
  duration?: number // 视频时长（秒）
  signature: string
  upload_time: string
  status: string
}

// 报表数据
export interface ReportData {
  stat_datetime: string
  advertiser_id?: number
  campaign_id?: number
  ad_id?: number
  creative_id?: number
  // 展现数据
  show: number
  // 点击数据
  click: number
  ctr: number
  // 转化数据
  convert: number
  conversion_cost: number
  conversion_rate: number
  // 消耗数据
  cost: number
  cpm: number
  cpc: number
  // ROI数据
  roi?: number
  // 其他指标
  avg_show_cost?: number
  avg_click_cost?: number
}

// 关键词
export interface Keyword {
  keyword_id: number
  advertiser_id: number
  ad_id: number
  word: string
  match_type: 'PHRASE' | 'EXACT' | 'EXTENSIVE'
  bid: number
  status: AdStatus
  created_time: string
}

// 否定词
export interface NegativeKeyword {
  phrase_id: number
  advertiser_id: number
  phrase_words: string[]
  created_time: string
}

// 定向包
export interface Audience {
  audience_package_id: number
  advertiser_id: number
  name: string
  description?: string
  audience_count?: number
  status: string
  created_time: string
  updated_time?: string
}

// 直播间
export interface LiveRoom {
  room_id: string
  advertiser_id: number
  aweme_id: string
  room_title: string
  room_status: 'live' | 'pause' | 'finish'
  live_start_time?: string
  live_end_time?: string
  cover_url?: string
  audience_count?: number
}

// 随心推订单
export interface AwemeOrder {
  aweme_order_id: number
  advertiser_id: number
  aweme_id: string
  aweme_name: string
  budget: number
  delivery_mode: string
  status: AdStatus
  delivery_status?: DeliveryStatus
  created_time: string
  end_time?: string
}

// 全域推广
export interface UniPromotion {
  promotion_id: number
  advertiser_id: number
  promotion_name: string
  marketing_goal: string
  budget: number
  roi_goal?: number
  status: AdStatus
  delivery_status?: DeliveryStatus
  created_time: string
  updated_time?: string
}

// 财务信息
export interface FinanceWallet {
  advertiser_id: number
  cash: number // 现金余额
  grant: number // 赠款余额
  total_balance: number // 总余额
  credit_balance?: number // 授信余额
  valid_cash?: number // 可用现金
  valid_grant?: number // 可用赠款
}

// 财务明细
export interface FinanceTransaction {
  transaction_id: string
  advertiser_id: number
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  created_time: string
}

// 用户角色
export type UserRole = 'admin' | 'operator' | 'viewer'

// 权限
export interface Permission {
  resource: string
  actions: string[]
}

// 操作日志
export interface OperationLog {
  log_id: string
  user_id: string
  user_name: string
  operation_type: string
  resource_type: string
  resource_id: string
  description: string
  ip_address: string
  user_agent: string
  created_time: string
  status: 'success' | 'failed'
  error_message?: string
}

// 统计数据
export interface Statistics {
  total_advertisers: number
  total_campaigns: number
  total_ads: number
  total_cost: number
  total_show: number
  total_click: number
  avg_ctr: number
  avg_conversion_rate: number
}

// 工具 - 行业列表
export interface Industry {
  industry_id: string
  industry_name: string
  level: number
  parent_id?: string
}

// 工具 - 兴趣分类
export interface InterestCategory {
  interest_id: string
  interest_name: string
  level: number
  parent_id?: string
}

// 工具 - 行为分类
export interface ActionCategory {
  action_id: string
  action_name: string
  level: number
  days: number
}

// 工具 - 抖音分类
export interface AwemeCategory {
  category_id: string
  category_name: string
  level: number
  parent_id?: string
}

// 智能建议
export interface SuggestBid {
  suggest_bid: number
  min_bid: number
  max_bid: number
}

export interface SuggestBudget {
  suggest_budget: number
  min_budget: number
}

export interface SuggestRoiGoal {
  suggest_roi_goal: number
  min_roi_goal: number
  max_roi_goal: number
}

// 预估效果
export interface EstimateEffect {
  estimate_show: number
  estimate_click: number
  estimate_convert: number
  estimate_cost: number
}

// 学习状态
export type LearningStatus = 'learning' | 'learned' | 'learning_failed'

export interface LearningInfo {
  ad_id: number
  ad_name: string
  learning_status: LearningStatus
  learning_progress: number
  learning_start_time?: string
  learning_end_time?: string
}

// 低质广告
export interface LowQualityAd {
  ad_id: number
  ad_name: string
  quality_score: number
  issues: string[]
  suggestions: string[]
}
