import { apiClient } from './client'

/**
 * 商品竞争分析API
 * 用于分析商品投放效果和竞品对比
 */

// ==================== 商品分析列表 ====================
export interface ProductAnalyseItem {
  product_id: string
  product_name: string
  product_img: string
  price: number
  category: string
  gmv: number
  cost: number
  roi: number
  show: number
  click: number
  ctr: number
  convert: number
  convert_rate: number
  creative_count: number
  advantage_tags: string[] // ['ROI优秀', '转化率高', '创意丰富']
}

export interface GetProductAnalyseListParams {
  advertiser_id: number
  start_date: string
  end_date: string
  sort_by?: 'gmv' | 'roi' | 'cost' | 'convert_rate'
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export const getProductAnalyseList = async (
  params: GetProductAnalyseListParams
): Promise<{ list: ProductAnalyseItem[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/product/analyse/list', { params })
  return data
}

// ==================== 商品效果对比 ====================
export interface ProductCompareStats {
  product_id: string
  product_name: string
  product_img: string
  
  // 核心指标
  gmv: number
  cost: number
  roi: number
  
  // 流量指标
  show: number
  click: number
  ctr: number
  
  // 转化指标
  convert: number
  convert_rate: number
  convert_cost: number
  
  // 订单指标
  order_count: number
  pay_order_count: number
  per_order_value: number
  
  // 趋势数据
  gmv_trend: { date: string; value: number }[]
  roi_trend: { date: string; value: number }[]
}

export interface GetProductCompareStatsParams {
  advertiser_id: number
  product_ids: string[]
  start_date: string
  end_date: string
}

export const getProductCompareStats = async (
  params: GetProductCompareStatsParams
): Promise<ProductCompareStats[]> => {
  const { data } = await apiClient.post('/qianchuan/product/analyse/compare-stats', params)
  return data?.list || []
}

// ==================== 商品创意比对 ====================
export interface ProductCreativeCompare {
  product_id: string
  product_name: string
  
  // 创意数据
  creatives: {
    creative_id: string
    title: string
    image_url: string
    video_url?: string
    show: number
    click: number
    ctr: number
    convert: number
    convert_rate: number
    cost: number
    gmv: number
    roi: number
    created_time: string
  }[]
  
  // 创意类型分布
  creative_type_distribution: {
    type: string // 'IMAGE' | 'VIDEO' | 'CAROUSEL'
    count: number
    avg_ctr: number
    avg_roi: number
  }[]
  
  // 创意素材标签
  material_tags: {
    tag: string
    count: number
    performance_score: number
  }[]
}

export const getProductCreativeCompare = async (
  advertiserId: number,
  productId: string,
  startDate: string,
  endDate: string
): Promise<ProductCreativeCompare> => {
  const { data } = await apiClient.get('/qianchuan/product/analyse/compare-creative', {
    params: {
      advertiser_id: advertiserId,
      product_id: productId,
      start_date: startDate,
      end_date: endDate
    }
  })
  return data
}

// ==================== 商品分析概览 ====================
export interface ProductAnalyseSummary {
  total_products: number
  avg_gmv: number
  avg_roi: number
  avg_convert_rate: number
  top_product: {
    product_id: string
    product_name: string
    gmv: number
  }
  best_roi_product: {
    product_id: string
    product_name: string
    roi: number
  }
}

export const getProductAnalyseSummary = async (
  advertiserId: number,
  startDate: string,
  endDate: string
): Promise<ProductAnalyseSummary> => {
  const { data } = await apiClient.get('/qianchuan/product/analyse/summary', {
    params: {
      advertiser_id: advertiserId,
      start_date: startDate,
      end_date: endDate
    }
  })
  return data
}
