import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Table, { TableColumn } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import AudienceDialog from '@/components/audience/AudienceDialog'
import { useAuthStore } from '@/store/authStore'
import { getAudienceList, deleteAudience, Audience } from '@/api/tools'
import { formatDate } from '@/utils/format'
import { showSuccess, showError } from '@/hooks'
import { withLoading } from '@/store/loadingStore'
import { toast } from '@/components/ui/Toast'

export default function Audiences() {
  const { confirm, ConfirmDialog } = useConfirm()
  const { user } = useAuthStore()
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAudience, setEditingAudience] = useState<Audience | null>(null)
  const pageSize = 20

  // 加载人群包列表
  const fetchAudiences = async () => {
    if (!user?.advertiserId) return

    setLoading(true)
    try {
      const { list, total: totalCount } = await withLoading(
        () => getAudienceList({
          advertiser_id: user.advertiserId!,
          page,
          page_size: pageSize,
        }),
        '加载人群包列表...'
      )
      setAudiences(list)
      setTotal(totalCount)
    } catch (error) {
      toast.error('加载人群包列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除人群包
  const handleDelete = async (audienceId: number) => {
    if (!user?.advertiserId) return
    
    const confirmed = await confirm({
      title: '删除人群包',
      description: '确定要删除这个人群包吗？删除后将无法恢复。',
      confirmText: '删除',
      variant: 'destructive',
    })
    
    if (!confirmed) return

    try {
      await withLoading(
        () => deleteAudience(user.advertiserId!, [audienceId]),
        '删除中...'
      )
      toast.success('删除成功')
      fetchAudiences()
    } catch (error) {
      toast.error('删除失败，请稍后重试')
    }
  }

  // 打开创建对话框
  const handleCreate = () => {
    setEditingAudience(null)
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (audience: Audience) => {
    setEditingAudience(audience)
    setDialogOpen(true)
  }

  // 搜索功能
  const filteredAudiences = searchKeyword
    ? audiences.filter(a => 
        a.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    : audiences

  // 初始加载
  useEffect(() => {
    fetchAudiences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // 表格列定义
  const columns: TableColumn<Audience>[] = [
    {
      key: 'name',
      title: '人群包名称',
      dataIndex: 'name',
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      key: 'description',
      title: '描述',
      dataIndex: 'description',
      render: (value) => <span className="max-w-xs truncate">{(value as string) || '-'}</span>,
    },
    {
      key: 'cover_num',
      title: '覆盖人数',
      dataIndex: 'cover_num',
      render: (value) => `${((value as number) / 10000).toFixed(1)}万`,
    },
    {
      key: 'upload_type',
      title: '上传方式',
      dataIndex: 'upload_type',
      render: (value) => (value as string) === 'FILE' ? '文件上传' : 'API上传',
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value) => (value as string) === 'VALID' ? (
        <Badge variant="default">有效</Badge>
      ) : (
        <Badge variant="destructive">无效</Badge>
      ),
    },
    {
      key: 'create_time',
      title: '创建时间',
      dataIndex: 'create_time',
      render: (value) => formatDate(value as string),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'right',
      render: (_, record) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(record)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(record.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <ConfirmDialog />
      <div className="p-6 space-y-6">
        <PageHeader
        title="人群包管理"
        description="管理您的自定义人群包，用于精准定向投放"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            创建人群包
          </Button>
        }
      />

      {/* 搜索框 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索人群包名称或描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总人群包数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">有效人群包</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audiences.filter(a => a.status === 'VALID').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总覆盖人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(audiences.reduce((sum, a) => sum + a.cover_num, 0) / 10000).toFixed(1)}万
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 人群包列表 */}
      <Card>
        <CardHeader>
          <CardTitle>人群包列表</CardTitle>
          <CardDescription>
            共 {total} 个人群包
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAudiences.length === 0 && !loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>暂无人群包</p>
              <p className="text-sm mt-2">创建第一个人群包开始精准投放</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredAudiences}
              loading={loading}
              emptyText="暂无人群包"
            />
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      {user?.advertiserId && (
        <AudienceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          advertiserId={user.advertiserId}
          audience={editingAudience}
          onSuccess={fetchAudiences}
        />
      )}
      </div>
    </>
  )
}
