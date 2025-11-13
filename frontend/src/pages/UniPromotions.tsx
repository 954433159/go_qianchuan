import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, RefreshCw } from 'lucide-react'
import {
  getUniPromotionList,
  updateUniPromotionStatus,
  type UniPromotionAd,
  type GetUniPromotionListParams,
} from '../api/uniPromotion'
import { useAuthStore } from '../store/authStore'
import { toast } from '../components/ui/Toast'

/**
 * 全域推广列表页面
 * 管理全域推广计划（支持多场景智能投放）
 */
export default function UniPromotions() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [promotions, setPromotions] = useState<UniPromotionAd[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  
  // 筛选条件
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    marketing_goal: '',
  })
  const [error, setError] = useState<string | null>(null)

  // 加载列表
  const fetchPromotions = async () => {
    if (!user?.advertiserId) return
    
    setLoading(true)
    setError(null)
    try {
      const params: GetUniPromotionListParams = {
        advertiser_id: user.advertiserId || 0,
        page,
        page_size: pageSize,
      }
      
      // 应用筛选条件
      if (filters.status || filters.marketing_goal) {
        params.filtering = {}
        if (filters.status) {
          params.filtering.status = [filters.status]
        }
        if (filters.marketing_goal) {
          params.filtering.marketing_goal = [filters.marketing_goal]
        }
      }
      
      const data = await getUniPromotionList(params)
      setPromotions(data.list || [])
      setTotal(data.total || 0)
      setError(null)
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'message' in err
        ? String(err.message)
        : '获取全域推广列表失败'
      
      // Handle 501 Not Implemented gracefully
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number } }).response
        if (response?.status === 501) {
          setError('全域推广功能暂未完全开放，部分接口正在对接中')
          toast.warning('全域推广功能开发中，请稍后再试')
        } else {
          setError(errorMsg)
          toast.error(errorMsg)
        }
      } else {
        setError(errorMsg)
        toast.error(errorMsg)
      }
      console.error('获取全域推广列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [page, user])

  // 状态更新
  const handleStatusUpdate = async (
    adIds: number[],
    optStatus: 'ENABLE' | 'DISABLE' | 'DELETE'
  ) => {
    if (!user?.advertiserId) return
    
    try {
      await updateUniPromotionStatus({
        advertiser_id: user.advertiserId || 0,
        ad_ids: adIds,
        opt_status: optStatus,
      })
      const actionText = optStatus === 'ENABLE' ? '启用' : optStatus === 'DISABLE' ? '暂停' : '删除'
      toast.success(`${actionText}成功`)
      fetchPromotions()
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'message' in err
        ? String(err.message)
        : '更新状态失败'
      toast.error(errorMsg)
      console.error('更新状态失败:', err)
    }
  }

  // 渲染状态标签
  const renderStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: '投放中', color: 'bg-green-100 text-green-800' },
      PAUSED: { label: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
      DELETED: { label: '已删除', color: 'bg-gray-100 text-gray-800' },
    }
    
    const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // 渲染营销目标
  const renderMarketingGoal = (goal: string) => {
    const goalMap: Record<string, string> = {
      LIVE: '直播推广',
      PRODUCT: '商品推广',
      FANS: '粉丝增长',
      BRAND: '品牌推广',
    }
    return goalMap[goal] || goal
  }

  // 应用搜索过滤
  const filteredPromotions = promotions.filter(promo => {
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      return promo.ad_name.toLowerCase().includes(keyword) ||
        promo.ad_id.toString().includes(keyword)
    }
    return true
  })

  // 处理搜索提交
  const handleSearch = () => {
    fetchPromotions()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">全域推广</h1>
        <p className="mt-1 text-sm text-gray-600">
          多场景智能投放，覆盖抖音、今日头条、西瓜视频等多个平台
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
              placeholder="搜索推广计划名称或ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            搜索
          </button>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value })
            }}
          >
            <option value="">全部状态</option>
            <option value="ACTIVE">投放中</option>
            <option value="PAUSED">已暂停</option>
          </select>

          {/* Marketing Goal Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.marketing_goal}
            onChange={(e) => {
              setFilters({ ...filters, marketing_goal: e.target.value })
            }}
          >
            <option value="">全部目标</option>
            <option value="LIVE">直播推广</option>
            <option value="PRODUCT">商品推广</option>
            <option value="FANS">粉丝增长</option>
            <option value="BRAND">品牌推广</option>
          </select>

          <button
            onClick={fetchPromotions}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/uni-promotions/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新建推广
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">加载失败</h3>
              <p className="mt-1 text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : error ? (
          <div className="p-8 text-center text-gray-500">
            加载失败，请刷新重试
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filters.keyword ? '没有找到匹配的推广计划' : '暂无推广计划，点击"新建推广"开始投放'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  推广计划
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  营销目标
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预算
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
              {filteredPromotions.map((promotion) => (
                <tr key={promotion.ad_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {promotion.ad_name}
                    </div>
                    <div className="text-sm text-gray-500">ID: {promotion.ad_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderMarketingGoal(promotion.marketing_goal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{promotion.budget.toFixed(2)} / 
                    {promotion.budget_mode === 'BUDGET_MODE_DAY' ? ' 日' : ' 总'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(promotion.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(promotion.create_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/uni-promotions/${promotion.ad_id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => navigate(`/uni-promotions/${promotion.ad_id}/edit`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      编辑
                    </button>
                    {promotion.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusUpdate([promotion.ad_id], 'DISABLE')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        暂停
                      </button>
                    )}
                    {promotion.status === 'PAUSED' && (
                      <button
                        onClick={() => handleStatusUpdate([promotion.ad_id], 'ENABLE')}
                        className="text-green-600 hover:text-green-900"
                      >
                        启用
                      </button>
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
