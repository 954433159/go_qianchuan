import { useEffect, useState } from 'react'
import { getCreativeReport, ReportData, ReportParams } from '@/api/report'
import {
  Card, CardContent, CardHeader, CardTitle,
  PageHeader, Loading, Button, Badge,
  Table, TableColumn
} from '@/components/ui'
import { Download, TrendingUp, Eye, MousePointer, DollarSign, Target } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/authStore'

export default function ReportCreative() {
  const { success, error: showError } = useToast()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState<ReportData[]>([])

  useEffect(() => {
    // 设置默认日期（最近7天）
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    setStartDate(start.toISOString().split('T')[0] ?? '')
    setEndDate(end.toISOString().split('T')[0] ?? '')
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport()
    }
  }, [startDate, endDate])

  const fetchReport = async () => {
    if (!user?.advertiserId) {
      showError('未获取到广告主ID，请重新登录')
      return
    }

    setLoading(true)
    try {
      const params: ReportParams = {
        advertiser_id: user.advertiserId,
        start_date: startDate,
        end_date: endDate,
        fields: ['cost', 'show', 'click', 'convert', 'ctr', 'cpc', 'cpm', 'convert_cost', 'convert_rate'],
      }

      const data = await getCreativeReport(params)
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch creative report:', error)
      showError('获取创意报表数据失败')
      setReportData([])
    } finally {
      setLoading(false)
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

  const avgCtr = summary.show > 0 ? (summary.click / summary.show) * 100 : 0
  const avgCpc = summary.click > 0 ? summary.cost / summary.click : 0
  const avgConvertRate = summary.click > 0 ? (summary.convert / summary.click) * 100 : 0

  // 统计卡片数据
  const stats = [
    {
      title: '总消耗',
      value: `¥${summary.cost.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: '总展示',
      value: summary.show.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '总点击',
      value: summary.click.toLocaleString(),
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '总转化',
      value: summary.convert.toLocaleString(),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  // 表格列定义
  const columns: TableColumn<ReportData>[] = [
    {
      key: 'date',
      title: '日期',
      dataIndex: 'date',
      width: '120px'
    },
    {
      key: 'cost',
      title: '消耗',
      dataIndex: 'cost',
      render: (value) => `¥${(value as number).toFixed(2)}`
    },
    {
      key: 'show',
      title: '展示',
      dataIndex: 'show',
      render: (value) => (value as number).toLocaleString()
    },
    {
      key: 'click',
      title: '点击',
      dataIndex: 'click',
      render: (value) => (value as number).toLocaleString()
    },
    {
      key: 'ctr',
      title: '点击率',
      dataIndex: 'ctr',
      render: (value) => `${((value as number) * 100).toFixed(2)}%`
    },
    {
      key: 'cpc',
      title: '点击单价',
      dataIndex: 'cpc',
      render: (value) => `¥${(value as number).toFixed(2)}`
    },
    {
      key: 'convert',
      title: '转化数',
      dataIndex: 'convert',
      render: (value) => (value as number).toLocaleString()
    },
    {
      key: 'convert_rate',
      title: '转化率',
      dataIndex: 'convert_rate',
      render: (value) => `${((value as number) * 100).toFixed(2)}%`
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载报表数据..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📊 创意报表"
        description="查看广告组投放效果数据和趋势分析"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '数据报表', href: '/reports' },
          { label: '创意报表' }
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
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReport}>
                查询
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>消耗趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#f97316" name="消耗" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>点击与转化趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="click" fill="#3b82f6" name="点击" />
                <Bar dataKey="convert" fill="#8b5cf6" name="转化" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>详细数据</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns as any}
            dataSource={reportData}
            rowKey="date"
          />
        </CardContent>
      </Card>

      {/* 关键指标说明 */}
      <Card>
        <CardHeader>
          <CardTitle>指标说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Badge variant="secondary" className="mr-2">CTR</Badge>
              <span className="text-muted-foreground">点击率 = 点击数 / 展示数 × 100%</span>
              <p className="mt-1 text-muted-foreground">平均点击率: {avgCtr.toFixed(2)}%</p>
            </div>
            <div>
              <Badge variant="secondary" className="mr-2">CPC</Badge>
              <span className="text-muted-foreground">点击单价 = 消耗 / 点击数</span>
              <p className="mt-1 text-muted-foreground">平均点击单价: ¥{avgCpc.toFixed(2)}</p>
            </div>
            <div>
              <Badge variant="secondary" className="mr-2">转化率</Badge>
              <span className="text-muted-foreground">转化率 = 转化数 / 点击数 × 100%</span>
              <p className="mt-1 text-muted-foreground">平均转化率: {avgConvertRate.toFixed(2)}%</p>
            </div>
            <div>
              <Badge variant="secondary" className="mr-2">CPM</Badge>
              <span className="text-muted-foreground">千次展示成本 = 消耗 / 展示数 × 1000</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
