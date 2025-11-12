import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Link2, Image as ImageIcon, Video, TrendingUp, Eye, MousePointerClick } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import { toast } from '@/components/ui/Toast'

interface MaterialRelation {
  ad_id: number
  ad_name: string
  campaign_name: string
  status: string
  cost: number
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  roi: number
}

export default function MaterialRelations() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [relations, setRelations] = useState<MaterialRelation[]>([])
  
  const materialId = searchParams.get('material_id')
  const materialType = searchParams.get('type') || 'image'
  const materialName = searchParams.get('name') || '未命名素材'

  useEffect(() => {
    loadRelations()
  }, [materialId])

  const loadRelations = async () => {
    if (!materialId) {
      toast.error('缺少素材ID参数')
      return
    }

    setLoading(true)
    try {
      // TODO: 调用API获取素材关联的计划
      // const data = await materialApi.getRelations(Number(materialId))
      
      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setRelations([
        {
          ad_id: 12345,
          ad_name: '春季新品推广计划',
          campaign_name: '春季大促',
          status: 'ACTIVE',
          cost: 1250.5,
          impressions: 45000,
          clicks: 1200,
          ctr: 2.67,
          conversions: 85,
          roi: 3.2,
        },
        {
          ad_id: 12346,
          ad_name: '夏季促销活动',
          campaign_name: '夏季大促',
          status: 'PAUSED',
          cost: 890.3,
          impressions: 32000,
          clicks: 850,
          ctr: 2.66,
          conversions: 62,
          roi: 2.8,
        },
      ])
    } catch (error) {
      console.error('Failed to load material relations:', error)
      toast.error('加载素材关联失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">投放中</Badge>
      case 'PAUSED':
        return <Badge variant="warning">已暂停</Badge>
      case 'DELETED':
        return <Badge variant="default">已删除</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`
    }
    return num.toLocaleString()
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="🔗 素材关联计划"
        description="查看素材关联的所有推广计划及数据表现"
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        }
      />

      {/* 素材信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {materialType === 'video' ? (
              <Video className="w-5 h-5 text-purple-600" />
            ) : (
              <ImageIcon className="w-5 h-5 text-blue-600" />
            )}
            素材信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">素材ID</label>
              <p className="mt-1 text-base text-gray-900">{materialId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">素材名称</label>
              <p className="mt-1 text-base text-gray-900">{materialName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">素材类型</label>
              <p className="mt-1 text-base text-gray-900">
                {materialType === 'video' ? '视频' : '图片'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">关联计划数</label>
              <p className="mt-1 text-base text-gray-900 font-semibold text-orange-600">
                {relations.length} 个
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 关联计划列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-orange-600" />
            关联的推广计划 ({relations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relations.length === 0 ? (
            <EmptyState
              icon={<Link2 className="h-12 w-12" />}
              title="暂无关联计划"
              description="该素材尚未被任何推广计划使用"
            />
          ) : (
            <div className="space-y-4">
              {relations.map((relation) => (
                <div
                  key={relation.ad_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {relation.ad_name}
                        </h3>
                        {getStatusBadge(relation.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>计划ID: {relation.ad_id}</span>
                        <span>•</span>
                        <span>广告组: {relation.campaign_name}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/ads/${relation.ad_id}`)}
                    >
                      查看详情
                    </Button>
                  </div>

                  {/* 数据指标 */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        消耗
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        ¥{relation.cost.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Eye className="w-3 h-3" />
                        曝光
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {formatNumber(relation.impressions)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <MousePointerClick className="w-3 h-3" />
                        点击
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {formatNumber(relation.clicks)}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">点击率</div>
                      <p className="text-base font-semibold text-gray-900">
                        {relation.ctr.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">转化数</div>
                      <p className="text-base font-semibold text-green-600">
                        {relation.conversions}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ROI</div>
                      <p className="text-base font-semibold text-orange-600">
                        {relation.roi.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white flex-shrink-0">
              💡
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">使用建议</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 高ROI素材可以复用到更多计划中，扩大投放规模</li>
                <li>• 低效素材建议及时替换，避免浪费预算</li>
                <li>• 定期分析素材表现，优化创意策略</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

