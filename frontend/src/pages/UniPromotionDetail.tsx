import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Play, Pause, Trash2, Image as ImageIcon } from 'lucide-react'
import {
  getUniPromotionDetail,
  updateUniPromotionStatus,
  getUniPromotionMaterial,
  type UniPromotionAd,
  type UniPromotionMaterial,
} from '../api/uniPromotion'
import { useAuthStore } from '../store/authStore'
import { toast } from '../components/ui/Toast'

/**
 * 全域推广详情页面
 */
export default function UniPromotionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [promotion, setPromotion] = useState<UniPromotionAd | null>(null)
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<UniPromotionMaterial[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)

  useEffect(() => {
    if (id && user?.advertiserId) {
      fetchDetail()
      fetchMaterials()
    }
  }, [id, user])

  const fetchDetail = async () => {
    if (!id || !user?.advertiserId) return
    
    setLoading(true)
    try {
      const data = await getUniPromotionDetail(user.advertiserId || 0, parseInt(id))
      setPromotion(data)
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

  const fetchMaterials = async () => {
    if (!id || !user?.advertiserId) return
    
    setMaterialsLoading(true)
    try {
      const data = await getUniPromotionMaterial({
        advertiser_id: user.advertiserId || 0,
        ad_id: parseInt(id),
      })
      setMaterials(data)
    } catch (err: unknown) {
      // Silently fail - materials are optional
      console.warn('获取素材失败:', err)
    } finally {
      setMaterialsLoading(false)
    }
  }

  const handleStatusUpdate = async (status: 'ENABLE' | 'DISABLE' | 'DELETE') => {
    if (!promotion || !user?.advertiserId) return
    
    const actionText = status === 'ENABLE' ? '启用' : status === 'DISABLE' ? '暂停' : '删除'
    
    if (status === 'DELETE' && !confirm(`确定要删除推广计划"${promotion.ad_name}"吗？`)) {
      return
    }
    
    try {
      await updateUniPromotionStatus({
        advertiser_id: user.advertiserId || 0,
        ad_ids: [promotion.ad_id],
        opt_status: status,
      })
      
      toast.success(`${actionText}成功`)
      
      if (status === 'DELETE') {
        navigate('/uni-promotions')
      } else {
        fetchDetail()
      }
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as any).message)
        : `${actionText}失败`
      toast.error(errorMsg)
      console.error('更新状态失败:', err)
    }
  }

  const renderMarketingGoal = (goal: string) => {
    const goalMap: Record<string, string> = {
      LIVE: '直播推广',
      PRODUCT: '商品推广',
      FANS: '粉丝增长',
      BRAND: '品牌推广',
    }
    return goalMap[goal] || goal
  }

  const renderStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: '投放中', color: 'bg-green-100 text-green-800' },
      PAUSED: { label: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
      DELETED: { label: '已删除', color: 'bg-gray-100 text-gray-800' },
    }
    
    const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/uni-promotions')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{promotion.ad_name}</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {promotion.ad_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {renderStatus(promotion.status)}
          
          <button
            onClick={() => navigate(`/uni-promotions/${id}/edit`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </button>

          {promotion.status === 'ACTIVE' && (
            <button
              onClick={() => handleStatusUpdate('DISABLE')}
              className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              暂停
            </button>
          )}

          {promotion.status === 'PAUSED' && (
            <button
              onClick={() => handleStatusUpdate('ENABLE')}
              className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              启用
            </button>
          )}

          <button
            onClick={() => handleStatusUpdate('DELETE')}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">推广计划名称</label>
                <p className="mt-1 text-gray-900">{promotion.ad_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">营销目标</label>
                <p className="mt-1 text-gray-900">{renderMarketingGoal(promotion.marketing_goal)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">创建时间</label>
                <p className="mt-1 text-gray-900">
                  {new Date(promotion.create_time).toLocaleString()}
                </p>
              </div>
              {promotion.modify_time && (
                <div>
                  <label className="text-sm text-gray-500">最后修改时间</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(promotion.modify_time).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Budget Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">预算信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">预算金额</label>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ¥{promotion.budget.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">预算模式</label>
                <p className="mt-1 text-gray-900">
                  {promotion.budget_mode === 'BUDGET_MODE_DAY' ? '日预算' : '总预算'}
                </p>
              </div>
              {promotion.roi_goal && (
                <div>
                  <label className="text-sm text-gray-500">ROI目标</label>
                  <p className="mt-1 text-gray-900">{promotion.roi_goal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Marketing Scenes */}
          {promotion.marketing_scene && promotion.marketing_scene.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">投放场景</h2>
              <div className="flex flex-wrap gap-2">
                {promotion.marketing_scene.map((scene, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {scene}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Settings */}
          {promotion.delivery_setting && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">投放设置</h2>
              <div className="space-y-2">
                <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
                  {JSON.stringify(promotion.delivery_setting, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">关联素材</h2>
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            {materialsLoading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无关联素材</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {materials.map((material) => (
                  <div key={material.material_id} className="border rounded-lg p-3">
                    {material.material_type === 'IMAGE' ? (
                      <img
                        src={material.url}
                        alt="素材"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    ) : (
                      <video
                        src={material.url}
                        className="w-full h-32 object-cover rounded mb-2"
                        controls
                      />
                    )}
                    <p className="text-xs text-gray-500 truncate">
                      {material.material_type === 'IMAGE' ? '图片' : '视频'} • {material.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">数据概览</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">曝光</span>
                <span className="text-lg font-semibold text-gray-900">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">点击</span>
                <span className="text-lg font-semibold text-gray-900">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">转化</span>
                <span className="text-lg font-semibold text-gray-900">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">花费</span>
                <span className="text-lg font-semibold text-gray-900">¥0.00</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              * 数据每小时更新一次
            </p>
          </div>

          {/* Campaign Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">推广信息</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">广告主ID</label>
                <p className="mt-1 text-gray-900">{promotion.advertiser_id}</p>
              </div>
              {promotion.campaign_id && (
                <div>
                  <label className="text-sm text-gray-500">关联广告组</label>
                  <p className="mt-1 text-gray-900">{promotion.campaign_id}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">操作状态</label>
                <p className="mt-1 text-gray-900">{promotion.opt_status || '正常'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
