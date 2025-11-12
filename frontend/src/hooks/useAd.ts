import { useState, useEffect, useCallback } from 'react'
import {
  getAdList,
  getAdDetail,
  createAd,
  updateAd,
  updateAdStatus,
  AdListParams,
  CreateAdParams,
  UpdateAdParams,
  AdStatusParams,
} from '../api/ad'
import { Ad, PaginatedResponse } from '../api/types'
import { showError, showSuccess } from './useToast'

export function useAdList(params: AdListParams) {
  const [data, setData] = useState<PaginatedResponse<Ad> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const paramsString = JSON.stringify(params)
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAdList(params)
      setData(response)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取广告列表失败')
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
    ads: data?.list || [],
    pagination: data?.page_info,
    loading,
    error,
    refetch: fetchData,
  }
}

export function useAdDetail(advertiserId: number, adId: number) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!adId) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await getAdDetail(advertiserId, adId)
      setAd(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取广告详情失败')
      setError(error)
      showError(`获取失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [advertiserId, adId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return {
    ad,
    loading,
    error,
    refetch: fetchDetail,
  }
}

export function useAdMutations() {
  const [loading, setLoading] = useState(false)

  const create = useCallback(async (params: CreateAdParams) => {
    setLoading(true)
    try {
      const result = await createAd(params)
      showSuccess(`创建成功，广告ID: ${result.ad_id}`)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('创建广告失败')
      showError(`创建失败: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (params: UpdateAdParams) => {
    setLoading(true)
    try {
      const result = await updateAd(params)
      showSuccess(`更新成功，广告ID: ${result.ad_id}`)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('更新广告失败')
      showError(`更新失败: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (params: AdStatusParams) => {
    setLoading(true)
    try {
      const result = await updateAdStatus(params)
      const statusText = params.opt_status === 'ENABLE' ? '启用' : 
                         params.opt_status === 'DISABLE' ? '暂停' : '删除'
      showSuccess(`操作成功，已${statusText}${result.ad_ids.length}个广告`)
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
