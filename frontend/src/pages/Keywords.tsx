import { useEffect, useState } from 'react'
import { 
  getKeywordPackageList, 
  getKeywordRecommendations, 
  getNegativeKeywordList,
  createKeywordPackage,
  updateKeywordPackage,
  updateNegativeKeywords,
  checkKeywordCompliance,
  type KeywordPackage, 
  type KeywordRecommendation, 
  type NegativeKeyword 
} from '@/api/keywords'
import { Button, PageHeader, Card, CardHeader, CardTitle, CardContent, Loading, EmptyState, Badge, DataTable, Tabs, TabsList, TabsTrigger, Dialog, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import type { ColumnDef } from '@/components/ui'
import { Plus, Search, AlertCircle, CheckCircle, Package, Ban, Sparkles, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

type TabValue = 'packages' | 'negative' | 'recommend'

export default function Keywords() {
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState<TabValue>('packages')
  const [loading, setLoading] = useState(true)
  const [selectedAdvertiserId] = useState(1)
  
  // 关键词包状态
  const [packages, setPackages] = useState<KeywordPackage[]>([])
  const [packageDialogOpen, setPackageDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<KeywordPackage | null>(null)
  
  // 否定词状态
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>([])
  const [negativeInputValue, setNegativeInputValue] = useState('')
  
  // 推荐词状态
  const [recommendations, setRecommendations] = useState<KeywordRecommendation[]>([])
  const [recommendQuery, setRecommendQuery] = useState('')

  // 新建/编辑表单状态
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    match_type: 'EXACT' as 'EXACT' | 'PHRASE' | 'BROAD'
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedAdvertiserId])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'packages') {
        const data = await getKeywordPackageList({
          advertiser_id: selectedAdvertiserId,
          page: 1,
          page_size: 50
        })
        setPackages(data.list || [])
      } else if (activeTab === 'negative') {
        const data = await getNegativeKeywordList({
          advertiser_id: selectedAdvertiserId
        })
        setNegativeKeywords(data || [])
      } else if (activeTab === 'recommend') {
        const data = await getKeywordRecommendations({
          advertiser_id: selectedAdvertiserId,
          limit: 50
        })
        setRecommendations(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch keywords:', err)
      error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = () => {
    setEditingPackage(null)
    setFormData({ name: '', keywords: '', match_type: 'EXACT' })
    setPackageDialogOpen(true)
  }

  const handleEditPackage = (pkg: KeywordPackage) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      keywords: '', // 需要从API获取具体关键词列表
      match_type: pkg.match_type
    })
    setPackageDialogOpen(true)
  }

  const handleSavePackage = async () => {
    if (!formData.name || !formData.keywords) {
      error('请填写完整信息')
      return
    }

    try {
      const keywords = formData.keywords.split('\n').filter(k => k.trim())
      
      // 合规检查
      const complianceResults = await checkKeywordCompliance({
        advertiser_id: selectedAdvertiserId,
        keywords
      })
      
      const nonCompliant = complianceResults.filter(r => !r.is_compliant)
      if (nonCompliant.length > 0) {
        error(`以下关键词不合规：${nonCompliant.map(r => r.keyword).join(', ')}`)
        return
      }

      if (editingPackage) {
        await updateKeywordPackage({
          advertiser_id: selectedAdvertiserId,
          keyword_package_id: editingPackage.id,
          name: formData.name,
          keywords,
          match_type: formData.match_type
        })
        success('更新成功')
      } else {
        await createKeywordPackage({
          advertiser_id: selectedAdvertiserId,
          name: formData.name,
          keywords,
          match_type: formData.match_type
        })
        success('创建成功')
      }
      
      setPackageDialogOpen(false)
      fetchData()
    } catch (err) {
      console.error('Failed to save package:', err)
      error('保存失败')
    }
  }

  const handleUpdateNegativeKeywords = async () => {
    try {
      const keywords = negativeInputValue.split('\n').filter(k => k.trim())
      await updateNegativeKeywords({
        advertiser_id: selectedAdvertiserId,
        negative_keywords: keywords
      })
      success('否定词更新成功')
      fetchData()
    } catch (err) {
      console.error('Failed to update negative keywords:', err)
      error('更新失败')
    }
  }

  const handleSearchRecommend = async () => {
    if (!recommendQuery.trim()) return
    setLoading(true)
    try {
      const data = await getKeywordRecommendations({
        advertiser_id: selectedAdvertiserId,
        query: recommendQuery,
        limit: 50
      })
      setRecommendations(data || [])
    } catch (err) {
      console.error('Failed to search recommendations:', err)
      error('搜索失败')
    } finally {
      setLoading(false)
    }
  }

  // 关键词包表格列定义
  const packageColumns: ColumnDef<KeywordPackage>[] = [
    {
      key: 'id',
      label: 'ID',
      dataIndex: 'id',
      width: '80px'
    },
    {
      key: 'name',
      label: '关键词包名称',
      dataIndex: 'name',
      sortable: true
    },
    {
      key: 'keyword_count',
      label: '关键词数量',
      dataIndex: 'keyword_count',
      render: (value) => <Badge variant="secondary">{value as number} 个</Badge>
    },
    {
      key: 'match_type',
      label: '匹配类型',
      dataIndex: 'match_type',
      render: (value) => {
        const typeMap = {
          EXACT: { label: '精确匹配', className: 'bg-blue-100 text-blue-800' },
          PHRASE: { label: '短语匹配', className: 'bg-green-100 text-green-800' },
          BROAD: { label: '广泛匹配', className: 'bg-purple-100 text-purple-800' }
        }
        const type = typeMap[value as keyof typeof typeMap] || typeMap.EXACT
        return <Badge className={type.className}>{type.label}</Badge>
      }
    },
    {
      key: 'status',
      label: '状态',
      dataIndex: 'status',
      render: (value) => (
        <Badge variant={value === 'ENABLE' ? 'default' : 'secondary'} className={value === 'ENABLE' ? 'bg-green-100 text-green-800' : ''}>
          {value === 'ENABLE' ? '启用' : '停用'}
        </Badge>
      )
    },
    {
      key: 'create_time',
      label: '创建时间',
      dataIndex: 'create_time',
      sortable: true
    },
    {
      key: 'actions',
      label: '操作',
      render: (_, record) => (
        <Button variant="ghost" size="sm" onClick={() => handleEditPackage(record)}>
          编辑
        </Button>
      )
    }
  ]

  // 否定词表格列定义
  const negativeColumns: ColumnDef<NegativeKeyword>[] = [
    {
      key: 'id',
      label: 'ID',
      dataIndex: 'id',
      width: '80px'
    },
    {
      key: 'keyword',
      label: '否定词',
      dataIndex: 'keyword'
    },
    {
      key: 'level',
      label: '层级',
      dataIndex: 'level',
      render: (value) => (
        <Badge variant="outline">
          {value === 'CAMPAIGN' ? '广告组' : '广告计划'}
        </Badge>
      )
    },
    {
      key: 'create_time',
      label: '创建时间',
      dataIndex: 'create_time'
    }
  ]

  // 推荐词表格列定义
  const recommendColumns: ColumnDef<KeywordRecommendation>[] = [
    {
      key: 'keyword',
      label: '推荐关键词',
      dataIndex: 'keyword'
    },
    {
      key: 'relevance_score',
      label: '相关度',
      dataIndex: 'relevance_score',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${(value as number) * 100}%` }}
            />
          </div>
          <span className="text-sm">{((value as number) * 100).toFixed(0)}%</span>
        </div>
      )
    },
    {
      key: 'competition_level',
      label: '竞争度',
      dataIndex: 'competition_level',
      render: (value) => {
        const levelMap = {
          HIGH: { label: '高', className: 'bg-red-100 text-red-800' },
          MEDIUM: { label: '中', className: 'bg-yellow-100 text-yellow-800' },
          LOW: { label: '低', className: 'bg-green-100 text-green-800' }
        }
        const level = levelMap[value as keyof typeof levelMap] || levelMap.MEDIUM
        return <Badge className={level.className}>{level.label}</Badge>
      }
    },
    {
      key: 'suggested_bid',
      label: '建议出价',
      dataIndex: 'suggested_bid',
      render: (value) => value ? `¥${(value as number).toFixed(2)}` : '-'
    }
  ]

  if (loading && (packages.length === 0 && negativeKeywords.length === 0 && recommendations.length === 0)) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="关键词管理" 
        description="管理关键词包、否定词和推荐词"
        actions={
          activeTab === 'packages' ? (
            <Button onClick={handleCreatePackage}>
              <Plus className="w-4 h-4 mr-2" />
              新建关键词包
            </Button>
          ) : null
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="packages">
            <Package className="w-4 h-4 mr-2" />
            关键词包
          </TabsTrigger>
          <TabsTrigger value="negative">
            <Ban className="w-4 h-4 mr-2" />
            否定词
          </TabsTrigger>
          <TabsTrigger value="recommend">
            <Sparkles className="w-4 h-4 mr-2" />
            推荐词
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'packages' && (
        <Card>
          {packages.length === 0 ? (
            <EmptyState
              icon={<Package className="h-12 w-12" />}
              title="暂无关键词包"
              description="点击新建按钮创建您的第一个关键词包"
            />
          ) : (
            <DataTable
              columns={packageColumns as unknown as ColumnDef<Record<string, unknown>>[]}
              data={packages as unknown as Record<string, unknown>[]}
              loading={loading}
              searchable
              rowKey="id"
            />
          )}
        </Card>
      )}

      {activeTab === 'negative' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                批量管理否定词
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="每行输入一个否定词&#10;例如：&#10;竞品词1&#10;竞品词2&#10;违规词"
                  value={negativeInputValue}
                  onChange={(e) => setNegativeInputValue(e.target.value)}
                  rows={10}
                  className="font-mono"
                />
                <div className="flex justify-end">
                  <Button onClick={handleUpdateNegativeKeywords}>
                    <Save className="w-4 h-4 mr-2" />
                    保存否定词
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>当前否定词列表</CardTitle>
            </CardHeader>
            <CardContent>
              {negativeKeywords.length === 0 ? (
                <EmptyState
                  icon={<Ban className="h-12 w-12" />}
                  title="暂无否定词"
                  description="在上方输入框中添加否定词"
                />
              ) : (
                <DataTable
                  columns={negativeColumns as unknown as ColumnDef<Record<string, unknown>>[]}
                  data={negativeKeywords as unknown as Record<string, unknown>[]}
                  loading={loading}
                  searchable
                  rowKey="id"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'recommend' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入关键词获取推荐..."
                  value={recommendQuery}
                  onChange={(e) => setRecommendQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchRecommend()}
                />
                <Button onClick={handleSearchRecommend}>
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            {recommendations.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-12 w-12" />}
                title="暂无推荐词"
                description="输入关键词搜索推荐词"
              />
            ) : (
              <DataTable
                columns={recommendColumns as unknown as ColumnDef<Record<string, unknown>>[]}
                data={recommendations as unknown as Record<string, unknown>[]}
                loading={loading}
                searchable
                rowKey="keyword"
              />
            )}
          </Card>
        </div>
      )}

      {/* 新建/编辑关键词包对话框 */}
      {packageDialogOpen && (
        <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
          <div className="fixed inset-0 z-50 bg-black/50" />
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingPackage ? '编辑关键词包' : '新建关键词包'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setPackageDialogOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">关键词包名称</label>
                  <Input
                    placeholder="请输入关键词包名称"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">匹配类型</label>
                  <Select value={formData.match_type} onValueChange={(v) => setFormData({ ...formData, match_type: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXACT">精确匹配</SelectItem>
                      <SelectItem value="PHRASE">短语匹配</SelectItem>
                      <SelectItem value="BROAD">广泛匹配</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">关键词列表（每行一个）</label>
                  <Textarea
                    placeholder="请输入关键词，每行一个&#10;例如：&#10;关键词1&#10;关键词2&#10;关键词3"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    rows={10}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSavePackage}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
