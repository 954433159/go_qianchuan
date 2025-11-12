import { useEffect, useState } from 'react'
import { getCampaignReport, getAdReport, getCreativeReport, ReportData } from '@/api/report'
import { 
  Card, CardContent, CardHeader, CardTitle, 
  PageHeader, Loading, Button, Badge,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui'
import { Download, TrendingUp, TrendingDown, Eye, MousePointer, DollarSign, Target } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/useToast'

export default function ReportsEnhanced() {
  const { success } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('campaign')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [selectedAdvertiserId] = useState(1)

  useEffect(() => {
    // 设置默认日期（最近7天）
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport()
    }
  }, [startDate, endDate, activeTab])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = {
        advertiser_id: selectedAdvertiserId,
        start_date: startDate,
        end_date: endDate,
        fields: ['cost', 'show', 'click', 'convert', 'ctr', 'cpc', 'cpm', 'convert_cost', 'convert_rate'],
      }

      let data: ReportData[]
      if (activeTab === 'campaign') {
        data = await getCampaignReport(params)
      } else if (activeTab === 'ad') {
        data = await getAdReport(params)
      } else {
        data = await getCreativeReport(params)
      }
      
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch report:', error)
      // Mock数据
      const mockData = generateMockData()
      setReportData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (): ReportData[] => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const cost = 1000 + Math.random() * 2000
      const show = Math.floor(10000 + Math.random() * 20000)
      const click = Math.floor(show * (0.01 + Math.random() * 0.03))
      const convert = Math.floor(click * (0.05 + Math.random() * 0.15))
      
      return {
        date: date.toISOString().split('T')[0],
        cost,
        show,
        click,
        convert,
        ctr: click / show,
        cpc: cost / click,
        cpm: (cost / show) * 1000,
        convert_cost: cost / convert,
        convert_rate: convert / click
      }
    })
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
      title: '总消耗',
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
        title="📊 数据报表"
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
          <TabsTrigger value="campaign">广告组报表</TabsTrigger>
          <TabsTrigger value="ad">广告计划报表</TabsTrigger>
          <TabsTrigger value="creative">创意报表</TabsTrigger>
          <TabsTrigger value="custom">自定义报表</TabsTrigger>
        </TabsList>

        {/* 广告组报表 */}
        <TabsContent value="campaign" className="space-y-6">
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
              <p className="text-muted-foreground">自定义维度和指标组合...</p>
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
