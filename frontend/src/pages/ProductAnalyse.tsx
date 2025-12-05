import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Loading from '../components/ui/Loading'
import { ProductAnalyseItem } from '../api/productAnalyse'
import { useToast } from '../hooks/useToast'
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Search,
  SlidersHorizontal,
  BarChart3,
  ArrowUpDown
} from 'lucide-react'

// 生成模拟数据
const generateMockProducts = (): ProductAnalyseItem[] => {
  const products = [
    { name: '春季连衣裙新款', category: '女装' },
    { name: '男士商务休闲鞋', category: '男鞋' },
    { name: '儿童益智玩具套装', category: '玩具' },
    { name: '智能手环运动版', category: '数码' },
    { name: '护肤品礼盒套装', category: '美妆' },
    { name: '家居收纳箱组合', category: '家居' },
    { name: '运动背包大容量', category: '箱包' },
    { name: '无线蓝牙耳机', category: '数码' },
    { name: '宠物智能喂食器', category: '宠物' },
    { name: '厨房多功能刀具', category: '厨具' },
    { name: '瑜伽垫加厚防滑', category: '运动' },
    { name: '保温杯便携款', category: '杯壶' },
    { name: '台灯护眼学习', category: '灯具' },
    { name: '办公椅人体工学', category: '家具' },
    { name: '零食大礼包', category: '食品' }
  ]

  return products.map((p, i) => {
    const baseGmv = Math.floor(Math.random() * 500000) + 50000
    const cost = Math.floor(baseGmv / (Math.random() * 5 + 1))
    const show = Math.floor(Math.random() * 100000) + 10000
    const click = Math.floor(Math.random() * 20000) + 1000
    const convert = Math.floor(Math.random() * 5000) + 500

    return {
      product_id: `prod_${10000 + i}`,
      product_name: p.name,
      product_img: `https://via.placeholder.com/120?text=${i + 1}`,
      category: p.category,
      price: Math.floor(Math.random() * 1000) + 50,
      gmv: baseGmv,
      cost,
      roi: baseGmv / cost,
      show,
      click,
      ctr: (click / show) * 100,
      convert,
      convert_rate: (convert / click) * 100,
      creative_count: Math.floor(Math.random() * 20) + 5,
      advantage_tags: [
        baseGmv / cost > 3 ? 'ROI优秀' : '',
        (convert / click) * 100 > 5 ? '转化率高' : '',
        Math.floor(Math.random() * 20) + 5 > 15 ? '创意丰富' : ''
      ].filter(Boolean)
    }
  })
}

export default function ProductAnalyse() {
  const navigate = useNavigate()
  const { error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<ProductAnalyseItem[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductAnalyseItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('全部')
  const [sortBy, setSortBy] = useState<'gmv' | 'roi' | 'cost' | 'convert_rate'>('gmv')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, categoryFilter, sortBy, sortOrder])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockData = generateMockProducts()
      setProducts(mockData)

      // 真实API调用（注释掉）
      // const data = await getProductAnalyseList({ advertiserId: 'xxx', dateRange: [startDate, endDate] })
      // setProducts(data)
    } catch (error) {
      showError('获取商品分析数据失败')
      console.error('Failed to fetch product analyse:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // 分类过滤
    if (categoryFilter !== '全部') {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.product_name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.product_id.toLowerCase().includes(query)
      )
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortBy) {
        case 'gmv':
          aValue = a.gmv
          bValue = b.gmv
          break
        case 'cost':
          aValue = a.cost
          bValue = b.cost
          break
        case 'roi':
          aValue = a.roi
          bValue = b.roi
          break
        case 'convert_rate':
          aValue = a.convert_rate
          bValue = b.convert_rate
          break
        default:
          aValue = a.gmv
          bValue = b.gmv
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

    setFilteredProducts(filtered)
  }

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)  }万`
    }
    return num.toLocaleString()
  }


  if (loading) {
    return <Loading fullScreen size="lg" text="加载商品分析数据..." />
  }

  // 获取所有分类
  const categories = ['全部', ...Array.from(new Set(products.map(p => p.category)))]

  // 统计数据
  const stats = {
    total: products.length,
    totalGmv: products.reduce((sum, p) => sum + p.gmv, 0),
    totalConvert: products.reduce((sum, p) => sum + p.convert, 0),
    avgRoi: products.length > 0 ? (products.reduce((sum, p) => sum + p.roi, 0) / products.length).toFixed(2) : '0.00'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="商品效果分析"
        description="分析各商品投放效果和ROI表现"
        actions={
          <button
            onClick={() => navigate('/product-compare')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            商品对比分析
          </button>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">商品总数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总GMV</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">¥{formatNumber(stats.totalGmv)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总转化</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalConvert)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均ROI</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgRoi}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商品名称、品牌或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gmv">GMV</option>
              <option value="cost">消耗</option>
              <option value="roi">ROI</option>
              <option value="convert_rate">转化率</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 商品卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            暂无数据
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.product_id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/product-analyse/${product.product_id}`)}
            >
              {/* 商品图片 */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={product.product_img}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                  {product.category}
                </div>
                {product.advantage_tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {product.advantage_tags.map(tag => (
                      <span key={tag} className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 商品信息 */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {product.product_name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{product.category} · ¥{product.price}</p>

                {/* 核心指标 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">GMV</p>
                    <p className="text-lg font-bold text-gray-900">¥{formatNumber(product.gmv)}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      ROI: {product.roi.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">转化</p>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(product.convert)}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {product.convert_rate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* 次要指标 */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">点击率</span>
                    <span className="text-sm font-medium text-gray-900">{product.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">曝光</span>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(product.show)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">点击</span>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(product.click)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">消耗</span>
                    <span className="text-sm font-medium text-gray-900">¥{formatNumber(product.cost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">创意数</span>
                    <span className="text-sm font-medium text-blue-600">{product.creative_count}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/product-analyse/${product.product_id}`)
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  查看详情
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 结果统计 */}
      {filteredProducts.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          显示 {filteredProducts.length} 个商品，共 {products.length} 个
        </div>
      )}
    </div>
  )
}
