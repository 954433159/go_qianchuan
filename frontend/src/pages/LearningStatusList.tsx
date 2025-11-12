import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, TrendingUp, AlertCircle, CheckCircle2, XCircle, Info, ArrowLeft } from 'lucide-react'
import { getAdLearningStatus, getAdList, LearningStatus } from '@/api/ad'
import { Ad } from '@/api/types'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Badge, Loading, EmptyState, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

interface LearningAdWithStatus extends Ad {
  learningInfo?: LearningStatus
}

const LEARNING_PHASE_CONFIG = {
  LEARNING: {
    label: '学习中',
    color: 'bg-blue-100 text-blue-800',
    icon: Target,
    description: '计划正在学习，系统正在优化投放策略'
  },
  LEARNED: {
    label: '学习成功',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    description: '学习完成，进入稳定投放期'
  },
  FAILED: {
    label: '学习失败',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: '学习失败，建议调整定向或预算'
  }
}

export default function LearningStatusList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [ads, setAds] = useState<LearningAdWithStatus[]>([])
  const [filteredPhase, setFilteredPhase] = useState<string>('ALL')
  
  const advertiserId = user?.advertiserId || 1

  const fetchLearningStatus = async () => {
    setLoading(true)
    try {
      // 1. 获取所有广告计划
      const adListResponse = await getAdList({
        advertiser_id: advertiserId,
        page: 1,
        page_size: 100
      })
      
      const adList = adListResponse.list || []
      
      if (adList.length === 0) {
        setAds([])
        return
      }

      // 2. 获取学习期状态
      const adIds = adList.map(ad => ad.id)
      const learningStatuses = await getAdLearningStatus(advertiserId, adIds)
      
      // 3. 合并数据
      const adsWithStatus = adList.map(ad => {
        const learningInfo = learningStatuses.find(ls => ls.ad_id === ad.id)
        return {
          ...ad,
          learningInfo
        }
      })

      // 4. 只显示有学习期状态的计划
      const filteredAds = adsWithStatus.filter(ad => ad.learningInfo)
      setAds(filteredAds)
    } catch (error) {
      console.error('Failed to fetch learning status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLearningStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserId])

  const filteredAds = filteredPhase === 'ALL' 
    ? ads 
    : ads.filter(ad => ad.learningInfo?.learning_phase === filteredPhase)

  const stats = {
    total: ads.length,
    learning: ads.filter(ad => ad.learningInfo?.learning_phase === 'LEARNING').length,
    learned: ads.filter(ad => ad.learningInfo?.learning_phase === 'LEARNED').length,
    failed: ads.filter(ad => ad.learningInfo?.learning_phase === 'FAILED').length
  }

  if (loading) {
    return <Loading fullScreen text="加载学习期状态..." size="lg" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="学习期状态管理"
        description="查看和管理广告计划的学习期状态"
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '广告计划', href: '/ads' },
          { label: '学习期状态' }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/ads')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilteredPhase('ALL')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总计划数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilteredPhase('LEARNING')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">学习中</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{stats.learning}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilteredPhase('LEARNED')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">学习成功</p>
                <p className="text-3xl font-bold text-green-700 mt-2">{stats.learned}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilteredPhase('FAILED')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">学习失败</p>
                <p className="text-3xl font-bold text-red-700 mt-2">{stats.failed}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 学习期说明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">关于学习期</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>学习中：</strong>系统正在探索最优投放策略，建议保持计划稳定，避免频繁调整</p>
                <p>• <strong>学习成功：</strong>已找到稳定的投放策略，计划将持续优化效果</p>
                <p>• <strong>学习失败：</strong>未能找到有效策略，建议调整预算、定向或创意</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 筛选标签 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">筛选：</span>
        <Button
          size="sm"
          variant={filteredPhase === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilteredPhase('ALL')}
        >
          全部 ({stats.total})
        </Button>
        <Button
          size="sm"
          variant={filteredPhase === 'LEARNING' ? 'default' : 'outline'}
          onClick={() => setFilteredPhase('LEARNING')}
        >
          学习中 ({stats.learning})
        </Button>
        <Button
          size="sm"
          variant={filteredPhase === 'LEARNED' ? 'default' : 'outline'}
          onClick={() => setFilteredPhase('LEARNED')}
        >
          学习成功 ({stats.learned})
        </Button>
        <Button
          size="sm"
          variant={filteredPhase === 'FAILED' ? 'default' : 'outline'}
          onClick={() => setFilteredPhase('FAILED')}
        >
          学习失败 ({stats.failed})
        </Button>
      </div>

      {/* 计划列表 */}
      {filteredAds.length === 0 ? (
        <EmptyState
          icon={<Target className="h-16 w-16" />}
          title="暂无学习期计划"
          description="当前没有处于学习期的广告计划"
          action={{
            label: '查看所有计划',
            onClick: () => navigate('/ads')
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>计划列表 ({filteredAds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAds.map((ad) => {
                const phase = ad.learningInfo?.learning_phase || 'LEARNING'
                const config = LEARNING_PHASE_CONFIG[phase as keyof typeof LEARNING_PHASE_CONFIG]
                const Icon = config.icon

                return (
                  <div
                    key={ad.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/ads/${ad.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{ad.name}</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className={config.color}>
                                  <Icon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{config.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">广告ID：</span>
                            <span className="text-gray-900 font-medium">{ad.id}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">预算：</span>
                            <span className="text-gray-900 font-medium">¥{(ad.budget / 100).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">状态：</span>
                            <Badge variant={ad.status === 'ENABLE' ? 'success' : 'secondary'}>
                              {ad.status === 'ENABLE' ? '投放中' : '已暂停'}
                            </Badge>
                          </div>
                          {ad.learningInfo?.learning_stage && (
                            <div>
                              <span className="text-gray-500">阶段：</span>
                              <span className="text-gray-900 font-medium">{ad.learningInfo.learning_stage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/ads/${ad.id}`)
                        }}
                      >
                        查看详情
                      </Button>
                    </div>
                    {phase === 'FAILED' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-red-800">
                            <p className="font-medium mb-1">优化建议：</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              <li>适当提高预算，确保每日有足够的转化数据</li>
                              <li>调整定向范围，扩大潜在受众群体</li>
                              <li>优化创意内容，提升点击率和转化率</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
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
