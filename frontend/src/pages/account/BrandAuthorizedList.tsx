import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Card, CardContent, EmptyState, Loading, Badge } from '@/components/ui'
import DataTable, { ColumnDef } from '@/components/ui/DataTable'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Award, Calendar } from 'lucide-react'

interface BrandAuth extends Record<string, unknown> {
  brand_id: string
  brand_name: string
  auth_status: 'ACTIVE' | 'EXPIRED' | 'PENDING'
  auth_time: string
  expire_time: string
  scope: string[]
}

export default function BrandAuthorizedList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [brandList, setBrandList] = useState<BrandAuth[]>([])

  useEffect(() => {
    fetchBrandList()
  }, [])

  const fetchBrandList = async () => {
    if (!user?.advertiserId) {
      toast.error('未获取到广告主ID')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with real API call
      // const data = await getBrandAuthorizedList(user.advertiserId)
      
      // Mock data
      const mockData: BrandAuth[] = [
        {
          brand_id: 'brand_001',
          brand_name: '华为品牌官方',
          auth_status: 'ACTIVE',
          auth_time: '2024-01-15T10:00:00Z',
          expire_time: '2025-01-15T10:00:00Z',
          scope: ['广告投放', '数据查看', '素材管理'],
        },
        {
          brand_id: 'brand_002',
          brand_name: '小米品牌旗舰店',
          auth_status: 'ACTIVE',
          auth_time: '2024-03-20T14:30:00Z',
          expire_time: '2025-03-20T14:30:00Z',
          scope: ['广告投放', '数据查看'],
        },
        {
          brand_id: 'brand_003',
          brand_name: 'OPPO官方授权',
          auth_status: 'EXPIRED',
          auth_time: '2023-06-10T09:00:00Z',
          expire_time: '2024-06-10T09:00:00Z',
          scope: ['广告投放'],
        },
      ]
      
      setBrandList(mockData)
    } catch (error) {
      console.error('Failed to fetch brand list:', error)
      toast.error('加载品牌授权列表失败')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<BrandAuth>[] = [
    {
      key: 'brand_name',
      label: '品牌名称',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" />
          <span className="font-medium">{row.brand_name}</span>
        </div>
      ),
    },
    {
      key: 'brand_id',
      label: '品牌ID',
      sortable: true,
    },
    {
      key: 'auth_status',
      label: '授权状态',
      render: (_, row) => {
        const statusConfig = {
          ACTIVE: { label: '已授权', variant: 'success' as const },
          EXPIRED: { label: '已过期', variant: 'destructive' as const },
          PENDING: { label: '待审核', variant: 'warning' as const },
        }
        const config = statusConfig[row.auth_status]
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      key: 'scope',
      label: '授权范围',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.scope.map((s, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'auth_time',
      label: '授权时间',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          {new Date(row.auth_time).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'expire_time',
      label: '过期时间',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          {new Date(row.expire_time).toLocaleDateString()}
        </div>
      ),
    },
  ]

  if (loading) {
    return <Loading fullScreen text="加载中..." size="lg" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="品牌授权列表"
        description="查看和管理品牌授权信息"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/account-center' },
          { label: '品牌授权列表' },
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          {brandList.length === 0 ? (
            <EmptyState
              icon={<Award className="w-12 h-12" />}
              title="暂无品牌授权"
              description="当前账户还没有任何品牌授权记录"
            />
          ) : (
            <DataTable<BrandAuth>
              columns={columns}
              data={brandList}
              searchable
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
