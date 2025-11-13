import { useState, useEffect } from 'react'
import { 
  Search, TrendingUp, DollarSign, Clock, Tag, Calculator,
  AlertCircle, CheckCircle, HelpCircle 
} from 'lucide-react'
import {
  getAwemeInterestKeywords,
  getSuggestAwemeBid,
  getSuggestAwemeRoiGoal,
  getEstimateProfit,
  getAwemeOrderQuota,
  getSuggestDeliveryTime,
  type InterestKeyword,
  type EstimateProfit,
  type AwemeOrderQuota
} from '../api/aweme'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../hooks/useToast'

/**
 * 随心推工具集合页面
 * 提供兴趣标签、建议出价、预估效果、配额查询等工具
 */
export default function AwemeTools() {
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState<'interest' | 'bid' | 'estimate' | 'quota' | 'duration'>('interest')

  // 兴趣标签
  const [interestKeywords, setInterestKeywords] = useState<InterestKeyword[]>([])
  const [interestLoading, setInterestLoading] = useState(false)

  // 建议出价
  const [bidParams, setBidParams] = useState({ aweme_id: '', external_action: 'AD_CONVERT_TYPE_LIVE_SUCCESSORDER_PAY' })
  const [suggestedBid, setSuggestedBid] = useState<number | null>(null)

  // ROI建议
  const [roiGoal, setRoiGoal] = useState<number | null>(null)

  // 效果预估
  const [estimateParams, setEstimateParams] = useState({
    aweme_id: '',
    item_id: '',
    budget: 300,
    delivery_mode: 'DELIVERY_MODE_STANDARD',
    external_action: 'AD_CONVERT_TYPE_LIVE_SUCCESSORDER_PAY'
  })
  const [estimatedResult, setEstimatedResult] = useState<EstimateProfit | null>(null)

  // 配额信息
  const [quotaInfo, setQuotaInfo] = useState<AwemeOrderQuota | null>(null)

  useEffect(() => {
    if (activeTab === 'interest' && !interestKeywords.length) {
      loadInterestKeywords()
    } else if (activeTab === 'quota') {
      loadQuotaInfo()
    }
  }, [activeTab])

  const loadInterestKeywords = async () => {
    if (!user?.advertiserId) return
    setInterestLoading(true)
    try {
      const data = await getAwemeInterestKeywords(user.advertiserId || 0)
      setInterestKeywords(data)
    } catch (error) {
      console.error('获取兴趣标签失败:', error)
      showError('获取兴趣标签失败')
    } finally {
      setInterestLoading(false)
    }
  }

  const handleGetSuggestedBid = async () => {
    if (!user?.advertiserId || !bidParams.aweme_id) {
      showError('请填写抖音号ID')
      return
    }

    try {
      const data = await getSuggestAwemeBid({
        advertiser_id: user.advertiserId || 0,
        aweme_id: bidParams.aweme_id,
        external_action: bidParams.external_action
      })
      setSuggestedBid(data.suggested_bid)
      success('已获取建议出价')
    } catch (error) {
      console.error('获取建议出价失败:', error)
      showError('获取建议出价失败')
    }
  }

  const handleGetRoiGoal = async () => {
    if (!user?.advertiserId || !bidParams.aweme_id) {
      showError('请填写抖音号ID')
      return
    }

    try {
      const data = await getSuggestAwemeRoiGoal({
        advertiser_id: user.advertiserId || 0,
        aweme_id: bidParams.aweme_id,
        external_action: bidParams.external_action
      })
      setRoiGoal(data.suggested_roi_goal)
      success('已获取ROI建议')
    } catch (error) {
      console.error('获取ROI建议失败:', error)
      showError('获取ROI建议失败')
    }
  }

  const handleEstimateProfit = async () => {
    if (!user?.advertiserId || !estimateParams.aweme_id || !estimateParams.item_id) {
      showError('请填写完整信息')
      return
    }

    try {
      const data = await getEstimateProfit({
        advertiser_id: user.advertiserId || 0,
        ...estimateParams
      })
      setEstimatedResult(data)
      success('已获取效果预估')
    } catch (error) {
      console.error('获取效果预估失败:', error)
      showError('获取效果预估失败')
    }
  }

  const loadQuotaInfo = async () => {
    if (!user?.advertiserId) return
    
    try {
      const data = await getAwemeOrderQuota(user.advertiserId || 0)
      setQuotaInfo(data)
    } catch (error) {
      console.error('获取配额信息失败:', error)
      showError('获取配额信息失败')
    }
  }

  const tabs = [
    { id: 'interest' as const, label: '兴趣标签', icon: Tag },
    { id: 'bid' as const, label: '建议出价', icon: DollarSign },
    { id: 'estimate' as const, label: '效果预估', icon: Calculator },
    { id: 'quota' as const, label: '订单配额', icon: TrendingUp },
    { id: 'duration' as const, label: '延长时长', icon: Clock },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">随心推工具</h1>
        <p className="mt-1 text-sm text-gray-600">
          提供兴趣标签、建议出价、效果预估、配额查询等辅助工具
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* 兴趣标签 */}
          {activeTab === 'interest' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">兴趣标签库</h2>
                <button
                  onClick={loadInterestKeywords}
                  disabled={interestLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {interestLoading ? '加载中...' : '刷新'}
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">使用说明</p>
                    <p>兴趣标签用于定向投放，选择合适的兴趣标签可以提升广告投放效果。点击标签可复制到剪贴板。</p>
                  </div>
                </div>
              </div>

              {interestLoading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : interestKeywords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无兴趣标签数据</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {interestKeywords.map((keyword) => (
                    <button
                      key={keyword.id}
                      onClick={() => {
                        navigator.clipboard.writeText(keyword.id)
                        success(`已复制: ${keyword.name}`)
                      }}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
                    >
                      <div className="font-medium text-gray-900">{keyword.name}</div>
                      {keyword.num && (
                        <div className="text-xs text-gray-500 mt-1">ID: {keyword.id}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 建议出价 */}
          {activeTab === 'bid' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">获取建议出价</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    抖音号ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bidParams.aweme_id}
                    onChange={(e) => setBidParams({ ...bidParams, aweme_id: e.target.value })}
                    placeholder="请输入抖音号ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">转化目标</label>
                  <select
                    value={bidParams.external_action}
                    onChange={(e) => setBidParams({ ...bidParams, external_action: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AD_CONVERT_TYPE_LIVE_SUCCESSORDER_PAY">直播成交</option>
                    <option value="AD_CONVERT_TYPE_LIVE_CLICK_PRODUCT_ACTION">直播商品点击</option>
                    <option value="AD_CONVERT_TYPE_LIVE_ENTER_ACTION">直播间进入</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGetSuggestedBid}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    获取建议出价
                  </button>
                  <button
                    onClick={handleGetRoiGoal}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    获取ROI建议
                  </button>
                </div>

                {suggestedBid !== null && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">建议出价</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">¥{suggestedBid.toFixed(2)}</div>
                  </div>
                )}

                {roiGoal !== null && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">ROI建议</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{roiGoal.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 效果预估 */}
          {activeTab === 'estimate' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">投放效果预估</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      抖音号ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={estimateParams.aweme_id}
                      onChange={(e) => setEstimateParams({ ...estimateParams, aweme_id: e.target.value })}
                      placeholder="请输入抖音号ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      视频ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={estimateParams.item_id}
                      onChange={(e) => setEstimateParams({ ...estimateParams, item_id: e.target.value })}
                      placeholder="请输入视频ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预算（元）</label>
                  <input
                    type="number"
                    value={estimateParams.budget}
                    onChange={(e) => setEstimateParams({ ...estimateParams, budget: Number(e.target.value) })}
                    min="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">投放模式</label>
                  <select
                    value={estimateParams.delivery_mode}
                    onChange={(e) => setEstimateParams({ ...estimateParams, delivery_mode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DELIVERY_MODE_STANDARD">标准投放</option>
                    <option value="DELIVERY_MODE_ACCELERATE">加速投放</option>
                  </select>
                </div>

                <button
                  onClick={handleEstimateProfit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  预估效果
                </button>

                {estimatedResult && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">预估结果</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">预估展示</div>
                        <div className="text-xl font-bold text-gray-900">
                          {estimatedResult.estimated_views.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">预估点击</div>
                        <div className="text-xl font-bold text-gray-900">
                          {estimatedResult.estimated_clicks.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">预估转化</div>
                        <div className="text-xl font-bold text-gray-900">
                          {estimatedResult.estimated_conversions.toLocaleString()}
                        </div>
                      </div>
                      {estimatedResult.estimated_roi && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">预估ROI</div>
                          <div className="text-xl font-bold text-gray-900">
                            {estimatedResult.estimated_roi.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 订单配额 */}
          {activeTab === 'quota' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">订单配额查询</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">配额说明</p>
                    <p>随心推订单数量受到配额限制，当前可用配额不足时将无法创建新订单。</p>
                  </div>
                </div>
              </div>

              {quotaInfo ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">总配额</div>
                      <div className="text-3xl font-bold text-gray-900">{quotaInfo.quota}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">已使用</div>
                      <div className="text-3xl font-bold text-orange-600">{quotaInfo.quota_used}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">可用配额</div>
                      <div className="text-3xl font-bold text-green-600">{quotaInfo.quota_available}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>使用进度</span>
                      <span>{((quotaInfo.quota_used / quotaInfo.quota) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${(quotaInfo.quota_used / quotaInfo.quota) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">加载配额信息...</div>
              )}

              <button
                onClick={loadQuotaInfo}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                刷新配额
              </button>
            </div>
          )}

          {/* 延长时长 */}
          {activeTab === 'duration' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">建议延长时长</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">功能说明</p>
                    <p>系统会根据订单的投放情况，给出建议的延长时长，帮助您优化投放效果。</p>
                  </div>
                </div>
              </div>

              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>请在订单详情页查看延长时长建议</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
