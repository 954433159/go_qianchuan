import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Wallet, TrendingUp, ArrowUpRight, Clock, 
  CreditCard, Gift, DollarSign, FileText 
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { BarChart } from '@tremor/react'
import { getWalletInfo, getFinanceDetail, Wallet as WalletType, FinanceDetail } from '@/api/finance'
import { useAdvertiserStore } from '@/store/advertiserStore'
import { toast } from '@/components/ui/Toast'
import { SkeletonList } from '@/components/ui'

export default function FinanceWallet() {
  const { currentAdvertiser } = useAdvertiserStore()
  const [wallet, setWallet] = useState<WalletType | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<FinanceDetail[]>([])
  const [trendData, setTrendData] = useState<Array<{ date: string; 余额: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentAdvertiser) {
      fetchWalletData()
      fetchRecentTransactions()
      fetchBalanceTrend()
    }
  }, [currentAdvertiser])

  const fetchWalletData = async () => {
    if (!currentAdvertiser) return
    
    try {
      const data = await getWalletInfo(currentAdvertiser.id)
      setWallet(data)
    } catch (error) {
      toast.error('获取钱包信息失败')
      console.error(error)
    }
  }

  const fetchRecentTransactions = async () => {
    if (!currentAdvertiser) return
    
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      
      const { list } = await getFinanceDetail({
        advertiser_id: currentAdvertiser.id,
        start_time: startDate.toISOString().split('T')[0] ?? '',
        end_time: endDate.toISOString().split('T')[0] ?? '',
        page: 1,
        page_size: 5
      })
      setRecentTransactions(list)
    } catch (error) {
      console.error('获取交易记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取余额趋势数据（30天）
  const fetchBalanceTrend = async () => {
    if (!currentAdvertiser) return
    
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      // TODO: 如果有专门的趋势数据API，在此调用
      // const trend = await getBalanceTrend({ advertiser_id, start_date, end_date })
      
      // 使用交易记录构造趋势数据
      const { list } = await getFinanceDetail({
        advertiser_id: currentAdvertiser.id,
        start_time: startDate.toISOString().split('T')[0] ?? '',
        end_time: endDate.toISOString().split('T')[0] ?? '',
        page: 1,
        page_size: 30
      })
      
      // 构造趋势图数据
      const trend = list.map(item => ({
        date: new Date(item.trade_time).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        余额: item.balance_after
      }))
      
      // 添加当前余额
      if (wallet) {
        trend.push({
          date: '今天',
          余额: wallet.valid_balance
        })
      }
      
      setTrendData(trend)
    } catch (error) {
      console.error('获取余额趋势失败:', error)
      // 失败时使用空数据
      setTrendData([])
    }
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

  // 计算预计可用天数（假设每天平均消耗）
  const estimatedDays = wallet ? Math.floor(wallet.valid_balance / 8456) : 0

  return (
    <div className="space-y-6">
      <PageHeader 
        title="💰 钱包管理"
        description="管理您的广告账户余额与充值"
      >
        <div className="flex gap-3">
          <Link to="/finance/transactions" className="qc-btn qc-btn-secondary">
            <FileText className="w-5 h-5 mr-2" />
            账单详情
          </Link>
          <button className="qc-btn qc-btn-primary" onClick={() => toast.info('充值功能开发中')}>
            <DollarSign className="w-5 h-5 mr-2" />
            立即充值
          </button>
        </div>
      </PageHeader>

      {/* 钱包余额卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 现金账户 */}
        <div 
          className="lg:col-span-2 p-8 rounded-xl shadow-lg text-white"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-white text-opacity-90 text-sm font-medium mb-2">现金账户余额</h3>
              <div className="text-5xl font-bold font-mono mb-1">
                {wallet ? formatAmount(wallet.cash) : '加载中...'}
              </div>
              <p className="text-white text-opacity-75 text-sm">可用余额</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white border-opacity-20">
            <div>
              <p className="text-white text-opacity-75 text-xs mb-1">冻结金额</p>
              <p className="text-white text-lg font-semibold font-mono">
                {wallet ? formatAmount(wallet.frozen_balance) : '-'}
              </p>
            </div>
            <div>
              <p className="text-white text-opacity-75 text-xs mb-1">今日消耗</p>
              <p className="text-white text-lg font-semibold font-mono">¥8,456</p>
            </div>
            <div>
              <p className="text-white text-opacity-75 text-xs mb-1">预计可用天数</p>
              <p className="text-white text-lg font-semibold font-mono">{estimatedDays} 天</p>
            </div>
          </div>
        </div>

        {/* 赠款账户 */}
        <div className="qc-card qc-card-highlight">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">赠款账户</h3>
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              限定用途
            </span>
          </div>
          <div className="mb-4">
            <div className="text-3xl font-bold font-mono text-gray-900">
              {wallet ? formatAmount(wallet.grant) : '加载中...'}
            </div>
            <p className="text-sm text-gray-600 mt-1">可用赠款余额</p>
          </div>
          <div className="bg-white rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">有效期至</span>
              <span className="font-medium text-gray-900">2025-12-31</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">适用场景</span>
              <span className="font-medium text-red-600">直播推广</span>
            </div>
          </div>
        </div>
      </div>

      {/* 余额趋势与操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 余额趋势图 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>余额变化趋势（近30天）</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-64"
              data={trendData}
              index="date"
              categories={['余额']}
              colors={['red']}
              valueFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
              showAnimation
              showLegend={false}
            />
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <div className="space-y-4">
          <Link to="/finance/transactions" className="block">
            <div className="qc-card qc-card-interactive">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">财务流水</h4>
                  <p className="text-xs text-gray-600">查看所有交易记录</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link to="/finance/balance" className="block">
            <div className="qc-card qc-card-interactive">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">余额查询</h4>
                  <p className="text-xs text-gray-600">实时余额与统计</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* 余额预警 */}
          <div className="qc-card bg-orange-50 border-orange-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-orange-800">余额预警</h3>
                <p className="mt-1 text-xs text-orange-700">
                  按当前消耗速度，账户余额预计可使用 {estimatedDays} 天，建议及时充值
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近交易记录 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>最近交易记录</CardTitle>
            <Link to="/finance/transactions" className="text-sm text-blue-600 hover:text-blue-700">
              查看全部 →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonList items={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="qc-table">
                <thead>
                  <tr>
                    <th>交易时间</th>
                    <th>交易类型</th>
                    <th>金额</th>
                    <th>余额</th>
                    <th>交易说明</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500">
                        暂无交易记录
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((transaction) => {
                      const typeInfo = getTransactionTypeInfo(transaction.trade_type)
                      return (
                        <tr key={transaction.trade_no}>
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
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
