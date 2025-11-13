import { useState, useEffect, useCallback } from 'react'
import { 
  getAwemeAuthList, 
  getAuthorizedAwemeList,
  addAwemeAuth,
  type AwemeAuthInfo,
  type AuthorizedAweme 
} from '@/api/advertiser'
import { toast } from '@/components/ui/Toast'

export interface AwemeAuthWithExpiry extends AwemeAuthInfo {
  auth_time?: string
  expire_time?: string
  is_expiring_soon?: boolean
}

interface UseAwemeAuthOptions {
  advertiserId?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAwemeAuth(options: UseAwemeAuthOptions = {}) {
  const { advertiserId, autoRefresh = false, refreshInterval = 30000 } = options

  const [authList, setAuthList] = useState<AwemeAuthWithExpiry[]>([])
  const [authorizedList, setAuthorizedList] = useState<AuthorizedAweme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查授权是否即将过期（30天内）
  const checkExpiry = useCallback((authTime?: string): boolean => {
    if (!authTime) return false
    const authDate = new Date(authTime)
    const expiryDate = new Date(authDate)
    expiryDate.setFullYear(expiryDate.getFullYear() + 1) // 假设授权有效期1年
    
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }, [])

  // 加载授权列表
  const fetchAuthList = useCallback(async () => {
    if (!advertiserId) return

    setLoading(true)
    setError(null)
    
    try {
      const [authData, authorizedData] = await Promise.all([
        getAwemeAuthList(advertiserId),
        getAuthorizedAwemeList(advertiserId)
      ])

      // 合并授权信息和时间信息
      const mergedList: AwemeAuthWithExpiry[] = authData.map(auth => {
        const authorized = authorizedData.list.find(a => a.aweme_id === auth.aweme_id)
        const isExpiringSoon = checkExpiry(authorized?.auth_time)
        
        return {
          ...auth,
          auth_time: authorized?.auth_time,
          is_expiring_soon: isExpiringSoon,
        }
      })

      setAuthList(mergedList)
      setAuthorizedList(authorizedData.list)

      // 如果有即将过期的授权，显示提醒
      const expiringSoon = mergedList.filter(a => a.is_expiring_soon)
      if (expiringSoon.length > 0) {
        toast.warning(`有 ${expiringSoon.length} 个抖音号授权即将过期，请及时续期`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载授权列表失败'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [advertiserId, checkExpiry])

  // 添加授权
  const addAuth = useCallback(async (awemeId: string, authType: 'PRODUCT' | 'LIVE' | 'VIDEO') => {
    if (!advertiserId) {
      toast.error('未指定广告主ID')
      return false
    }

    setLoading(true)
    try {
      const success = await addAwemeAuth({
        advertiser_id: advertiserId,
        aweme_id: awemeId,
        auth_type: authType,
      })

      if (success) {
        toast.success('授权添加成功')
        await fetchAuthList()
        return true
      } else {
        toast.error('授权添加失败')
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '授权添加失败'
      toast.error(errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }, [advertiserId, fetchAuthList])

  // 刷新授权状态
  const refreshAuth = useCallback(() => {
    return fetchAuthList()
  }, [fetchAuthList])

  // 获取即将过期的授权数量
  const getExpiringSoonCount = useCallback(() => {
    return authList.filter(a => a.is_expiring_soon).length
  }, [authList])

  // 获取已授权数量
  const getAuthorizedCount = useCallback(() => {
    return authList.filter(a => a.auth_status === 'AUTHORIZED').length
  }, [authList])

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && advertiserId) {
      const interval = setInterval(fetchAuthList, refreshInterval)
      return () => clearInterval(interval)
    }
    return undefined
  }, [autoRefresh, advertiserId, refreshInterval, fetchAuthList])

  // 初始加载
  useEffect(() => {
    if (advertiserId) {
      fetchAuthList()
    }
  }, [advertiserId, fetchAuthList])

  return {
    authList,
    authorizedList,
    loading,
    error,
    addAuth,
    refreshAuth,
    getExpiringSoonCount,
    getAuthorizedCount,
  }
}
