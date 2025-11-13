import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CheckCircle, XCircle, Plus, RefreshCw, AlertTriangle, Video } from 'lucide-react'
import { Card, CardContent, PageHeader, Loading, Button, Badge } from '@/components/ui'
import { useAwemeAuth } from '@/hooks/useAwemeAuth'
import { useAuthStore } from '@/store/authStore'

export default function AwemeAuthList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const advertiserId = user?.advertiserId

  const {
    authList,
    loading,
    refreshAuth,
    getExpiringSoonCount,
    getAuthorizedCount,
  } = useAwemeAuth({ advertiserId, autoRefresh: false })

  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshAuth()
    setRefreshing(false)
  }

  const filteredList = authList.filter(item => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'authorized') return item.auth_status === 'AUTHORIZED'
    if (filterStatus === 'unauthorized') return item.auth_status === 'UNAUTHORIZED'
    if (filterStatus === 'expiring') return item.is_expiring_soon
    return true
  })

  const stats = [
    {
      title: '总授权数',
      value: authList.length,
      icon: Video,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: '已授权',
      value: getAuthorizedCount(),
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: '即将过期',
      value: getExpiringSoonCount(),
      icon: AlertTriangle,
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400'
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
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
              <option value="unauthorized">未授权</option>
              <option value="expiring">即将过期</option>
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
        {filteredList.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">暂无授权数据</p>
            </CardContent>
          </Card>
        ) : (
          filteredList.map((aweme) => (
            <Card key={aweme.aweme_id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{aweme.aweme_name || aweme.aweme_id}</h3>
                        {aweme.auth_status === 'AUTHORIZED' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已授权
                          </Badge>
                        )}
                        {aweme.auth_status === 'UNAUTHORIZED' && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            未授权
                          </Badge>
                        )}
                        {aweme.is_expiring_soon && (
                          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            即将过期
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <p>抖音号ID: {aweme.aweme_id}</p>
                        <p>授权类型: {aweme.auth_type}</p>
                        {aweme.auth_time && <p>授权时间: {aweme.auth_time}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <Button size="sm" variant="outline">查看详情</Button>
                    {aweme.auth_status === 'AUTHORIZED' ? (
                      <Button variant="outline" size="sm">解除授权</Button>
                    ) : (
                      <Button variant="outline" size="sm">重新授权</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
