import { useEffect, useState } from 'react'
import { getVideoUserLoseReport, VideoUserLoseReport, ReportParams } from '@/api/report'
import {
  Card, CardContent, CardHeader, CardTitle,
  PageHeader, Loading, Button,
  Table, TableColumn
} from '@/components/ui'
import { Download, Video, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/authStore'

export default function ReportVideoUserLose() {
  const { success, error: showError } = useToast()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState<VideoUserLoseReport[]>([])

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
        fields: [],
      }

      const data = await getVideoUserLoseReport(params)
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch video user lose report:', error)
      showError('获取视频流失报表数据失败')
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    success('报表已导出')
  }

  const columns: TableColumn<VideoUserLoseReport>[] = [
    {
      key: 'date',
      title: '日期',
      dataIndex: 'date',
      width: '120px'
    },
    {
      key: 'video_title',
      title: '视频标题',
      dataIndex: 'video_title',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      )
    },
    {
      key: 'total_watch',
      title: '总观看',
      dataIndex: 'total_watch',
      render: (value) => (value as number).toLocaleString()
    },
    {
      key: 'lose_3s',
      title: '3秒流失',
      dataIndex: 'lose_3s',
      render: (value, record) => {
        const rate = ((value as number) / (record as VideoUserLoseReport).total_watch * 100).toFixed(1)
        return `${(value as number).toLocaleString()} (${rate}%)`
      }
    },
    {
      key: 'lose_5s',
      title: '5秒流失',
      dataIndex: 'lose_5s',
      render: (value, record) => {
        const rate = ((value as number) / (record as VideoUserLoseReport).total_watch * 100).toFixed(1)
        return `${(value as number).toLocaleString()} (${rate}%)`
      }
    },
    {
      key: 'lose_10s',
      title: '10秒流失',
      dataIndex: 'lose_10s',
      render: (value, record) => {
        const rate = ((value as number) / (record as VideoUserLoseReport).total_watch * 100).toFixed(1)
        return `${(value as number).toLocaleString()} (${rate}%)`
      }
    },
    {
      key: 'lose_30s',
      title: '30秒流失',
      dataIndex: 'lose_30s',
      render: (value, record) => {
        const rate = ((value as number) / (record as VideoUserLoseReport).total_watch * 100).toFixed(1)
        return `${(value as number).toLocaleString()} (${rate}%)`
      }
    },
    {
      key: 'avg_watch_duration',
      title: '平均观看时长',
      dataIndex: 'avg_watch_duration',
      render: (value) => `${(value as number).toFixed(1)}秒`
    },
    {
      key: 'complete_rate',
      title: '完播率',
      dataIndex: 'complete_rate',
      render: (value) => `${((value as number) * 100).toFixed(2)}%`
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载报表数据..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📹 视频用户流失报表"
        description="分析视频在不同时间节点的用户流失情况"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '数据报表', href: '/reports' },
          { label: '视频流失报表' }
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

      {/* 流失趋势图 */}
      <Card>
        <CardHeader>
          <CardTitle>用户流失趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="video_title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lose_3s" stroke="#ef4444" name="3秒流失" />
              <Line type="monotone" dataKey="lose_5s" stroke="#f97316" name="5秒流失" />
              <Line type="monotone" dataKey="lose_10s" stroke="#eab308" name="10秒流失" />
              <Line type="monotone" dataKey="lose_30s" stroke="#84cc16" name="30秒流失" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>详细数据</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns as any}
            data={reportData as any}
            rowKey={(record: any) => String(record.video_id)}
          />
        </CardContent>
      </Card>

      {/* 优化建议 */}
      <Card>
        <CardHeader>
          <CardTitle>优化建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                3-5秒高流失
              </h4>
              <p className="text-muted-foreground">
                视频开头不够吸引人，建议优化前3秒内容，使用更有冲击力的画面或文案
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                10秒流失较高
              </h4>
              <p className="text-muted-foreground">
                用户对内容失去兴趣，建议检查视频节奏，加快内容展开速度
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-yellow-500" />
                30秒流失高
              </h4>
              <p className="text-muted-foreground">
                视频过长或内容冗余，建议精简内容，控制视频时长在15-30秒
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-2">
                完播率优化
              </h4>
              <p className="text-muted-foreground">
                提高完播率可显著提升视频权重和转化效果，建议使用悬念、互动等方式留住用户
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
