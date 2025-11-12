import { useState, useEffect } from 'react'
import { Download, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { getFinanceDetail, FinanceDetail, GetFinanceDetailParams } from '@/api/finance'
import { useAdvertiserStore } from '@/store/advertiserStore'
import { toast } from '@/components/ui/Toast'
import { SkeletonList } from '@/components/ui'
import Pagination from '@/components/ui/Pagination'

export default function FinanceTransactions() {
  const { currentAdvertiser } = useAdvertiserStore()
  const [transactions, setTransactions] = useState<FinanceDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // 筛选条件
  const [filters, setFilters] = useState({
    tradeType: '',
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate()
  })

  // 统计数据
  const [statistics, setStatistics] = useState({
    totalRecharge: 250000,
    totalConsume: 182345,
    totalRefund: 3240,
    totalCount: 588
  })

  useEffect(() => {
    if (currentAdvertiser) {
      fetchTransactions()
    }
  }, [currentAdvertiser, currentPage])

  function getDefaultStartDate() {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  }

  function getDefaultEndDate() {
    return new Date().toISOString().split('T')[0]
  }

  const fetchTransactions = async () => {
    if (!currentAdvertiser) return
    
    setLoading(true)
    try {
      const params: GetFinanceDetailParams = {
        advertiser_id: currentAdvertiser.id,
        start_time: filters.startDate,
        end_time: filters.endDate,
        page: currentPage,
        page_size: pageSize
      }

      if (filters.tradeType) {
        params.trade_type = [filters.tradeType]
      }

      const { list, total } = await getFinanceDetail(params)
      setTransactions(list)
      setTotal(total)
    } catch (error) {
      toast.error('获取财务流水失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchTransactions()
  }

  const handleExport = () => {
    toast.info('导出功能开发中')
  }

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case 'RECHARGE':
        return { label: '充值', color: 'bg-green-100 text-green-700' }
      case 'CONSUME':
        return { label: '消耗', color: 'bg-red-100 text-red-700' }
      case 'REFUND':
        return { label: '退款', color: 'bg-orange-100 text-orange-700' }
      case 'TRANSFER':
        return { label: '转账', color: 'bg-blue-100 text-blue-700' }
      default:
        return { label: type, color: 'bg-gray-100 text-gray-700' }
    }
  }

  const getAmountColor = (type: string) => {
    if (type === 'RECHARGE' || type === 'REFUND') return 'text-green-600'
    if (type === 'CONSUME') return 'text-red-600'
    return 'text-gray-900'
  }

  const getAmountPrefix = (type: string) => {
    if (type === 'RECHARGE' || type === 'REFUND') return '+'
    if (type === 'CONSUME') return '-'
    return ''
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="💳 财务流水"
        description="查看所有账户交易记录"
      >
        <button 
          onClick={handleExport}
          className="qc-btn qc-btn-primary"
        >
          <Download className="w-5 h-5 mr-2" />
          导出流水
        </button>
      </PageHeader>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="qc-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">本月充值</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-green-600">
            +{formatAmount(statistics.totalRecharge)}
          </p>
          <p className="text-xs text-gray-500 mt-1">12笔交易</p>
        </div>
        
        <div className="qc-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">本月消耗</p>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-red-600">
            -{formatAmount(statistics.totalConsume)}
          </p>
          <p className="text-xs text-gray-500 mt-1">568笔交易</p>
        </div>
        
        <div className="qc-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">本月退款</p>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-orange-600">
            +{formatAmount(statistics.totalRefund)}
          </p>
          <p className="text-xs text-gray-500 mt-1">8笔交易</p>
        </div>
        
        <div className="qc-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">总交易笔数</p>
          </div>
          <p className="text-2xl font-bold font-mono text-gray-900">
            {statistics.totalCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">本月统计</p>
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交易类型
              </label>
              <select 
                className="qc-input"
                value={filters.tradeType}
                onChange={(e) => setFilters({ ...filters, tradeType: e.target.value })}
              >
                <option value="">全部类型</option>
                <option value="RECHARGE">充值</option>
                <option value="CONSUME">消耗</option>
                <option value="REFUND">退款</option>
                <option value="TRANSFER">转账</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始时间
              </label>
              <input 
                type="date" 
                className="qc-input"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束时间
              </label>
              <input 
                type="date" 
                className="qc-input"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            
            <div className="md:col-span-2 flex items-end">
              <button 
                onClick={handleSearch}
                className="qc-btn qc-btn-primary w-full"
              >
                <Search className="w-5 h-5 mr-2" />
                查询
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 流水列表 */}
      <Card>
        <CardHeader>
          <CardTitle>交易流水</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonList items={10} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="qc-table">
                  <thead>
                    <tr>
                      <th>交易流水号</th>
                      <th>交易时间</th>
                      <th>交易类型</th>
                      <th>金额</th>
                      <th>余额</th>
                      <th>交易说明</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-gray-500">
                          暂无交易记录
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => {
                        const typeInfo = getTransactionTypeInfo(transaction.trade_type)
                        return (
                          <tr key={transaction.trade_no}>
                            <td className="font-mono text-xs">
                              {transaction.trade_no}
                            </td>
                            <td className="font-mono text-sm">
                              {new Date(transaction.trade_time).toLocaleString('zh-CN')}
                            </td>
                            <td>
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </td>
                            <td className={`font-mono font-semibold ${getAmountColor(transaction.trade_type)}`}>
                              {getAmountPrefix(transaction.trade_type)}{formatAmount(transaction.amount)}
                            </td>
                            <td className="font-mono text-sm text-gray-600">
                              {formatAmount(transaction.balance_after)}
                            </td>
                            <td className="text-gray-600">
                              {transaction.remark || transaction.trade_type_name}
                            </td>
                            <td>
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                已完成
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {total > 0 && (
                <div className="mt-6">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
