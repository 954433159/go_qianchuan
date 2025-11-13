import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Eye, MousePointer, DollarSign, Target } from 'lucide-react'
import { getAwemeOrderDetail, type AwemeOrder } from '../api/aweme'
import { useAuthStore } from '../store/authStore'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * 随心推订单效果分析页面
 * 展示订单的投放效果数据和趋势分析
 */
export default function AwemeOrderEffect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [order, setOrder] = useState<AwemeOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('7days')

  useEffect(() => {
    if (id && user?.advertiserId) {
      fetchOrderDetail()
    }
  }, [id, user])

  const fetchOrderDetail = async () => {
    if (!id || !user?.advertiserId) return
    
    setLoading(true)
    try {
      const data = await getAwemeOrderDetail(user.advertiserId || 0, id)
      setOrder(data)
    } catch (error) {
      console.error('获取订单详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock效果数据（实际应从后端API获取）
  const mockEffectData = [
    { date: '11-06', show: 15234, click: 234, convert: 23, cost: 1245 },
    { date: '11-07', show: 18567, click: 289, convert: 31, cost: 1567 },
    { date: '11-08', show: 21234, click: 345, convert: 42, cost: 1890 },
    { date: '11-09', show: 19876, click: 312, convert: 38, cost: 1678 },
    { date: '11-10', show: 23456, click: 401, convert: 48, cost: 2123 },
    { date: '11-11', show: 25678, click: 456, convert: 54, cost: 2345 },
    { date: '11-12', show: 22345, click: 389, convert: 46, cost: 2012 },
  ]

  const totalStats = mockEffectData.reduce((acc, curr) => ({
    show: acc.show + curr.show,
    click: acc.click + curr.click,
    convert: acc.convert + curr.convert,
    cost: acc.cost + curr.cost,
  }), { show: 0, click: 0, convert: 0, cost: 0 })

  const avgCtr = (totalStats.click / totalStats.show * 100).toFixed(2)
  const avgCpc = (totalStats.cost / totalStats.click).toFixed(2)
  const avgConvertRate = (totalStats.convert / totalStats.click * 100).toFixed(2)
  const avgConvertCost = (totalStats.cost / totalStats.convert).toFixed(2)

  const stats = [
    {
      title: '总展示',
      value: totalStats.show.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12.5%'
    },
    {
      title: '总点击',
      value: totalStats.click.toLocaleString(),
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+18.3%'
    },
    {
      title: '总转化',
      value: totalStats.convert.toLocaleString(),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+22.7%'
    },
    {
      title: '总消耗',
      value: `¥${totalStats.cost.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+15.2%'
    },
  ]

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
            onClick={() => navigate(`/aweme-orders/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">效果分析</h1>
            <p className="text-sm text-gray-500 mt-1">{order.order_name}</p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            今天
          </button>
          <button
            onClick={() => setDateRange('7days')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === '7days'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            近7天
          </button>
          <button
            onClick={() => setDateRange('30days')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === '30days'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            近30天
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600">{stat.change}</span>
                <span className="text-gray-500 ml-1">vs 上周</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">核心指标</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">点击率 (CTR)</div>
            <div className="text-2xl font-bold text-gray-900">{avgCtr}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">平均点击成本 (CPC)</div>
            <div className="text-2xl font-bold text-gray-900">¥{avgCpc}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">转化率</div>
            <div className="text-2xl font-bold text-gray-900">{avgConvertRate}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">转化成本</div>
            <div className="text-2xl font-bold text-gray-900">¥{avgConvertCost}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据趋势</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockEffectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="show" stroke="#3b82f6" name="展示" />
              <Line type="monotone" dataKey="click" stroke="#10b981" name="点击" />
              <Line type="monotone" dataKey="convert" stroke="#8b5cf6" name="转化" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">消耗分布</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockEffectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#f97316" name="消耗（元）" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">明细数据</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  展示
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  点击
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  转化
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  消耗
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  转化率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockEffectData.map((row) => (
                <tr key={row.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.show.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.click.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.convert.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{row.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(row.click / row.show * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{(row.cost / row.click).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(row.convert / row.click * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
