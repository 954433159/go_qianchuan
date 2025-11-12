import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthorizedAwemeList } from '@/api/advertiser'
import { Users, CheckCircle, XCircle, Plus, RefreshCw } from 'lucide-react'
import { Card, CardContent, PageHeader, Loading, Button, Badge } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface AwemeAuth {
  aweme_id: string
  aweme_name: string
  aweme_avatar: string
  auth_status: 'AUTHORIZED' | 'UNAUTHORIZED' | 'EXPIRED'
  auth_time?: string
  expire_time?: string
  followers_count?: number
  shop_name?: string
}

export default function AwemeAuthList() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [loading, setLoading] = useState(true)
  const [awemeList, setAwemeList] = useState<AwemeAuth[]>([])
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchAwemeList()
  }, [])

  const fetchAwemeList = async () => {
    setLoading(true)
    try {
      // 模拟数据
      const mockData: AwemeAuth[] = [
        {
          aweme_id: 'aweme_123',
          aweme_name: '@xiaomei_beauty',
          aweme_avatar: 'https://via.placeholder.com/48',
          auth_status: 'AUTHORIZED',
          auth_time: '2024-03-10 16:20:15',
          expire_time: '2025-03-10',
          followers_count: 125600,
          shop_name: '美妆旗舰店'
        },
        {
          aweme_id: 'aweme_456',
          aweme_name: '@fashion_store',
          aweme_avatar: 'https://via.placeholder.com/48',
          auth_status: 'AUTHORIZED',
          auth_time: '2024-02-15 10:30:00',
          followers_count: 89300,
          shop_name: '服饰专卖店'
        },
        {
          aweme_id: 'aweme_789',
          aweme_name: '@food_lover',
          aweme_avatar: 'https://via.placeholder.com/48',
          auth_status: 'EXPIRED',
          auth_time: '2023-12-01 14:20:00',
          expire_time: '2024-12-01',
          followers_count: 56700
        }
      ]
      setAwemeList(mockData)
    } catch (error) {
      console.error('Failed to fetch aweme list:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredList = awemeList.filter(item => {
    if (filterStatus === 'all') return true
    return item.auth_status.toLowerCase() === filterStatus
  })

  const stats = [
    {
      title: '授权抖音号',
      value: awemeList.filter(a => a.auth_status === 'AUTHORIZED').length,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: '待授权',
      value: awemeList.filter(a => a.auth_status === 'UNAUTHORIZED').length,
      icon: XCircle,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: '已过期',
      value: awemeList.filter(a => a.auth_status === 'EXPIRED').length,
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载抖音号列表..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📱 抖音号授权管理"
        description="管理已授权的抖音号，查看授权状态和有效期"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/advertisers' },
          { label: '抖音号授权' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/aweme-auth/add')}>
              <Plus className="h-4 w-4 mr-2" />
              添加授权
            </Button>
            <Button variant="outline" onClick={fetchAwemeList}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="authorized">已授权</option>
              <option value="expired">已过期</option>
              <option value="unauthorized">待授权</option>
            </select>
            <input
              type="text"
              placeholder="搜索抖音号..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Aweme List */}
      <div className="space-y-4">
        {filteredList.map((aweme) => (
          <Card key={aweme.aweme_id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img 
                        src={aweme.aweme_avatar} 
                        alt={aweme.aweme_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{aweme.aweme_name}</h3>
                      {aweme.auth_status === 'AUTHORIZED' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已授权
                        </Badge>
                      )}
                      {aweme.auth_status === 'EXPIRED' && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          已过期
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        抖音号
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p>抖音号ID: {aweme.aweme_id}</p>
                      {aweme.auth_time && <p>授权时间: {aweme.auth_time}</p>}
                      {aweme.expire_time && <p>授权到期: {aweme.expire_time}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">粉丝数</div>
                        <div className="text-base font-semibold text-gray-900">
                          {aweme.followers_count ? 
                            `${(aweme.followers_count / 1000).toFixed(1)}K` : 
                            '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">关联店铺</div>
                        <div className="text-base font-semibold text-blue-600">
                          {aweme.shop_name || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">素材授权</div>
                        <div className="text-base font-semibold text-green-600">
                          {aweme.auth_status === 'AUTHORIZED' ? '已授权' : '未授权'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <Button size="sm">查看详情</Button>
                  {aweme.auth_status === 'AUTHORIZED' ? (
                    <Button variant="outline" size="sm">解除授权</Button>
                  ) : (
                    <Button variant="outline" size="sm">重新授权</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
