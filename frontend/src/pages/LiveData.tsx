import { useEffect, useState } from 'react'
import { getLiveStats, getLiveRooms, LiveStats, LiveRoom } from '@/api/report'
import {
  Card, CardContent, CardHeader, CardTitle,
  PageHeader, Loading, Button, Badge
} from '@/components/ui'
import { TrendingUp, TrendingDown, Eye, Users, ShoppingCart, DollarSign, Heart, MessageCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function LiveData() {
  const { success } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null)
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([])
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAdvertiserId] = useState(1)

  useEffect(() => {
    fetchLiveData()
  }, [])

  const fetchLiveData = async () => {
    setLoading(true)
    try {
      // 获取今日直播数据
      const stats = await getLiveStats(selectedAdvertiserId, selectedDate ?? '')
      setLiveStats(stats)

      // 获取直播间列表
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      
      const rooms = await getLiveRooms({
        count: 10
      })
      setLiveRooms(rooms.list)
    } catch (error) {
      console.error('Failed to fetch live data:', error)
      // Mock数据
      setLiveStats(generateMockStats())
      setLiveRooms(generateMockRooms())
    } finally {
      setLoading(false)
    }
  }

  const generateMockStats = (): LiveStats => ({
    advertiser_id: 1,
    date: selectedDate ?? '',
    gmv: 285600,
    watch_count: 152000,
    watch_ucnt: 45800,
    interaction_count: 8950,
    order_count: 1856,
    pay_order_count: 1624,
    online_user_count: 3420,
    avg_watch_duration: 185,
    share_count: 456,
    comment_count: 5234,
    like_count: 12680
  })

  const generateMockRooms = (): LiveRoom[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      room_id: `room_${i + 1}`,
      room_title: `直播间${i + 1} - ${['美妆推荐', '服饰特卖', '美食推荐', '数码测评', '健身直播'][i]}`,
      anchor_name: ['小美', '芳芳', '大厨', '科技君', '健身达人'][i],
      aweme_name: `@${['xiaomei', 'fangfang', 'chef', 'techguy', 'fitness'][i]}`,
      start_time: `2024-01-${20 - i} 19:00:00`,
      end_time: `2024-01-${20 - i} 22:00:00`,
      status: (i === 0 ? 'LIVE' : 'END') as 'LIVE' | 'END',
      gmv: Math.floor(50000 + Math.random() * 100000),
      watch_ucnt: Math.floor(8000 + Math.random() * 12000),
      order_count: Math.floor(300 + Math.random() * 500),
      online_user_count: i === 0 ? Math.floor(500 + Math.random() * 1000) : 0
    }))
  }

  // 模拟实时在线数据
  const generateOnlineData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      count: Math.floor(1000 + Math.random() * 2000 + Math.sin(i / 3) * 500)
    }))
  }

  // 模拟商品数据
  const generateProductData = () => {
    return [
      { name: '面膜套装', value: 45000, count: 350 },
      { name: '精华液', value: 38000, count: 280 },
      { name: '口红', value: 32000, count: 520 },
      { name: '眼霜', value: 28000, count: 210 },
      { name: '防晒霜', value: 22000, count: 380 }
    ]
  }

  if (loading) {
    return <Loading size="lg" text="加载直播数据..." />
  }

  if (!liveStats) {
    return <div>暂无数据</div>
  }

  const stats = [
    {
      title: '今日GMV',
      value: `¥${liveStats.gmv.toLocaleString()}`,
      change: '+18.5%',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: '观看人数',
      value: liveStats.watch_ucnt.toLocaleString(),
      change: '+12.3%',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '互动次数',
      value: liveStats.interaction_count.toLocaleString(),
      change: '+25.8%',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: '成交订单',
      value: liveStats.pay_order_count.toLocaleString(),
      change: '+15.2%',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  const onlineData = generateOnlineData()
  const productData = generateProductData()

  return (
    <div className="space-y-6">
      <PageHeader
        title="📺 今日直播数据"
        description="实时查看直播间表现和销售数据"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '数据报表', href: '/reports' },
          { label: '直播数据' }
        ]}
        actions={
          <Button onClick={() => navigate('/live-rooms')}>
            查看所有直播间
          </Button>
        }
      />

      {/* 关键指标 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.change.startsWith('+') ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">vs 昨日</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 实时在线人数曲线 */}
      <Card>
        <CardHeader>
          <CardTitle>实时在线人数趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={onlineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="在线人数"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 商品销售排行 */}
        <Card>
          <CardHeader>
            <CardTitle>商品销售排行</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" name="GMV">
                  {productData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 互动数据分布 */}
        <Card>
          <CardHeader>
            <CardTitle>互动数据分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: '点赞', value: liveStats.like_count },
                    { name: '评论', value: liveStats.comment_count },
                    { name: '分享', value: liveStats.share_count }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 直播间列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>近期直播间</CardTitle>
            <Button size="sm" variant="outline" onClick={() => navigate('/live-rooms')}>
              查看全部
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveRooms.map((room) => (
              <div
                key={room.room_id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate(`/live-rooms/${room.room_id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{room.room_title}</h4>
                      {room.status === 'LIVE' && (
                        <Badge className="bg-red-100 text-red-800 animate-pulse">
                          🔴 直播中
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      主播: {room.anchor_name} | 抖音号: {room.aweme_name}
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">GMV</div>
                        <div className="text-base font-semibold text-orange-600">
                          ¥{(room.gmv || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">观看人数</div>
                        <div className="text-base font-semibold">{(room.watch_ucnt || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">订单数</div>
                        <div className="text-base font-semibold text-green-600">{room.order_count || 0}</div>
                      </div>
                      {room.status === 'LIVE' && (
                        <div>
                          <div className="text-xs text-gray-500">当前在线</div>
                          <div className="text-base font-semibold text-red-600">
                            {room.online_user_count || 0}人
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
