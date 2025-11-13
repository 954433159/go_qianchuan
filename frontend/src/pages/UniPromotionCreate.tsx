import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Video, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import {
  createUniPromotion,
  getAuthorizedAwemeForUni,
  type CreateUniPromotionParams,
  type AuthorizedAwemeForUni,
} from '../api/uniPromotion'
import { useAuthStore } from '../store/authStore'
import { useEffect } from 'react'

/**
 * 全域推广创建页面
 * 创建新的全域推广计划
 */
export default function UniPromotionCreate() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [submitting, setSubmitting] = useState(false)
  const [awemeList, setAwemeList] = useState<AuthorizedAwemeForUni[]>([])
  const [formData, setFormData] = useState<CreateUniPromotionParams>({
    advertiser_id: user?.advertiserId || 0,
    ad_name: '',
    marketing_goal: 'LIVE',
    marketing_scene: ['FEED', 'SEARCH'],
    budget: 300,
    budget_mode: 'BUDGET_MODE_DAY',
    roi_goal: undefined,
    aweme_id: '',
    product_id: '',
    delivery_setting: {
      start_time: new Date().toISOString().slice(0, 16),
      end_time: undefined,
    },
  })

  useEffect(() => {
    if (user?.advertiserId) {
      loadAwemeList()
    }
  }, [user])

  const loadAwemeList = async () => {
    if (!user?.advertiserId) return
    try {
      const list = await getAuthorizedAwemeForUni(user.advertiserId || 0)
      setAwemeList(list)
      if (list.length > 0 && list[0]?.is_authorized) {
        setFormData((prev) => ({ ...prev, aweme_id: list[0]?.aweme_id ?? '' }))
      }
    } catch (error) {
      console.error('获取抖音号列表失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.advertiserId) {
      alert('请先登录')
      return
    }

    if (!formData.ad_name.trim()) {
      alert('请输入推广计划名称')
      return
    }

    if (formData.marketing_scene.length === 0) {
      alert('请至少选择一个营销场景')
      return
    }

    setSubmitting(true)
    try {
      const params: CreateUniPromotionParams = {
        ...formData,
        advertiser_id: user.advertiserId || 0,
        delivery_setting: formData.delivery_setting?.end_time
          ? formData.delivery_setting
          : { start_time: formData.delivery_setting?.start_time || new Date().toISOString() },
      }

      const result = await createUniPromotion(params)
      alert('创建成功！')
      navigate(`/uni-promotions/${result.ad_id}`)
    } catch (error: any) {
      console.error('创建失败:', error)
      alert(`创建失败: ${error.response?.data?.message || error.message || '未知错误'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSceneToggle = (scene: string) => {
    setFormData((prev) => ({
      ...prev,
      marketing_scene: prev.marketing_scene.includes(scene)
        ? prev.marketing_scene.filter((s) => s !== scene)
        : [...prev.marketing_scene, scene],
    }))
  }

  const marketingGoals = [
    { value: 'LIVE', label: '直播推广', icon: Video, description: '推广直播间，提升直播GMV' },
    { value: 'PRODUCT', label: '商品推广', icon: ShoppingBag, description: '推广商品，提升商品销量' },
    { value: 'FANS', label: '粉丝增长', icon: Users, description: '增加账号粉丝数量' },
    { value: 'BRAND', label: '品牌推广', icon: TrendingUp, description: '提升品牌知名度' },
  ]

  const marketingScenes = [
    { value: 'FEED', label: '抖音信息流' },
    { value: 'SEARCH', label: '抖音搜索' },
    { value: 'TOUTIAO_FEED', label: '今日头条' },
    { value: 'XIGUA', label: '西瓜视频' },
    { value: 'PIPIXIA', label: '皮皮虾' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/uni-promotions')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新建全域推广</h1>
          <p className="text-sm text-gray-500 mt-1">创建多场景智能投放计划</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Marketing Goal */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">营销目标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketingGoals.map((goal) => {
              const Icon = goal.icon
              const isSelected = formData.marketing_goal === goal.value
              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, marketing_goal: goal.value as any })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{goal.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{goal.description}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                推广计划名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入推广计划名称"
                value={formData.ad_name}
                onChange={(e) => setFormData({ ...formData, ad_name: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">最多50个字符</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择抖音号 {formData.marketing_goal === 'LIVE' && <span className="text-red-500">*</span>}
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.aweme_id}
                onChange={(e) => setFormData({ ...formData, aweme_id: e.target.value })}
                required={formData.marketing_goal === 'LIVE'}
              >
                <option value="">请选择抖音号</option>
                {awemeList.map((aweme) => (
                  <option key={aweme.aweme_id} value={aweme.aweme_id} disabled={!aweme.is_authorized}>
                    {aweme.aweme_name} {!aweme.is_authorized && '(未授权)'}
                  </option>
                ))}
              </select>
            </div>

            {formData.marketing_goal === 'PRODUCT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品ID（可选）
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入商品ID"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Marketing Scenes */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            营销场景 <span className="text-red-500">*</span>
          </h2>
          <p className="text-sm text-gray-600 mb-4">选择要投放的平台和场景（至少选择一个）</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {marketingScenes.map((scene) => {
              const isSelected = formData.marketing_scene.includes(scene.value)
              return (
                <button
                  key={scene.value}
                  type="button"
                  onClick={() => handleSceneToggle(scene.value)}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {scene.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Budget Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">预算设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                预算模式 <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.budget_mode}
                onChange={(e) =>
                  setFormData({ ...formData, budget_mode: e.target.value as any })
                }
              >
                <option value="BUDGET_MODE_DAY">日预算</option>
                <option value="BUDGET_MODE_TOTAL">总预算</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                预算金额（元） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="300"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="最低300元"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">最低预算300元</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ROI目标（可选）
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：2.5（表示期望ROI为2.5）"
                value={formData.roi_goal || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roi_goal: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">控成本投放时可设置ROI目标</p>
            </div>
          </div>
        </div>

        {/* Delivery Time */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">投放时间</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.delivery_setting?.start_time?.slice(0, 16) || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_setting: {
                      ...formData.delivery_setting,
                      start_time: new Date(e.target.value).toISOString(),
                    },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束时间（可选）
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.delivery_setting?.end_time?.slice(0, 16) || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_setting: {
                      ...formData.delivery_setting,
                      start_time: formData.delivery_setting?.start_time || new Date().toISOString(),
                      end_time: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    },
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">不设置则长期投放</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/uni-promotions')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {submitting ? '创建中...' : '创建推广计划'}
          </button>
        </div>
      </form>
    </div>
  )
}
