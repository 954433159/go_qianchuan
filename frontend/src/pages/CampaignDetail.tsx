import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCampaignDetail } from '@/api/campaign'
import { getAdList } from '@/api/ad'
import { Campaign, Ad } from '@/api/types'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Table, { TableColumn } from '@/components/ui/Table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ArrowLeft, Megaphone, DollarSign, Calendar, Edit, Pause, CheckCircle, XCircle, TrendingUp, Eye, MousePointer, ShoppingCart, BarChart3, Settings, Clock } from 'lucide-react'

// 模拟统计数据
interface CampaignStats {
  todaySpend: number
  todayGMV: number
  todayImpressions: number
  todayClicks: number
  todayConversions: number
  todaySpendChange: number
  todayGMVChange: number
  todayImpressionsChange: number
  todayClicksChange: number
  todayConversionsChange: number
  ctr: number
  cpc: number
  roi: number
  conversionCost: number
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [adsLoading, setAdsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // 模拟统计数据
  const [stats] = useState<CampaignStats>({
    todaySpend: 8652,
    todayGMV: 125480,
    todayImpressions: 2405680,
    todayClicks: 76800,
    todayConversions: 1847,
    todaySpendChange: 12.5,
    todayGMVChange: 18.2,
    todayImpressionsChange: 24.3,
    todayClicksChange: 15.8,
    todayConversionsChange: 21.4,
    ctr: 3.19,
    cpc: 0.11,
    roi: 14.5,
    conversionCost: 4.68,
  })

  const fetchCampaignDetail = async (campaignId: number) => {
    setLoading(true)
    setError(false)
    try {
      const data = await getCampaignDetail(1, campaignId) // advertiserId暂时硬编码为1
      setCampaign(data)
      
      // 同时加载关联的广告列表
      fetchRelatedAds(campaignId)
    } catch (err) {
      console.error('Failed to fetch campaign detail:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCampaignDetail(parseInt(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchRelatedAds = async (campaignId: number) => {
    setAdsLoading(true)
    try {
      const response = await getAdList({
        advertiser_id: 1,
        filtering: {
          campaign_ids: [campaignId]
        },
        page: 1,
        page_size: 20
      })
      setAds(response.list || [])
    } catch (err) {
      console.error('Failed to fetch ads:', err)
    } finally {
      setAdsLoading(false)
    }
  }

  const getBudgetModeLabel = (mode: string) => {
    return mode === 'BUDGET_MODE_DAY' ? '日预算' : '不限'
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
      'ENABLE': { label: '已启用', className: 'bg-green-100 text-green-800 hover:bg-green-100', icon: CheckCircle },
      'DISABLE': { label: '已暂停', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100', icon: Pause },
      'DELETE': { label: '已删除', className: 'bg-red-100 text-red-800 hover:bg-red-100', icon: XCircle },
    }
    const config = statusMap[status] || statusMap['DISABLE']
    if (!config) return null
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const adColumns: TableColumn<Ad>[] = [
    {
      key: 'id',
      title: '广告ID',
      dataIndex: 'id',
      width: '100px'
    },
    {
      key: 'name',
      title: '广告名称',
      dataIndex: 'name'
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value) => getStatusBadge(value as string)
    },
    {
      key: 'budget',
      title: '预算',
      dataIndex: 'budget',
      render: (value) => `¥${((value as number) / 100).toFixed(2)}`
    },
    {
      key: 'create_time',
      title: '创建时间',
      dataIndex: 'create_time'
    }
  ]

  if (loading) {
    return <Loading fullScreen text="加载广告计划详情..." />
  }

  if (error || !campaign) {
    return (
      <ErrorState
        title="加载失败"
        description="无法加载广告计划详情，请稍后重试"
        action={{
          label: '重新加载',
          onClick: () => fetchCampaignDetail(parseInt(id!)),
        }}
      />
    )
  }

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // 格式化变化百分比
  const formatChange = (change: number) => {
    const prefix = change >= 0 ? '↑' : '↓'
    return `${prefix} ${Math.abs(change).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.name}
        description={
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>📁 广告组 ID: {campaign.id}</span>
            <span>📅 创建时间: {campaign.create_time}</span>
            {campaign.modify_time && <span>⏰ 最后更新: {campaign.modify_time}</span>}
          </div>
        }
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '广告组', href: '/campaigns' },
          { label: campaign.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Link to={`/campaigns/${campaign.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>
            </Link>
          </div>
        }
      />

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              预算剩余: ¥{((campaign.budget / 100) - stats.todaySpend).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* 今日GMV */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">今日GMV</span>
              <span className={`text-xs font-medium ${stats.todayGMVChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(stats.todayGMVChange)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ¥{stats.todayGMV.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              ROI: {stats.roi}
            </div>
          </CardContent>
        </Card>

        {/* 曝光量 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">曝光量</span>
              <span className={`text-xs font-medium ${stats.todayImpressionsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(stats.todayImpressionsChange)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.todayImpressions)}
            </div>
            <div className="text-xs text-muted-foreground">
              点击率: {stats.ctr}%
            </div>
          </CardContent>
        </Card>

        {/* 点击量 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">点击量</span>
              <span className={`text-xs font-medium ${stats.todayClicksChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(stats.todayClicksChange)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.todayClicks)}
            </div>
            <div className="text-xs text-muted-foreground">
              CPC: ¥{stats.cpc}
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
              {stats.todayConversions.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              转化成本: ¥{stats.conversionCost}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab导航 */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="px-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                数据概览
              </TabsTrigger>
              <TabsTrigger value="ads" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                推广计划 ({ads.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                设置
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                操作历史
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* 数据概览Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  基本信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">计划名称</p>
                    <p className="font-medium">{campaign.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">状态</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(campaign.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">投放状态</p>
                    <Badge variant="secondary">{campaign.opt_status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">预算类型</p>
                    <p className="font-medium">{getBudgetModeLabel(campaign.budget_mode)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">预算金额</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">¥{(campaign.budget / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">创建时间</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{campaign.create_time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 趋势图表占位 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    投放趋势
                  </h3>
                  <div className="flex items-center gap-3">
                    <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg">
                      <option>近7天</option>
                      <option>近15天</option>
                      <option>近30天</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 text-center text-muted-foreground">
                  图表功能开发中...
                </div>
              </div>
            </TabsContent>

            {/* 推广计划Tab */}
            <TabsContent value="ads" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="搜索推广计划..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>全部状态</option>
                    <option>投放中</option>
                    <option>已暂停</option>
                    <option>已结束</option>
                  </select>
                </div>
                <Button onClick={() => navigate(`/ads/new?campaign_id=${campaign.id}`)}>
                  创建推广计划
                </Button>
              </div>

              {adsLoading ? (
                <Loading text="加载广告列表..." />
              ) : ads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无关联推广计划
                </div>
              ) : (
                <Table
                  columns={adColumns}
                  data={ads}
                  loading={false}
                  rowKey="id"
                />
              )}
            </TabsContent>

            {/* 设置Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    广告组名称
                  </label>
                  <input
                    type="text"
                    defaultValue={campaign.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预算类型
                  </label>
                  <select
                    defaultValue={campaign.budget_mode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="BUDGET_MODE_DAY">日预算</option>
                    <option value="BUDGET_MODE_TOTAL">不限</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预算金额
                  </label>
                  <input
                    type="number"
                    defaultValue={(campaign.budget / 100).toFixed(2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button>保存修改</Button>
                  <Button variant="outline">取消</Button>
                </div>
              </div>
            </TabsContent>

            {/* 操作历史Tab */}
            <TabsContent value="history" className="mt-0">
              <div className="text-center py-12 text-muted-foreground">
                操作历史功能开发中...
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
