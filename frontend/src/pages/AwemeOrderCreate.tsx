import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Video, CheckCircle } from 'lucide-react'
import {
  createAwemeOrder,
  getAwemeVideoList,
  type CreateAwemeOrderParams,
  type AwemeVideoItem,
} from '../api/aweme'
import { useAuthStore } from '../store/authStore'

/**
 * 随心推订单创建页面
 * 创建新的随心推订单
 */
export default function AwemeOrderCreate() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [submitting, setSubmitting] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [videos, setVideos] = useState<AwemeVideoItem[]>([])
  const [selectedVideo, setSelectedVideo] = useState<AwemeVideoItem | null>(null)
  
  const [formData, setFormData] = useState<CreateAwemeOrderParams>({
    advertiser_id: user?.advertiserId || 0,
    aweme_id: '',
    item_id: '',
    order_name: '',
    budget: 500,
    delivery_mode: 'DELIVERY_MODE_STANDARD',
    delivery_setting: {
      start_time: new Date().toISOString(),
      end_time: undefined,
    },
    audience_targeting: {
      gender: 'NONE',
      age: [],
      region: [],
      interest_tags: [],
    },
    external_action: 'AD_CONVERT_TYPE_LIVE_SUCCESSPAGE_CLICK',
    roi_goal: undefined,
  })

  const loadVideos = async (awemeId: string) => {
    if (!user?.advertiserId || !awemeId) return
    
    setLoadingVideos(true)
    try {
      const data = await getAwemeVideoList({
        advertiser_id: user.advertiserId || 0,
        aweme_id: awemeId,
        count: 20,
      })
      setVideos(data.list || [])
    } catch (error) {
      console.error('获取视频列表失败:', error)
      alert('获取视频列表失败，请稍后重试')
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleAwemeIdChange = (awemeId: string) => {
    setFormData({ ...formData, aweme_id: awemeId, item_id: '' })
    setSelectedVideo(null)
    if (awemeId) {
      loadVideos(awemeId)
    }
  }

  const handleVideoSelect = (video: AwemeVideoItem) => {
    if (!video.is_promotable) {
      alert('该视频不可投放')
      return
    }
    setSelectedVideo(video)
    setFormData({ ...formData, item_id: video.item_id })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.advertiserId) {
      alert('请先登录')
      return
    }

    if (!formData.aweme_id) {
      alert('请输入抖音号ID')
      return
    }

    if (!formData.item_id) {
      alert('请选择视频')
      return
    }

    if (!formData.order_name.trim()) {
      alert('请输入订单名称')
      return
    }

    setSubmitting(true)
    try {
      const params: CreateAwemeOrderParams = {
        ...formData,
        advertiser_id: user.advertiserId || 0,
      }

      const result = await createAwemeOrder(params)
      alert('创建成功！')
      navigate(`/aweme-orders/${result.order_id}`)
    } catch (error: any) {
      console.error('创建失败:', error)
      alert(`创建失败: ${error.response?.data?.message || error.message || '未知错误'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const ageOptions = [
    { value: 'AGE_UNDER_18', label: '18岁以下' },
    { value: 'AGE_18_23', label: '18-23岁' },
    { value: 'AGE_24_30', label: '24-30岁' },
    { value: 'AGE_31_40', label: '31-40岁' },
    { value: 'AGE_41_49', label: '41-49岁' },
    { value: 'AGE_OVER_50', label: '50岁以上' },
  ]

  const handleAgeToggle = (age: string) => {
    const currentAges = formData.audience_targeting?.age || []
    const newAges = currentAges.includes(age)
      ? currentAges.filter((a) => a !== age)
      : [...currentAges, age]
    
    setFormData({
      ...formData,
      audience_targeting: {
        ...formData.audience_targeting,
        age: newAges,
      },
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/aweme-orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新建随心推订单</h1>
          <p className="text-sm text-gray-500 mt-1">为短视频创建推广订单</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-6xl">
        {/* Aweme Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            选择抖音号和视频 <span className="text-red-500">*</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                抖音号ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入抖音号ID"
                value={formData.aweme_id}
                onChange={(e) => handleAwemeIdChange(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">输入抖音号ID后自动加载可投放视频</p>
            </div>

            {loadingVideos && (
              <div className="text-center py-8 text-gray-500">加载视频中...</div>
            )}

            {!loadingVideos && videos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择视频 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.map((video) => {
                    const isSelected = selectedVideo?.item_id === video.item_id
                    return (
                      <button
                        key={video.item_id}
                        type="button"
                        onClick={() => handleVideoSelect(video)}
                        disabled={!video.is_promotable}
                        className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : video.is_promotable
                            ? 'border-gray-200 hover:border-blue-300'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          {video.cover_url ? (
                            <img
                              src={video.cover_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Video className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {video.title || '无标题'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {video.duration}秒 · {new Date(video.create_time).toLocaleDateString()}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                        {!video.is_promotable && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">不可投放</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                订单名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入订单名称"
                value={formData.order_name}
                onChange={(e) => setFormData({ ...formData, order_name: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">最多50个字符</p>
            </div>
          </div>
        </div>

        {/* Budget Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">预算与投放</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                预算金额（元） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="最低100元"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">随心推最低预算100元</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                投放模式 <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.delivery_mode}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_mode: e.target.value as any })
                }
              >
                <option value="DELIVERY_MODE_STANDARD">标准投放（均匀消耗预算）</option>
                <option value="DELIVERY_MODE_ACCELERATE">加速投放（快速消耗预算）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.delivery_setting.start_time.slice(0, 16)}
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
                value={formData.delivery_setting.end_time?.slice(0, 16) || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_setting: {
                      ...formData.delivery_setting,
                      end_time: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    },
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">不设置则预算耗尽或手动终止</p>
            </div>
          </div>
        </div>

        {/* Audience Targeting */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">受众定向（可选）</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.audience_targeting?.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    audience_targeting: {
                      ...formData.audience_targeting,
                      gender: e.target.value as any,
                    },
                  })
                }
              >
                <option value="NONE">不限</option>
                <option value="MALE">男性</option>
                <option value="FEMALE">女性</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年龄段</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ageOptions.map((option) => {
                  const isSelected = formData.audience_targeting?.age?.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleAgeToggle(option.value)}
                      className={`px-4 py-2 border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地域定向（可选）
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入地区代码，用逗号分隔，如：110000,310000"
                value={formData.audience_targeting?.region?.join(',') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    audience_targeting: {
                      ...formData.audience_targeting,
                      region: e.target.value ? e.target.value.split(',').map((r) => r.trim()) : [],
                    },
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">留空表示不限地域</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/aweme-orders')}
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
            {submitting ? '创建中...' : '创建订单'}
          </button>
        </div>
      </form>
    </div>
  )
}
