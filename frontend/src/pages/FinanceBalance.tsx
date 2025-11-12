import { useState, useEffect } from 'react'
import { RefreshCw, Wallet, TrendingUp, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { getBalance, Balance } from '@/api/finance'
import { useAdvertiserStore } from '@/store/advertiserStore'
import { toast } from '@/components/ui/Toast'
import { SkeletonList } from '@/components/ui'

export default function FinanceBalance() {
  const { currentAdvertiser } = useAdvertiserStore()
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (currentAdvertiser) {
      fetchBalance()
    }
  }, [currentAdvertiser])

  const fetchBalance = async () => {
    if (!currentAdvertiser) return
    
    setLoading(true)
    try {
      const data = await getBalance(currentAdvertiser.id)
      setBalance(data)
    } catch (error) {
      toast.error('获取余额信息失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchBalance()
    setRefreshing(false)
    toast.success('余额已刷新')
  }

  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="💳 余额查询"
        description="查看账户实时余额信息"
      >
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="qc-btn qc-btn-primary"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '刷新中...' : '刷新余额'}
        </button>
      </PageHeader>

      {loading ? (
        <SkeletonList items={3} />
      ) : balance ? (
        <>
          {/* 总余额卡片 */}
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white text-opacity-90 text-sm font-medium mb-2">账户总余额</h3>
                  <div className="text-5xl font-bold font-mono mb-1">
                    ¥{formatAmount(balance.balance)}
                  </div>
                  <p className="text-white text-opacity-75 text-sm">
                    广告主ID: {balance.advertiser_id}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white border-opacity-20">
                <div>
                  <p className="text-white text-opacity-75 text-xs mb-1">现金余额</p>
                  <p className="text-2xl font-bold">¥{formatAmount(balance.cash)}</p>
                </div>
                <div>
                  <p className="text-white text-opacity-75 text-xs mb-1">赠款余额</p>
                  <p className="text-2xl font-bold">¥{formatAmount(balance.grant)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 可用余额详情 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  可用余额
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ¥{formatAmount(balance.valid_balance)}
                </div>
                <p className="text-sm text-gray-600">
                  可用于广告投放的余额
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">总余额</span>
                    <span className="font-semibold">¥{formatAmount(balance.balance)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">可用余额</span>
                    <span className="font-semibold text-green-600">¥{formatAmount(balance.valid_balance)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  更新时间
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {new Date(balance.update_time).toLocaleString('zh-CN')}
                </div>
                <p className="text-sm text-gray-600">
                  最后更新时间
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      💡 余额数据每5分钟自动更新一次，如需查看最新余额请点击"刷新余额"按钮
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 余额构成详情 */}
          <Card>
            <CardHeader>
              <CardTitle>💰 余额构成详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 现金余额 */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-2xl">💵</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">现金余额</h4>
                      <p className="text-xs text-gray-600">充值或转账获得的现金</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ¥{formatAmount(balance.cash)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {((balance.cash / balance.balance) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* 赠款余额 */}
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">赠款余额</h4>
                      <p className="text-xs text-gray-600">平台赠送的推广金</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      ¥{formatAmount(balance.grant)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {((balance.grant / balance.balance) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* 余额使用说明 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 余额使用说明</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>现金余额优先使用，用完后自动使用赠款余额</li>
                    <li>赠款余额仅限用于广告投放，不可提现</li>
                    <li>部分赠款可能有使用期限，请及时使用</li>
                    <li>可用余额 = 现金余额 + 赠款余额 - 冻结金额</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ 快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="qc-btn qc-btn-secondary justify-center">
                  充值
                </button>
                <button className="qc-btn qc-btn-secondary justify-center">
                  查看流水
                </button>
                <button className="qc-btn qc-btn-secondary justify-center">
                  转账记录
                </button>
                <button className="qc-btn qc-btn-secondary justify-center">
                  退款记录
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无余额信息</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

