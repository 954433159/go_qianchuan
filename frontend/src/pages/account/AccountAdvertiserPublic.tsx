import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAdvertiserPublicInfo, PublicInfo } from '@/api/advertiser'
import { PageHeader, Card, CardContent, Loading, Badge } from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Building2, User, Shield, Activity } from 'lucide-react'

export default function AccountAdvertiserPublic() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [advertiserInfo, setAdvertiserInfo] = useState<PublicInfo | null>(null)

  useEffect(() => {
    const ids = searchParams.get('ids')
    if (ids) {
      fetchAdvertiserInfo(ids.split(',').map(Number))
    } else if (user?.advertiserId) {
      fetchAdvertiserInfo([user.advertiserId])
    }
  }, [searchParams, user])

  const fetchAdvertiserInfo = async (ids: number[]) => {
    setLoading(true)
    try {
      const data = await getAdvertiserPublicInfo(ids)
      setAdvertiserInfo(data[0] || null)
    } catch (error) {
      console.error('Failed to fetch advertiser info:', error)
      toast.error('加载广告主信息失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text="加载中..." size="lg" />
  }

  if (!advertiserInfo) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">未找到广告主信息</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
      ACTIVE: { label: '正常', variant: 'success' },
      FROZEN: { label: '已冻结', variant: 'destructive' },
      PENDING: { label: '审核中', variant: 'warning' },
    }
    const config = statusMap[status] || { label: status, variant: 'warning' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="广告主基础信息"
        description="查看广告主账户的公开信息"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/account-center' },
          { label: '广告主信息' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本信息卡片 */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              基本信息
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">广告主ID:</dt>
                <dd className="text-sm font-medium">{advertiserInfo.advertiser_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">广告主名称:</dt>
                <dd className="text-sm font-medium">{advertiserInfo.advertiser_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">公司名称:</dt>
                <dd className="text-sm font-medium">{advertiserInfo.company}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* 状态信息卡片 */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              状态信息
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-sm text-gray-600">账户状态:</dt>
                <dd>{getStatusBadge(advertiserInfo.status)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  角色类型:
                </dt>
                <dd className="text-sm font-medium">{advertiserInfo.role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  权限级别:
                </dt>
                <dd className="text-sm font-medium">普通账户</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
