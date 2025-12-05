import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
// Note: getAgentInfo can be used when API is fully implemented
import { Building2, Users, DollarSign, ArrowLeft, TrendingUp } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Badge } from '@/components/ui'

interface AgentDetail {
  agent_id: string
  agent_name: string
  company_name: string
  contact_name: string
  contact_phone: string
  advertiser_count: number
  total_balance: number
  auth_scope: string
  fund_transfer_enabled: boolean
  create_time: string
}

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState<AgentDetail | null>(null)

  useEffect(() => {
    if (id) {
      fetchAgentDetail(id)
    }
  }, [id])

  const fetchAgentDetail = async (agentId: string) => {
    setLoading(true)
    try {
      // Mock数据
      const mockAgent: AgentDetail = {
        agent_id: agentId,
        agent_name: '星河传媒代理商',
        company_name: 'XX营销科技有限公司',
        contact_name: '张三',
        contact_phone: '13800138000',
        advertiser_count: 8,
        total_balance: 125000,
        auth_scope: 'FULL_AUTH',
        fund_transfer_enabled: true,
        create_time: '2023-01-10 09:00:00'
      }
      setAgent(mockAgent)
    } catch (error) {
      console.error('Failed to fetch agent detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading size="lg" text="加载代理商详情..." />
  }

  if (!agent) {
    return <div>代理商不存在</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={agent.agent_name}
        description={`代理商ID: ${agent.agent_id}`}
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/advertisers' },
          { label: '代理商详情' }
        ]}
        actions={
          <Link to="/advertisers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Button>
          </Link>
        }
      />

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>代理商信息</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">代理商名称</p>
              <p className="font-medium">{agent.agent_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">公司名称</p>
              <p className="font-medium">{agent.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">代理商ID</p>
              <p className="font-mono text-sm">{agent.agent_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">联系人</p>
              <p className="font-medium">{agent.contact_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">联系电话</p>
              <p className="font-medium">{agent.contact_phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">创建时间</p>
              <p className="font-medium">{agent.create_time}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">管理广告账户</p>
                <p className="text-2xl font-bold">{agent.advertiser_count}</p>
                <p className="text-xs text-muted-foreground mt-1">个账户</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">账户总余额</p>
                <p className="text-2xl font-bold">¥{agent.total_balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">合计余额</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">授权范围</p>
                <p className="text-2xl font-bold">
                  {agent.auth_scope === 'FULL_AUTH' ? '全部权限' : '部分权限'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">权限级别</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authorization Info */}
      <Card>
        <CardHeader>
          <CardTitle>权限信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">授权范围</span>
                <Badge className="bg-green-100 text-green-800">
                  {agent.auth_scope === 'FULL_AUTH' ? '全部权限' : '部分权限'}
                </Badge>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 广告账户管理</li>
                <li>• 广告计划创建/编辑</li>
                <li>• 数据报表查看</li>
                <li>• 素材管理</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">资金转账</span>
                <Badge className={agent.fund_transfer_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {agent.fund_transfer_enabled ? '已开启' : '未开启'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {agent.fund_transfer_enabled 
                  ? '可向下属广告账户转账、退款' 
                  : '无法进行资金操作'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertiser List */}
      <Card>
        <CardHeader>
          <CardTitle>下属广告主列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: '客户A', id: '111222', balance: 35000, status: 'ENABLE' },
              { name: '客户B', id: '333444', balance: 28000, status: 'ENABLE' },
              { name: '客户C', id: '555666', balance: 42000, status: 'ENABLE' },
              { name: '客户D', id: '777888', balance: 20000, status: 'DISABLE' }
            ].map((adv, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{adv.name}</div>
                  <div className="text-sm text-gray-500">ID: {adv.id}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">账户余额</div>
                    <div className="font-semibold">¥{adv.balance.toLocaleString()}</div>
                  </div>
                  <Badge className={adv.status === 'ENABLE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {adv.status === 'ENABLE' ? '启用' : '禁用'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/advertisers/${adv.id}`)}>查看</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fund Management */}
      <Card>
        <CardHeader>
          <CardTitle>资金管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button disabled={!agent.fund_transfer_enabled} onClick={() => navigate('/finance/transfer')}>
              <DollarSign className="h-4 w-4 mr-2" />
              向广告主转账
            </Button>
            <Button variant="outline" disabled={!agent.fund_transfer_enabled} onClick={() => navigate('/finance/refund')}>
              退款申请
            </Button>
            <Button variant="outline" onClick={() => navigate('/finance/transactions')}>
              查看流水记录
            </Button>
          </div>
          {!agent.fund_transfer_enabled && (
            <p className="text-sm text-orange-600 mt-4">
              ⚠️ 资金转账功能未开启，如需开启请联系平台管理员
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => toast.info('权限管理功能开发中')}>
              权限管理
            </Button>
            <Button variant="outline" onClick={() => toast.info('修改联系方式功能开发中')}>
              修改联系方式
            </Button>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => toast.warning('解除代理商授权功能开发中')}>
              解除代理商授权
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
