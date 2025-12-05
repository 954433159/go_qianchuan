/**
 * API响应类型定义
 */

// 基础API响应格式
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp?: number
  hint?: string // 提示信息（用于501等状态）
}

// 分页响应格式
export interface PaginatedResponse<T> {
  code: number
  message: string
  data: {
    list: T[]
    page: number
    page_size: number
    total: number
  }
  timestamp?: number
}

// 分页参数
export interface PaginationParams {
  page?: number
  page_size?: number
}

// 日期范围参数
export interface DateRangeParams {
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

// 排序参数
export interface SortParams {
  sort_field?: string
  sort_order?: 'asc' | 'desc'
}

// 搜索参数
export interface SearchParams {
  keyword?: string
}

// OAuth Token响应
export interface OAuthTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_token_expires_in: number
}

// 用户信息响应
export interface UserInfoResponse {
  advertiser_id: number
  advertiser_name: string
  role: string
  permissions: string[]
}

// 文件上传响应
export interface FileUploadResponse {
  file_id: string
  file_url: string
  file_name: string
  file_size: number
  upload_time: string
}

// 批量操作响应
export interface BatchOperationResponse {
  success_count: number
  fail_count: number
  failed_items: Array<{
    id: string
    reason: string
  }>
}

// 错误响应
export interface ErrorResponse {
  code: number
  message: string
  details?: string
  error_code?: string
}

// 状态枚举
export type Status = 'active' | 'inactive' | 'paused' | 'deleted' | 'pending'

// 广告状态
export type AdStatus = 'enable' | 'disable' | 'delete'

// 审核状态
export type AuditStatus = 'pending' | 'approved' | 'rejected'

// 投放状态
export type DeliveryStatus = 'delivering' | 'not_delivering' | 'completed' | 'pending'

// 操作类型
export type OperationType = 'create' | 'update' | 'delete' | 'status_change'
