import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateAdBudget } from '@/api/ad'
import { PageHeader, Button, Card, CardContent, Input, Loading } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { DollarSign, AlertCircle } from 'lucide-react'

export default function PromotionBatchUpdateBudget() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [adIds, setAdIds] = useState<number[]>([])
  const [budget, setBudget] = useState<number>(300)
  const [budgetMode, setBudgetMode] = useState<'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'>('BUDGET_MODE_DAY')

  useEffect(() => {
    // 从URL参数获取选中的广告ID
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

    if (budget < 300) {
      toast.error('预算不能低于300元')
      return
    }

    if (adIds.length === 0) {
      toast.error('未选择任何推广计划')
      return
    }

    setLoading(true)
    try {
      await updateAdBudget({
        advertiser_id: user.advertiserId,
        ad_ids: adIds,
        budget: budget * 100, // 转换为分
        budget_mode: budgetMode,
      })
      
      toast.success(`成功更新 ${adIds.length} 个推广计划的预算`)
      navigate('/ads')
    } catch (error) {
      console.error('Failed to update budget:', error)
      toast.error('更新预算失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="批量修改预算"
        description="批量修改所选推广计划的预算设置"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划', href: '/ads' },
          { label: '批量修改预算' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/ads')}>
              取消
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <DollarSign className="w-4 h-4 mr-2" />
              确认修改
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 已选计划数量提示 */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  已选择 {adIds.length} 个推广计划
                </p>
                <p className="text-xs text-blue-700">
                  将同时修改这些计划的预算设置
                </p>
              </div>
            </div>

            {/* 预算设置表单 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  预算类型 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={budgetMode}
                  onValueChange={(value) => setBudgetMode(value as typeof budgetMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUDGET_MODE_DAY">日预算</SelectItem>
                    <SelectItem value="BUDGET_MODE_TOTAL">总预算</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {budgetMode === 'BUDGET_MODE_DAY' ? '每日消耗上限' : '整个投放周期的消耗上限'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  预算金额 (元) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  min={300}
                  step={10}
                  placeholder="最低300元"
                />
                <p className="text-xs text-gray-500">
                  {budgetMode === 'BUDGET_MODE_DAY' ? '日预算' : '总预算'}最低300元
                </p>
              </div>
            </div>

            {/* 预览信息 */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">修改预览</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">预算类型:</span>
                  <span className="font-medium">
                    {budgetMode === 'BUDGET_MODE_DAY' ? '日预算' : '总预算'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">预算金额:</span>
                  <span className="font-medium text-green-600">¥{budget.toFixed(2)}</span>
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
