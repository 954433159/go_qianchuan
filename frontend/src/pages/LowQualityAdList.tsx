import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, TrendingDown, DollarSign, Target, Eye, RefreshCw } from 'lucide-react'
import { getLowQualityAds, getAdDetail } from '@/api/ad'
import { Ad } from '@/api/types'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Badge, Loading, EmptyState, Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toast'

export default function LowQualityAdList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lowQualityAds, setLowQualityAds] = useState<Ad[]>([])
  
  const advertiserId = user?.advertiserId || 1

  const fetchLowQualityAds = async (showToast = false) => {
    setLoading(!showToast)
    setRefreshing(showToast)
    try {
      // 1. 获取低效计划ID列表
      const lowQualityAdIds = await getLowQualityAds(advertiserId)
      
      if (lowQualityAdIds.length === 0) {
        setLowQualityAds([])
        if (showToast) {
          toast.success('暂无低效计划')
        }
        return
      }

      // 2. 获取每个低效计划的详细信息
      const adDetails = await Promise.allSettled(
        lowQualityAdIds.map(adId => getAdDetail(advertiserId, adId))
      )

      const validAds = adDetails
        .filter((result): result is PromiseFulfilledResult<Ad> => result.status === 'fulfilled')
        .map(result => result.value)

      setLowQualityAds(validAds)
      
      if (showToast) {
        toast.success(`已刷新，找到 ${validAds.length} 个低效计划`)
      }
    } catch (error) {
      console.error('Failed to fetch low quality ads:', error)
      toast.error('加载失败，请重试')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLowQualityAds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserId])

  // 计算统计数据
  const calculateMetrics = (ad: Ad) => {
    // 模拟数据 - 实际应从 API 获取
    const spend = Math.random() * (ad.budget / 100) * 0.8
    const conversions = Math.floor(Math.random() * 10)
    const cpa = conversions > 0 ? spend / conversions : 0
    const roi = conversions > 0 ? (conversions * 100) / spend : 0
    
    return {
      spend: spend.toFixed(2),
      conversions,
      cpa: cpa.toFixed(2),
      roi: roi.toFixed(2)
    }
  }

  if (loading) {
    return <Loading fullScreen text="加载低效计划..." size="lg" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="低效计划诊断"
        description="查看表现不佳的广告计划并获取优化建议"
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '广告计划', href: '/ads' },
          { label: '低效计划' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchLowQualityAds(true)}
              loading={refreshing}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新数据
            </Button>
            <Button variant="outline" onClick={() => navigate('/ads')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </div>
        }
      />

      {/* 警告提示 */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">关于低效计划</h3>
              <div className="text-sm text-orange-800 space-y-1">
                <p>低效计划是指在一定时间内，投放效果未达到预期的广告计划。系统会根据以下指标进行判定：</p>
                <ul className="list-disc list-inside mt-2 space-y-0.5">
                  <li>转化成本（CPA）显著高于行业平均水平</li>
                  <li>投资回报率（ROI）低于设定目标</li>
                  <li>点击率（CTR）持续低迷</li>
                  <li>转化率（CVR）低于预期</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">低效计划数</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{lowQualityAds.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">待优化预算</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ¥{lowQualityAds.reduce((sum, ad) => sum + ad.budget / 100, 0).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均消耗率</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {lowQualityAds.length > 0 ? '65%' : '0%'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 计划列表 */}
      {lowQualityAds.length === 0 ? (
        <EmptyState
          icon={<Target className="h-16 w-16" />}
          title="暂无低效计划"
          description="当前没有检测到低效的广告计划，继续保持！"
          action={{
            label: '查看所有计划',
            onClick: () => navigate('/ads')
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>低效计划列表 ({lowQualityAds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowQualityAds.map((ad) => {
                const metrics = calculateMetrics(ad)

                return (
                  <div
                    key={ad.id}
                    className="p-5 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{ad.name}</h3>
                          <Badge variant="warning" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            低效计划
                          </Badge>
                          <Badge variant={ad.status === 'ENABLE' ? 'success' : 'secondary'}>
                            {ad.status === 'ENABLE' ? '投放中' : '已暂停'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          广告ID: {ad.id} | 计划ID: {ad.campaign_id}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/ads/${ad.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        查看详情
                      </Button>
                    </div>

                    {/* 性能指标 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">预算</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ¥{(ad.budget / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">已消耗</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ¥{metrics.spend}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">转化数</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {metrics.conversions}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">ROI</p>
                        <p className="text-lg font-semibold text-red-600">
                          {metrics.roi}
                        </p>
                      </div>
                    </div>

                    {/* 问题诊断 */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        诊断结果与优化建议
                      </h4>
                      <div className="space-y-2 text-sm text-red-800">
                        {Number(metrics.roi) < 3 && (
                          <div className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">•</span>
                            <p>
                              <strong>ROI过低：</strong>
                              建议降低出价或优化定向，提升转化质量
                            </p>
                          </div>
                        )}
                        {metrics.conversions < 5 && (
                          <div className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">•</span>
                            <p>
                              <strong>转化不足：</strong>
                              建议扩大定向人群，或提高预算增加曝光
                            </p>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">•</span>
                          <p>
                            <strong>创意优化：</strong>
                            更换表现更好的创意素材，提升点击率
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/ads/${ad.id}/edit`)}
                      >
                        优化设置
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/creatives?ad_id=${ad.id}`)}
                      >
                        更换创意
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: 实现暂停功能
                          toast.info('暂停功能开发中')
                        }}
                      >
                        暂停投放
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
