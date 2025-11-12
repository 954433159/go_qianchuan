import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCreativeList, updateCreativeStatus } from '@/api/creative'
import { Creative } from '@/api/types'
import { Button, PageHeader, Card, Loading, EmptyState, Badge, DataTable, FilterPanel, Dialog, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import type { ColumnDef, FilterField } from '@/components/ui'
import { Plus, Image as ImageIcon, Video, Eye, Download, Trash2, Play, Pause } from 'lucide-react'
import CreativeUploadDialog from '@/components/creative/CreativeUploadDialog'
import { useToast } from '@/hooks/useToast'

export default function Creatives() {
  const { success } = useToast()
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdvertiserId] = useState(1)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null)
  const [selectedCreatives, setSelectedCreatives] = useState<Creative[]>([])
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({})
  const [activeTab, setActiveTab] = useState('all')
  
  const fetchCreatives = async () => {
    setLoading(true)
    try {
      const data = await getCreativeList({
        advertiser_id: selectedAdvertiserId,
        page: 1,
        page_size: 20
      })
      setCreatives(data.list || [])
    } catch (error) {
      console.error('Failed to fetch creatives:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCreatives()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAdvertiserId])

  const filterFields: FilterField[] = [
    {
      key: 'title',
      label: '创意标题',
      type: 'text',
      placeholder: '请输入创意标题',
    },
    {
      key: 'material_type',
      label: '素材类型',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '视频', value: 'VIDEO' },
        { label: '图片', value: 'IMAGE' },
      ],
    },
    {
      key: 'audit_status',
      label: '审核状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '已通过', value: 'PASSED' },
        { label: '审核中', value: 'PENDING' },
        { label: '已拒绝', value: 'REJECTED' },
      ],
    },
    {
      key: 'createTime',
      label: '创建时间',
      type: 'dateRange',
    },
  ]

  const handlePreview = (creative: Creative) => {
    setSelectedCreative(creative)
    setPreviewDialogOpen(true)
  }

  const handleBatchDelete = async () => {
    if (selectedCreatives.length === 0) return
    try {
      await updateCreativeStatus({
        advertiser_id: selectedAdvertiserId,
        creative_ids: selectedCreatives.map(c => Number(c.id)),
        opt_status: 'DELETE'
      })
      success(`已删除 ${selectedCreatives.length} 个创意`)
      setCreatives(creatives.filter(c => !selectedCreatives.find(sc => sc.id === c.id)))
      setSelectedCreatives([])
    } catch (error) {
      console.error('Failed to delete creatives:', error)
    }
  }

  const handleBatchEnable = async () => {
    if (selectedCreatives.length === 0) return
    try {
      await updateCreativeStatus({
        advertiser_id: selectedAdvertiserId,
        creative_ids: selectedCreatives.map(c => Number(c.id)),
        opt_status: 'ENABLE'
      })
      success(`已启用 ${selectedCreatives.length} 个创意`)
      fetchCreatives()
      setSelectedCreatives([])
    } catch (error) {
      console.error('Failed to enable creatives:', error)
    }
  }

  const handleBatchDisable = async () => {
    if (selectedCreatives.length === 0) return
    try {
      await updateCreativeStatus({
        advertiser_id: selectedAdvertiserId,
        creative_ids: selectedCreatives.map(c => Number(c.id)),
        opt_status: 'DISABLE'
      })
      success(`已暂停 ${selectedCreatives.length} 个创意`)
      fetchCreatives()
      setSelectedCreatives([])
    } catch (error) {
      console.error('Failed to disable creatives:', error)
    }
  }
  
  const filteredCreatives = creatives.filter(creative => {
    if (activeTab === 'all') return true
    if (activeTab === 'video') return creative.material_type === 'VIDEO'
    if (activeTab === 'image') return creative.material_type === 'IMAGE'
    return true
  })

  const columns: ColumnDef<Creative>[] = [
    {
      key: 'id',
      label: '创意ID',
      dataIndex: 'id',
      width: '120px',
      sortable: true,
    },
    {
      key: 'title',
      label: '创意标题',
      dataIndex: 'title',
      sortable: true,
    },
    {
      key: 'ad_id',
      label: '所属广告',
      dataIndex: 'ad_id',
    },
    {
      key: 'material_type',
      label: '素材类型',
      dataIndex: 'material_type',
      render: (value) => {
        if (value === 'VIDEO') {
          return (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              <Video className="w-4 h-4 mr-1" />
              视频
            </Badge>
          )
        }
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <ImageIcon className="w-4 h-4 mr-1" />
            图片
          </Badge>
        )
      }
    },
    {
      key: 'status',
      label: '审核状态',
      dataIndex: 'audit_status',
      render: (value) => {
        const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
          PASSED: { label: '已通过', variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
          PENDING: { label: '审核中', variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
          REJECTED: { label: '已拒绝', variant: 'destructive' }
        }
        const status = statusMap[value as string] || statusMap.PENDING
        return (
          <Badge variant={status.variant} className={status.className}>
            {status.label}
          </Badge>
        )
      }
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
            onClick={() => handlePreview(record)}
          >
            <Eye className="h-4 w-4 mr-1" />
            预览
          </Button>
        </div>
      )
    }
  ]
  
  if (loading && creatives.length === 0) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="创意管理" 
        description="管理您的广告创意素材"
        actions={
          <div className="flex gap-2">
            <Link to="/creatives/upload">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                上传创意(页面)
              </Button>
            </Link>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              上传创意(快捷)
            </Button>
          </div>
        }
      />

      {/* Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="video">视频</TabsTrigger>
          <TabsTrigger value="image">图片</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter Panel */}
      <FilterPanel
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onApply={fetchCreatives}
        onReset={() => {
          setFilterValues({})
          fetchCreatives()
        }}
      />

      {/* Batch Actions */}
      {selectedCreatives.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                已选择 {selectedCreatives.length} 个创意
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBatchEnable}>
                  <Play className="h-4 w-4 mr-2" />
                  批量启用
                </Button>
                <Button size="sm" variant="outline" onClick={handleBatchDisable}>
                  <Pause className="h-4 w-4 mr-2" />
                  批量暂停
                </Button>
                <Button size="sm" variant="outline" onClick={() => success('批量下载已启动')}>
                  <Download className="h-4 w-4 mr-2" />
                  批量下载
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedCreatives([])}>
                  取消选择
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {filteredCreatives.length === 0 && !loading ? (
        <EmptyState
          icon={<ImageIcon className="h-12 w-12" />}
          title="暂无创意"
          description="点击上方按钮上传您的第一个创意素材"
        />
      ) : (
        <Card>
          <DataTable
            columns={columns}
            data={filteredCreatives}
            loading={loading}
            selectable
            searchable
            onSelectionChange={setSelectedCreatives}
            rowKey="id"
          />
        </Card>
      )}

      <CreativeUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        advertiserId={selectedAdvertiserId}
        onSuccess={fetchCreatives}
      />

      {/* Preview Dialog */}
      {previewDialogOpen && selectedCreative && (
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <div className="fixed inset-0 z-50 bg-black/50" />
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">创意预览</h3>

              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {selectedCreative.material_type === 'VIDEO' ? (
                    selectedCreative.video_url ? (
                      <video 
                        src={selectedCreative.video_url} 
                        controls 
                        className="w-full h-full object-contain"
                        poster={selectedCreative.image_url}
                      >
                        <source src={selectedCreative.video_url} type="video/mp4" />
                        您的浏览器不支持视频播放
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">视频地址不可用</p>
                        </div>
                      </div>
                    )
                  ) : (
                    selectedCreative.image_url || (selectedCreative.image_urls && selectedCreative.image_urls[0]) ? (
                      <img 
                        src={selectedCreative.image_url || selectedCreative.image_urls?.[0]} 
                        alt={selectedCreative.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">图片地址不可用</p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">创意 ID</span>
                    <span className="text-sm font-medium">{selectedCreative.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">标题</span>
                    <span className="text-sm font-medium">{selectedCreative.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">素材类型</span>
                    <span className="text-sm font-medium">{selectedCreative.material_type === 'VIDEO' ? '视频' : '图片'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">审核状态</span>
                    <Badge variant="secondary">
                      {selectedCreative.audit_status === 'PASSED' ? '已通过' : selectedCreative.audit_status === 'PENDING' ? '审核中' : '已拒绝'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
