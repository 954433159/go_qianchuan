# 千川SDK前端项目 - 改进计划

> 基于合规性分析的详细改进方案

---

## 🎯 核心问题

### 1. 工具类API完全缺失 (最关键)

**影响**: 无法实现高级定向功能，严重影响广告投放精准度

**缺失的SDK方法**:
```go
// 行业/类目
ToolsIndustryGet()                        // 获取行业列表
ToolsAwemeMultiLevelCategoryGet()         // 查询抖音类目列表
ToolsAwemeCategoryTopAuthorGet()          // 查询推荐达人

// 定向工具
ToolsInterestActionInterestCategory()     // 兴趣类目查询
ToolsInterestActionInterestKeyword()      // 兴趣关键词查询
ToolsInterestActionActionCategory()       // 行为类目查询
ToolsInterestActionActionKeyword()        // 行为关键词查询

// 其他
ToolsCreativeWordSelect()                 // 查询动态创意词包
DmpAudiencesGet()                         // 查询人群包列表
```

---

## 📅 三阶段改进计划

### 阶段一: 工具类API实现 (1-2周)

#### Week 1: API封装和基础UI

##### 1.1 创建工具类API模块 (2天)

**新建文件**: `frontend/src/api/tools.ts`

```typescript
import { apiClient } from './client'

// ==================== 行业/类目 ====================

export interface Industry {
  id: string
  name: string
  level: number
  parent_id?: string
  children?: Industry[]
}

export const getIndustryList = async (
  advertiserId: number,
  level?: number
): Promise<Industry[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/industry/get', {
    params: { advertiser_id: advertiserId, level }
  })
  return data.list || []
}

export interface AwemeCategory {
  id: number
  name: string
  level: number
  parent_id?: number
  children?: AwemeCategory[]
}

export const getAwemeCategories = async (
  advertiserId: number
): Promise<AwemeCategory[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/aweme_category/get', {
    params: { advertiser_id: advertiserId }
  })
  return data.list || []
}

export interface TopAuthor {
  aweme_id: string
  aweme_name: string
  aweme_avatar: string
  fans_count: number
}

export const getTopAuthors = async (
  advertiserId: number,
  categoryId: number,
  behaviors?: string[]
): Promise<TopAuthor[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/top_authors/get', {
    params: { 
      advertiser_id: advertiserId,
      category_id: categoryId,
      behaviors: behaviors?.join(',')
    }
  })
  return data.list || []
}

// ==================== 定向工具 ====================

export interface InterestCategory {
  id: string
  name: string
  parent_id?: string
  children?: InterestCategory[]
}

export const getInterestCategories = async (
  advertiserId: number
): Promise<InterestCategory[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/interest/category', {
    params: { advertiser_id: advertiserId }
  })
  return data.list || []
}

export interface InterestKeyword {
  id: string
  name: string
  num: string
}

export const searchInterestKeywords = async (
  advertiserId: number,
  query: string
): Promise<InterestKeyword[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/interest/keyword', {
    params: { advertiser_id: advertiserId, query_words: query }
  })
  return data.list || []
}

export interface ActionCategory {
  id: string
  name: string
  parent_id?: string
}

export const getActionCategories = async (
  advertiserId: number,
  actionScene?: string[],
  actionDays?: number
): Promise<ActionCategory[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/action/category', {
    params: { 
      advertiser_id: advertiserId,
      action_scene: actionScene?.join(','),
      action_days: actionDays
    }
  })
  return data.list || []
}

export const searchActionKeywords = async (
  advertiserId: number,
  query: string,
  actionScene?: string[],
  actionDays?: number
): Promise<InterestKeyword[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/action/keyword', {
    params: { 
      advertiser_id: advertiserId,
      query_words: query,
      action_scene: actionScene?.join(','),
      action_days: actionDays
    }
  })
  return data.list || []
}

// ==================== 人群包 ====================

export interface Audience {
  id: number
  name: string
  cover_num: number
  status: string
  create_time: string
  modify_time: string
}

export const getAudienceList = async (
  advertiserId: number,
  retargetingTagsType: number,
  offset?: number,
  limit?: number
): Promise<{ list: Audience[], total: number }> => {
  const { data } = await apiClient.get('/api/qianchuan/dmp/audiences/get', {
    params: { 
      advertiser_id: advertiserId,
      retargeting_tags_type: retargetingTagsType,
      offset,
      limit
    }
  })
  return data
}

// ==================== 创意词包 ====================

export interface CreativeWord {
  id: string
  name: string
  word_list: string[]
}

export const getCreativeWords = async (
  advertiserId: number,
  wordIds?: string[]
): Promise<CreativeWord[]> => {
  const { data } = await apiClient.get('/api/qianchuan/tools/creative_word/select', {
    params: { 
      advertiser_id: advertiserId,
      creative_word_ids: wordIds?.join(',')
    }
  })
  return data.list || []
}
```

##### 1.2 创建定向选择器组件 (3天)

**新建文件**: `frontend/src/components/targeting/TargetingSelector.tsx`

```typescript
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { Badge } from '@/components/ui/Badge'
import { Search, Users, Heart, MousePointer } from 'lucide-react'
import { 
  getInterestCategories, 
  searchInterestKeywords,
  getActionCategories,
  searchActionKeywords,
  InterestCategory,
  InterestKeyword,
  ActionCategory
} from '@/api/tools'

interface TargetingSelectorProps {
  advertiserId: number
  value: {
    interests?: string[]
    actions?: string[]
  }
  onChange: (value: any) => void
}

export default function TargetingSelector({
  advertiserId,
  value,
  onChange
}: TargetingSelectorProps) {
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([])
  const [interestKeywords, setInterestKeywords] = useState<InterestKeyword[]>([])
  const [actionCategories, setActionCategories] = useState<ActionCategory[]>([])
  const [actionKeywords, setActionKeywords] = useState<InterestKeyword[]>([])
  
  const [interestQuery, setInterestQuery] = useState('')
  const [actionQuery, setActionQuery] = useState('')
  
  useEffect(() => {
    loadInterestCategories()
    loadActionCategories()
  }, [advertiserId])
  
  const loadInterestCategories = async () => {
    const data = await getInterestCategories(advertiserId)
    setInterestCategories(data)
  }
  
  const loadActionCategories = async () => {
    const data = await getActionCategories(advertiserId)
    setActionCategories(data)
  }
  
  const handleInterestSearch = async () => {
    if (!interestQuery) return
    const data = await searchInterestKeywords(advertiserId, interestQuery)
    setInterestKeywords(data)
  }
  
  const handleActionSearch = async () => {
    if (!actionQuery) return
    const data = await searchActionKeywords(advertiserId, actionQuery)
    setActionKeywords(data)
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="interest">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interest">
            <Heart className="w-4 h-4 mr-2" />
            兴趣定向
          </TabsTrigger>
          <TabsTrigger value="action">
            <MousePointer className="w-4 h-4 mr-2" />
            行为定向
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interest" className="space-y-4">
          {/* 兴趣关键词搜索 */}
          <div className="flex gap-2">
            <Input
              placeholder="搜索兴趣关键词..."
              value={interestQuery}
              onChange={(e) => setInterestQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInterestSearch()}
            />
            <Button onClick={handleInterestSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 搜索结果 */}
          {interestKeywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">搜索结果</h4>
              <div className="flex flex-wrap gap-2">
                {interestKeywords.map(keyword => (
                  <Badge
                    key={keyword.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      const newInterests = [...(value.interests || []), keyword.id]
                      onChange({ ...value, interests: newInterests })
                    }}
                  >
                    {keyword.name} ({keyword.num})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 兴趣类目树 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">兴趣类目</h4>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              {interestCategories.map(category => (
                <CategoryTree
                  key={category.id}
                  category={category}
                  selected={value.interests || []}
                  onSelect={(id) => {
                    const newInterests = value.interests?.includes(id)
                      ? value.interests.filter(i => i !== id)
                      : [...(value.interests || []), id]
                    onChange({ ...value, interests: newInterests })
                  }}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="action" className="space-y-4">
          {/* 行为关键词搜索 */}
          <div className="flex gap-2">
            <Input
              placeholder="搜索行为关键词..."
              value={actionQuery}
              onChange={(e) => setActionQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleActionSearch()}
            />
            <Button onClick={handleActionSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 行为类目 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">行为类目</h4>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              {actionCategories.map(category => (
                <div key={category.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    checked={value.actions?.includes(category.id)}
                    onCheckedChange={(checked) => {
                      const newActions = checked
                        ? [...(value.actions || []), category.id]
                        : value.actions?.filter(a => a !== category.id) || []
                      onChange({ ...value, actions: newActions })
                    }}
                  />
                  <label className="text-sm">{category.name}</label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* 已选择的定向 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">已选择</h4>
        <div className="flex flex-wrap gap-2">
          {value.interests?.map(id => (
            <Badge key={id} variant="secondary">
              兴趣: {id}
              <button
                className="ml-2 text-xs"
                onClick={() => {
                  onChange({
                    ...value,
                    interests: value.interests?.filter(i => i !== id)
                  })
                }}
              >
                ×
              </button>
            </Badge>
          ))}
          {value.actions?.map(id => (
            <Badge key={id} variant="secondary">
              行为: {id}
              <button
                className="ml-2 text-xs"
                onClick={() => {
                  onChange({
                    ...value,
                    actions: value.actions?.filter(a => a !== id)
                  })
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

// 类目树组件
function CategoryTree({ category, selected, onSelect }: any) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="ml-4">
      <div className="flex items-center space-x-2 py-1">
        {category.children && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs">
            {expanded ? '▼' : '▶'}
          </button>
        )}
        <Checkbox
          checked={selected.includes(category.id)}
          onCheckedChange={() => onSelect(category.id)}
        />
        <label className="text-sm">{category.name}</label>
      </div>
      {expanded && category.children?.map((child: any) => (
        <CategoryTree
          key={child.id}
          category={child}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
```

#### Week 2: 人群包管理和集成

##### 2.1 创建人群包管理页面 (2天)

**新建文件**: `frontend/src/pages/Audiences.tsx`

```typescript
import { useEffect, useState } from 'react'
import { getAudienceList, Audience } from '@/api/tools'
import { Table, PageHeader, Badge } from '@/components/ui'
import { Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function Audiences() {
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  
  useEffect(() => {
    fetchAudiences()
  }, [])
  
  const fetchAudiences = async () => {
    setLoading(true)
    try {
      const data = await getAudienceList(
        user?.advertiserId || 1,
        1, // retargeting_tags_type
        0,
        100
      )
      setAudiences(data.list)
    } catch (error) {
      console.error('Failed to fetch audiences:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const columns = [
    { key: 'id', title: 'ID', dataIndex: 'id' },
    { key: 'name', title: '人群包名称', dataIndex: 'name' },
    { 
      key: 'cover_num', 
      title: '覆盖人数', 
      dataIndex: 'cover_num',
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value: string) => (
        <Badge variant={value === 'VALID' ? 'default' : 'secondary'}>
          {value === 'VALID' ? '有效' : '无效'}
        </Badge>
      )
    },
    { key: 'create_time', title: '创建时间', dataIndex: 'create_time' }
  ]
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="人群包管理"
        description="管理您的定向人群包"
        icon={<Users className="w-6 h-6" />}
      />
      
      <Table
        columns={columns}
        data={audiences}
        loading={loading}
      />
    </div>
  )
}
```

##### 2.2 集成到广告创建流程 (3天)

**修改**: `frontend/src/components/ad/CreateAdDialog.tsx`

添加定向选择器:
```typescript
import TargetingSelector from '@/components/targeting/TargetingSelector'

// 在表单中添加
<FormField
  control={form.control}
  name="targeting"
  render={({ field }) => (
    <FormItem>
      <FormLabel>定向设置</FormLabel>
      <FormControl>
        <TargetingSelector
          advertiserId={advertiserId}
          value={field.value}
          onChange={field.onChange}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### 阶段二: UI完善 (3-5天)

#### 2.1 创意创建对话框 (2天)

**新建文件**: `frontend/src/components/creative/CreateCreativeDialog.tsx`

#### 2.2 审核建议展示 (1天)

**新建文件**: `frontend/src/components/common/RejectReasonModal.tsx`

#### 2.3 素材上传UI (2天)

**修改**: `frontend/src/pages/Media.tsx`

添加上传按钮和进度条

---

### 阶段三: 高级功能 (1周)

#### 3.1 批量操作 (2天)
#### 3.2 高级筛选 (2天)
#### 3.3 数据导出 (2天)

---

## 📊 预期成果

完成后的功能完整度:

| 模块 | 当前 | 完成后 |
|------|------|--------|
| OAuth认证 | 100% | 100% |
| 广告主 | 100% | 100% |
| 广告计划 | 90% | 100% |
| 广告单元 | 85% | 100% |
| 创意 | 75% | 95% |
| 媒体库 | 85% | 95% |
| 报表 | 100% | 100% |
| **工具类** | **0%** | **95%** |
| **总计** | **76%** | **98%** |

---

## ✅ 验收标准

### 阶段一验收
- [ ] 工具类API全部封装完成
- [ ] 定向选择器组件可用
- [ ] 人群包管理页面完成
- [ ] 集成到广告创建流程

### 阶段二验收
- [ ] 创意创建对话框完成
- [ ] 审核建议可正常展示
- [ ] 素材上传功能可用

### 阶段三验收
- [ ] 批量操作功能正常
- [ ] 高级筛选可用
- [ ] 数据导出功能正常

---

**文档版本**: 1.0  
**更新日期**: 2025-01-09

