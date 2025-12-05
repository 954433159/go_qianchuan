import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdvertiserList, updateAdvertiser } from '@/api/advertiser'
import { Advertiser } from '@/api/types'
import { Building2, DollarSign, CheckCircle, XCircle, Eye, Power, FileDown, Trash2, RefreshCw } from 'lucide-react'
import { Card, CardContent, PageHeader, Loading, Button, DataTable, FilterPanel, Drawer } from '@/components/ui'
import type { ColumnDef, FilterField } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { BatchOperator, BatchAction } from '@/components/common/BatchOperator'

export default function Advertisers() {
  const navigate = useNavigate()
  const { success, error } = useToast()
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
    // 模拟导出CSV
    const csv = [
      ['广告主ID', '名称', '公司', '余额', '状态', '创建时间'],
      ...selectedAdvertisers.map(a => [
        a.id,
        a.name,
        a.company,
        a.balance,
        a.status === 'ENABLE' ? '启用' : '禁用',
        a.create_time
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `advertisers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    success(`已导出 ${selectedAdvertisers.length} 个广告主数据`)
  }

  const handleBatchEnable = async (advertisers: Advertiser[]) => {
    try {
      await Promise.all(
        advertisers.map(a => updateAdvertiser(a.id as unknown as number, { status: 'ENABLE' }))
      )
      success(`已启用 ${advertisers.length} 个广告主`)
      fetchAdvertisers()
    } catch (err) {
      error('批量启用失败')
    }
  }

  const handleBatchDisable = async (advertisers: Advertiser[]) => {
    try {
      await Promise.all(
        advertisers.map(a => updateAdvertiser(a.id as unknown as number, { status: 'DISABLE' }))
      )
      success(`已禁用 ${advertisers.length} 个广告主`)
      fetchAdvertisers()
    } catch (err) {
      error('批量禁用失败')
    }
  }

  const handleBatchDelete = async (advertisers: Advertiser[]) => {
    try {
      // TODO: 调用批量删除 API
      success(`已删除 ${advertisers.length} 个广告主`)
      fetchAdvertisers()
    } catch (err) {
      error('批量删除失败')
    }
  }

  const batchActions: BatchAction<Advertiser>[] = [
    {
      key: 'enable',
      label: '批量启用',
      icon: Power,
      variant: 'default',
      onClick: handleBatchEnable,
      disabled: (items) => items.every(a => a.status === 'ENABLE'),
    },
    {
      key: 'disable',
      label: '批量禁用',
      icon: XCircle,
      variant: 'outline',
      onClick: handleBatchDisable,
      disabled: (items) => items.every(a => a.status === 'DISABLE'),
    },
    {
      key: 'export',
      label: '批量导出',
      icon: FileDown,
      variant: 'outline',
      onClick: handleBatchExport,
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleBatchDelete,
      confirm: {
        title: '确认删除',
        description: '删除后将无法恢复，请谨慎操作。',
      },
    },
  ]

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
      <Card>
        <CardContent className="p-4">
          <BatchOperator
            items={advertisers}
            selectedItems={selectedAdvertisers}
            onSelectionChange={setSelectedAdvertisers}
            actions={batchActions}
            keyExtractor={(item) => item.id}
            disabled={loading}
          />
        </CardContent>
      </Card>
      
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
