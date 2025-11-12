import { useEffect, useState } from 'react'
import { getCampaignReport, getAdReport, getCreativeReport, getCustomReport, ReportData } from '@/api/report'
import Table, { TableColumn } from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import Loading from '@/components/ui/Loading'
import { Download, Eye, MousePointer, Target, DollarSign, Settings } from 'lucide-react'
import { LineChart, BarChart } from '@tremor/react'
import { showSuccess } from '@/hooks'

// 可选字段配置
const FIELD_OPTIONS = [
  { value: 'cost', label: '消耗' },
  { value: 'show', label: '展示' },
  { value: 'click', label: '点击' },
  { value: 'convert', label: '转化' },
  { value: 'ctr', label: '点击率' },
  { value: 'cpc', label: 'CPC' },
  { value: 'cpm', label: 'CPM' },
  { value: 'convert_cost', label: '转化成本' },
  { value: 'convert_rate', label: '转化率' },
]

const DIMENSION_OPTIONS = [
  { value: 'date', label: '日期' },
  { value: 'campaign', label: '广告计划' },
  { value: 'ad', label: '广告' },
  { value: 'creative', label: '创意' },
]

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAdvertiserId] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportType, setReportType] = useState<'campaign' | 'ad' | 'creative' | 'custom'>('campaign')
  const [selectedFields, setSelectedFields] = useState<string[]>(['cost', 'show', 'click', 'convert', 'ctr', 'cpc', 'cpm', 'convert_cost', 'convert_rate'])
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['date'])
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  
  useEffect(() => {
    // 设置默认日期范围（最近7天）
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])
  
  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = {
        advertiser_id: selectedAdvertiserId,
        start_date: startDate,
        end_date: endDate,
        fields: selectedFields,
      }

      let data: ReportData[]
      if (reportType === 'campaign') {
        data = await getCampaignReport(params)
      } else if (reportType === 'ad') {
        data = await getAdReport(params)
      } else if (reportType === 'creative') {
        data = await getCreativeReport(params)
      } else {
        data = await getCustomReport({ ...params, dimensions: selectedDimensions })
      }
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  // CSV 导出功能
  const handleExportCSV = () => {
    if (reportData.length === 0) {
      return
    }

    // 构建 CSV 内容
    const headers = columns.map(col => col.title).join(',')
    const rows = reportData.map(row => 
      columns.map(col => {
        const value = row[col.dataIndex as keyof ReportData]
        return typeof value === 'number' ? value : `"${value}"`
      }).join(',')
    )
    
    const csv = [headers, ...rows].join('\n')
    
    // 创建下载链接
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `report_${startDate}_${endDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showSuccess('报表已导出')
  }

  // 字段选择处理
  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  // 维度选择处理
  const handleDimensionToggle = (dimension: string) => {
    setSelectedDimensions(prev => 
      prev.includes(dimension)
        ? prev.filter(d => d !== dimension)
        : [...prev, dimension]
    )
  }
  
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
      render: (value) => `¥${(value as number)?.toFixed(2) || '0.00'}`,
      align: 'right'
    },
    {
      key: 'show',
      title: '展示',
      dataIndex: 'show',
      render: (value) => (value as number)?.toLocaleString() || '0',
      align: 'right'
    },
    {
      key: 'click',
      title: '点击',
      dataIndex: 'click',
      render: (value) => (value as number)?.toLocaleString() || '0',
      align: 'right'
    },
    {
      key: 'ctr',
      title: '点击率',
      dataIndex: 'ctr',
      render: (value) => `${((value as number) * 100)?.toFixed(2) || '0.00'}%`,
      align: 'right'
    },
    {
      key: 'cpc',
      title: 'CPC',
      dataIndex: 'cpc',
      render: (value) => `¥${(value as number)?.toFixed(2) || '0.00'}`,
      align: 'right'
    },
    {
      key: 'cpm',
      title: 'CPM',
      dataIndex: 'cpm',
      render: (value) => `¥${(value as number)?.toFixed(2) || '0.00'}`,
      align: 'right'
    },
    {
      key: 'convert',
      title: '转化',
      dataIndex: 'convert',
      render: (value) => (value as number)?.toLocaleString() || '0',
      align: 'right'
    },
    {
      key: 'convert_rate',
      title: '转化率',
      dataIndex: 'convert_rate',
      render: (value) => `${((value as number) * 100)?.toFixed(2) || '0.00'}%`,
      align: 'right'
    },
    {
      key: 'convert_cost',
      title: '转化成本',
      dataIndex: 'convert_cost',
      render: (value) => `¥${(value as number)?.toFixed(2) || '0.00'}`,
      align: 'right'
    }
  ]
  
  // 计算总计
  const totals = reportData.reduce((acc, item) => ({
    cost: acc.cost + item.cost,
    show: acc.show + item.show,
    click: acc.click + item.click,
    convert: acc.convert + item.convert
  }), { cost: 0, show: 0, click: 0, convert: 0 })
  
  const avgCtr = totals.show > 0 ? totals.click / totals.show : 0
  const avgConvertRate = totals.click > 0 ? totals.convert / totals.click : 0
  
  const stats = [
    { 
      name: '总消耗', 
      value: `¥${totals.cost.toFixed(2)}`, 
      icon: DollarSign, 
      bgColor: 'bg-red-50 dark:bg-red-950', 
      iconColor: 'text-red-600 dark:text-red-400' 
    },
    { 
      name: '总展示', 
      value: totals.show.toLocaleString(), 
      icon: Eye, 
      bgColor: 'bg-blue-50 dark:bg-blue-950', 
      iconColor: 'text-blue-600 dark:text-blue-400',
      subtitle: `CTR: ${(avgCtr * 100).toFixed(2)}%`
    },
    { 
      name: '总点击', 
      value: totals.click.toLocaleString(), 
      icon: MousePointer, 
      bgColor: 'bg-green-50 dark:bg-green-950', 
      iconColor: 'text-green-600 dark:text-green-400',
      subtitle: `CTR: ${(avgCtr * 100).toFixed(2)}%`
    },
    { 
      name: '总转化', 
      value: totals.convert.toLocaleString(), 
      icon: Target, 
      bgColor: 'bg-purple-50 dark:bg-purple-950', 
      iconColor: 'text-purple-600 dark:text-purple-400',
      subtitle: `CVR: ${(avgConvertRate * 100).toFixed(2)}%`
    }
  ]

  if (loading && reportData.length === 0) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="数据报表" 
        description="查看广告投放数据统计"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowFieldSelector(!showFieldSelector)}>
              <Settings className="w-4 h-4 mr-2" />
              配置字段
            </Button>
            <Button variant="secondary" onClick={handleExportCSV} disabled={reportData.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              导出 CSV
            </Button>
          </div>
        }
      />
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* 字段配置面板 */}
      {showFieldSelector && (
        <Card>
          <CardHeader>
            <CardTitle>字段与维度配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 报表类型 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">报表类型</label>
              <Select value={reportType} onValueChange={(value: 'campaign' | 'ad' | 'creative' | 'custom') => setReportType(value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign">广告计划报表</SelectItem>
                  <SelectItem value="ad">广告报表</SelectItem>
                  <SelectItem value="creative">创意报表</SelectItem>
                  <SelectItem value="custom">自定义报表</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 字段选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">选择指标</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {FIELD_OPTIONS.map(field => (
                  <label key={field.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFields.includes(field.value)}
                      onCheckedChange={() => handleFieldToggle(field.value)}
                    />
                    <span className="text-sm">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 维度选择（仅自定义报表） */}
            {reportType === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">选择维度</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DIMENSION_OPTIONS.map(dimension => (
                    <label key={dimension.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedDimensions.includes(dimension.value)}
                        onCheckedChange={() => handleDimensionToggle(dimension.value)}
                      />
                      <span className="text-sm">{dimension.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-end">
            <Input
              type="date"
              label="开始日期"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-48"
            />
            <Input
              type="date"
              label="结束日期"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-48"
            />
            <Button onClick={fetchReport} loading={loading}>
              查询
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* 点击率和转化率趋势图 */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CTR 趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>点击率趋势 (CTR)</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                className="h-72"
                data={reportData.map(item => ({
                  日期: item.date,
                  'CTR (%)': parseFloat((item.ctr * 100).toFixed(2)),
                }))}
                index="日期"
                categories={['CTR (%)']}
                colors={['blue']}
                valueFormatter={(value) => `${value.toFixed(2)}%`}
                yAxisWidth={50}
                showAnimation
              />
            </CardContent>
          </Card>
          
          {/* CVR 趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>转化率趋势 (CVR)</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                className="h-72"
                data={reportData.map(item => ({
                  日期: item.date,
                  'CVR (%)': parseFloat((item.convert_rate * 100).toFixed(2)),
                }))}
                index="日期"
                categories={['CVR (%)']}
                colors={['purple']}
                valueFormatter={(value) => `${value.toFixed(2)}%`}
                yAxisWidth={50}
                showAnimation
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 消耗、点击、转化对比图 */}
      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>核心指标对比</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-80"
              data={reportData.map(item => ({
                日期: item.date,
                '消耗 (¥)': item.cost,
                '点击': item.click,
                '转化': item.convert,
              }))}
              index="日期"
              categories={['消耗 (¥)', '点击', '转化']}
              colors={['red', 'blue', 'green']}
              valueFormatter={(value) => value.toLocaleString()}
              yAxisWidth={60}
              showAnimation
              stack={false}
            />
          </CardContent>
        </Card>
      )}
      
      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          data={reportData}
          loading={loading}
          rowKey="date"
          emptyText="请选择日期范围查询数据"
        />
      </Card>
    </div>
  )
}
