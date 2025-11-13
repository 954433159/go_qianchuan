import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAgentAdvertiserList, AgentAdvertiser } from '@/api/advertiser'
import { PageHeader, Card, CardContent, EmptyState, Loading } from '@/components/ui'
import DataTable, { ColumnDef } from '@/components/ui/DataTable'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Building, Users } from 'lucide-react'

export default function AccountAgentAdvertisers() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [advertiserList, setAdvertiserList] = useState<AgentAdvertiser[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const agentIdParam = searchParams.get('agent_id')
    const agentId = agentIdParam ? Number(agentIdParam) : user?.advertiserId
    
    if (agentId) {
      fetchAdvertiserList(agentId)
    }
  }, [searchParams, user])

  const fetchAdvertiserList = async (agentId: number) => {
    setLoading(true)
    try {
      const data = await getAgentAdvertiserList(agentId)
      setAdvertiserList(data.list)
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to fetch advertiser list:', error)
      toast.error('加载广告主列表失败')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<AgentAdvertiser>[] = [
    {
      key: 'advertiser_id',
      label: '广告主ID',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-sm">{row.advertiser_id}</span>
      ),
    },
    {
      key: 'advertiser_name',
      label: '广告主名称',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{row.advertiser_name}</span>
        </div>
      ),
    },
    {
      key: 'company',
      label: '公司名称',
      sortable: true,
    },
    {
      key: 'status',
      label: '状态',
      render: (_, row) => {
        const isActive = row.status === 'ACTIVE'
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? '正常' : '已停用'}
          </span>
        )
      },
    },
  ]

  if (loading) {
    return <Loading fullScreen text="加载中..." size="lg" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="代理商广告主列表"
        description={`查看代理商账户关联的广告主 (共 ${total} 个)`}
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/account-center' },
          { label: '代理商广告主' },
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          {advertiserList.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="暂无广告主"
              description="该代理商账户暂无关联的广告主"
            />
          ) : (
            <DataTable<AgentAdvertiser>
              columns={columns}
              data={advertiserList}
              searchable
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
