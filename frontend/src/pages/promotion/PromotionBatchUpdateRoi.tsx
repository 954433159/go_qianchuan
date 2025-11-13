import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateAdRoiGoal } from '@/api/ad'
import { PageHeader, Button, Card, CardContent, Input } from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Target, AlertCircle } from 'lucide-react'

export default function PromotionBatchUpdateRoi() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [adIds, setAdIds] = useState<number[]>([])
  const [roiGoal, setRoiGoal] = useState<number>(1.0)

  useEffect(() => {
    const ids = searchParams.get('ids')
    if (ids) {
      setAdIds(ids.split(',').map(Number))
    } else {
      toast.error('未选择任何推广计划')
      navigate('/ads')
    }
  }, [searchParams, navigate])

  const handleSubmit = async () => {
    if (!user?.advertiserId) {
      toast.error('未获取到广告主ID')
      return
    }

    if (roiGoal < 0.1) {
      toast.error('ROI目标不能低于0.1')
      return
    }

    if (adIds.length === 0) {
      toast.error('未选择任何推广计划')
      return
    }

    setLoading(true)
    try {
      // 批量更新ROI目标（需要逐个调用）
      const promises = adIds.map(adId =>
        updateAdRoiGoal({
          advertiser_id: user.advertiserId!,
          ad_id: adId,
          roi_goal: roiGoal,
        })
      )
      
      await Promise.all(promises)
      toast.success(`成功更新 ${adIds.length} 个推广计划的ROI目标`)
      navigate('/ads')
    } catch (error) {
      console.error('Failed to update ROI goal:', error)
      toast.error('更新ROI目标失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="批量修改ROI目标"
        description="批量修改所选推广计划的ROI目标"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划', href: '/ads' },
          { label: '批量修改ROI目标' },
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
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  已选择 {adIds.length} 个推广计划
                </p>
                <p className="text-xs text-blue-700">
                  将同时修改这些计划的ROI目标设置
                </p>
              </div>
            </div>

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

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">修改预览</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ROI目标:</span>
                  <span className="font-medium text-green-600">{roiGoal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">影响计划数:</span>
                  <span className="font-medium">{adIds.length} 个</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  系统将尽可能优化投放以达到设定的ROI目标
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
