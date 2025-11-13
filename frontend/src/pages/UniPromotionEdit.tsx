import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import {
  getUniPromotionDetail,
  updateUniPromotion,
  type UpdateUniPromotionParams,
  type UniPromotionAd,
} from '../api/uniPromotion'
import { useAuthStore } from '../store/authStore'
import { toast } from '../components/ui/Toast'

/**
 * 全域推广编辑页面
 * 编辑现有的全域推广计划
 */
export default function UniPromotionEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [promotion, setPromotion] = useState<UniPromotionAd | null>(null)
  const [formData, setFormData] = useState<UpdateUniPromotionParams>({
    advertiser_id: user?.advertiserId || 0,
    ad_id: parseInt(id || '0'),
    ad_name: '',
    budget: undefined,
    budget_mode: undefined,
    roi_goal: undefined,
  })

  useEffect(() => {
    if (id && user?.advertiserId) {
      loadPromotion()
    }
  }, [id, user])

  const loadPromotion = async () => {
    if (!id || !user?.advertiserId) return
    
    setLoading(true)
    try {
      const data = await getUniPromotionDetail(user.advertiserId || 0, parseInt(id))
      setPromotion(data)
      setFormData({
        advertiser_id: user.advertiserId || 0,
        ad_id: data.ad_id,
        ad_name: data.ad_name,
        budget: data.budget,
        budget_mode: data.budget_mode,
        roi_goal: data.roi_goal,
      })
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as any).message)
        : '获取详情失败'
      toast.error(errorMsg)
      console.error('获取详情失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.advertiserId || !id) {
      toast.error('参数错误')
      return
    }

    if (!formData.ad_name?.trim()) {
      toast.error('请输入推广计划名称')
      return
    }

    if (formData.budget && formData.budget < 300) {
      toast.error('预算金额不能少于300元')
      return
    }

    setSubmitting(true)
    try {
      // 只传递有修改的字段
      const params: UpdateUniPromotionParams = {
        advertiser_id: user.advertiserId || 0,
        ad_id: parseInt(id),
      }

      // 只传递有变化的字段
      if (formData.ad_name && formData.ad_name !== promotion?.ad_name) {
        params.ad_name = formData.ad_name
      }
      if (formData.budget !== undefined && formData.budget !== promotion?.budget) {
        params.budget = formData.budget
      }
      if (formData.budget_mode && formData.budget_mode !== promotion?.budget_mode) {
        params.budget_mode = formData.budget_mode
      }
      if (formData.roi_goal !== undefined && formData.roi_goal !== promotion?.roi_goal) {
        params.roi_goal = formData.roi_goal
      }

      await updateUniPromotion(params)
      toast.success('保存成功！')
      navigate(`/uni-promotions/${id}`)
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'response' in err
        ? (err as any).response?.data?.message || (err as any).message
        : '保存失败'
      toast.error(errorMsg || '保存失败，请稍后重试')
      console.error('保存失败:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!promotion) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">推广计划不存在</p>
          <button
            onClick={() => navigate('/uni-promotions')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(`/uni-promotions/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">编辑推广计划</h1>
          <p className="text-sm text-gray-500 mt-1">ID: {promotion.ad_id}</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>提示：</strong>全域推广计划仅支持修改计划名称、预算和ROI目标。营销目标和场景创建后不可修改。
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
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

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm text-gray-500">营销目标</label>
                <p className="mt-1 text-gray-900">
                  {promotion.marketing_goal === 'LIVE' && '直播推广'}
                  {promotion.marketing_goal === 'PRODUCT' && '商品推广'}
                  {promotion.marketing_goal === 'FANS' && '粉丝增长'}
                  {promotion.marketing_goal === 'BRAND' && '品牌推广'}
                  <span className="ml-2 text-xs text-gray-500">(不可修改)</span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">营销场景</label>
                <p className="mt-1 text-gray-900">
                  {promotion.marketing_scene.join(', ')}
                  <span className="ml-2 text-xs text-gray-500">(不可修改)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">预算设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                预算模式
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
                预算金额（元）
              </label>
              <input
                type="number"
                min="300"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="最低300元"
                value={formData.budget || ''}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })
                }
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

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/uni-promotions/${id}`)}
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
            {submitting ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  )
}
