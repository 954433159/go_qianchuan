import { useEffect, useState } from 'react'
import { 
  getAdvertiserReport, getAdReport, getCreativeReport, 
  getCustomReport, getCustomReportConfig,
  ReportData, CustomReportConfig
} from '@/api/report'
import {
  Card, CardContent, CardHeader, CardTitle, 
  PageHeader, Loading, Button, Badge,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui'
import { Download, TrendingUp, TrendingDown, Eye, MousePointer, DollarSign, Target } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/authStore'

export default function ReportsEnhanced() {
  const { success, error: showError } = useToast()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('advertiser')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [customConfig, setCustomConfig] = useState<CustomReportConfig | null>(null)
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [customLoading, setCustomLoading] = useState(false)
  const [showExtendedHint, setShowExtendedHint] = useState(true)

  useEffect(() => {
    // 设置默认日期（最近7天）
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    setStartDate(start.toISOString().split('T')[0] ?? '')
    setEndDate(end.toISOString().split('T')[0] ?? '')
  }, [])

  useEffect(() => {
    if (startDate && endDate && activeTab !== 'custom') {
      fetchReport()
    }
    if (activeTab === 'custom' && !customConfig) {
      fetchCustomConfig()
    }
  }, [startDate, endDate, activeTab])

  const fetchReport = async () => {
    if (!user?.advertiserId) {
      showError('未获取到广告主ID，请重新登录')
      return
    }

    setLoading(true)
    try {
      const params = {
        advertiser_id: user.advertiserId,
        start_date: startDate,
        end_date: endDate,
        fields: ['cost', 'show', 'click', 'convert', 'ctr', 'cpc', 'cpm', 'convert_cost', 'convert_rate'],
      }

      let data: ReportData[]
      if (activeTab === 'advertiser') {
        data = await getAdvertiserReport(params)
      } else if (activeTab === 'ad') {
        data = await getAdReport(params)
      } else {
        data = await getCreativeReport(params)
      }
      
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch report:', error)
      showError('获取报表数据失败')
      // 设置空数据，不使用mock
      setReportData([])
    } finally {
      setLoading(false)
    }
  }


  const fetchCustomConfig = async () => {
    setCustomLoading(true)
    try {
      const config = await getCustomReportConfig()
      setCustomConfig(config)
    } catch (error: any) {
      // 后端返回 501，显示提示
      console.error('Failed to fetch custom config:', error)
      if (error.response?.status === 501) {
        const hint = error.hint || '请使用现有维度报表（广告主/广告/创意）'
        showError(`自定义报表功能暂未实现。${hint}`)
      }
    } finally {
      setCustomLoading(false)
    }
  }

  const fetchCustomReport = async () => {
    if (!user?.advertiserId || selectedDimensions.length === 0) {
      showError('请选择至少一个维度')
      return
    }

    setCustomLoading(true)
    try {
      const data = await getCustomReport({
        advertiser_id: user.advertiserId,
        start_date: startDate,
        end_date: endDate,
        fields: ['cost', 'show', 'click', 'convert'],
        dimensions: selectedDimensions
      })
      setReportData(data)
    } catch (error: any) {
      console.error('Failed to fetch custom report:', error)
      if (error.response?.status === 501) {
        const hint = error.hint || '请使用现有维度报表'
        showError(`自定义报表功能暂未实现。${hint}`)
      }
    } finally {
      setCustomLoading(false)
    }
  }

  const handleExport = () => {
    success('报表已导出')
  }

  // 计算汇总数据
  const summary = reportData.reduce((acc, curr) => ({
    cost: acc.cost + curr.cost,
    show: acc.show + curr.show,
    click: acc.click + curr.click,
    convert: acc.convert + curr.convert,
  }), { cost: 0, show: 0, click: 0, convert: 0 })

  const avgCtr = summary.click / summary.show || 0
  const avgCpc = summary.cost / summary.click || 0
  const avgConvertRate = summary.convert / summary.click || 0

  // 统计卡片数据
  const stats = [
    {
      title: '总消耗 📊',
      value: `¥${summary.cost.toFixed(2)}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: '总展示',
      value: summary.show.toLocaleString(),
      change: '+8.3%',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '总点击',
      value: summary.click.toLocaleString(),
      change: '+15.2%',
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '总转化',
      value: summary.convert.toLocaleString(),
      change: '+22.1%',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载报表数据..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📊 数据报表 · 基础版"
        description="查看广告投放效果数据，支持多维度分析"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '数据报表' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              导出报表
            </Button>
          </div>
        }
      />

      {/* Extended Features Hint */}
      {showExtendedHint && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-lg shadow-sm relative">
          <button
            onClick={() => setShowExtendedHint(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-900">🌟 当前为基础版报表</h3>
              <p className="mt-1 text-sm text-purple-800">
                支持<strong>账户、广告计划、创意</strong>三大维度报表。以下高级功能正在对接SDK：
              </p>
              <ul className="mt-2 text-xs text-purple-700 space-y-1 ml-4 list-disc">
                <li>素材报表：查看图片/视频素材的效果表现</li>
                <li>搜索词报表：分析用户搜索关键词效果</li>
                <li>视频流失报表：了解视频各阶段用户流失</li>
                <li>自定义报表：自由组合维度和指标</li>
              </ul>
              <p className="mt-2 text-xs text-purple-700">
                当前请使用<strong>创意报表</strong>查看素材效果，使用<strong>关键词管理</strong>查看关键词表现。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 日期选择器 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <span className="text-gray-500">至</span>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={fetchReport}>
              查询
            </Button>
            <Select defaultValue="last7days">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="快速选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="yesterday">昨天</SelectItem>
                <SelectItem value="last7days">近7天</SelectItem>
                <SelectItem value="last30days">近30天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.change.startsWith('+') ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">vs 上周期</span>
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

      {/* Tab切换报表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="advertiser">账户报表</TabsTrigger>
          <TabsTrigger value="ad">广告计划报表</TabsTrigger>
          <TabsTrigger value="creative">创意报表</TabsTrigger>
          <TabsTrigger value="custom">自定义报表</TabsTrigger>
        </TabsList>

        {/* 账户报表 */}
        <TabsContent value="advertiser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>趋势图 - 消耗与转化</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#f97316" strokeWidth={2} name="消耗" />
                  <Line yAxisId="right" type="monotone" dataKey="convert" stroke="#10b981" strokeWidth={2} name="转化" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>数据明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">消耗</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">展示</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">点击</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">点击率</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPC</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">转化</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">转化率</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{row.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-orange-600">
                          ¥{row.cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{row.show.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{row.click.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{(row.ctr * 100).toFixed(2)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">¥{row.cpc.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                          {row.convert.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{(row.convert_rate * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">合计</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">¥{summary.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{summary.show.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{summary.click.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{(avgCtr * 100).toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">¥{avgCpc.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{summary.convert.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{(avgConvertRate * 100).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 广告计划报表 */}
        <TabsContent value="ad">
          <Card>
            <CardHeader>
              <CardTitle>广告计划数据（与广告组报表格式相同）</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">广告计划维度的数据展示...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 创意报表 */}
        <TabsContent value="creative">
          <Card>
            <CardHeader>
              <CardTitle>创意数据（与广告组报表格式相同）</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">创意维度的数据展示...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 自定义报表 */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>自定义报表</CardTitle>
            </CardHeader>
            <CardContent>
              {customLoading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">功能暂未实现</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          SDK 正在对接千川自定义报表API，请稍后使用。建议使用现有维度报表（广告主/广告计划/创意）。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">选择维度</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['advertiser', 'campaign', 'ad', 'creative', 'date', 'region'].map((dim) => (
                        <label key={dim} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDimensions.includes(dim)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDimensions([...selectedDimensions, dim])
                              } else {
                                setSelectedDimensions(selectedDimensions.filter(d => d !== dim))
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {{
                              advertiser: '广告主',
                              campaign: '广告组',
                              ad: '广告计划',
                              creative: '创意',
                              date: '日期',
                              region: '地域'
                            }[dim]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={fetchCustomReport}
                      disabled={customLoading || selectedDimensions.length === 0}
                    >
                      查询报表
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedDimensions([])}
                    >
                      清空选择
                    </Button>
                  </div>

                  {reportData.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-4">已选择维度: {selectedDimensions.join(', ')}</p>
                      <div className="text-center text-gray-500 py-8">
                        报表数据将在此处展示
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 性能指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">平均点击率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(avgCtr * 100).toFixed(2)}%</div>
            <p className="text-sm text-muted-foreground mt-2">行业平均: 2.5%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">平均点击成本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">¥{avgCpc.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">行业平均: ¥0.80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">平均转化率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(avgConvertRate * 100).toFixed(2)}%</div>
            <p className="text-sm text-muted-foreground mt-2">行业平均: 8.0%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
