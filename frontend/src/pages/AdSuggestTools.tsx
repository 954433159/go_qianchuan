import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, TrendingUp, Target, Lightbulb, BarChart, Calculator } from 'lucide-react'
import { getSuggestBid, getSuggestBudget, getSuggestRoiGoal, getEstimateEffect } from '@/api/ad'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Input, Loading, Badge } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toast'

export default function AdSuggestTools() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'bid' | 'budget' | 'roi' | 'estimate'>('bid')
  
  // 表单数据
  const [campaignId, setCampaignId] = useState('')
  const [budget, setBudget] = useState('500')
  const [budgetMode, setBudgetMode] = useState('BUDGET_MODE_DAY')
  const [bid, setBid] = useState('5')
  
  // 建议结果
  const [bidSuggestion, setBidSuggestion] = useState<any>(null)
  const [budgetSuggestion, setBudgetSuggestion] = useState<any>(null)
  const [roiSuggestion, setRoiSuggestion] = useState<any>(null)
  const [estimateResult, setEstimateResult] = useState<any>(null)
  
  const advertiserId = user?.advertiserId || 1

  const fetchSuggestBid = async () => {
    setLoading(true)
    try {
      const result = await getSuggestBid({
        advertiser_id: advertiserId,
        campaign_id: campaignId ? Number(campaignId) : undefined,
        delivery_setting: {
          budget: Number(budget) * 100,
          budget_mode: budgetMode
        }
      })
      setBidSuggestion(result)
      toast.success('建议出价获取成功')
    } catch (error) {
      console.error('Failed to get bid suggestion:', error)
      toast.error('获取建议出价失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestBudget = async () => {
    setLoading(true)
    try {
      const result = await getSuggestBudget({
        advertiser_id: advertiserId,
        campaign_id: campaignId ? Number(campaignId) : undefined
      })
      setBudgetSuggestion(result)
      toast.success('建议预算获取成功')
    } catch (error) {
      console.error('Failed to get budget suggestion:', error)
      toast.error('获取建议预算失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestRoi = async () => {
    setLoading(true)
    try {
      const result = await getSuggestRoiGoal({
        advertiser_id: advertiserId,
        campaign_id: campaignId ? Number(campaignId) : undefined
      })
      setRoiSuggestion(result)
      toast.success('建议ROI目标获取成功')
    } catch (error) {
      console.error('Failed to get ROI suggestion:', error)
      toast.error('获取建议ROI目标失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchEstimate = async () => {
    setLoading(true)
    try {
      const result = await getEstimateEffect({
        advertiser_id: advertiserId,
        campaign_id: campaignId ? Number(campaignId) : undefined,
        delivery_setting: {
          budget: Number(budget) * 100,
          budget_mode: budgetMode
        },
        audience: {
          gender: 'NONE',
          age: ['AGE_18_23', 'AGE_24_30'],
          region: ['110000']
        },
        bid: Number(bid) * 100,
        budget: Number(budget) * 100
      })
      setEstimateResult(result)
      toast.success('效果预估成功')
    } catch (error) {
      console.error('Failed to get estimate:', error)
      toast.error('效果预估失败')
    } finally {
      setLoading(false)
    }
  }

  const renderBidTool = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <CardTitle>建议出价</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              广告计划ID（可选）
            </label>
            <Input
              type="number"
              placeholder="输入计划ID"
              value={campaignId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算（元）
            </label>
            <Input
              type="number"
              placeholder="500"
              value={budget}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudget(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算类型
            </label>
            <Select value={budgetMode} onValueChange={setBudgetMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUDGET_MODE_DAY">日预算</SelectItem>
                <SelectItem value="BUDGET_MODE_TOTAL">总预算</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchSuggestBid} loading={loading} className="w-full">
            <Lightbulb className="mr-2 h-4 w-4" />
            获取建议出价
          </Button>

          {bidSuggestion && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">建议结果</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">建议出价：</span>
                  <span className="text-lg font-bold text-blue-900">
                    ¥{(bidSuggestion.suggested_bid / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">出价范围：</span>
                  <span className="text-sm font-medium text-blue-900">
                    ¥{(bidSuggestion.bid_range.min / 100).toFixed(2)} - 
                    ¥{(bidSuggestion.bid_range.max / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderBudgetTool = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle>建议预算</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              广告计划ID（可选）
            </label>
            <Input
              type="number"
              placeholder="输入计划ID"
              value={campaignId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignId(e.target.value)}
            />
          </div>

          <Button onClick={fetchSuggestBudget} loading={loading} className="w-full">
            <Lightbulb className="mr-2 h-4 w-4" />
            获取建议预算
          </Button>

          {budgetSuggestion && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">建议结果</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800">建议预算：</span>
                  <span className="text-lg font-bold text-green-900">
                    ¥{(budgetSuggestion.suggested_budget / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800">预算范围：</span>
                  <span className="text-sm font-medium text-green-900">
                    ¥{(budgetSuggestion.budget_range.min / 100).toFixed(2)} - 
                    ¥{(budgetSuggestion.budget_range.max / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderRoiTool = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle>建议ROI目标</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              广告计划ID（可选）
            </label>
            <Input
              type="number"
              placeholder="输入计划ID"
              value={campaignId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignId(e.target.value)}
            />
          </div>

          <Button onClick={fetchSuggestRoi} loading={loading} className="w-full">
            <Lightbulb className="mr-2 h-4 w-4" />
            获取建议ROI目标
          </Button>

          {roiSuggestion && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3">建议结果</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800">建议ROI目标：</span>
                  <span className="text-lg font-bold text-purple-900">
                    {roiSuggestion.suggested_roi_goal}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800">ROI范围：</span>
                  <span className="text-sm font-medium text-purple-900">
                    {roiSuggestion.roi_range.min} - {roiSuggestion.roi_range.max}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderEstimateTool = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-orange-600" />
            <CardTitle>效果预估</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              广告计划ID（可选）
            </label>
            <Input
              type="number"
              placeholder="输入计划ID"
              value={campaignId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算（元）
            </label>
            <Input
              type="number"
              placeholder="500"
              value={budget}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudget(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出价（元）
            </label>
            <Input
              type="number"
              placeholder="5"
              value={bid}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBid(e.target.value)}
            />
          </div>

          <Button onClick={fetchEstimate} loading={loading} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            预估投放效果
          </Button>

          {estimateResult && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-3">预估结果</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">预估曝光</p>
                  <p className="text-lg font-bold text-orange-900">
                    {estimateResult.estimated_impressions?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">预估点击</p>
                  <p className="text-lg font-bold text-orange-900">
                    {estimateResult.estimated_clicks?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">预估转化</p>
                  <p className="text-lg font-bold text-orange-900">
                    {estimateResult.estimated_conversions}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">预估成本</p>
                  <p className="text-lg font-bold text-orange-900">
                    ¥{(estimateResult.estimated_cost / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="智能建议工具"
        description="基于行业数据和历史表现，提供智能投放建议"
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '广告计划', href: '/ads' },
          { label: '建议工具' }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/ads')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        }
      />

      {/* 工具选择卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'bid' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setActiveTab('bid')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">建议出价</h3>
              <p className="text-xs text-gray-600">智能推荐最优出价</p>
              {activeTab === 'bid' && (
                <Badge className="mt-2" variant="default">
                  当前选中
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'budget' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => setActiveTab('budget')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">建议预算</h3>
              <p className="text-xs text-gray-600">推荐合理的预算</p>
              {activeTab === 'budget' && (
                <Badge className="mt-2" variant="default">
                  当前选中
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'roi' ? 'ring-2 ring-purple-500' : ''
          }`}
          onClick={() => setActiveTab('roi')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">建议ROI</h3>
              <p className="text-xs text-gray-600">推荐ROI目标范围</p>
              {activeTab === 'roi' && (
                <Badge className="mt-2" variant="default">
                  当前选中
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'estimate' ? 'ring-2 ring-orange-500' : ''
          }`}
          onClick={() => setActiveTab('estimate')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">效果预估</h3>
              <p className="text-xs text-gray-600">预估投放效果</p>
              {activeTab === 'estimate' && (
                <Badge className="mt-2" variant="default">
                  当前选中
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工具内容 */}
      {loading ? (
        <Loading text="计算中..." />
      ) : (
        <>
          {activeTab === 'bid' && renderBidTool()}
          {activeTab === 'budget' && renderBudgetTool()}
          {activeTab === 'roi' && renderRoiTool()}
          {activeTab === 'estimate' && renderEstimateTool()}
        </>
      )}
    </div>
  )
}
