import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Video,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  BarChart3,
  ArrowUpDown,
  Target,
} from 'lucide-react'
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Loading,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MaterialMetrics {
  material_id: string
  material_name: string
  material_type: 'image' | 'video'
  material_url: string
  cover_url?: string
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  cvr: number
  cost: number
  cpa: number
  roi: number
  usage_count: number
}

type SortField = 'impressions' | 'clicks' | 'ctr' | 'conversions' | 'cvr' | 'cost' | 'cpa' | 'roi'
type SortOrder = 'asc' | 'desc'

export default function MaterialEfficiency() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState<MaterialMetrics[]>([])
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all')
  const [sortField, setSortField] = useState<SortField>('roi')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [dateRange, setDateRange] = useState('7')

  const advertiserId = user?.advertiserId || 1

  useEffect(() => {
    loadMaterials()
  }, [advertiserId, dateRange])

  const loadMaterials = async () => {
    setLoading(true)
    try {
      // TODO: 调用API获取素材效果数据
      // const data = await getMaterialEfficiency(advertiserId, { date_range: dateRange })
      // setMaterials(data)
      
      // 暂时设置空数据，等待API实现
      setMaterials([])
    } catch (error) {
      console.error('Failed to load materials:', error)
      toast.error('加载素材数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w'
    }
    return num.toLocaleString()
  }

  const getPerformanceBadge = (roi: number) => {
    if (roi >= 6) {
      return <Badge variant="success">优秀</Badge>
    } else if (roi >= 4) {
      return <Badge variant="warning">良好</Badge>
    } else {
      return <Badge variant="error">待优化</Badge>
    }
  }

  const getTrendIcon = (value: number, threshold: number) => {
    if (value >= threshold) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
  }

  // 筛选和排序
  const filteredMaterials = materials
    .filter((m) => filterType === 'all' || m.material_type === filterType)
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

  // 计算总计
  const totals = filteredMaterials.reduce(
    (acc, m) => ({
      impressions: acc.impressions + m.impressions,
      clicks: acc.clicks + m.clicks,
      conversions: acc.conversions + m.conversions,
      cost: acc.cost + m.cost,
    }),
    { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
  )

  const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const avgCvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0
  const avgCpa = totals.conversions > 0 ? totals.cost / totals.conversions : 0
  const avgRoi = filteredMaterials.length > 0 
    ? filteredMaterials.reduce((sum, m) => sum + m.roi, 0) / filteredMaterials.length 
    : 0

  // 素材类型分布数据
  const typeDistribution = [
    {
      name: '图片素材',
      value: materials.filter(m => m.material_type === 'image').length,
      color: '#3b82f6'
    },
    {
      name: '视频素材',
      value: materials.filter(m => m.material_type === 'video').length,
      color: '#8b5cf6'
    }
  ]

  // 趋势数据（模拟按日期的趋势）
  const trendData = Array.from({ length: parseInt(dateRange) }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - parseInt(dateRange) + i + 1)
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      ctr: 5 + Math.random() * 3,
      cvr: 4 + Math.random() * 2,
      roi: 4 + Math.random() * 3
    }
  })

  if (loading) {
    return <Loading fullScreen text="加载素材数据..." size="lg" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="素材效果分析"
        description="分析不同素材的投放效果，优化素材策略"
      />

      {/* 工具栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 时间范围 */}
            <div className="w-full md:w-48">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">近1天</SelectItem>
                  <SelectItem value="7">近7天</SelectItem>
                  <SelectItem value="30">近30天</SelectItem>
                  <SelectItem value="90">近90天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 素材类型筛选 */}
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                全部
              </Button>
              <Button
                variant={filterType === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('image')}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                图片
              </Button>
              <Button
                variant={filterType === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('video')}
              >
                <Video className="w-4 h-4 mr-1" />
                视频
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总曝光</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(totals.impressions)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              平均CTR: {avgCtr.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总点击</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(totals.clicks)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              平均CVR: {avgCvr.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总转化</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(totals.conversions)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              平均CPA: ¥{avgCpa.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总消耗</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">¥{totals.cost.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              {filteredMaterials.length} 个素材
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图表和分布图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 效果趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle>效果趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ctr" stroke="#3b82f6" name="CTR (%)" strokeWidth={2} />
                <Line type="monotone" dataKey="cvr" stroke="#10b981" name="CVR (%)" strokeWidth={2} />
                <Line type="monotone" dataKey="roi" stroke="#8b5cf6" name="ROI" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 素材类型分布 */}
        <Card>
          <CardHeader>
            <CardTitle>素材类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">图片: {typeDistribution[0]?.value ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">视频: {typeDistribution[1]?.value ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 素材列表 */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="暂无数据"
          description="选择的时间范围内没有素材数据"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>素材效果排行 ({filteredMaterials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">素材</th>
                    <th
                      className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-orange-600"
                      onClick={() => handleSort('impressions')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        曝光 <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-orange-600"
                      onClick={() => handleSort('ctr')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CTR <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-orange-600"
                      onClick={() => handleSort('conversions')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        转化 <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-orange-600"
                      onClick={() => handleSort('cvr')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CVR <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-orange-600"
                      onClick={() => handleSort('cpa')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CPA <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-orange-600"
                      onClick={() => handleSort('roi')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        ROI <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">表现</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material, index) => (
                    <tr key={material.material_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={material.material_type === 'video' ? material.cover_url : material.material_url}
                              alt={material.material_name}
                              className="w-full h-full object-cover"
                            />
                            {material.material_type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Video className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{material.material_name}</p>
                            <p className="text-xs text-gray-500">使用 {material.usage_count} 次</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{formatNumber(material.impressions)}</td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {material.ctr.toFixed(2)}%
                          {getTrendIcon(material.ctr, 6)}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{formatNumber(material.conversions)}</td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {material.cvr.toFixed(2)}%
                          {getTrendIcon(material.cvr, 5)}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">¥{material.cpa.toFixed(2)}</td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {material.roi.toFixed(1)}
                          {getTrendIcon(material.roi, 5)}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{getPerformanceBadge(material.roi)}</td>
                      <td className="text-center py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/materials/relations?material_id=${material.material_id}&type=${material.material_type}&name=${material.material_name}`
                            )
                          }
                        >
                          查看详情
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

