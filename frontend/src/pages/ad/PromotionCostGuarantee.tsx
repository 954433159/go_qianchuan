import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader, Button, Card, CardContent, Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Shield, AlertCircle, DollarSign } from 'lucide-react'

type GuaranteeType = 'cpa' | 'cpc' | 'cpm'

export default function PromotionCostGuarantee() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [adId, setAdId] = useState<number | null>(null)
  const [guaranteeType, setGuaranteeType] = useState<GuaranteeType>('cpa')
  const [maxCost, setMaxCost] = useState<number>(10)

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

    if (maxCost <= 0) {
      toast.error('成本上限必须大于0')
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with real API call
      // await updateCostGuarantee({
      //   advertiser_id: user.advertiserId,
      //   ad_id: adId,
      //   guarantee_type: guaranteeType,
      //   max_cost: maxCost * 100,
      // })
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('成本保障设置成功')
      navigate('/ads')
    } catch (error) {
      console.error('Failed to set cost guarantee:', error)
      toast.error('设置成本保障失败')
    } finally {
      setLoading(false)
    }
  }

  const getTypeInfo = () => {
    switch (guaranteeType) {
      case 'cpa':
        return {
          name: 'CPA（转化成本）',
          unit: '元/转化',
          description: '每个转化的平均成本不超过设定值',
        }
      case 'cpc':
        return {
          name: 'CPC（点击成本）',
          unit: '元/点击',
          description: '每次点击的平均成本不超过设定值',
        }
      case 'cpm':
        return {
          name: 'CPM（千次展示成本）',
          unit: '元/千次',
          description: '每千次展示的平均成本不超过设定值',
        }
    }
  }

  const typeInfo = getTypeInfo()

  return (
    <div className="space-y-6">
      <PageHeader
        title="设置成本保障"
        description="控制广告投放的成本上限，保护投放预算"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划', href: '/ads' },
          { label: '成本保障' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/ads')}>
              取消
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <Shield className="w-4 h-4 mr-2" />
              确认设置
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
                  将为此广告设置成本保障机制
                </p>
              </div>
            </div>

            {/* 保障类型选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                成本保障类型 <span className="text-red-500">*</span>
              </label>
              <Select
                value={guaranteeType}
                onValueChange={(value) => setGuaranteeType(value as GuaranteeType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpa">CPA - 转化成本保障</SelectItem>
                  <SelectItem value="cpc">CPC - 点击成本保障</SelectItem>
                  <SelectItem value="cpm">CPM - 展示成本保障</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{typeInfo.description}</p>
            </div>

            {/* 成本上限输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                成本上限 ({typeInfo.unit}) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={maxCost}
                onChange={(e) => setMaxCost(Number(e.target.value))}
                min={0.1}
                step={0.1}
                placeholder={`例如：${guaranteeType === 'cpa' ? '10' : guaranteeType === 'cpc' ? '1' : '5'}`}
              />
              <p className="text-xs text-gray-500">
                超过此成本时，系统会自动调整出价策略
              </p>
            </div>

            {/* 保障说明 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                成本保障机制
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                    1
                  </span>
                  <p>实时监控{typeInfo.name}，当接近设定上限时自动降低出价</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                    2
                  </span>
                  <p>优化投放策略，优先展示给高转化人群</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                    3
                  </span>
                  <p>超出成本上限时暂停投放，保护预算不被过度消耗</p>
                </div>
              </div>
            </div>

            {/* 建议成本 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-900 mb-2">行业参考成本</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-yellow-700">电商行业</p>
                  <p className="font-semibold text-yellow-900">
                    {guaranteeType === 'cpa' ? '¥8-15' : guaranteeType === 'cpc' ? '¥0.8-1.5' : '¥5-10'}
                  </p>
                </div>
                <div>
                  <p className="text-yellow-700">游戏行业</p>
                  <p className="font-semibold text-yellow-900">
                    {guaranteeType === 'cpa' ? '¥15-30' : guaranteeType === 'cpc' ? '¥1.2-2.5' : '¥8-15'}
                  </p>
                </div>
                <div>
                  <p className="text-yellow-700">教育行业</p>
                  <p className="font-semibold text-yellow-900">
                    {guaranteeType === 'cpa' ? '¥20-50' : guaranteeType === 'cpc' ? '¥1.5-3.0' : '¥10-20'}
                  </p>
                </div>
              </div>
            </div>

            {/* 预览信息 */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">设置预览</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">保障类型:</span>
                  <span className="font-medium">{typeInfo.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">成本上限:</span>
                  <span className="font-medium text-red-600 text-lg">
                    ¥{maxCost.toFixed(2)} {typeInfo.unit}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                  启用成本保障后，系统会自动控制投放成本在设定范围内
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
