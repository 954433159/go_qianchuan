import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateAdRegion } from '@/api/ad'
import { PageHeader, Button, Card, CardContent } from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import RegionSelector from '@/components/targeting/RegionSelector'
import { MapPin, AlertCircle } from 'lucide-react'

export default function AdUpdateRegion() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [adId, setAdId] = useState<number | null>(null)
  const [regions, setRegions] = useState<string[]>([])

  useEffect(() => {
    const id = searchParams.get('ad_id')
    if (id) {
      setAdId(Number(id))
    } else {
      toast.error('未指定广告ID')
      navigate('/ads')
    }
  }, [searchParams, navigate])

  const handleSubmit = async () => {
    if (!user?.advertiserId || !adId) {
      toast.error('参数错误')
      return
    }

    if (regions.length === 0) {
      toast.error('请至少选择一个地域')
      return
    }

    setLoading(true)
    try {
      await updateAdRegion({
        advertiser_id: user.advertiserId,
        ad_id: adId,
        region: regions,
      })
      
      toast.success('地域定向更新成功')
      navigate('/ads')
    } catch (error) {
      console.error('Failed to update region:', error)
      toast.error('更新地域定向失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="修改地域定向"
        description="调整广告投放的地域范围"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划', href: '/ads' },
          { label: '修改地域定向' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/ads')}>
              取消
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <MapPin className="w-4 h-4 mr-2" />
              确认修改
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 广告ID提示 */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  广告ID: {adId}
                </p>
                <p className="text-xs text-blue-700">
                  将修改此广告的地域定向设置
                </p>
              </div>
            </div>

            {/* 地域选择器 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                选择地域 <span className="text-red-500">*</span>
              </label>
              {user?.advertiserId && (
                <RegionSelector
                  advertiserId={user.advertiserId}
                  value={regions}
                  onChange={setRegions}
                />
              )}
              <p className="text-xs text-gray-500">
                可选择省份、城市或商圈进行精准投放
              </p>
            </div>

            {/* 说明信息 */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">地域定向说明</p>
              <ul className="list-disc list-inside space-y-1">
                <li>支持按省份、城市、商圈三个层级选择投放地域</li>
                <li>可多选，最多支持选择500个地域</li>
                <li>选择省份时，将覆盖该省份下的所有城市</li>
                <li>更精准的地域定向有助于提升转化效果</li>
              </ul>
            </div>

            {/* 预览信息 */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">修改预览</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">已选地域数:</span>
                  <span className="font-medium text-blue-600">{regions.length} 个</span>
                </div>
                {regions.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-2">已选地域（前10个）:</p>
                    <div className="flex flex-wrap gap-1">
                      {regions.slice(0, 10).map((code) => (
                        <span key={code} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {code}
                        </span>
                      ))}
                      {regions.length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{regions.length - 10} 个
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
