import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateAdRoiGoal } from '@/api/ad'
import { PageHeader, Button, Card, CardContent, Input } from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Target, AlertCircle, TrendingUp } from 'lucide-react'

export default function AdUpdateRoi() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [adId, setAdId] = useState<number | null>(null)
  const [roiGoal, setRoiGoal] = useState<number>(1.0)

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

    if (roiGoal < 0.1) {
      toast.error('ROI目标不能低于0.1')
      return
    }

    setLoading(true)
    try {
      await updateAdRoiGoal({
        advertiser_id: user.advertiserId,
        ad_id: adId,
        roi_goal: roiGoal,
      })
      
      toast.success('ROI目标更新成功')
      navigate('/ads')
    } catch (error) {
      console.error('Failed to update ROI goal:', error)
      toast.error('更新ROI目标失败')
    } finally {
      setLoading(false)
    }
  }

  // 计算预期收入
  const calculateExpectedRevenue = (cost: number) => {
    return (cost * roiGoal).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="修改ROI目标"
        description="设置广告的投资回报率目标"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划', href: '/ads' },
          { label: '修改ROI目标' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/ads')}>
              取消
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <Target className="w-4 h-4 mr-2" />
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
                  将修改此广告的ROI目标设置
                </p>
              </div>
            </div>

            {/* ROI目标输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                ROI目标 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={roiGoal}
                onChange={(e) => setRoiGoal(Number(e.target.value))}
                min={0.1}
                step={0.1}
                placeholder="例如：2.0表示投入1元回本2元"
              />
              <p className="text-xs text-gray-500">
                ROI = 收入 / 成本，建议目标ROI ≥ 1.0
              </p>
            </div>

            {/* ROI计算示例 */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                ROI效果预估
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded p-3">
                  <p className="text-gray-600 mb-1">投入 ¥100</p>
                  <p className="text-lg font-semibold text-green-600">
                    预期收入 ¥{calculateExpectedRevenue(100)}
                  </p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-gray-600 mb-1">投入 ¥500</p>
                  <p className="text-lg font-semibold text-green-600">
                    预期收入 ¥{calculateExpectedRevenue(500)}
                  </p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-gray-600 mb-1">投入 ¥1000</p>
                  <p className="text-lg font-semibold text-green-600">
                    预期收入 ¥{calculateExpectedRevenue(1000)}
                  </p>
                </div>
              </div>
            </div>

            {/* 说明信息 */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">ROI目标说明</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ROI目标用于指导系统优化投放策略</li>
                <li>系统会尽可能达到或超过设定的ROI目标</li>
                <li>建议根据行业平均水平和历史数据设置合理目标</li>
                <li>目标过高可能导致消耗受限，目标过低可能影响收益</li>
              </ul>
            </div>

            {/* 预览信息 */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">修改预览</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ROI目标:</span>
                  <span className="font-medium text-green-600 text-lg">{roiGoal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">目标级别:</span>
                  <span className="font-medium">
                    {roiGoal >= 3 ? '优秀' : roiGoal >= 2 ? '良好' : roiGoal >= 1 ? '及格' : '较低'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  系统将根据此目标优化广告投放，实际ROI可能有波动
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
