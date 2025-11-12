import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Play, Image as ImageIcon, FileText, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getCreativeDetail } from '@/api/creative'
import { Creative } from '@/api/types'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Badge, Loading, ErrorState } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export default function CreativeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [creative, setCreative] = useState<Creative | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const advertiserId = user?.advertiserId || 1

  const fetchCreativeDetail = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getCreativeDetail(advertiserId, Number(id))
      setCreative(data)
    } catch (err) {
      console.error('Failed to fetch creative detail:', err)
      setError('加载创意详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchCreativeDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return <Loading fullScreen text="加载中..." size="lg" />
  }

  if (error || !creative) {
    return (
      <ErrorState
        title="加载失败"
        description={error || '创意不存在'}
        action={{
          label: '重试',
          onClick: fetchCreativeDetail
        }}
      />
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      AUDIT: { variant: 'warning' as const, label: '审核中', icon: Clock },
      APPROVED: { variant: 'success' as const, label: '审核通过', icon: CheckCircle },
      REJECT: { variant: 'error' as const, label: '审核拒绝', icon: XCircle },
      OFFLINE: { variant: 'secondary' as const, label: '已下线', icon: XCircle }
    }
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: status, icon: Clock }
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getMaterialTypeBadge = (mode: string) => {
    const modeMap = {
      CUSTOM: { label: '自定义创意', color: 'bg-blue-100 text-blue-800' },
      PROGRAMMATIC: { label: '程序化创意', color: 'bg-purple-100 text-purple-800' }
    }
    const config = modeMap[mode as keyof typeof modeMap] || { label: mode, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={creative.title || '创意详情'}
        description={`创意ID: ${creative.id}`}
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '创意', href: '/creatives' },
          { label: creative.title || '详情' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/creatives')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/creatives/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑创意
            </Button>
          </div>
        }
      />

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">创意标题</label>
              <p className="mt-1 text-base font-medium">{creative.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">创意ID</label>
              <p className="mt-1 text-base">{creative.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">关联广告ID</label>
              <p className="mt-1 text-base">
                <Button
                  variant="link"
                  onClick={() => navigate(`/ads/${creative.ad_id}`)}
                  className="p-0 h-auto"
                >
                  {creative.ad_id}
                </Button>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">审核状态</label>
              <p className="mt-1">{getStatusBadge(creative.audit_status || 'AUDIT')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">创意模式</label>
              <p className="mt-1">{getMaterialTypeBadge(creative.creative_material_mode)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">创建时间</label>
              <p className="mt-1 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {creative.create_time}
              </p>
            </div>
            {creative.modify_time && (
              <div>
                <label className="text-sm font-medium text-gray-500">修改时间</label>
                <p className="mt-1 text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {creative.modify_time}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 素材内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            素材内容
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 视频素材 */}
            {creative.video_id && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  视频素材
                </label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">视频ID</p>
                      <p className="font-mono text-sm">{creative.video_id}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      预览视频
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 图片素材 */}
            {creative.image_ids && creative.image_ids.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  图片素材 ({creative.image_ids.length})
                </label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(creative.image_ids as unknown[]).map((imageId, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="text-center">
                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 truncate" title={String(imageId)}>
                          {String(imageId)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 第三方ID */}
            {creative.third_party_id && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2">第三方素材ID</label>
                <p className="mt-1 text-base font-mono text-gray-900 bg-gray-50 p-3 rounded-lg border">
                  {creative.third_party_id}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 审核信息 */}
      {creative.audit_status === 'REJECT' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              审核拒绝原因
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-red-800">
                {creative.audit_reject_reason || '审核未通过，请查看详细原因并修改创意内容'}
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/creatives/${id}/edit`)}
                >
                  立即修改
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性能数据 */}
      <Card>
        <CardHeader>
          <CardTitle>创意表现</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">曝光量</p>
              <p className="text-2xl font-bold text-blue-600">
                {creative.impressions?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">点击量</p>
              <p className="text-2xl font-bold text-green-600">
                {creative.clicks?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">点击率</p>
              <p className="text-2xl font-bold text-purple-600">
                {creative.ctr ? `${(creative.ctr * 100).toFixed(2)}%` : '0%'}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">转化数</p>
              <p className="text-2xl font-bold text-orange-600">
                {creative.conversions?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/creatives/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑创意
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/ads/${creative.ad_id}`)}
            >
              查看关联广告
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: 实现复制功能
              }}
            >
              复制创意
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/reports?creative_id=${creative.id}`)}
            >
              查看数据报表
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
