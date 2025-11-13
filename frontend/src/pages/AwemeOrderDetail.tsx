import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, StopCircle, Plus } from 'lucide-react'
import {
  getAwemeOrderDetail,
  terminateAwemeOrder,
  addAwemeOrderBudget,
  type AwemeOrder,
} from '../api/aweme'
import { useAuthStore } from '../store/authStore'

/**
 * 随心推订单详情页面
 */
export default function AwemeOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [order, setOrder] = useState<AwemeOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [addBudgetAmount, setAddBudgetAmount] = useState<number>(100)

  useEffect(() => {
    if (id && user?.advertiserId) {
      fetchDetail()
    }
  }, [id, user])

  const fetchDetail = async () => {
    if (!id || !user?.advertiserId) return
    
    setLoading(true)
    try {
      const data = await getAwemeOrderDetail(user.advertiserId || 0, id)
      setOrder(data)
    } catch (error) {
      console.error('获取详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTerminate = async () => {
    if (!order || !user?.advertiserId) return
    
    if (!confirm('确定要终止此订单吗？终止后订单将停止投放且无法恢复。')) {
      return
    }
    
    try {
      await terminateAwemeOrder({
        advertiser_id: user.advertiserId || 0,
        order_ids: [order.order_id],
      })
      alert('订单已终止')
      navigate('/aweme-orders')
    } catch (error) {
      console.error('终止订单失败:', error)
      alert('操作失败，请稍后重试')
    }
  }

  const handleAddBudget = async () => {
    if (!order || !user?.advertiserId) return
    
    if (addBudgetAmount < 100) {
      alert('追加预算最低100元')
      return
    }
    
    try {
      await addAwemeOrderBudget({
        advertiser_id: user.advertiserId || 0,
        order_id: order.order_id,
        add_budget: addBudgetAmount,
      })
      alert('预算追加成功')
      setShowAddBudget(false)
      fetchDetail()
    } catch (error) {
      console.error('追加预算失败:', error)
      alert('操作失败，请稍后重试')
    }
  }

  const renderStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: '投放中', color: 'bg-green-100 text-green-800' },
      PAUSED: { label: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: '已完成', color: 'bg-blue-100 text-blue-800' },
      DELETED: { label: '已删除', color: 'bg-gray-100 text-gray-800' },
    }
    
    const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const renderDeliveryMode = (mode: string) => {
    return mode === 'DELIVERY_MODE_STANDARD' ? '标准投放' : '加速投放'
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">订单不存在</p>
          <button
            onClick={() => navigate('/aweme-orders')}
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
            onClick={() => navigate('/aweme-orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_name}</h1>
            <p className="text-sm text-gray-500 mt-1">订单ID: {order.order_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {renderStatus(order.status)}
          
          {order.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => setShowAddBudget(true)}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                追加预算
              </button>
              
              <button
                onClick={handleTerminate}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                终止订单
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">订单名称</label>
                <p className="mt-1 text-gray-900">{order.order_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">订单ID</label>
                <p className="mt-1 text-gray-900 font-mono text-sm">{order.order_id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">抖音号ID</label>
                <p className="mt-1 text-gray-900">{order.aweme_id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">视频ID</label>
                <p className="mt-1 text-gray-900 font-mono text-sm">{order.item_id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">创建时间</label>
                <p className="mt-1 text-gray-900">
                  {new Date(order.create_time).toLocaleString()}
                </p>
              </div>
              {order.modify_time && (
                <div>
                  <label className="text-sm text-gray-500">最后修改时间</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(order.modify_time).toLocaleString()}
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
                <p className="mt-1 text-2xl font-bold text-gray-900">¥{order.budget}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">预算模式</label>
                <p className="mt-1 text-gray-900">总预算</p>
              </div>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">投放设置</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">投放模式</label>
                <p className="mt-1 text-gray-900">{renderDeliveryMode(order.delivery_mode)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">排期类型</label>
                <p className="mt-1 text-gray-900">{order.delivery_setting.schedule_type || '标准排期'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">开始时间</label>
                <p className="mt-1 text-gray-900">
                  {new Date(order.delivery_setting.start_time).toLocaleString()}
                </p>
              </div>
              {order.delivery_setting.end_time && (
                <div>
                  <label className="text-sm text-gray-500">结束时间</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(order.delivery_setting.end_time).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audience Targeting */}
          {order.audience_targeting && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">受众定向</h2>
              <div className="space-y-3">
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(order.audience_targeting, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">数据概览</h2>
            <div className="space-y-4">
              <div className="pb-4 border-b">
                <label className="text-sm text-gray-500">状态</label>
                <div className="mt-2">{renderStatus(order.status)}</div>
              </div>
              <div className="pb-4 border-b">
                <label className="text-sm text-gray-500">投放模式</label>
                <p className="mt-1 text-gray-900">{renderDeliveryMode(order.delivery_mode)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">预算</label>
                <p className="mt-1 text-xl font-bold text-gray-900">¥{order.budget}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>提示：</strong>数据报表功能请前往"数据中心"查看详细投放效果
            </p>
          </div>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">追加预算</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                追加金额（元） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="100"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="最低100元"
                value={addBudgetAmount}
                onChange={(e) => setAddBudgetAmount(parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">当前预算：¥{order.budget}，追加后：¥{order.budget + addBudgetAmount}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddBudget(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddBudget}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确认追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
