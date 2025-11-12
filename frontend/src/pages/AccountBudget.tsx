import { useEffect, useState } from 'react'
import { getAccountBudget, updateAccountBudget } from '@/api/advertiser'
import { getAdvertiserList } from '@/api/advertiser'
import { Advertiser } from '@/api/types'
import { DollarSign, AlertCircle, TrendingUp, CheckCircle, Edit2, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Progress } from '@/components/ui'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/useToast'

interface BudgetData {
  advertiser: Advertiser
  dailyBudget: number
  todaySpend: number
  percentage: number
  remaining: number
  status: 'normal' | 'warning' | 'danger'
}

interface BudgetTrendData {
  date: string
  budget: number
  spend: number
}

export default function AccountBudget() {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [trendData, setTrendData] = useState<BudgetTrendData[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [filterType, setFilterType] = useState('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchBudgetData()
    generateTrendData()
  }, [])

  const fetchBudgetData = async () => {
    setLoading(true)
    try {
      const response = await getAdvertiserList({ page: 1, page_size: 50 })
      const advertisers = response.list || []
      
      // 模拟预算数据（实际应该从API获取）
      const budgetData: BudgetData[] = advertisers.map((adv, index) => {
        const dailyBudget = [5000, 8000, 3000, 15000, 10000, 6000][index % 6]
        const todaySpend = dailyBudget * (0.5 + Math.random() * 0.5)
        const percentage = (todaySpend / dailyBudget) * 100
        const remaining = dailyBudget - todaySpend
        
        let status: 'normal' | 'warning' | 'danger' = 'normal'
        if (percentage >= 95) status = 'danger'
        else if (percentage >= 80) status = 'warning'
        
        return {
          advertiser: adv,
          dailyBudget,
          todaySpend,
          percentage,
          remaining,
          status
        }
      })
      
      setBudgets(budgetData)
    } catch (err) {
      console.error('Failed to fetch budget data:', err)
      showError('获取预算数据失败')
    } finally {
      setLoading(false)
    }
  }

  const generateTrendData = () => {
    const dates = ['01-14', '01-15', '01-16', '01-17', '01-18', '01-19', '01-20']
    const data: BudgetTrendData[] = dates.map((date, index) => ({
      date,
      budget: 50000 + (index % 2) * 2000,
      spend: 42000 + Math.random() * 10000
    }))
    setTrendData(data)
  }

  const handleEditStart = (budget: BudgetData) => {
    setEditingId(budget.advertiser.id)
    setEditValue(budget.dailyBudget)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue(0)
  }

  const handleEditSave = async (advertiserId: number) => {
    try {
      await updateAccountBudget({
        advertiser_id: advertiserId,
        budget: editValue,
        budget_mode: 'BUDGET_MODE_DAY'
      })
      success('预算更新成功')
      setEditingId(null)
      fetchBudgetData()
    } catch (err) {
      showError('预算更新失败')
    }
  }

  const filteredBudgets = budgets.filter(budget => {
    if (filterType === 'warning' && budget.status === 'normal') return false
    if (filterType === 'danger' && budget.status !== 'danger') return false
    if (searchText && !budget.advertiser.name.includes(searchText) && 
        !budget.advertiser.id.toString().includes(searchText)) return false
    return true
  })

  const totalBudget = budgets.reduce((sum, b) => sum + b.dailyBudget, 0)
  const totalSpend = budgets.reduce((sum, b) => sum + b.todaySpend, 0)
  const totalRemaining = totalBudget - totalSpend
  const alertCount = budgets.filter(b => b.status === 'danger').length

  const statsData = [
    {
      title: '总日预算',
      value: `¥${totalBudget.toLocaleString()}`,
      subtitle: `${budgets.length}个账户合计`,
      icon: DollarSign,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent'
    },
    {
      title: '今日已消耗',
      value: `¥${Math.round(totalSpend).toLocaleString()}`,
      subtitle: `预算执行率 ${((totalSpend / totalBudget) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600'
    },
    {
      title: '今日剩余',
      value: `¥${Math.round(totalRemaining).toLocaleString()}`,
      subtitle: '可用余额',
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600'
    },
    {
      title: '预算告警',
      value: alertCount,
      subtitle: '账户预算不足',
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-950',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600'
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载预算数据..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="💰 账户日预算管理"
        description="设置和管理广告账户的日消耗预算上限"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/advertisers' },
          { label: '预算管理' }
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📈 近7日预算使用趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `¥${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#3b82f6" 
                strokeDasharray="5 5"
                name="设定预算"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="spend" 
                stroke="#f97316" 
                strokeWidth={2}
                name="实际消耗"
                fill="url(#colorSpend)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">全部账户</option>
              <option value="danger">预算告警账户</option>
              <option value="warning">接近上限</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
              <option>账户类型</option>
              <option>店铺账户</option>
              <option>代理商账户</option>
            </select>
            <div className="md:col-span-2">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="搜索账户名称或ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    账户名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    账户ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日预算
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    今日消耗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    消耗占比
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    剩余预算
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBudgets.map((budget) => (
                  <tr key={budget.advertiser.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{budget.advertiser.name}</div>
                      <div className="text-xs text-gray-500">{budget.advertiser.company || '店铺账户'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">
                      {budget.advertiser.id}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === budget.advertiser.id ? (
                        <input
                          type="number"
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          min="0"
                          step="100"
                        />
                      ) : (
                        <span className="font-medium">¥{budget.dailyBudget.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-orange-600">
                      ¥{Math.round(budget.todaySpend).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={budget.percentage} 
                          className="flex-1" 
                          indicatorColor={
                            budget.status === 'danger' ? 'bg-red-500' :
                            budget.status === 'warning' ? 'bg-orange-500' :
                            'bg-green-500'
                          }
                        />
                        <span className={`text-sm font-medium ${
                          budget.status === 'danger' ? 'text-red-600' :
                          budget.status === 'warning' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {budget.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ¥{Math.round(budget.remaining).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {budget.status === 'danger' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          预算告警
                        </span>
                      )}
                      {budget.status === 'warning' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          接近上限
                        </span>
                      )}
                      {budget.status === 'normal' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === budget.advertiser.id ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSave(budget.advertiser.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(budget)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="p-3 bg-blue-500 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 预算优化建议</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {budgets.filter(b => b.status === 'danger').map(b => (
                <li key={b.advertiser.id}>
                  • 【{b.advertiser.name}】预算告警，当前消耗已达{b.percentage.toFixed(1)}%，建议立即调整或追加预算
                </li>
              ))}
              {budgets.filter(b => b.status === 'warning').slice(0, 2).map(b => (
                <li key={b.advertiser.id}>
                  • 【{b.advertiser.name}】今日预算接近用完({b.percentage.toFixed(1)}%)，建议增加日预算以保证投放持续性
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
