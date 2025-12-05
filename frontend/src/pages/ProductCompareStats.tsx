import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Loading from '../components/ui/Loading'
import { ProductCompareStats as ProductCompareStatsType } from '../api/productAnalyse'
import { useToast } from '../hooks/useToast'
import {
  ArrowLeft,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Eye,
  Target,
  Plus,
  X
} from 'lucide-react'
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// 生成模拟对比数据
const generateMockCompareData = (productIds: string[]): ProductCompareStatsType[] => {
  const productNames = ['春季连衣裙', '运动鞋', '智能手环', '护肤套装', '无线耳机']
  
  return productIds.map((id, index) => ({
    product_id: id,
    product_name: productNames[index] || `商品${index + 1}`,
    product_img: `https://via.placeholder.com/80?text=P${index + 1}`,
    gmv: Math.floor(Math.random() * 500000) + 100000,
    cost: Math.floor(Math.random() * 100000) + 10000,
    roi: Math.random() * 5 + 1,
    show: Math.floor(Math.random() * 100000) + 10000,
    click: Math.floor(Math.random() * 20000) + 2000,
    ctr: Math.random() * 0.05 + 0.01,
    convert: Math.floor(Math.random() * 1000) + 100,
    convert_rate: Math.random() * 0.1 + 0.02,
    convert_cost: Math.floor(Math.random() * 200) + 50,
    order_count: Math.floor(Math.random() * 3000) + 300,
    pay_order_count: Math.floor(Math.random() * 2800) + 280,
    per_order_value: Math.floor(Math.random() * 500) + 50,
    gmv_trend: [],
    roi_trend: []
  }))
}

export default function ProductCompareStats() {
  const navigate = useNavigate()
  const { error: showError, warning, info } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    'prod_10000',
    'prod_10001',
    'prod_10002'
  ])
  const [compareData, setCompareData] = useState<ProductCompareStatsType[]>([])
  const [showProductSelector, setShowProductSelector] = useState(false)

  useEffect(() => {
    if (selectedProducts.length > 0) {
      fetchCompareData()
    }
  }, [selectedProducts])

  const fetchCompareData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockData = generateMockCompareData(selectedProducts)
      setCompareData(mockData)

      // 真实API调用（注释掉）
      // const data = await getProductCompareStats({ productIds: selectedProducts })
      // setCompareData(data)
    } catch (error) {
      showError('获取商品对比数据失败')
      console.error('Failed to fetch compare data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)  }万`
    }
    return num.toLocaleString()
  }

  const removeProduct = (productId: string) => {
    if (selectedProducts.length <= 2) {
      warning('至少需要保留2个商品进行对比')
      return
    }
    setSelectedProducts(selectedProducts.filter(id => id !== productId))
  }

  const addProduct = () => {
    if (selectedProducts.length >= 5) {
      warning('最多只能对比5个商品')
      return
    }
    info('商品选择功能待实现')
  }

  if (loading) {
    return <Loading fullScreen size="lg" text="加载对比数据..." />
  }

  // 准备各类对比图表数据
  const gmvCompareData = compareData.map(p => ({
    name: p.product_name,
    GMV: p.gmv,
    '广告花费': p.cost
  }))

  const salesCompareData = compareData.map(p => ({
    name: p.product_name,
    订单数: p.order_count,
    付款订单: p.pay_order_count
  }))

  const trafficCompareData = compareData.map(p => ({
    name: p.product_name,
    展现量: p.show,
    点击量: p.click
  }))

  // 雷达图数据 - 综合指标对比
  const radarData = [
    {
      indicator: 'GMV',
      ...Object.fromEntries(
        compareData.map(p => [p.product_name, (p.gmv / Math.max(...compareData.map(d => d.gmv))) * 100])
      )
    },
    {
      indicator: '订单数',
      ...Object.fromEntries(
        compareData.map(p => [p.product_name, (p.order_count / Math.max(...compareData.map(d => d.order_count))) * 100])
      )
    },
    {
      indicator: '点击率',
      ...Object.fromEntries(
        compareData.map(p => [p.product_name, p.ctr * 1000])
      )
    },
    {
      indicator: '转化率',
      ...Object.fromEntries(
        compareData.map(p => [p.product_name, p.convert_rate * 500])
      )
    },
    {
      indicator: 'ROI',
      ...Object.fromEntries(
        compareData.map(p => [p.product_name, p.roi * 15])
      )
    }
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      <PageHeader
        title="商品对比分析"
        description="对比多个商品的投放效果和ROI表现"
        actions={
          <button
            onClick={() => navigate('/product-analyse')}
            className="qc-btn qc-btn-outline"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
        }
      />

      {/* 商品选择器 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">对比商品</h3>
          <button
            onClick={addProduct}
            disabled={selectedProducts.length >= 5}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加商品
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {compareData.map((product, index) => (
            <div key={product.product_id} className="relative bg-gray-50 rounded-lg p-4 border-2" style={{ borderColor: COLORS[index] }}>
              <button
                onClick={() => removeProduct(product.product_id)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full hover:bg-gray-100 shadow"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex flex-col items-center">
                <img
                  src={product.product_img}
                  alt={product.product_name}
                  className="w-16 h-16 rounded-lg object-cover mb-2"
                />
                <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                  {product.product_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">¥{product.per_order_value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 核心指标对比表格 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">核心指标对比</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标
                </th>
                {compareData.map((product, index) => (
                  <th
                    key={product.product_id}
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                    style={{ color: COLORS[index] }}
                  >
                    {product.product_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    GMV
                  </div>
                </td>
                {compareData.map(product => (
                  <td key={product.product_id} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ¥{formatNumber(product.gmv)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-400" />
                    订单数
                  </div>
                </td>
                {compareData.map(product => (
                  <td key={product.product_id} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(product.order_count)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    转化率
                  </div>
                </td>
                {compareData.map(product => (
                  <td key={product.product_id} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {(product.convert_rate * 100).toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    ROI
                  </div>
                </td>
                {compareData.map(product => (
                  <td key={product.product_id} className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                    {product.roi.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    点击率
                  </div>
                </td>
                {compareData.map(product => (
                  <td key={product.product_id} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {(product.ctr * 100).toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    展现量
                  </div>
                </td>
                {compareData.map(product => (
                  <td key={product.product_id} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(product.show)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">广告花费</td>
                {compareData.map(product => (
                  <td key={product.product_id} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ¥{formatNumber(product.cost)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GMV和广告花费对比 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">GMV与广告花费对比</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gmvCompareData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: any) => `¥${formatNumber(Number(value))}`} />
            <Legend />
            <Bar dataKey="GMV" fill="#10b981" />
            <Bar dataKey="广告花费" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 销量对比 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">销量对比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesCompareData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="销量" fill="#3b82f6" />
              <Bar dataKey="订单数" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 流量对比 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">流量对比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trafficCompareData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
              <Legend />
              <Bar dataKey="展现量" fill="#f59e0b" />
              <Bar dataKey="点击量" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 综合指标雷达图 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">综合指标对比（标准化）</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="indicator" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {compareData.map((product, index) => (
              <Radar
                key={product.product_id}
                name={product.product_name}
                dataKey={product.product_name}
                stroke={COLORS[index]}
                fill={COLORS[index]}
                fillOpacity={0.3}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 text-center mt-4">
          * 各指标已标准化处理，满分100分，便于直观对比
        </p>
      </div>

      {/* 结论建议 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">分析建议</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• 综合GMV和ROI表现，选择最优投放商品</li>
          <li>• 关注转化率低的商品，优化落地页和商品详情</li>
          <li>• 对比点击率，调整创意素材和投放策略</li>
          <li>• 分析广告花费占比，合理分配预算</li>
        </ul>
      </div>
    </div>
  )
}
