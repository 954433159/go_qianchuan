import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Copy, Search, Package, Tag, FileText } from 'lucide-react'
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Loading,
  EmptyState,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'

interface WordPackage {
  id: string
  name: string
  category: 'title' | 'description' | 'cta'
  words: string[]
  usage_count: number
  create_time: number
  update_time: number
}

export default function CreativeWordPackage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [packages, setPackages] = useState<WordPackage[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'title' | 'description' | 'cta'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<WordPackage | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'title' as WordPackage['category'],
    words: '',
  })

  const advertiserId = user?.advertiserId || 1

  useEffect(() => {
    loadPackages()
  }, [advertiserId])

  const loadPackages = async () => {
    setLoading(true)
    try {
      // TODO: 调用API获取词包列表
      // const data = await creativeApi.getWordPackages(advertiserId)

      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPackages([
        {
          id: '1',
          name: '春季促销标题词包',
          category: 'title',
          words: ['春季大促', '限时优惠', '新品上市', '爆款推荐', '超值特惠'],
          usage_count: 25,
          create_time: Date.now() - 86400000 * 10,
          update_time: Date.now() - 86400000 * 2,
        },
        {
          id: '2',
          name: '产品描述词包',
          category: 'description',
          words: ['品质保证', '正品直销', '全国包邮', '7天无理由退换', '售后无忧'],
          usage_count: 18,
          create_time: Date.now() - 86400000 * 15,
          update_time: Date.now() - 86400000 * 5,
        },
        {
          id: '3',
          name: '行动号召词包',
          category: 'cta',
          words: ['立即购买', '马上抢购', '点击了解', '进入直播间', '领取优惠券'],
          usage_count: 42,
          create_time: Date.now() - 86400000 * 20,
          update_time: Date.now() - 86400000 * 1,
        },
      ])
    } catch (error) {
      console.error('Failed to load packages:', error)
      toast.error('加载词包列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPackage(null)
    setFormData({ name: '', category: 'title', words: '' })
    setDialogOpen(true)
  }

  const handleEdit = (pkg: WordPackage) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      category: pkg.category,
      words: pkg.words.join('\n'),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入词包名称')
      return
    }

    const words = formData.words
      .split('\n')
      .map((w) => w.trim())
      .filter((w) => w.length > 0)

    if (words.length === 0) {
      toast.error('请至少添加一个词语')
      return
    }

    try {
      if (editingPackage) {
        // TODO: 调用API更新词包
        // await creativeApi.updateWordPackage(advertiserId, editingPackage.id, { ...formData, words })

        setPackages((prev) =>
          prev.map((pkg) =>
            pkg.id === editingPackage.id
              ? { ...pkg, ...formData, words, update_time: Date.now() }
              : pkg
          )
        )
        toast.success('词包更新成功')
      } else {
        // TODO: 调用API创建词包
        // const result = await creativeApi.createWordPackage(advertiserId, { ...formData, words })

        const newPackage: WordPackage = {
          id: Date.now().toString(),
          name: formData.name,
          category: formData.category,
          words,
          usage_count: 0,
          create_time: Date.now(),
          update_time: Date.now(),
        }
        setPackages((prev) => [newPackage, ...prev])
        toast.success('词包创建成功')
      }

      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to save package:', error)
      toast.error('保存失败')
    }
  }

  const handleDelete = async (pkg: WordPackage) => {
    const confirmed = await confirm({
      title: '删除词包',
      description: `确定要删除词包"${pkg.name}"吗？删除后将无法恢复。`,
      confirmText: '删除',
      variant: 'destructive',
    })
    
    if (!confirmed) return

    try {
      // TODO: 调用API删除词包
      // await creativeApi.deleteWordPackage(advertiserId, pkg.id)

      setPackages((prev) => prev.filter((p) => p.id !== pkg.id))
      toast.success('词包已删除')
    } catch (error) {
      console.error('Failed to delete package:', error)
      toast.error('删除失败')
    }
  }

  const handleCopy = async (pkg: WordPackage) => {
    try {
      await navigator.clipboard.writeText(pkg.words.join('\n'))
      toast.success('词语已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const getCategoryLabel = (category: WordPackage['category']) => {
    const labels = {
      title: '标题',
      description: '描述',
      cta: '行动号召',
    }
    return labels[category]
  }

  const getCategoryColor = (category: WordPackage['category']) => {
    const colors = {
      title: 'bg-blue-100 text-blue-800',
      description: 'bg-green-100 text-green-800',
      cta: 'bg-orange-100 text-orange-800',
    }
    return colors[category]
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      pkg.words.some((w) => w.toLowerCase().includes(searchKeyword.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <Loading fullScreen text="加载词包列表..." size="lg" />
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6">
        <PageHeader
        title="动态创意词包"
        description="管理创意标题、描述和行动号召的词语库"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            创建词包
          </Button>
        }
      />

      {/* 说明卡片 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">什么是动态创意词包？</h3>
              <p className="text-sm text-blue-800">
                动态创意词包是一组预设的词语集合，可用于自动生成多样化的广告创意。系统会从词包中随机组合词语，生成不同版本的标题、描述和行动号召，提升广告创意的多样性和测试效率。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 工具栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索词包名称或词语..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 分类筛选 */}
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                全部
              </Button>
              <Button
                variant={selectedCategory === 'title' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('title')}
              >
                标题
              </Button>
              <Button
                variant={selectedCategory === 'description' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('description')}
              >
                描述
              </Button>
              <Button
                variant={selectedCategory === 'cta' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('cta')}
              >
                行动号召
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>共 {filteredPackages.length} 个词包</span>
            <span>总使用次数: {packages.reduce((sum, pkg) => sum + pkg.usage_count, 0)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 词包列表 */}
      {filteredPackages.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="暂无词包"
          description={searchKeyword ? '没有找到匹配的词包' : '点击创建按钮添加第一个词包'}
          action={{
            label: '创建词包',
            onClick: handleCreate,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{pkg.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(pkg.category)}>
                        {getCategoryLabel(pkg.category)}
                      </Badge>
                      <span className="text-xs text-gray-500">使用 {pkg.usage_count} 次</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 词语列表 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      词语 ({pkg.words.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.words.slice(0, 5).map((word, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {word}
                      </span>
                    ))}
                    {pkg.words.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                        +{pkg.words.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* 时间信息 */}
                <div className="text-xs text-gray-500 mb-4">
                  <div>创建: {formatDate(pkg.create_time)}</div>
                  <div>更新: {formatDate(pkg.update_time)}</div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                    <Edit className="w-3 h-3 mr-1" />
                    编辑
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(pkg)}>
                    <Copy className="w-3 h-3 mr-1" />
                    复制
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pkg)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPackage ? '编辑词包' : '创建词包'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">词包名称</label>
              <Input
                placeholder="例如：春季促销标题词包"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <div className="flex gap-2">
                {(['title', 'description', 'cta'] as const).map((cat) => (
                  <Button
                    key={cat}
                    variant={formData.category === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, category: cat })}
                  >
                    {getCategoryLabel(cat)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                词语列表（每行一个）
              </label>
              <textarea
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="春季大促&#10;限时优惠&#10;新品上市&#10;爆款推荐"
                value={formData.words}
                onChange={(e) => setFormData({ ...formData, words: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                当前 {formData.words.split('\n').filter((w) => w.trim()).length} 个词语
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}

