import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateAdBid } from '@/api/ad'
import { PageHeader, Button, Card, CardContent, Input } from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { TrendingUp, AlertCircle } from 'lucide-react'

export default function PromotionBatchUpdateBid() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [adIds, setAdIds] = useState<number[]>([])
  const [bid, setBid] = useState<number>(5)

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

    if (bid < 0.1) {
      toast.error('出价不能低于0.1元')
      return
    }

    if (adIds.length === 0) {
      toast.error('未选择任何推广计划')
      return
    }

    setLoading(true)
    try {
      await updateAdBid({
        advertiser_id: user.advertiserId,
        ad_ids: adIds,
        bid: bid * 100, // 转换为分
      })
      
      toast.success(`成功更新 ${adIds.length} 个推广计划的出价`)
      navigate('/ads')
    } catch (error) {
      console.error('Failed to update bid:', error)
      toast.error('更新出价失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="批量修改出价"
        description="批量修改所选推广计划的出价设置"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划', href: '/ads' },
          { label: '批量修改出价' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/ads')}>
              取消
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <TrendingUp className="w-4 h-4 mr-2" />
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
                  将同时修改这些计划的出价设置
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                出价 (元) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={bid}
                onChange={(e) => setBid(Number(e.target.value))}
                min={0.1}
                step={0.1}
                placeholder="最低0.1元"
              />
              <p className="text-xs text-gray-500">
                建议出价范围：¥5 - ¥50，根据竞争情况调整
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">修改预览</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">出价:</span>
                  <span className="font-medium text-green-600">¥{bid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">影响计划数:</span>
                  <span className="font-medium">{adIds.length} 个</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
