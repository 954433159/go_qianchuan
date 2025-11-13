import { useEffect, useState } from 'react'
import { getSearchWordReport, SearchWordReport, ReportParams } from '@/api/report'
import {
  Card, CardContent, CardHeader, CardTitle,
  PageHeader, Loading, Button, Badge,
  Table, TableColumn
} from '@/components/ui'
import { Download, Search, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/authStore'

export default function ReportSearchWord() {
  const { success, error: showError } = useToast()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState<SearchWordReport[]>([])

  useEffect(() => {
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
        fields: ['cost', 'show', 'click', 'convert', 'ctr', 'cpc'],
      }

      const data = await getSearchWordReport(params)
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch search word report:', error)
      showError('获取搜索词报表数据失败')
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    success('报表已导出')
  }

  const columns: TableColumn<SearchWordReport>[] = [
    {
      key: 'search_word',
      title: '搜索词',
      dataIndex: 'search_word',
      width: '200px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      )
    },
    {
      key: 'match_type',
      title: '匹配类型',
      dataIndex: 'match_type',
      render: (value) => {
        const matchTypeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' }> = {
          EXACT: { label: '精确匹配', variant: 'success' },
          PHRASE: { label: '短语匹配', variant: 'default' },
          BROAD: { label: '广泛匹配', variant: 'secondary' }
        }
        const config = matchTypeMap[value as string] || { label: value as string, variant: 'default' as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
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
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载报表数据..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="🔍 搜索词报表"
        description="查看用户搜索词的投放效果和匹配情况"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '数据报表', href: '/reports' },
          { label: '搜索词报表' }
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

      <Card>
        <CardHeader>
          <CardTitle>搜索词数据</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns as any}
            dataSource={reportData}
            rowKey={(record) => String(record.search_word)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>匹配类型说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Badge variant="success" className="mr-2">精确匹配</Badge>
              <p className="mt-2 text-muted-foreground">
                搜索词与关键词完全相同时才会触发广告
              </p>
            </div>
            <div>
              <Badge variant="default" className="mr-2">短语匹配</Badge>
              <p className="mt-2 text-muted-foreground">
                搜索词包含关键词或其近义词时触发广告
              </p>
            </div>
            <div>
              <Badge variant="secondary" className="mr-2">广泛匹配</Badge>
              <p className="mt-2 text-muted-foreground">
                搜索词与关键词相关时即可触发广告
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
