import { apiClient } from './client'

export interface UploadImageParams {
  advertiser_id: number
  file?: File  // 本地文件上传
  image_url?: string  // URL上传
  upload_type: 'UPLOAD_BY_FILE' | 'UPLOAD_BY_URL'  // 与SDK一致
  image_signature?: string  // 图片签名（可选）
}

export interface UploadVideoParams {
  advertiser_id: number
  file: File
  video_signature: string
}

export interface FileInfo {
  id: string
  url: string
  cover_url?: string  // 视频封面
  poster_url?: string // 海报图
  width?: number
  height?: number
  size: number
  format?: string
  duration?: number
}

export const uploadImage = async (
  params: UploadImageParams
): Promise<FileInfo> => {
  const formData = new FormData()
  
  // 根据upload_type处理不同的上传方式
  if (params.upload_type === 'UPLOAD_BY_FILE' && params.file) {
    formData.append('image_file', params.file)
  } else if (params.upload_type === 'UPLOAD_BY_URL' && params.image_url) {
    formData.append('image_url', params.image_url)
  } else {
    throw new Error('Invalid upload parameters: file or image_url required based on upload_type')
  }
  
  formData.append('advertiser_id', params.advertiser_id.toString())
  formData.append('upload_type', params.upload_type)
  
  // 添加签名支持（可选）
  if (params.image_signature) {
    formData.append('image_signature', params.image_signature)
  }
  
  const { data } = await apiClient.post('/qianchuan/file/image/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}

export const uploadVideo = async (
  params: UploadVideoParams
): Promise<FileInfo> => {
  const formData = new FormData()
  formData.append('video_file', params.file)
  formData.append('advertiser_id', params.advertiser_id.toString())
  formData.append('video_signature', params.video_signature)
  
  const { data } = await apiClient.post('/qianchuan/file/video/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}

export const getImageInfo = async (
  advertiserId: number,
  imageIds: string[]
): Promise<FileInfo[]> => {
  const { data } = await apiClient.get('/qianchuan/file/image/get', {
    params: { advertiser_id: advertiserId, image_ids: imageIds.join(',') }
  })
  return data.list || []
}

export const getVideoInfo = async (
  advertiserId: number,
  videoIds: string[]
): Promise<FileInfo[]> => {
  const { data } = await apiClient.get('/qianchuan/file/video/get', {
    params: { advertiser_id: advertiserId, video_ids: videoIds.join(',') }
  })
  return data.list || []
}

// ==================== 素材管理高级功能 ====================

// 获取抖音号下的视频
export interface AwemeVideo {
  item_id: string
  title: string
  cover_url: string
  video_url: string
  duration: number
  create_time: string
  statistics: {
    digg_count: number
    comment_count: number
    share_count: number
    play_count: number
  }
}

export interface GetAwemeVideoParams {
  advertiser_id: number
  aweme_id: string
  page?: number
  page_size?: number
  count?: number
}

export const getAwemeVideos = async (
  params: GetAwemeVideoParams
): Promise<{ list: AwemeVideo[]; cursor: number; has_more: boolean }> => {
  const { data } = await apiClient.get('/qianchuan/file/video/aweme/get', {
    params
  })
  return data
}

// 获取首发素材
export interface GetOriginalVideoParams {
  advertiser_id: number
  start_time: string
  end_time: string
}

export const getOriginalVideos = async (
  params: GetOriginalVideoParams
): Promise<string[]> => {
  const { data } = await apiClient.get('/qianchuan/file/video/original/get', {
    params
  })
  return data?.video_ids || []
}

// 获取低效素材
export interface GetIneffectiveVideoParams {
  advertiser_id: number
  start_time: string
  end_time: string
}

export const getIneffectiveVideos = async (
  params: GetIneffectiveVideoParams
): Promise<string[]> => {
  const { data } = await apiClient.get('/qianchuan/file/video/ineffective/get', {
    params
  })
  return data?.video_ids || []
}

// 批量删除图片素材
export interface DeleteImagesParams {
  advertiser_id: number
  image_ids: string[]
}

export const deleteImages = async (
  params: DeleteImagesParams
): Promise<{ image_ids: string[] }> => {
  const { data } = await apiClient.post('/qianchuan/file/image/delete', params)
  return data
}

// 批量删除视频素材
export interface DeleteVideosParams {
  advertiser_id: number
  video_ids: string[]
}

export const deleteVideos = async (
  params: DeleteVideosParams
): Promise<{ video_ids: string[] }> => {
  const { data } = await apiClient.post('/qianchuan/file/video/delete', params)
  return data
}

// 获取千川素材库图文
export interface CarouselInfo {
  carousel_id: string
  title: string
  images: {
    image_id: string
    url: string
  }[]
  create_time: string
}

export interface GetCarouselParams {
  advertiser_id: number
  filtering?: {
    carousel_ids?: string[]
  }
  page?: number
  page_size?: number
}

export const getCarouselList = async (
  params: GetCarouselParams
): Promise<{ list: CarouselInfo[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/carousel/get', { params })
  return data
}

// 获取抽音号下图文
export interface GetAwemeCarouselParams {
  advertiser_id: number
  aweme_id: string
  page?: number
  page_size?: number
}

// ==================== 素材审核建议 ====================
export interface MaterialSuggestion {
  suggestion_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO'
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  fix_suggestion: string
}

export interface GetMaterialSuggestionParams {
  advertiser_id: number
  ad_id: number
  material_type: 'IMAGE' | 'VIDEO'
  material_ids: string[]
}

/**
 * 获取计划下素材审核建议
 */
export const getMaterialSuggestion = async (
  params: GetMaterialSuggestionParams
): Promise<MaterialSuggestion[]> => {
  const { data } = await apiClient.post('/qianchuan/material/suggestion/get', params)
  return data?.list || []
}

// ==================== 素材关联计划查询 ====================
export interface MaterialAdRelation {
  material_id: string
  material_type: 'IMAGE' | 'VIDEO'
  ad_id: number
  ad_name: string
  campaign_id: number
  campaign_name: string
  status: 'ENABLE' | 'DISABLE' | 'DELETE'
  create_time: string
}

export interface GetMaterialAdParams {
  advertiser_id: number
  material_ids: string[]
  material_type: 'IMAGE' | 'VIDEO'
}

/**
 * 获取素材关联的计划列表
 */
export const getMaterialAdRelations = async (
  params: GetMaterialAdParams
): Promise<MaterialAdRelation[]> => {
  const { data } = await apiClient.post('/qianchuan/material/ad/get', params)
  return data?.list || []
}

export const getAwemeCarouselList = async (
  params: GetAwemeCarouselParams
): Promise<{ list: CarouselInfo[]; cursor: number; has_more: boolean }> => {
  const { data } = await apiClient.get('/qianchuan/carousel/aweme/get', { params })
  return data
}
