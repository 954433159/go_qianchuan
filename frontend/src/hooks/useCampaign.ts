import { useState, useEffect, useCallback } from 'react'
import {
  getCampaignList,
  getCampaignDetail,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  CampaignListParams,
  CreateCampaignParams,
  UpdateCampaignParams,
  CampaignStatusParams,
} from '../api/campaign'
import { Campaign, PaginatedResponse } from '../api/types'
import { showError, showSuccess } from './useToast'

export function useCampaignList(params: CampaignListParams) {
  const [data, setData] = useState<PaginatedResponse<Campaign> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const paramsString = JSON.stringify(params)
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCampaignList(params)
      setData(response)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取广告计划列表失败')
      setError(error)
      showError(`获取失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    campaigns: data?.list || [],
    pagination: data?.page_info,
    loading,
    error,
    refetch: fetchData,
  }
}

export function useCampaignDetail(advertiserId: number, campaignId: number) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!campaignId) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await getCampaignDetail(advertiserId, campaignId)
      setCampaign(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取广告计划详情失败')
      setError(error)
      showError(`获取失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [advertiserId, campaignId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return {
    campaign,
    loading,
    error,
    refetch: fetchDetail,
  }
}

export function useCampaignMutations() {
  const [loading, setLoading] = useState(false)

  const create = useCallback(async (params: CreateCampaignParams) => {
    setLoading(true)
    try {
      const result = await createCampaign(params)
      showSuccess(`创建成功，广告计划ID: ${result.campaign_id}`)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('创建广告计划失败')
      showError(`创建失败: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (params: UpdateCampaignParams) => {
    setLoading(true)
    try {
      const result = await updateCampaign(params)
      showSuccess(`更新成功，广告计划ID: ${result.campaign_id}`)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('更新广告计划失败')
      showError(`更新失败: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (params: CampaignStatusParams) => {
    setLoading(true)
    try {
      const result = await updateCampaignStatus(params)
      const statusText = params.opt_status === 'ENABLE' ? '启用' : 
                         params.opt_status === 'DISABLE' ? '暂停' : '删除'
      showSuccess(`操作成功，已${statusText}${result.campaign_ids.length}个广告计划`)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('更新状态失败')
      showError(`操作失败: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    create,
    update,
    updateStatus,
    loading,
  }
}
