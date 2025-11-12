import { useEffect, useState } from 'react'
import { FileText, Download, Filter, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { getActivityList, Activity } from '@/api/activity'
import { useAuthStore } from '@/store/authStore'

// 使用API定义的Activity类型
type OperationLogItem = Activity & {
  operation_type?: string
  operation_name?: string
  operator?: string
  operator_id?: string
  target_type?: string
  target_id?: string
  target_name?: string
  ip_address?: string
  result?: 'success' | 'failed'
  error_message?: string
}

export default function OperationLog() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<OperationLogItem[]>([])
  const [filteredLogs, setFilteredLogs] = useState<OperationLogItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterResult, setFilterResult] = useState('all')
  const [dateRange, setDateRange] = useState('7')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<OperationLogItem | null>(null)
  const [total, setTotal] = useState(0)

  const itemsPerPage = 20

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterType, dateRange])

  useEffect(() => {
    applyFilters()
  }, [logs, searchTerm, filterType, filterResult, dateRange])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await getActivityList({
        page: currentPage,
        page_size: itemsPerPage,
        type: filterType === 'all' ? undefined : filterType
      })
      
      // 映射Activity到OperationLogItem格式
      const mappedLogs: OperationLogItem[] = response.list.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        status: activity.status,
        resource_id: activity.resource_id,
        resource_type: activity.resource_type,
        created_at: activity.created_at,
        operation_type: activity.type,
        operation_name: activity.title,
        operator: user?.name || '未知',
        operator_id: user?.id?.toString() || '',
        target_type: activity.resource_type,
        target_id: activity.resource_id.toString(),
        target_name: activity.description || activity.title,
        ip_address: '127.0.0.1',
        result: activity.status === 'success' ? 'success' : 'failed',
        error_message: activity.status === 'error' ? activity.description : undefined
      }))
      
      setLogs(mappedLogs)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      // 失败时显示空列表而不是Mock数据
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    if (searchTerm) {
      filtered = filtered.filter(log =>
        (log.operation_name?.includes(searchTerm) ?? false) ||
        (log.operator?.includes(searchTerm) ?? false) ||
        (log.target_name?.includes(searchTerm) ?? false)
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.operation_type === filterType || log.type === filterType)
    }

    if (filterResult !== 'all') {
      filtered = filtered.filter(log => log.result === filterResult)
    }

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const exportLogs = () => {
    // 实际实现应该调用导出API
    const csvContent = [
      ['时间', '操作类型', '操作人', 'IP地址', '目标对象', '结果'].join(','),
      ...filteredLogs.map(log =>
        [
          log.created_at,
          log.operation_name || log.title,
          log.operator || '未知',
          log.ip_address || 'N/A',
          log.target_name || log.description,
          log.result === 'success' ? '成功' : '失败'
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `operation_logs_${new Date().getTime()}.csv`
    link.click()
  }

  const getOperationTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      campaign_create: '创建计划',
      budget_update: '预算修改',
      ad_pause: '广告暂停',
      account_login: '账户登录',
      material_upload: '素材上传'
    }
    return typeMap[type] || type
  }

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return <Loading size="lg" text="加载操作日志..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="操作日志"
        description="查看和管理账户操作记录"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/advertisers' },
          { label: '操作日志' }
        ]}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">总操作数</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">成功操作</p>
              <p className="text-2xl font-bold text-green-600">
                {logs.filter(l => l.result === 'success').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">失败操作</p>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.result === 'failed').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">成功率</p>
              <p className="text-2xl font-bold">
                {logs.length > 0 ? ((logs.filter(l => l.result === 'success').length / logs.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索操作人、操作类型或目标对象..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="操作类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="campaign_create">创建计划</SelectItem>
                <SelectItem value="budget_update">预算修改</SelectItem>
                <SelectItem value="ad_pause">广告暂停</SelectItem>
                <SelectItem value="account_login">账户登录</SelectItem>
                <SelectItem value="material_upload">素材上传</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="结果状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">今天</SelectItem>
                <SelectItem value="7">近7天</SelectItem>
                <SelectItem value="30">近30天</SelectItem>
                <SelectItem value="90">近90天</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>操作记录 ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>暂无操作日志</p>
              </div>
            ) : (
              currentLogs.map(log => (
                <div
                  key={log.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={log.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {log.result === 'success' ? '成功' : '失败'}
                        </Badge>
                        <span className="font-medium">{log.operation_name || log.title}</span>
                        <Badge variant="outline">{getOperationTypeLabel(log.operation_type || log.type)}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">操作人：</span>
                          <span className="font-medium">{log.operator || '未知'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">目标对象：</span>
                          <span className="font-medium truncate">{log.target_name || log.description}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">IP地址：</span>
                          <span className="font-mono">{log.ip_address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">操作时间：</span>
                          <span>{log.created_at}</span>
                        </div>
                      </div>
                      {log.error_message && (
                        <div className="mt-2 text-sm text-red-600">
                          错误信息：{log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} 条，共 {filteredLogs.length} 条
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
          <Card className="w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>操作详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">操作类型</p>
                    <p className="font-medium">{selectedLog.operation_name || selectedLog.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">执行结果</p>
                    <Badge className={selectedLog.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedLog.result === 'success' ? '成功' : '失败'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">操作人</p>
                    <p className="font-medium">{selectedLog.operator || '未知'} {selectedLog.operator_id && `(${selectedLog.operator_id})`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">操作时间</p>
                    <p className="font-medium">{selectedLog.created_at}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">目标类型</p>
                    <p className="font-medium">{selectedLog.target_type || selectedLog.resource_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">目标对象</p>
                    <p className="font-medium">{selectedLog.target_name || selectedLog.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">目标ID</p>
                    <p className="font-mono text-sm">{selectedLog.target_id || selectedLog.resource_id.toString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">IP地址</p>
                    <p className="font-mono">{selectedLog.ip_address || 'N/A'}</p>
                  </div>
                </div>
                {selectedLog.error_message && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">错误信息</p>
                    <p className="text-sm text-red-600">{selectedLog.error_message}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedLog(null)}>关闭</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
