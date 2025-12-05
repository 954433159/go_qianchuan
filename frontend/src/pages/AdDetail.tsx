import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Play, Pause, FileText, Target, Image as ImageIcon, BarChart3 } from 'lucide-react'
import { getAdDetail } from '@/api/ad'
import { Ad } from '@/api/types'
import { PageHeader, Card, CardContent, Button, Badge, Loading, ErrorState } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useAuthStore } from '@/store/authStore'

// 模拟统计数据
interface AdStats {
  todaySpend: number
  todayROI: number
  todayConversions: number
  todaySpendChange: number
  todayROIChange: number
  todayConversionsChange: number
}

export default function AdDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  const advertiserId = user?.advertiserId || 1

  // 模拟统计数据
  const [stats] = useState<AdStats>({
    todaySpend: 3456.78,
    todayROI: 4.2,
    todayConversions: 234,
    todaySpendChange: 8.5,
    todayROIChange: 12.3,
    todayConversionsChange: 15.7,
  })

  const fetchAdDetail = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAdDetail(advertiserId, Number(id))
      setAd(data)
    } catch (err) {
      console.error('Failed to fetch ad detail:', err)
      setError('加载广告详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchAdDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return <Loading fullScreen text="加载中..." size="lg" />
  }

  if (error || !ad) {
    return (
      <ErrorState
        title="加载失败"
        description={error || '广告不存在'}
        action={{
          label: '重试',
          onClick: fetchAdDetail
        }}
      />
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ENABLE: { variant: 'success' as const, label: '投放中' },
      DISABLE: { variant: 'secondary' as const, label: '已暂停' },
      AUDIT: { variant: 'warning' as const, label: '审核中' },
      REJECT: { variant: 'error' as const, label: '已拒绝' }
    }
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // 格式化变化百分比
  const formatChange = (change: number) => {
    const prefix = change >= 0 ? '↑' : '↓'
    return `${prefix} ${Math.abs(change).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ad.name || '广告详情'}
        description={
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>📋 计划 ID: {ad.id}</span>
            <span>📅 创建于 {ad.create_time}</span>
            {getStatusBadge(ad.status)}
          </div>
        }
        breadcrumbs={[
          { label: '工作台', href: '/' },
          { label: '推广计划', href: '/ads' },
          { label: ad.name || '详情' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/ads')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/ads/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑计划
            </Button>
            <Button
              variant={ad.status === 'ENABLE' ? 'outline' : 'default'}
              onClick={() => {/* TODO: 实现启停功能 */}}
            >
              {ad.status === 'ENABLE' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  暂停投放
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  启动投放
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 今日消耗 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">今日消耗</span>
              <span className={`text-xs font-medium ${stats.todaySpendChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(stats.todaySpendChange)}
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-1">
              ¥{stats.todaySpend.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              预算: ¥{(ad.budget / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">ROI</span>
              <span className={`text-xs font-medium ${stats.todayROIChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(stats.todayROIChange)}
              </span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.todayROI}
            </div>
            <div className="text-xs text-muted-foreground">
              投入产出比
            </div>
          </CardContent>
        </Card>

        {/* 转化数 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">转化数</span>
              <span className={`text-xs font-medium ${stats.todayConversionsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(stats.todayConversionsChange)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.todayConversions}
            </div>
            <div className="text-xs text-muted-foreground">
              今日成交订单
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab导航 */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="px-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                基础信息
              </TabsTrigger>
              <TabsTrigger value="targeting" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                定向设置
              </TabsTrigger>
              <TabsTrigger value="creative" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                创意素材
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                数据报表
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* 基础信息Tab */}
            <TabsContent value="basic" className="mt-0 space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 投放设置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">计划名称</label>
                    <p className="mt-1 text-base">{ad.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">计划ID</label>
                    <p className="mt-1 text-base font-mono">{ad.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">所属广告组</label>
                    <p className="mt-1 text-base">
                      <Button
                        variant="link"
                        onClick={() => navigate(`/campaigns/${ad.campaign_id}`)}
                        className="p-0 h-auto"
                      >
                        {ad.campaign_id}
                      </Button>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">状态</label>
                    <p className="mt-1">{getStatusBadge(ad.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">创意模式</label>
                    <p className="mt-1 text-base">
                      {ad.creative_material_mode === 'CUSTOM' ? '自定义创意' : '程序化创意'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">创建时间</label>
                    <p className="mt-1 text-base">{ad.create_time}</p>
                  </div>
                  {ad.modify_time && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">修改时间</label>
                      <p className="mt-1 text-base">{ad.modify_time}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 预算与出价 */}
              {ad.delivery_setting && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 预算与出价</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">预算类型</label>
                      <p className="mt-1 text-base">
                        {ad.delivery_setting.budget_mode === 'BUDGET_MODE_DAY' ? '日预算' : '总预算'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">预算金额</label>
                      <p className="mt-1 text-base">¥{(ad.delivery_setting.budget / 100).toLocaleString()}</p>
                    </div>
                    {ad.delivery_setting.start_time && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">开始时间</label>
                        <p className="mt-1 text-base">{ad.delivery_setting.start_time}</p>
                      </div>
                    )}
                    {ad.delivery_setting.end_time && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">结束时间</label>
                        <p className="mt-1 text-base">{ad.delivery_setting.end_time}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 定向设置Tab */}
            <TabsContent value="targeting" className="mt-0">
              {ad.audience ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 人群定向</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">性别</label>
                        <p className="mt-1 text-base">
                          {ad.audience.gender === 'NONE' && '不限'}
                          {ad.audience.gender === 'MALE' && '男'}
                          {ad.audience.gender === 'FEMALE' && '女'}
                        </p>
                      </div>
                      {ad.audience.age && ad.audience.age.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">年龄</label>
                          <p className="mt-1 text-base">{ad.audience.age.join(', ')}</p>
                        </div>
                      )}
                      {ad.audience.region && ad.audience.region.length > 0 && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-500">地域</label>
                          <p className="mt-1 text-base">{ad.audience.region.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(ad.audience.interest_tags && ad.audience.interest_tags.length > 0) ||
                   (ad.audience.action_tags && ad.audience.action_tags.length > 0) ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏷️ 兴趣行为</h3>
                      <div className="space-y-4">
                        {ad.audience.interest_tags && ad.audience.interest_tags.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">兴趣标签</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {ad.audience.interest_tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {ad.audience.action_tags && ad.audience.action_tags.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">行为标签</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {ad.audience.action_tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  暂无定向设置
                </div>
              )}
            </TabsContent>

            {/* 创意素材Tab */}
            <TabsContent value="creative" className="mt-0">
              <div className="text-center py-12 text-muted-foreground">
                创意素材功能开发中...
                <div className="mt-4">
                  <Button onClick={() => navigate(`/creatives?ad_id=${ad.id}`)}>
                    查看创意列表
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 数据报表Tab */}
            <TabsContent value="data" className="mt-0">
              <div className="text-center py-12 text-muted-foreground">
                数据报表功能开发中...
                <div className="mt-4">
                  <Button onClick={() => navigate(`/reports?ad_id=${ad.id}`)}>
                    查看完整报表
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

    </div>
  )
}
