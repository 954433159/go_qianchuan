import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Loading from '../components/ui/Loading'
import { LiveRoom, getLiveRooms } from '../api/report'
import { useToast } from '../hooks/useToast'
import { useAuthStore } from '../store/authStore'
import {
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Search,
  SlidersHorizontal,
  BarChart3,
  Filter
} from 'lucide-react'


export default function LiveRooms() {
  const navigate = useNavigate()
  const { error: showError } = useToast()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<LiveRoom[]>([])
  const [filteredRooms, setFilteredRooms] = useState<LiveRoom[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [sortBy, setSortBy] = useState<'watch_ucnt' | 'gmv' | 'order_count'>('watch_ucnt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchLiveRooms()
  }, [])

  useEffect(() => {
    filterAndSortRooms()
  }, [rooms, searchQuery, statusFilter, sortBy, sortOrder])

  const fetchLiveRooms = async () => {
    if (!user?.advertiserId) {
      showError('未获取到广告主ID，请重新登录')
      return
    }

    setLoading(true)
    try {
      // SDK直播间API返回今日直播间列表，不需要日期参数
      const { list } = await getLiveRooms({
        count: 100
      })
      setRooms(list)
    } catch (error) {
      showError('获取直播间列表失败')
      console.error('Failed to fetch live rooms:', error)
      // 设置空数据
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortRooms = () => {
    let filtered = [...rooms]

    // 状态过滤
    if (statusFilter !== '全部') {
      filtered = filtered.filter(room => room.status === statusFilter)
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        room =>
          room.room_title.toLowerCase().includes(query) ||
          (room.anchor_name || '').toLowerCase().includes(query) ||
          String(room.room_id).toLowerCase().includes(query)
      )
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortBy) {
        case 'watch_ucnt':
          aValue = a.watch_ucnt || 0
          bValue = b.watch_ucnt || 0
          break
        case 'gmv':
          aValue = a.gmv || 0
          bValue = b.gmv || 0
          break
        case 'order_count':
          aValue = a.order_count || 0
          bValue = b.order_count || 0
          break
        default:
          aValue = a.watch_ucnt || 0
          bValue = b.watch_ucnt || 0
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

    setFilteredRooms(filtered)
  }

  const handleRoomClick = (roomId: string | number) => {
    navigate(`/live-rooms/${roomId}`)
  }

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0'
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }


  const getStatusColor = (status: string) => {
    // SDK返回LIVE/END, Mock返回LIVE/END/PAUSE
    if (status === 'LIVE' || status === 'LIVING') {
      return 'text-green-600 bg-green-50 border-green-200'
    } else if (status === 'PAUSE') {
      return 'text-blue-600 bg-blue-50 border-blue-200'
    } else {
      return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    if (status === 'LIVE' || status === 'LIVING') {
      return '直播中'
    } else if (status === 'PAUSE') {
      return '预告中'
    } else {
      return '已结束'
    }
  }

  if (loading) {
    return <Loading fullScreen size="lg" text="加载直播间列表..." />
  }

  // 统计数据
  const stats = {
    total: rooms.length,
    live: rooms.filter(r => r.status === 'LIVE' || r.status === 'LIVING').length,
    totalGMV: rooms.reduce((sum, r) => sum + (r.gmv || 0), 0),
    totalWatchCount: rooms.reduce((sum, r) => sum + (r.watch_ucnt || 0), 0)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="直播间管理"
        description="查看和管理所有直播间数据"
        actions={
          <button
            onClick={() => navigate('/live-data')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            今日数据概览
          </button>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总直播间数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">正在直播</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.live}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总GMV</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">¥{formatNumber(stats.totalGMV)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总观看人次</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalWatchCount)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索直播间名称、主播或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 状态过滤 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="全部">全部状态</option>
              <option value="LIVE">直播中</option>
              <option value="PAUSE">预告中</option>
              <option value="END">已结束</option>
            </select>
          </div>

          {/* 排序 */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="watch_ucnt">观看人次</option>
              <option value="gmv">GMV</option>
              <option value="order_count">订单数</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      {/* 直播间列表 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  直播间信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  观看人次
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GMV
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单数
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr
                    key={room.room_id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRoomClick(room.room_id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {room.room_title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            主播：{room.anchor_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {room.room_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                        {room.status === 'LIVE' && <span className="w-2 h-2 bg-green-600 rounded-full mr-1.5 animate-pulse" />}
                        {getStatusLabel(room.status)}
                      </span>
                      {room.status === 'LIVE' && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatNumber(room.online_user_count)}在线
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(room.watch_ucnt)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Eye className="w-3 h-3" />
                          观看
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900">
                          ¥{formatNumber(room.gmv)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <DollarSign className="w-3 h-3" />
                          成交额
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatNumber(room.order_count)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRoomClick(room.room_id)
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 结果统计 */}
      {filteredRooms.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          显示 {filteredRooms.length} 个直播间，共 {rooms.length} 个
        </div>
      )}
    </div>
  )
}
