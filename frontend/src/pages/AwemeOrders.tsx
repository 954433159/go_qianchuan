import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, DollarSign } from 'lucide-react'
import {
  getAwemeOrderList,
  terminateAwemeOrder,
  type AwemeOrder,
  type GetAwemeOrderListParams,
} from '../api/aweme'
import { useAuthStore } from '../store/authStore'

/**
 * 随心推订单列表页面
 * 管理短视频推广订单
 */
export default function AwemeOrders() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [orders, setOrders] = useState<AwemeOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  
  // 筛选条件
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    aweme_id: '',
  })

  // 加载订单列表
  const fetchOrders = async () => {
    if (!user?.advertiserId) return
    
    setLoading(true)
    try {
      const params: GetAwemeOrderListParams = {
        advertiser_id: user.advertiserId || 0,
        page,
        page_size: pageSize,
      }
      
      // 应用筛选条件
      if (filters.status) {
        params.filtering = {
          status: [filters.status],
        }
      }
      
      if (filters.aweme_id) {
        params.aweme_id = filters.aweme_id
      }
      
      const data = await getAwemeOrderList(params)
      setOrders(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('获取随心推订单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, user])

  // 终止订单
  const handleTerminate = async (orderId: string) => {
    if (!user?.advertiserId) return
    
    if (!confirm('确定要终止此订单吗？订单终止后将立即停止投放。')) {
      return
    }
    
    try {
      await terminateAwemeOrder({
        advertiser_id: user.advertiserId || 0,
        order_ids: [orderId],
      })
      fetchOrders()
    } catch (error) {
      console.error('终止订单失败:', error)
    }
  }

  // 追加预算
  const handleAddBudget = (orderId: string) => {
    navigate(`/aweme-orders/${orderId}/add-budget`)
  }

  // 渲染状态标签
  const renderStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: '投放中', color: 'bg-green-100 text-green-800' },
      PAUSED: { label: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: '已完成', color: 'bg-blue-100 text-blue-800' },
      DELETED: { label: '已删除', color: 'bg-gray-100 text-gray-800' },
    }
    
    const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // 渲染投放模式
  const renderDeliveryMode = (mode: string) => {
    const modeMap: Record<string, string> = {
      DELIVERY_MODE_STANDARD: '标准投放',
      DELIVERY_MODE_ACCELERATE: '加速投放',
    }
    return modeMap[mode] || mode
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">随心推</h1>
        <p className="mt-1 text-sm text-gray-600">
          短视频推广订单管理，2分钟快速创建推广
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索订单名称..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">全部状态</option>
            <option value="ACTIVE">投放中</option>
            <option value="PAUSED">已暂停</option>
            <option value="COMPLETED">已完成</option>
          </select>

          {/* Aweme ID Filter */}
          <input
            type="text"
            placeholder="抖音号ID..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.aweme_id}
            onChange={(e) => setFilters({ ...filters, aweme_id: e.target.value })}
          />

          <button
            onClick={fetchOrders}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/aweme-orders/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新建订单
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无订单，点击&quot;新建订单&quot;开始推广
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  抖音号/视频
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预算
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投放模式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.order_name}
                    </div>
                    <div className="text-sm text-gray-500">ID: {order.order_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      抖音号: {order.aweme_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      视频: {order.item_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{order.budget.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderDeliveryMode(order.delivery_mode)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.create_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/aweme-orders/${order.order_id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      查看
                    </button>
                    {order.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleAddBudget(order.order_id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="追加预算"
                        >
                          <DollarSign className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleTerminate(order.order_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          终止
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            共 {total} 条记录
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-gray-700">
              第 {page} / {Math.ceil(total / pageSize)} 页
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
