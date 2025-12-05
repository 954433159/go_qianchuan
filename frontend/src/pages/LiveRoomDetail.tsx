import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Loading from '../components/ui/Loading'
import {
  LiveRoomDetail as LiveRoomDetailType,
  LiveRoomFlowPerformance,
  LiveRoomUserInsight,
  LiveRoomProduct
} from '../api/report'
import { useToast } from '../hooks/useToast'
import {
  ArrowLeft,
  DollarSign,
  Heart,
  TrendingUp,
  Package,
  Eye,
  UserPlus
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// 生成模拟数据
const generateMockRoomDetail = (roomId: string): LiveRoomDetailType => ({
  room_id: roomId,
  room_title: '潮流服饰专场直播',
  anchor_name: '主播小美',
  aweme_name: '潮流小店',
  start_time: new Date(Date.now() - 7200000).toISOString(),
  end_time: new Date(Date.now() - 3600000).toISOString(),
  status: 'END',
  gmv: 456789,
  watch_ucnt: 35420,
  order_count: 2341,
  online_user_count: 2856,
  cover_url: 'https://via.placeholder.com/300x200',
  room_duration: 3600,
  peak_online_user_count: 2856,
  avg_online_user_count: 1523,
  interaction_rate: 0.44,
  conversion_rate: 0.066,
  per_user_value: 12.9
})

const generateMockFlowPerformance = (): LiveRoomFlowPerformance[] => {
  return [
    { room_id: 'test', flow_source: '短视频', watch_ucnt: 12000, order_count: 800, gmv: 120000, conversion_rate: 0.067 },
    { room_id: 'test', flow_source: '直播广场', watch_ucnt: 8000, order_count: 600, gmv: 90000, conversion_rate: 0.075 },
    { room_id: 'test', flow_source: '推荐', watch_ucnt: 6500, order_count: 450, gmv: 75000, conversion_rate: 0.069 },
    { room_id: 'test', flow_source: '搜索', watch_ucnt: 5000, order_count: 350, gmv: 60000, conversion_rate: 0.070 },
    { room_id: 'test', flow_source: '其他', watch_ucnt: 3920, order_count: 241, gmv: 111789, conversion_rate: 0.061 }
  ]
}

const generateMockUserInsight = (): LiveRoomUserInsight => ({
  room_id: 'test',
  gender_distribution: { male: 3535, female: 7845 },
  age_distribution: {
    '18-24': 3245,
    '25-30': 4156,
    '31-40': 2567,
    '41-50': 1023,
    '50+': 389
  },
  city_distribution: [
    { city: '北京', percentage: 0.21 },
    { city: '上海', percentage: 0.19 },
    { city: '广州', percentage: 0.17 },
    { city: '深圳', percentage: 0.15 },
    { city: '杭州', percentage: 0.11 }
  ],
  device_distribution: {
    'iOS': 6789,
    'Android': 4591
  }
})

const generateMockProducts = (): LiveRoomProduct[] => {
  const products = [
    '春季新款连衣裙',
    'T恤套装组合',
    '牛仔裤',
    '运动鞋',
    '帆布包',
    '防晒衣',
    '短袖衬衫',
    '休闲裤',
    '凉鞋',
    '太阳镜'
  ]

  return products.map((name, i) => ({
    product_id: `prod_${1000 + i}`,
    product_name: name,
    product_img: `https://via.placeholder.com/80?text=P${i + 1}`,
    price: Math.floor(Math.random() * 500) + 50,
    click_count: Math.floor(Math.random() * 2000) + 100,
    order_count: Math.floor(Math.random() * 500) + 10,
    gmv: Math.floor(Math.random() * 100000) + 5000,
    conversion_rate: (Math.random() * 0.15 + 0.02)
  }))
}

export default function LiveRoomDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [roomDetail, setRoomDetail] = useState<LiveRoomDetailType | null>(null)
  const [flowData, setFlowData] = useState<LiveRoomFlowPerformance[]>([])
  const [userInsight, setUserInsight] = useState<LiveRoomUserInsight | null>(null)
  const [products, setProducts] = useState<LiveRoomProduct[]>([])

  useEffect(() => {
    if (id) {
      fetchRoomData(id)
    }
  }, [id])

  const fetchRoomData = async (roomId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 使用模拟数据
      setRoomDetail(generateMockRoomDetail(roomId))
      setFlowData(generateMockFlowPerformance())
      setUserInsight(generateMockUserInsight())
      setProducts(generateMockProducts())

      // 真实API调用（注释掉）
      // const [detail, flow, insight, prods] = await Promise.all([
      //   getLiveRoomDetail({ roomId }),
      //   getLiveRoomFlowPerformance({ roomId }),
      //   getLiveRoomUserInsight({ roomId }),
      //   getLiveRoomProducts({ roomId })
      // ])
      // setRoomDetail(detail)
      // setFlowData(flow)
      // setUserInsight(insight)
      // setProducts(prods)
    } catch (error) {
      showError('获取直播间详情失败')
      console.error('Failed to fetch room detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0'
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)  }万`
    }
    return num.toLocaleString()
  }

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '0分钟'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  if (loading || !roomDetail) {
    return <Loading fullScreen size="lg" text="加载直播间详情..." />
  }

  // 准备流量趋势图表数据
  const flowChartData = flowData && flowData.length > 0
    ? flowData.map((flow) => ({
        来源: flow.flow_source,
        观看人数: flow.watch_ucnt,
        订单数: flow.order_count,
        GMV: flow.gmv,
        转化率: `${(flow.conversion_rate * 100).toFixed(2)  }%`
      }))
    : []

  // 年龄分布饼图数据
  const ageChartData = userInsight?.age_distribution
    ? Object.entries(userInsight.age_distribution).map(([age, count]) => ({
        name: age,
        value: count as number
      }))
    : []

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${roomDetail.room_title} - ${roomDetail.anchor_name}`}
        description={`房间ID：${roomDetail.room_id} | ${new Date(roomDetail.start_time).toLocaleString()} - ${
          roomDetail.end_time ? new Date(roomDetail.end_time).toLocaleString() : '进行中'
        } | 时长：${formatDuration(roomDetail.room_duration || 0)}`}
        actions={
          <button
            onClick={() => navigate('/live-rooms')}
            className="qc-btn qc-btn-outline"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回列表
          </button>
        }
      />

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">观看人次</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(roomDetail.watch_ucnt)}</p>
              <p className="text-xs text-gray-500 mt-2">峰值在线：{formatNumber(roomDetail.peak_online_user_count)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">GMV成交额</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">¥{formatNumber(roomDetail.gmv)}</p>
              <p className="text-xs text-gray-500 mt-2">订单数：{formatNumber(roomDetail.order_count)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">互动率</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{(roomDetail.interaction_rate * 100).toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-2">
                <Heart className="w-3 h-3 inline mr-1" />
                用户互动率
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">转化率</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{(roomDetail.conversion_rate * 100).toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-2">
                <UserPlus className="w-3 h-3 inline mr-1" />
                人均价值：¥{roomDetail.per_user_value.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 基础数据卡片 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">直播间基础数据</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">平均在线人数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(roomDetail.avg_online_user_count)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">互动率</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{(roomDetail.interaction_rate * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">人均价值</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">¥{roomDetail.per_user_value.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 流量来源分析 */}
      {flowData && flowData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">流量来源分析</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={flowChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="来源" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="观看人数" fill="#3b82f6" />
              <Bar dataKey="订单数" fill="#10b981" />
              <Bar dataKey="GMV" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 用户画像分析 */}
      {userInsight && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 年龄分布 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">年龄分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 性别分布 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">性别分布</h3>
            <div className="space-y-4 mt-8">
              {[
                { gender: '女性', count: userInsight.gender_distribution.female },
                { gender: '男性', count: userInsight.gender_distribution.male }
              ].map((item, index) => {
                const total = userInsight.gender_distribution.male + userInsight.gender_distribution.female
                const percentage = `${((item.count / total) * 100).toFixed(1)  }%`
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.gender}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatNumber(item.count)} ({percentage})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${index === 0 ? 'bg-pink-500' : 'bg-blue-500'}`}
                        style={{ width: percentage }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">设备分布</h3>
            <div className="space-y-4">
              {Object.entries(userInsight.device_distribution).map(([device, count], index) => {
                const total = Object.values(userInsight.device_distribution).reduce((sum: number, c) => sum + (c as number), 0)
                const percentage = `${(((count as number) / total) * 100).toFixed(1)  }%`
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{device}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatNumber(count as number)} ({percentage})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${index === 0 ? 'bg-gray-700' : 'bg-green-500'}`}
                        style={{ width: percentage }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 商品销售排行 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">商品销售排行</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            共 {products.length} 个商品
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品信息
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  销量
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GMV
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  点击量
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  转化率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product, index) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.product_img}
                        alt={product.product_name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                        <p className="text-xs text-gray-500">ID: {product.product_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ¥{product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatNumber(product.order_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ¥{formatNumber(product.gmv)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(product.click_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {(product.conversion_rate * 100).toFixed(2)}%
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
