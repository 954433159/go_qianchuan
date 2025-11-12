# 前端重构方案 05 - 定向工具模块重构

> **目标**: 实现完整的定向工具系统（关键词、人群包、兴趣行为词库、定向包）

## 📋 模块清单

1. **Keywords** - 关键词管理
2. **Audiences** - 人群包管理
3. **Interest Keywords** - 兴趣词库
4. **Action Keywords** - 行为词库
5. **Creative Words** - 创意词包
6. **Orientation Packages** - 定向包

---

## 1. Keywords 关键词管理

### 页面结构
```tsx
<KeywordsPage>
  <PageHeader title="关键词管理" />
  <Tabs>
    <TabPanel label="搜索关键词">
      <KeywordList type="search" />
    </TabPanel>
    <TabPanel label="否定词">
      <NegativeWordList />
    </TabPanel>
    <TabPanel label="关键词推荐">
      <KeywordSuggestion />
    </TabPanel>
    <TabPanel label="合规校验">
      <KeywordCompliance />
    </TabPanel>
  </Tabs>
</KeywordsPage>
```

### 关键词卡片组件
```tsx
interface Keyword {
  id: string
  word: string
  category: string
  bid: number
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  status: 'active' | 'paused'
  matchType: 'exact' | 'phrase' | 'broad'
}

export function KeywordCard({ keyword }: { keyword: Keyword }) {
  return (
    <div className="qc-card flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold">{keyword.word}</h4>
          <span className="qc-badge qc-badge-info text-xs">
            {keyword.matchType === 'exact' ? '精确' : keyword.matchType === 'phrase' ? '短语' : '广泛'}
          </span>
          <StatusBadge status={keyword.status} />
        </div>
        <p className="text-sm text-gray-600">类目: {keyword.category}</p>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mx-6">
        <MetricBox label="出价" value={`¥${keyword.bid}`} />
        <MetricBox label="展示" value={formatNumber(keyword.impressions)} />
        <MetricBox label="点击" value={formatNumber(keyword.clicks)} />
        <MetricBox label="CTR" value={`${(keyword.ctr * 100).toFixed(2)}%`} />
      </div>
      
      <div className="flex gap-2">
        <button className="qc-btn qc-btn-secondary text-sm">编辑出价</button>
        <button className="qc-btn qc-btn-secondary text-sm">
          {keyword.status === 'active' ? '暂停' : '启用'}
        </button>
      </div>
    </div>
  )
}
```

### 关键词推荐组件
```tsx
export function KeywordSuggestion() {
  const [seeds, setSeeds] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<SuggestedKeyword[]>([])
  
  return (
    <div className="space-y-4">
      <div className="qc-card">
        <h3 className="font-semibold mb-3">输入种子关键词</h3>
        <TagInput 
          value={seeds}
          onChange={setSeeds}
          placeholder="输入关键词，按回车添加"
        />
        <button 
          className="qc-btn qc-btn-primary mt-3"
          onClick={() => fetchSuggestions(seeds)}
        >
          获取推荐
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {suggestions.map(kw => (
          <div key={kw.word} className="qc-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5" />
              <div>
                <h4 className="font-semibold">{kw.word}</h4>
                <p className="text-sm text-gray-600">
                  搜索量: {formatNumber(kw.searchVolume)} | 竞争度: {kw.competition}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-600">建议出价</p>
                <p className="font-semibold">¥{kw.suggestedBid}</p>
              </div>
              <button className="qc-btn qc-btn-primary text-sm">添加</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 2. Audiences 人群包管理

### 页面结构
```tsx
<AudiencesPage>
  <PageHeader title="人群包管理" />
  <Tabs>
    <TabPanel label="我的人群包">
      <AudienceList />
    </TabPanel>
    <TabPanel label="上传人群">
      <AudienceUpload />
    </TabPanel>
    <TabPanel label="人群分组">
      <AudienceGroups />
    </TabPanel>
    <TabPanel label="定向包">
      <OrientationPackages />
    </TabPanel>
  </Tabs>
</AudiencesPage>
```

### 人群包卡片组件
```tsx
interface Audience {
  id: string
  name: string
  type: 'upload' | 'lookalike' | 'retargeting' | 'dmp'
  size: number
  coverage: number  // 覆盖率
  status: 'ready' | 'processing' | 'failed'
  usageCount: number
  createdAt: string
  expiresAt: string
}

export function AudienceCard({ audience }: { audience: Audience }) {
  const typeLabels = {
    upload: '文件上传',
    lookalike: '相似人群',
    retargeting: '重定向',
    dmp: 'DMP人群'
  }
  
  return (
    <div className="qc-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{audience.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="qc-badge qc-badge-info text-xs">
              {typeLabels[audience.type]}
            </span>
            <StatusBadge status={audience.status} />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>编辑</DropdownMenuItem>
            <DropdownMenuItem>复制</DropdownMenuItem>
            <DropdownMenuItem>创建相似人群</DropdownMenuItem>
            <DropdownMenuItem>删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <MetricBox label="人群规模" value={formatNumber(audience.size)} />
        <MetricBox label="覆盖率" value={`${audience.coverage}%`} />
        <MetricBox label="使用次数" value={audience.usageCount} />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>创建于 {audience.createdAt}</span>
        <span>有效期至 {audience.expiresAt}</span>
      </div>
    </div>
  )
}
```

### 人群上传组件
```tsx
export function AudienceUpload() {
  const [uploadType, setUploadType] = useState<'mobile' | 'idfa' | 'imei'>('mobile')
  
  return (
    <div className="qc-card max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">上传人群包</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">人群包名称</label>
          <input 
            type="text" 
            className="qc-input"
            placeholder="请输入人群包名称"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">数据类型</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                value="mobile"
                checked={uploadType === 'mobile'}
                onChange={(e) => setUploadType(e.target.value as any)}
              />
              <span>手机号</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                value="idfa"
                checked={uploadType === 'idfa'}
                onChange={(e) => setUploadType(e.target.value as any)}
              />
              <span>IDFA</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                value="imei"
                checked={uploadType === 'imei'}
                onChange={(e) => setUploadType(e.target.value as any)}
              />
              <span>IMEI</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">上传文件</label>
          <FileUploadZone
            accept=".txt,.csv"
            maxSize={50 * 1024 * 1024}  // 50MB
            onUpload={handleFileUpload}
          >
            <div className="text-center py-8">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                点击上传或拖拽文件到此处
              </p>
              <p className="text-xs text-gray-500">
                支持 TXT、CSV 格式，最大 50MB
              </p>
            </div>
          </FileUploadZone>
        </div>
        
        <div className="flex gap-3">
          <button className="qc-btn qc-btn-primary flex-1">提交</button>
          <button className="qc-btn qc-btn-secondary">取消</button>
        </div>
      </div>
    </div>
  )
}
```

---

## 3. Interest Keywords 兴趣词库

### 页面结构
```tsx
<InterestKeywordsPage>
  <PageHeader title="兴趣词库" />
  
  <div className="grid grid-cols-4 gap-4">
    {/* 左侧类目树 */}
    <Card className="col-span-1">
      <CategoryTree 
        categories={interestCategories}
        onSelect={handleCategorySelect}
      />
    </Card>
    
    {/* 右侧关键词列表 */}
    <div className="col-span-3">
      <SearchInput placeholder="搜索兴趣关键词" />
      <InterestKeywordGrid keywords={keywords} />
    </div>
  </div>
</InterestKeywordsPage>
```

### 兴趣关键词组件
```tsx
interface InterestKeyword {
  id: string
  name: string
  category: string
  reach: number  // 覆盖人数
  selected: boolean
}

export function InterestKeywordItem({ keyword, onToggle }: Props) {
  return (
    <div 
      className={cn(
        'qc-card cursor-pointer transition-all',
        keyword.selected && 'border-2 border-qc-orange bg-orange-50'
      )}
      onClick={() => onToggle(keyword.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={keyword.selected}
            className="w-5 h-5"
            readOnly
          />
          <div>
            <h4 className="font-semibold">{keyword.name}</h4>
            <p className="text-sm text-gray-600">{keyword.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">覆盖人数</p>
          <p className="font-semibold">{formatNumber(keyword.reach)}</p>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. Creative Words 创意词包

### 页面结构
```tsx
<CreativeWordsPage>
  <PageHeader title="创意词包" />
  
  <div className="grid grid-cols-2 gap-6">
    {/* 词包列表 */}
    <Card>
      <CardHeader>
        <CardTitle>动态创意词包</CardTitle>
      </CardHeader>
      <CardContent>
        <WordPackageList packages={packages} />
      </CardContent>
    </Card>
    
    {/* 词包详情 */}
    <Card>
      <CardHeader>
        <CardTitle>词包内容预览</CardTitle>
      </CardHeader>
      <CardContent>
        <WordPreview words={selectedWords} />
      </CardContent>
    </Card>
  </div>
</CreativeWordsPage>
```

---

## 实施时间表

| 模块 | 预计时间 | 依赖 |
|------|---------|------|
| Keywords | 4天 | 关键词API |
| Audiences | 5天 | 人群包API、文件上传 |
| Interest Keywords | 3天 | 兴趣词API |
| Action Keywords | 3天 | 行为词API |
| Creative Words | 2天 | 创意词API |
| Orientation Packages | 3天 | 定向包API |

**总计**: 20天（约4周，2人并行）

---

**文档版本**: v1.0  
**创建日期**: 2025-11-11  
**负责人**: 前端团队
