import { apiClient } from './client'

export interface ReportParams {
  advertiser_id: number
  start_date: string
  end_date: string
  fields: string[]
  filtering?: {
    campaign_ids?: number[]
    ad_ids?: number[]
  }
}

export interface ReportData extends Record<string, unknown> {
  date: string
  cost: number
  show: number
  click: number
  convert: number
  ctr: number
  cpc: number
  cpm: number
  convert_cost: number
  convert_rate: number
}

export const getCampaignReport = async (
  params: ReportParams
): Promise<ReportData[]> => {
  const { data } = await apiClient.post('/qianchuan/report/campaign/get', params)
  return data?.list || []
}

export const getAdReport = async (
  params: ReportParams
): Promise<ReportData[]> => {
  const { data } = await apiClient.post('/qianchuan/report/ad/get', params)
  return data?.list || []
}

export const getCreativeReport = async (
  params: ReportParams
): Promise<ReportData[]> => {
  const { data } = await apiClient.post('/qianchuan/report/creative/get', params)
  return data?.list || []
}

export const getCustomReport = async (
  params: ReportParams & {
    dimensions: string[]
  }
): Promise<ReportData[]> => {
  const { data } = await apiClient.get('/qianchuan/report/custom/get', { params })
  return data.list || []
}

// ==================== 素材报表 ====================
export const getMaterialReport = async (
  params: ReportParams
): Promise<ReportData[]> => {
  const { data } = await apiClient.post('/qianchuan/report/material/get', params)
  return data?.list || []
}

// ==================== 搜索词报表 ====================
export interface SearchWordReport extends ReportData {
  search_word: string
  match_type: string
}

export const getSearchWordReport = async (
  params: ReportParams
): Promise<SearchWordReport[]> => {
  const { data } = await apiClient.post('/qianchuan/report/search-word/get', params)
  return data?.list || []
}

// ==================== 直播间报表 ====================

// 今日直播数据
export interface LiveStats {
  advertiser_id: number
  date: string
  gmv: number
  watch_count: number
  watch_ucnt: number
  interaction_count: number
  order_count: number
  pay_order_count: number
  online_user_count: number
  avg_watch_duration: number
  share_count: number
  comment_count: number
  like_count: number
}

export const getLiveStats = async (
  advertiserId: number,
  date: string
): Promise<LiveStats> => {
  const { data } = await apiClient.get('/qianchuan/report/live/get', {
    params: { advertiser_id: advertiserId, date }
  })
  return data
}

// 直播间列表
export interface LiveRoom {
  room_id: string
  room_title: string
  anchor_name: string
  aweme_name: string
  start_time: string
  end_time?: string
  status: 'LIVE' | 'END' | 'PAUSE'
  gmv: number
  watch_ucnt: number
  order_count: number
  online_user_count: number
}

export interface GetLiveRoomsParams {
  advertiser_id: number
  start_date: string
  end_date: string
  page?: number
  page_size?: number
}

export const getLiveRooms = async (
  params: GetLiveRoomsParams
): Promise<{ list: LiveRoom[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/live/room/get', { params })
  return data
}

// 直播间详情
export interface LiveRoomDetail extends LiveRoom {
  cover_url: string
  room_duration: number
  peak_online_user_count: number
  avg_online_user_count: number
  interaction_rate: number
  conversion_rate: number
  per_user_value: number
}

export const getLiveRoomDetail = async (
  advertiserId: number,
  roomId: string
): Promise<LiveRoomDetail> => {
  const { data } = await apiClient.get('/qianchuan/live/room/detail/get', {
    params: { advertiser_id: advertiserId, room_id: roomId }
  })
  return data
}

// 直播间流量表现
export interface LiveRoomFlowPerformance {
  room_id: string
  flow_source: string
  watch_ucnt: number
  order_count: number
  gmv: number
  conversion_rate: number
}

export const getLiveRoomFlowPerformance = async (
  advertiserId: number,
  roomId: string
): Promise<LiveRoomFlowPerformance[]> => {
  const { data } = await apiClient.get('/qianchuan/live/room/flow-performance/get', {
    params: { advertiser_id: advertiserId, room_id: roomId }
  })
  return data?.list || []
}

// 直播间用户洞察
export interface LiveRoomUserInsight {
  room_id: string
  gender_distribution: { male: number; female: number }
  age_distribution: Record<string, number>
  city_distribution: { city: string; percentage: number }[]
  device_distribution: Record<string, number>
}

export const getLiveRoomUserInsight = async (
  advertiserId: number,
  roomId: string
): Promise<LiveRoomUserInsight> => {
  const { data } = await apiClient.get('/qianchuan/live/room/user/get', {
    params: { advertiser_id: advertiserId, room_id: roomId }
  })
  return data
}

// 直播间商品列表
export interface LiveRoomProduct {
  product_id: string
  product_name: string
  product_img: string
  price: number
  click_count: number
  order_count: number
  gmv: number
  conversion_rate: number
}

export const getLiveRoomProducts = async (
  advertiserId: number,
  roomId: string
): Promise<LiveRoomProduct[]> => {
  const { data } = await apiClient.get('/qianchuan/live/room/product-list/get', {
    params: { advertiser_id: advertiserId, room_id: roomId }
  })
  return data?.list || []
}

// ==================== 账户报表 ====================
export interface AdvertiserReportData extends ReportData {
  advertiser_id: number
  advertiser_name: string
}

export const getAdvertiserReport = async (
  params: ReportParams
): Promise<AdvertiserReportData[]> => {
  const { data } = await apiClient.post('/qianchuan/report/advertiser/get', params)
  return data?.list || []
}

// ==================== 视频互动流失报表 ====================
export interface VideoUserLoseReport {
  date: string
  video_id: string
  video_title: string
  total_watch: number
  lose_3s: number
  lose_5s: number
  lose_10s: number
  lose_30s: number
  avg_watch_duration: number
  complete_rate: number
}

export const getVideoUserLoseReport = async (
  params: ReportParams
): Promise<VideoUserLoseReport[]> => {
  const { data } = await apiClient.post('/qianchuan/report/video-user-lose/get', params)
  return data?.list || []
}
