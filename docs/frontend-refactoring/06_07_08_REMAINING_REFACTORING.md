# 前端重构方案 06-08 - 组件库/API层/状态管理重构

## 方案 06 - 组件库重构与扩展

### 新增组件清单

#### 业务组件
1. **FileUploadZone** - 文件上传区域（支持拖拽）
2. **TagInput** - 标签输入组件
3. **CategoryTree** - 类目树组件
4. **DateRangePicker** - 日期范围选择器
5. **MetricBox** - 数据指标盒子
6. **StatusBadge** - 状态徽章（统一样式）
7. **ROIIndicator** - ROI指示器（自动分级着色）
8. **LiveDot** - 直播状态点（脉冲动画）

#### 表单组件
1. **TargetingSelector** - 定向选择器（综合）
2. **BudgetInput** - 预算输入（带建议）
3. **BidInput** - 出价输入（带建议）
4. **TimeRangeSelector** - 时间范围选择

### 组件实现示例

```tsx
// FileUploadZone.tsx
export function FileUploadZone({ 
  accept, 
  maxSize, 
  onUpload,
  children 
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  
  return (
    <div 
      className={cn(
        'qc-card border-2 border-dashed cursor-pointer transition-colors',
        isDragging && 'border-qc-orange bg-orange-50'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {children}
      <input 
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ROIIndicator.tsx
export function ROIIndicator({ value }: { value: number }) {
  const config = value > 5 
    ? { label: '优秀', color: 'qc-roi-excellent' }
    : value >= 3
    ? { label: '良好', color: 'qc-roi-good' }
    : { label: '较差', color: 'qc-roi-poor' }
  
  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-2xl font-bold', config.color)}>
        {value.toFixed(1)}
      </span>
      <span className="qc-badge qc-badge-info text-xs">
        {config.label}
      </span>
    </div>
  )
}
```

### 实施时间: 10天（2人）

---

## 方案 07 - API层重构与扩展

### 当前API模块（已有）
```
frontend/src/api/
├── activity.ts
├── ad.ts
├── advertiser.ts
├── audience.ts
├── campaign.ts
├── creative.ts
├── file.ts
├── media.ts
├── report.ts
└── targeting.ts
```

### 需补充API模块

```typescript
// api/product.ts - 商品API
export const productAPI = {
  list: (params: ProductListParams) => client.get('/qianchuan/product/available/get'),
  detail: (id: string) => client.get(`/qianchuan/product/${id}`),
  analyze: (params: AnalyzeParams) => client.get('/qianchuan/product/analyse/list')
}

// api/live.ts - 直播API
export const liveAPI = {
  getRooms: (params: RoomParams) => client.get('/qianchuan/live/room/get'),
  getRoomDetail: (roomId: string) => client.get(`/qianchuan/live/room/detail/${roomId}`),
  getLiveData: (params: DataParams) => client.get('/qianchuan/report/live/get')
}

// api/uniPromotion.ts - 全域推广API
export const uniPromotionAPI = {
  create: (data: CreateData) => client.post('/qianchuan/uni_promotion/ad/create'),
  update: (data: UpdateData) => client.post('/qianchuan/uni_promotion/ad/update'),
  list: (params: ListParams) => client.get('/qianchuan/uni_promotion/ad/list'),
  detail: (id: string) => client.get(`/qianchuan/uni_promotion/ad/detail/${id}`)
}

// api/suixintui.ts - 随心推API
export const suixintuiAPI = {
  createOrder: (data: OrderData) => client.post('/qianchuan/aweme/order/create'),
  getOrders: (params: QueryParams) => client.get('/qianchuan/aweme/order/get'),
  terminate: (orderId: string) => client.post('/qianchuan/aweme/order/terminate'),
  estimate: (params: EstimateParams) => client.get('/qianchuan/aweme/estimate_profit')
}

// api/keyword.ts - 关键词API
export const keywordAPI = {
  getKeywords: (params) => client.get('/qianchuan/ad/keywords/get'),
  updateKeywords: (data) => client.post('/qianchuan/ad/keywords/update'),
  getSuggestions: (params) => client.get('/qianchuan/ad/recommend_keywords/get'),
  checkCompliance: (data) => client.post('/qianchuan/ad/keyword/check')
}

// api/finance.ts - 财务API
export const financeAPI = {
  getWallet: (advertiserId: string) => client.get('/qianchuan/finance/wallet/get'),
  getBalance: (advertiserId: string) => client.get('/qianchuan/advertiser/balance/get'),
  getTransactions: (params) => client.get('/qianchuan/finance/detail/get')
}

// api/aweme.ts - 抖音号API
export const awemeAPI = {
  getAuthorized: (params) => client.get('/qianchuan/aweme/authorized/get'),
  auth: (data) => client.post('/qianchuan/tools/aweme_auth'),
  getAccountInfo: (awemeId: string) => client.get(`/qianchuan/aweme/${awemeId}`)
}

// api/author.ts - 达人API
export const authorAPI = {
  search: (params) => client.get('/qianchuan/tools/aweme_similar_author/search'),
  getByCategory: (params) => client.get('/qianchuan/tools/aweme_category_top_author/get'),
  getCategories: (params) => client.get('/qianchuan/tools/aweme_multi_level_category/get')
}
```

### API Client 增强

```typescript
// api/client.ts
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
})

// 请求拦截器
client.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
client.interceptors.response.use(
  response => response.data,
  error => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // Token过期，跳转登录
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
```

### 实施时间: 8天（1人）

---

## 方案 08 - 状态管理重构

### 状态管理架构

使用 Zustand 进行模块化状态管理：

```typescript
// store/
├── authStore.ts          // 认证状态（已有）
├── loadingStore.ts       // 加载状态（已有）
├── campaignStore.ts      // 广告组状态（新增）
├── promotionStore.ts     // 推广计划状态（新增）
├── filterStore.ts        // 筛选器状态（新增）
├── targetingStore.ts     // 定向状态（新增）
└── uiStore.ts            // UI状态（新增）
```

### Store实现示例

```typescript
// store/campaignStore.ts
interface CampaignStore {
  campaigns: Campaign[]
  selectedIds: string[]
  filters: CampaignFilters
  sorting: SortConfig
  
  // Actions
  setCampaigns: (campaigns: Campaign[]) => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  setFilters: (filters: Partial<CampaignFilters>) => void
  setSorting: (sorting: SortConfig) => void
  
  // Computed
  selectedCampaigns: () => Campaign[]
  filteredCampaigns: () => Campaign[]
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: [],
  selectedIds: [],
  filters: {},
  sorting: { field: 'createdAt', order: 'desc' },
  
  setCampaigns: (campaigns) => set({ campaigns }),
  
  toggleSelect: (id) => set(state => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(i => i !== id)
      : [...state.selectedIds, id]
  })),
  
  selectAll: () => set(state => ({
    selectedIds: state.campaigns.map(c => c.id)
  })),
  
  clearSelection: () => set({ selectedIds: [] }),
  
  setFilters: (filters) => set(state => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setSorting: (sorting) => set({ sorting }),
  
  selectedCampaigns: () => {
    const { campaigns, selectedIds } = get()
    return campaigns.filter(c => selectedIds.includes(c.id))
  },
  
  filteredCampaigns: () => {
    const { campaigns, filters, sorting } = get()
    let result = campaigns
    
    // 应用筛选
    if (filters.status) {
      result = result.filter(c => c.status === filters.status)
    }
    if (filters.type) {
      result = result.filter(c => c.type === filters.type)
    }
    
    // 应用排序
    result.sort((a, b) => {
      const aVal = a[sorting.field]
      const bVal = b[sorting.field]
      return sorting.order === 'asc' 
        ? aVal > bVal ? 1 : -1
        : aVal < bVal ? 1 : -1
    })
    
    return result
  }
}))
```

### 数据缓存策略

```typescript
// hooks/useDataCache.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCampaigns(advertiserId: string) {
  return useQuery({
    queryKey: ['campaigns', advertiserId],
    queryFn: () => campaignAPI.list({ advertiser_id: advertiserId }),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    refetchInterval: 30 * 1000 // 30秒自动刷新
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: campaignAPI.update,
    onSuccess: () => {
      // 刷新缓存
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })
}
```

### 实施时间: 6天（1人）

---

## 总体时间估算

| 方案 | 预计时间 | 人力 |
|------|---------|------|
| 方案06 - 组件库 | 10天 | 2人 |
| 方案07 - API层 | 8天 | 1人 |
| 方案08 - 状态管理 | 6天 | 1人 |
| **总计** | **24天** | **2-3人** |

---

**文档版本**: v1.0  
**创建日期**: 2025-11-11  
**负责人**: 前端团队
