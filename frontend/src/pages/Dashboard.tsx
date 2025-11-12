import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  BarChart3, Users, Package, TrendingUp, DollarSign, Eye,
  Building2, Megaphone, Target, Palette, Image, Crosshair,
  CheckCircle, AlertCircle, AlertTriangle, Clock, Wallet
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { AreaChart, DonutChart, BarList } from '@tremor/react'
import { getActivityList, Activity } from '@/api/activity'
import { getBalance, Balance } from '@/api/finance'
import { SkeletonList } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import GMVCard from '@/components/dashboard/GMVCard'
import { useAdvertiserStore } from '@/store/advertiserStore'

export default function Dashboard() {
  const { currentAdvertiser } = useAdvertiserStore()
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)

  // 初始加载
  useEffect(() => {
    fetchActivities()
    if (currentAdvertiser) {
      fetchBalance()
    }
  }, [currentAdvertiser])

  // 实时数据更新 - 每60秒刷新一次
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('实时刷新Dashboard数据...')
      fetchActivities()
      if (currentAdvertiser) {
        fetchBalance()
      }
    }, 60000) // 60秒

    return () => clearInterval(interval)
  }, [currentAdvertiser])

  const fetchActivities = async () => {
    setActivitiesLoading(true)
    try {
      const data = await getActivityList({ page: 1, page_size: 10 })
      setActivities(data.list)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  const fetchBalance = async () => {
    if (!currentAdvertiser) return
    setBalanceLoading(true)
    try {
      const data = await getBalance(currentAdvertiser.id)
      setBalance(data)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    } finally {
      setBalanceLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700 ring-green-600/20'
      case 'error':
        return 'bg-red-50 text-red-700 ring-red-600/20'
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return '已完成'
      case 'error':
        return '失败'
      case 'warning':
        return '需要关注'
      default:
        return '进行中'
    }
  }

  const stats = [
    { name: '今日消耗', value: '￥12,845', icon: DollarSign, bgColor: 'bg-blue-50 dark:bg-blue-950', iconColor: 'text-blue-600 dark:text-blue-400', change: '+12.5%', changeColor: 'text-green-600' },
    { name: '展示次数', value: '245,890', icon: Eye, bgColor: 'bg-green-50 dark:bg-green-950', iconColor: 'text-green-600 dark:text-green-400', change: '+8.2%', changeColor: 'text-green-600' },
    { name: '点击次数', value: '18,432', icon: TrendingUp, bgColor: 'bg-purple-50 dark:bg-purple-950', iconColor: 'text-purple-600 dark:text-purple-400', change: '+15.3%', changeColor: 'text-green-600' },
    { name: '成交订单', value: '1,024', icon: Package, bgColor: 'bg-orange-50 dark:bg-orange-950', iconColor: 'text-orange-600 dark:text-orange-400', change: '+22.1%', changeColor: 'text-green-600' },
  ]
  
  // 近7天趋势数据
  const trendData = [
    { date: '01-15', '消耗': 10200, '展示': 198000, '点击': 14500 },
    { date: '01-16', '消耗': 11300, '展示': 215000, '点击': 15800 },
    { date: '01-17', '消耗': 9800, '展示': 189000, '点击': 13900 },
    { date: '01-18', '消耗': 12100, '展示': 232000, '点击': 17200 },
    { date: '01-19', '消耗': 11800, '展示': 225000, '点击': 16500 },
    { date: '01-20', '消耗': 13200, '展示': 251000, '点击': 18900 },
    { date: '01-21', '消耗': 12845, '展示': 245890, '点击': 18432 },
  ]
  
  // 转化漏斗数据
  const funnelData = [
    { name: '展示', value: 245890, color: 'blue' },
    { name: '点击', value: 18432, color: 'green' },
    { name: '转化', value: 1024, color: 'purple' },
  ]
  
  // 广告计划排行
  const topCampaigns = [
    { name: '春节大促-图文', value: 28500, href: '/campaigns/1' },
    { name: '新品推广-视频', value: 24300, href: '/campaigns/2' },
    { name: '品牌曝光-信息流', value: 21800, href: '/campaigns/3' },
    { name: '直播带货-短视频', value: 18900, href: '/campaigns/4' },
    { name: '老客召回-图文', value: 15200, href: '/campaigns/5' },
  ]
  
  const quickLinks = [
    { name: '广告主管理', path: '/advertisers', icon: Building2, desc: '查看和管理广告主账户' },
    { name: '广告计划', path: '/campaigns', icon: Megaphone, desc: '创建和管理广告计划' },
    { name: '广告管理', path: '/ads', icon: Target, desc: '创建和管理广告单元' },
    { name: '创意管理', path: '/creatives', icon: Palette, desc: '上传和管理广告创意' },
    { name: '媒体库', path: '/media', icon: Image, desc: '管理图片和视频素材' },
    { name: '定向工具', path: '/tools/targeting', icon: Crosshair, desc: '精准定位目标受众' },
    { name: '人群包', path: '/audiences', icon: Users, desc: '创建和管理人群包' },
    { name: '数据报表', path: '/reports', icon: BarChart3, desc: '查看广告投放数据' },
  ]
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="工作台" 
        description="欢迎回来，查看今日数据概览"
      />
      
      {/* GMV Card - 千川设计系统 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GMVCard
            todayGMV={128450}
            yesterdayGMV={115200}
            monthGMV={2845000}
            targetGMV={5000000}
          />
        </div>

        {/* 账户余额卡片 */}
        <Link to="/finance/wallet" className="block">
          <Card className="h-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white text-opacity-90 text-sm font-medium mb-2">账户余额</p>
                  {balanceLoading ? (
                    <div className="h-10 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
                  ) : balance ? (
                    <div className="text-3xl font-bold font-mono">
                      ¥{formatAmount(balance.balance)}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">--</div>
                  )}
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
              </div>

              {balance && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white border-opacity-20">
                  <div>
                    <p className="text-white text-opacity-75 text-xs mb-1">现金</p>
                    <p className="text-lg font-bold">¥{formatAmount(balance.cash)}</p>
                  </div>
                  <div>
                    <p className="text-white text-opacity-75 text-xs mb-1">赠款</p>
                    <p className="text-lg font-bold">¥{formatAmount(balance.grant)}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-white text-opacity-75 flex items-center justify-between">
                <span>点击查看详情</span>
                <span>→</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="qc-card">
            <div className="flex flex-col">
              <div className={`p-2 rounded-lg ${stat.bgColor} w-fit mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <p className="text-xs text-gray-600 mb-1">{stat.name}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <div className="flex items-center gap-1 text-xs mt-1">
                <TrendingUp className="h-3 w-3" />
                <span className={stat.changeColor}>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 数据趋势图和转化漏斗 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 近7天趋势 - 占2列 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>近7天数据趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="h-72"
              data={trendData}
              index="date"
              categories={['消耗', '点击']}
              colors={['blue', 'purple']}
              valueFormatter={(value) => value > 10000 ? `¥${(value / 1000).toFixed(1)}k` : value.toLocaleString()}
              yAxisWidth={60}
              showAnimation
            />
          </CardContent>
        </Card>
        
        {/* 转化漏斗 - 占1列 */}
        <Card>
          <CardHeader>
            <CardTitle>转化漏斗</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-72"
              data={funnelData}
              category="value"
              index="name"
              valueFormatter={(value) => value.toLocaleString()}
              colors={['blue', 'green', 'purple']}
              showAnimation
            />
          </CardContent>
        </Card>
      </div>
      
      {/* 广告计划排行榜 */}
      <Card>
        <CardHeader>
          <CardTitle>热门广告计划 Top 5</CardTitle>
        </CardHeader>
        <CardContent>
          <BarList
            data={topCampaigns}
            valueFormatter={(value: number) => `¥${value.toLocaleString()}`}
            showAnimation
          />
        </CardContent>
      </Card>
      
      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>快速入口</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="group relative overflow-hidden rounded-lg border border-border bg-background p-5 hover:border-primary hover:shadow-md transition-all duration-200"
              >
                <link.icon className="h-10 w-10 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
                <h3 className="font-semibold text-foreground mb-1">{link.name}</h3>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <SkeletonList items={5} />
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>暂无活动记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadge(activity.status)}`}>
                    {getStatusLabel(activity.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
