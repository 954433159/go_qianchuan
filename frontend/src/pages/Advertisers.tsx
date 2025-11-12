import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdvertiserList } from '@/api/advertiser'
import { Advertiser } from '@/api/types'
import { Building2, DollarSign, CheckCircle, XCircle, Eye, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent, PageHeader, Loading, Button, DataTable, FilterPanel, Drawer } from '@/components/ui'
import type { ColumnDef, FilterField } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export default function Advertisers() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<Advertiser[]>([])
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({})
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null)
  
  useEffect(() => {
    fetchAdvertisers()
  }, [])
  
  const fetchAdvertisers = async () => {
    setLoading(true)
    try {
      const response = await getAdvertiserList({ page: 1, page_size: 20 })
      setAdvertisers(response.list || [])
    } catch (error) {
      console.error('Failed to fetch advertisers:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filterFields: FilterField[] = [
    {
      key: 'name',
      label: '广告主名称',
      type: 'text',
      placeholder: '请输入广告主名称',
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 'ENABLE' },
        { label: '禁用', value: 'DISABLE' },
      ],
    },
    {
      key: 'minBalance',
      label: '最小余额',
      type: 'number',
      placeholder: '请输入最小余额',
    },
    {
      key: 'createTime',
      label: '创建时间',
      type: 'dateRange',
    },
  ]

  const statsData = [
    {
      title: '总账户数',
      value: advertisers.length,
      icon: Building2,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: '启用账户',
      value: advertisers.filter(a => a.status === 'ENABLE').length,
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: '总余额',
      value: `¥${advertisers.reduce((sum, a) => sum + a.balance, 0).toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  const handleViewDetails = (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser)
    setDrawerOpen(true)
  }

  const handleBatchExport = () => {
    if (selectedAdvertisers.length === 0) {
      return
    }
    success(`已导出 ${selectedAdvertisers.length} 个广告主数据`)
  }

  const columns: ColumnDef<Advertiser>[] = [
    {
      key: 'id',
      label: '广告主 ID',
      dataIndex: 'id',
      width: '120px',
      sortable: true,
    },
    {
      key: 'name',
      label: '名称',
      dataIndex: 'name',
      sortable: true,
    },
    {
      key: 'company',
      label: '公司',
      dataIndex: 'company',
    },
    {
      key: 'balance',
      label: '余额',
      dataIndex: 'balance',
      sortable: true,
      align: 'right',
      render: (value) => `¥${(value as number).toLocaleString()}`,
    },
    {
      key: 'status',
      label: '状态',
      dataIndex: 'status',
      render: (value) => (value as string) === 'ENABLE' ? (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          启用
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          <XCircle className="w-3 h-3 mr-1" />
          禁用
        </span>
      )
    },
    {
      key: 'create_time',
      label: '创建时间',
      dataIndex: 'create_time',
      sortable: true,
    },
    {
      key: 'actions',
      label: '操作',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(record)}
          >
            <Eye className="h-4 w-4 mr-1" />
            查看
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载中..." />
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="广告主管理"
        description="管理您的广告主账户"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '广告主管理' }
        ]}
      />
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
      ))}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onApply={fetchAdvertisers}
        onReset={() => {
          setFilterValues({})
          fetchAdvertisers()
        }}
      />

      {/* Batch Actions */}
      {selectedAdvertisers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                已选择 {selectedAdvertisers.length} 个广告主
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBatchExport}>
                  <Download className="h-4 w-4 mr-2" />
                  批量导出
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedAdvertisers([])}>
                  取消选择
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={advertisers}
          loading={loading}
          selectable
          searchable
          onSelectionChange={setSelectedAdvertisers}
          rowKey="id"
        />
      </Card>

      {/* Details Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="广告主详情"
        size="lg"
      >
        {selectedAdvertiser && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">基本信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">广告主 ID</span>
                  <span className="font-medium">{selectedAdvertiser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">名称</span>
                  <span className="font-medium">{selectedAdvertiser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">公司</span>
                  <span className="font-medium">{selectedAdvertiser.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">余额</span>
                  <span className="font-medium text-lg">¥{selectedAdvertiser.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">状态</span>
                  <span>
                    {selectedAdvertiser.status === 'ENABLE' ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        启用
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        禁用
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span className="font-medium">{selectedAdvertiser.create_time}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">快速操作</h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate(`/advertisers/${selectedAdvertiser.id}`)
                    setDrawerOpen(false)
                  }}
                >
                  查看完整信息
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate(`/campaigns?advertiser_id=${selectedAdvertiser.id}`)
                    setDrawerOpen(false)
                  }}
                >
                  查看广告计划
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    success('刷新账户数据')
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新数据
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
