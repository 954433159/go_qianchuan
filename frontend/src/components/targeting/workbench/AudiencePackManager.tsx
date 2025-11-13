import { useState } from 'react'
import { Users, Plus, Edit2, Trash2, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

interface AudiencePack {
  id: string
  name: string
  description?: string
  audienceSize: number
  createTime: string
  tags: string[]
}

export default function AudiencePackManager() {
  const [packs, setPacks] = useState<AudiencePack[]>([
    {
      id: '1',
      name: '高价值用户',
      description: '近30天消费>500元的用户',
      audienceSize: 125000,
      createTime: '2025-01-10',
      tags: ['高消费', '活跃'],
    },
    {
      id: '2',
      name: '兴趣美妆用户',
      description: '对美妆类内容感兴趣的用户',
      audienceSize: 850000,
      createTime: '2025-01-08',
      tags: ['美妆', '女性'],
    },
    {
      id: '3',
      name: '新用户群体',
      description: '注册不超过7天的新用户',
      audienceSize: 320000,
      createTime: '2025-01-05',
      tags: ['新用户'],
    },
  ])

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<AudiencePack | null>(null)
  const [newPackName, setNewPackName] = useState('')
  const [newPackDesc, setNewPackDesc] = useState('')
  const { success, error } = useToast()

  const handleCreate = () => {
    if (!newPackName.trim()) {
      error('请输入人群包名称')
      return
    }

    const newPack: AudiencePack = {
      id: Date.now().toString(),
      name: newPackName,
      description: newPackDesc,
      audienceSize: Math.floor(Math.random() * 1000000),
      createTime: new Date().toISOString().split('T')[0] ?? '',
      tags: [],
    }

    setPacks([newPack, ...packs])
    setCreateDialogOpen(false)
    setNewPackName('')
    setNewPackDesc('')
    success('人群包创建成功')
  }

  const handleEdit = (pack: AudiencePack) => {
    setEditingPack(pack)
    setNewPackName(pack.name)
    setNewPackDesc(pack.description || '')
    setCreateDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!editingPack || !newPackName.trim()) {
      error('请输入人群包名称')
      return
    }

    setPacks(
      packs.map((p) =>
        p.id === editingPack.id
          ? { ...p, name: newPackName, description: newPackDesc }
          : p
      )
    )
    setCreateDialogOpen(false)
    setEditingPack(null)
    setNewPackName('')
    setNewPackDesc('')
    success('人群包更新成功')
  }

  const handleDelete = (id: string) => {
    setPacks(packs.filter((p) => p.id !== id))
    success('人群包已删除')
  }

  const handleDuplicate = (pack: AudiencePack) => {
    const duplicated: AudiencePack = {
      ...pack,
      id: Date.now().toString(),
      name: `${pack.name} (副本)`,
      createTime: new Date().toISOString().split('T')[0] ?? '',
    }
    setPacks([duplicated, ...packs])
    success('人群包已复制')
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            人群包管理
          </CardTitle>
          <Button
            onClick={() => {
              setEditingPack(null)
              setNewPackName('')
              setNewPackDesc('')
              setCreateDialogOpen(true)
            }}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            新建人群包
          </Button>
        </CardHeader>
        <CardContent>
          {packs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>暂无人群包</p>
              <p className="text-sm mt-2">点击上方按钮创建您的第一个人群包</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map((pack) => (
                <Card key={pack.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-base mb-1">{pack.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pack.description || '暂无描述'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">人群规模</span>
                        <span className="font-medium">
                          {pack.audienceSize.toLocaleString()}
                        </span>
                      </div>

                      {pack.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pack.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        创建时间: {pack.createTime}
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => success(`已应用人群包: ${pack.name}`)}
                        >
                          应用
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(pack)}
                          className="px-2"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(pack)}
                          className="px-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(pack.id)}
                          className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      {createDialogOpen && (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <div className="fixed inset-0 z-50 bg-black/50" />
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {editingPack ? '编辑人群包' : '新建人群包'}
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">人群包名称 *</label>
                  <Input
                    value={newPackName}
                    onChange={(e) => setNewPackName(e.target.value)}
                    placeholder="请输入人群包名称"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">描述</label>
                  <Input
                    value={newPackDesc}
                    onChange={(e) => setNewPackDesc(e.target.value)}
                    placeholder="请输入人群包描述（可选）"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false)
                    setEditingPack(null)
                    setNewPackName('')
                    setNewPackDesc('')
                  }}
                >
                  取消
                </Button>
                <Button onClick={editingPack ? handleUpdate : handleCreate}>
                  {editingPack ? '更新' : '创建'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
