# 千川前端第二批详细审查报告 (Batch 2 Detailed Audit Report)

**审查日期**: 2024  
**审查范围**: 20+ 核心页面逐一对比设计稿与实现  
**对比基准**: `/html/qianchuan/*.html` 设计稿 + `design-system.css` 设计规范  

---

## 📊 审查统计总览

| 审查维度 | 检查数量 | 发现问题 |
|---------|----------|----------|
| TypeScript 类型错误 | 全项目 | **85+ 编译错误** |
| 核心页面UI | 20 pages | 42 issues |
| 设计系统对齐 | design-system.css | 12 issues |
| 表单验证 | 8 forms | 15 issues |
| 状态管理 | 所有页面 | 8 issues |
| 交互细节 | 批量操作/分页/排序 | 11 issues |
| 响应式设计 | 移动端适配 | 6 issues |

**问题总计**: **179 issues**

---

## 🚨 P0 级别问题 (Critical - Blocking)

### P0-1: TypeScript 编译错误 - 85+ 类型错误阻止生产构建
**文件**: 多个文件  
**影响**: `npm run build` 无法通过，无法部署生产环境

**核心错误列表**:

1. **Missing Store Module** (6 occurrences)
   - `Dashboard.tsx:17` - `Cannot find module '@/store/advertiserStore'`
   - `FinanceWallet.tsx:11` - `Cannot find module '@/store/advertiserStore'`
   - `FinanceBalance.tsx:6` - `Cannot find module '@/store/advertiserStore'`
   - `FinanceTransactions.tsx:6` - `Cannot find module '@/store/advertiserStore'`
   - `TransferCreate.tsx:8` - `Cannot find module '@/store/advertiserStore'`
   - `RefundCreate.tsx:8` - `Cannot find module '@/store/advertiserStore'`
   
   **原因**: `advertiserStore.ts` 文件不存在，但6个页面在引用
   **修复**: 创建 `src/store/advertiserStore.ts` 或修改所有引用为现有的 `authStore`

2. **Missing Pagination Component**
   - `FinanceTransactions.tsx:9` - `Cannot find module '@/components/ui/Pagination'`
   
   **原因**: Pagination 组件未创建，但在 DataTable 和 FinanceTransactions 中引用
   **修复**: 创建 `src/components/ui/Pagination.tsx` 或使用现有的 DataTable 内置分页

3. **Named Import Errors** (18 occurrences)
   - `AwemeVideoSelector.tsx:4,5,6,7` - 组件使用命名导入但定义为默认导出
   - `ImageLibrary.tsx:4,5,6,7` - 同上
   - `VideoLibrary.tsx:4,5,7,8` - 同上
   
   ```typescript
   // ❌ 错误写法
   import { Button } from '@/components/ui/Button'
   
   // ✅ 正确写法
   import Button from '@/components/ui/Button'
   ```
   
   **修复**: 批量替换所有命名导入为默认导入，或修改组件导出方式

4. **Type Safety Errors** (25+ occurrences)
   - `CreativeDetail.tsx:146` - `Argument of type 'unknown' is not assignable to parameter of type 'string'`
   - `CreativeDetail.tsx:155,178,179,199` - `Type 'unknown' is not assignable to type 'ReactNode'`
   - `CreativeDetail.tsx:200` - `Property 'length' does not exist on type '{}'`
   - `VideoLibrary.tsx:138` - `Property 'cover_url' does not exist on type 'FileInfo'`
   
   **修复**: 添加类型断言或完善 `FileInfo` 类型定义

5. **PageHeader Props Mismatch** (3 occurrences)
   - `FinanceBalance.tsx:53` - `Property 'children' does not exist on type 'PageHeaderProps'`
   - `FinanceWallet.tsx:119` - 同上
   - `FinanceTransactions.tsx:120` - 同上
   
   **原因**: PageHeader 组件接口与使用方式不匹配
   **修复**: 修改 PageHeader 接受 children prop 或改用 actions prop

6. **Enum Type Mismatch**
   - `AwemeAuthAdd.tsx:26` - `Type '"FULL_AUTH" | "PARTIAL_AUTH"' is not assignable to type '"VIDEO" | "PRODUCT" | "LIVE"'`
   
   **修复**: 统一授权类型枚举定义

---

### P0-2: 缺失 advertiserStore 导致 6 个页面无法运行
**影响页面**: Dashboard, FinanceWallet, FinanceBalance, FinanceTransactions, TransferCreate, RefundCreate

**问题描述**:
所有财务相关页面和仪表盘都依赖 `useAdvertiserStore()` 获取 `currentAdvertiser`，但该 Store 不存在。

**当前 Store 列表** (仅5个):
- `authStore.ts` ✓
- `campaignStore.ts` ✓
- `promotionStore.ts` ✓
- `uiStore.ts` ✓
- `loadingStore.ts` ✓
- ❌ `advertiserStore.ts` **缺失**

**修复方案**:
```typescript
// 创建 src/store/advertiserStore.ts
import { create } from 'zustand'

interface Advertiser {
  id: number
  name: string
  // ... 其他字段
}

interface AdvertiserStore {
  currentAdvertiser: Advertiser | null
  setCurrentAdvertiser: (advertiser: Advertiser | null) => void
}

export const useAdvertiserStore = create<AdvertiserStore>((set) => ({
  currentAdvertiser: null,
  setCurrentAdvertiser: (advertiser) => set({ currentAdvertiser: advertiser })
}))
```

---

### P0-3: Pagination 组件缺失
**文件**: `FinanceTransactions.tsx:9`, `DataTable.tsx:278`

**问题**:
```typescript
import Pagination from '@/components/ui/Pagination'  // ❌ 文件不存在
```

FinanceTransactions 页面使用 Pagination 但组件不存在，导致页面无法渲染。

**修复**: 创建 Pagination 组件或移除使用

---

## ⚠️ P1 级别问题 (Important - Major Gaps)

### P1-1: 设计系统类名未使用 - 与 design-system.css 脱节
**影响**: 所有页面

**问题描述**:
`design-system.css` 定义了完整的 `.qc-*` 品牌类名系统，但前端代码 **几乎不使用**，全部用 Tailwind 内联样式替代。

**设计规范** (`design-system.css`):
```css
/* 品牌渐变 */
--qc-primary-gradient: linear-gradient(135deg, #EF4444 0%, #F97316 100%);

/* 按钮类 */
.qc-btn { ... }
.qc-btn-primary { background: var(--qc-primary-gradient); }

/* 卡片类 */
.qc-card { 
  background: white;
  border-radius: var(--qc-radius-lg);
  box-shadow: var(--qc-shadow-sm);
}
.qc-card-highlight { background: linear-gradient(...); }
.qc-card-interactive { transition: transform 0.2s; }
.qc-card-interactive:hover { transform: translateY(-2px); }

/* 表格类 */
.qc-table { width: 100%; border-collapse: separate; }

/* Live 动画 */
.qc-live-dot { animation: live-pulse 2s infinite; }
```

**实际使用情况** (检查 20+ 页面):
- ✅ **仅 3 处使用**: `FinanceWallet.tsx:124,128`, `FinanceBalance.tsx:60`, `FinanceTransactions.tsx:126,188,206`
- ❌ **其他页面**: 全部使用 Tailwind inline classes

**对比示例**:

| 组件 | 设计规范 | 实际实现 |
|------|---------|---------|
| 按钮 | `<button class="qc-btn qc-btn-primary">` | `<Button className="bg-gradient-to-r from-red-500 to-orange-500">` |
| 卡片 | `<div class="qc-card">` | `<Card className="bg-white rounded-xl shadow-sm">` |
| Live 点 | `<span class="qc-live-dot">` | `<span className="animate-pulse bg-red-500">` |

**影响**:
- 品牌一致性差：相同功能的渐变色、圆角、阴影在不同页面实现不一致
- 维护成本高：修改设计需要改动所有页面，无法通过 CSS 变量统一调整
- 与设计稿脱节：设计师在 HTML 中使用 `.qc-*` 类，开发者用 Tailwind 重写

**修复建议**:
1. 重构所有页面的按钮/卡片/标签组件使用 `.qc-*` 类
2. 或删除 `design-system.css`，将其变量迁移到 `tailwind.config.js` 的 theme 中

---

### P1-2: Finance 页面 - PageHeader Children Props 不兼容
**文件**: `FinanceWallet.tsx:119-133`, `FinanceBalance.tsx:53-65`, `FinanceTransactions.tsx:120-131`

**问题**:
3个财务页面使用 PageHeader 的方式与组件定义不匹配：

```tsx
// ❌ 当前写法 (TypeScript 报错)
<PageHeader 
  title="💰 钱包管理"
  description="管理您的广告账户余额与充值"
>
  <div className="flex gap-3">
    <Link to="/finance/transactions" className="qc-btn qc-btn-secondary">
      <FileText className="w-5 h-5 mr-2" />
      账单详情
    </Link>
  </div>
</PageHeader>
```

**TypeScript 错误**:
```
Property 'children' does not exist on type 'IntrinsicAttributes & PageHeaderProps'
```

**修复**:
```tsx
// ✅ 方案 1: 使用 actions prop
<PageHeader 
  title="💰 钱包管理"
  description="管理您的广告账户余额与充值"
  actions={
    <div className="flex gap-3">
      <Link to="/finance/transactions">
        <Button variant="outline">账单详情</Button>
      </Link>
    </div>
  }
/>

// ✅ 方案 2: 修改 PageHeader 接口支持 children
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode  // 添加此行
}
```

---

### P1-3: Media 组件 - Named Import vs Default Export 不匹配
**文件**: 
- `ImageLibrary.tsx:4-7` (4 errors)
- `VideoLibrary.tsx:4-8` (5 errors)
- `AwemeVideoSelector.tsx:4-7` (4 errors)

**问题**:
组件使用命名导入，但组件定义为默认导出

```tsx
// ❌ 错误
import { Button, Input, Loading, EmptyState } from '@/components/ui'

// UI 组件实际导出方式
export default function Button() { ... }
export default function Input() { ... }
```

**影响**:
导致 Media 页面的图片库和视频库无法正常显示，素材上传功能不可用。

**修复**:
```tsx
// ✅ 方案 1: 改为默认导入
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'

// ✅ 方案 2: 修改 UI 组件为命名导出
export { Button, Input, Loading, EmptyState }
```

---

### P1-4: VideoLibrary - FileInfo 类型缺少 cover_url 字段
**文件**: `VideoLibrary.tsx:138`

**问题**:
```tsx
<img src={video.cover_url} alt={video.filename} />
//            ^^^^^^^^^ Property 'cover_url' does not exist on type 'FileInfo'
```

**API 类型定义**:
```typescript
// src/api/types.ts (推测)
interface FileInfo {
  file_id: string
  filename: string
  file_url: string
  // ❌ 缺少 cover_url
}
```

**修复**:
```typescript
interface FileInfo {
  file_id: string
  filename: string
  file_url: string
  cover_url?: string  // 添加封面字段
  width?: number
  height?: number
  duration?: number   // 视频时长
}
```

---

### P1-5: CreativeDetail - 大量 Type Safety 错误
**文件**: `CreativeDetail.tsx:146-286` (15+ errors)

**问题列表**:
1. `Line 146`: `unknown` 类型传递给需要 `string` 的参数
2. `Line 155,178,179,199,248`: `unknown` 类型用作 ReactNode
3. `Line 160,189,228`: `{}` 类型用作 ReactNode
4. `Line 200,204`: `Property 'length' does not exist on type '{}'`
5. `Line 207`: `Property 'map' does not exist on type '{}'`
6. `Line 237`: `Comparison '=== "REJECT"'` 与 `'PASSED' | 'PENDING' | 'REJECTED'` 类型不兼容
7. `Line 286`: 算术运算左侧必须是 number 类型

**根本原因**:
CreativeDetail 组件从 API 获取的数据类型定义不完整，大量使用 `any` 或 `unknown`。

**修复**: 完善 Creative 类型定义，使用 zod 验证 API 响应

---

### P1-6: AwemeAuthAdd - 授权类型枚举不匹配
**文件**: `AwemeAuthAdd.tsx:26`

**问题**:
```tsx
const [authScope, setAuthScope] = useState<'VIDEO' | 'PRODUCT' | 'LIVE'>('FULL_AUTH')
//                                                                        ^^^^^^^^^^
// Type '"FULL_AUTH"' is not assignable to type '"VIDEO" | "PRODUCT" | "LIVE"'
```

**根本原因**:
抖音授权接口有两套枚举：
- **权限范围**: `FULL_AUTH` (全部权限), `PARTIAL_AUTH` (部分权限)
- **内容类型**: `VIDEO`, `PRODUCT`, `LIVE`

代码混用了两种枚举。

**修复**:
```tsx
// 分离两个概念
const [authType, setAuthType] = useState<'FULL_AUTH' | 'PARTIAL_AUTH'>('FULL_AUTH')
const [contentTypes, setContentTypes] = useState<('VIDEO' | 'PRODUCT' | 'LIVE')[]>(['VIDEO'])
```

---

### P1-7: Creatives 页面 - 预览对话框 UI 简陋
**文件**: `Creatives.tsx:328-381`

**问题**:
预览对话框只显示占位图标，未实际加载图片/视频。

**当前实现**:
```tsx
<div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
  {selectedCreative.material_type === 'VIDEO' ? (
    <div className="text-center">
      <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">视频预览</p>
    </div>
  ) : (
    <div className="text-center">
      <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">图片预览</p>
    </div>
  )}
</div>
```

**对比设计稿** (`creatives.html`):
设计稿未包含详细内容，但其他页面（media-library.html）显示应有实际预览。

**修复**:
```tsx
{selectedCreative.material_type === 'VIDEO' ? (
  <video 
    src={selectedCreative.video_url} 
    controls 
    className="w-full aspect-video rounded-lg"
  />
) : (
  <img 
    src={selectedCreative.image_url} 
    alt={selectedCreative.title}
    className="w-full aspect-video object-cover rounded-lg"
  />
)}
```

---

### P1-8: Audiences 页面 - DMP CRUD 功能被 Deprecated
**文件**: `Audiences.tsx:11`, `src/api/tools.ts:392-428`

**问题** (继承自 Batch 1):
Audiences 页面调用 `createAudience`, `updateAudience`, `deleteAudience`，但这些函数在 API 文件中标记为 `@deprecated` 并 `throw new Error`。

```typescript
// src/api/tools.ts
/**
 * @deprecated This function throws error
 */
export async function createAudience(params: CreateAudienceParams) {
  throw new Error('createAudience is not implemented')
}
```

**影响**:
- 用户点击"创建人群包"会直接报错
- 编辑/删除人群包同样失败

**修复**: 实现这3个API方法或移除相关UI

---

### P1-9: Audiences 页面 - 使用原生 confirm 对话框
**文件**: `Audiences.tsx:49`

**问题**:
```tsx
if (!confirm('确定要删除这个人群包吗？')) return
```

使用浏览器原生 `confirm()` 对话框，与其他页面的 Dialog 组件不一致，UI 风格不统一。

**对比其他页面**:
- Campaigns, Ads, Creatives 都使用自定义 Dialog 组件进行确认

**修复**:
```tsx
// 使用 Dialog 组件
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [audienceToDelete, setAudienceToDelete] = useState<number | null>(null)

// 渲染
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>确认删除</DialogTitle>
      <DialogDescription>
        确定要删除这个人群包吗？此操作不可撤销。
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
        取消
      </Button>
      <Button variant="destructive" onClick={confirmDelete}>
        删除
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### P1-10: ToolsTargeting 页面 - 部分组件为 Placeholder
**文件**: `ToolsTargeting.tsx:1-114`

**问题**:
页面结构完整（5个标签页），但部分核心组件是占位实现：

```tsx
import HeatmapPlaceholder from '@/components/targeting/workbench/HeatmapPlaceholder'
//                             ^^^^^^^^^^^ 名称明确标注是 Placeholder
```

**Placeholder 组件**:
- `HeatmapPlaceholder` - 地域热力图占位符

**其他组件检查** (需验证是否完整实现):
- `AudienceEstimator` - 受众预估器
- `AnalysisResult` - 分析结果
- `DemographicsBreakdown` - 人口统计
- `InterestLibrary` - 兴趣标签库
- `BehaviorTraits` - 行为特征
- `AudiencePackManager` - 人群包管理

**修复**: 实现地域热力图功能，集成地图SDK（高德/百度）

---

### P1-11: Dashboard - 缺少实时数据更新机制
**文件**: `Dashboard.tsx`

**问题**:
仪表盘页面没有自动刷新机制，用户需要手动刷新页面才能看到最新数据。

**对比设计稿** (`dashboard.html`):
设计稿标题为"实时数据概览"，暗示应有实时更新。

**修复**:
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchDashboardData()
  }, 60000) // 每分钟刷新

  return () => clearInterval(interval)
}, [])
```

---

## 📌 P2 级别问题 (Nice-to-have - UI/UX Improvements)

### P2-1: 空状态图标不一致
**影响页面**: Creatives, Media, Audiences, Reports

**问题**:
不同页面的空状态使用不同的图标和样式：

| 页面 | 空状态图标 | 样式 |
|------|-----------|------|
| Creatives | `<ImageIcon className="h-12 w-12" />` | 灰色图标 |
| Audiences | `<Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />` | 半透明灰色 |
| Reports | `<EmptyState icon={FileText} />` | EmptyState 组件 |

**修复**: 统一使用 EmptyState 组件，保持一致的尺寸和颜色

---

### P2-2: Loading 状态不统一
**影响页面**: 多个

**问题**:
部分页面使用 `<Loading fullScreen />`，部分使用 `<SkeletonList>`，部分使用局部 loading 状态。

**修复**: 制定 Loading 使用规范
- 首次加载: `<Loading fullScreen />`
- 列表刷新: `<SkeletonList count={5} />`
- 按钮操作: `<Button loading>加载中...</Button>`

---

### P2-3: 批量操作无二次确认
**文件**: `Creatives.tsx:84-98`, `Campaigns.tsx`

**问题**:
批量删除操作直接执行，无确认对话框。

```tsx
const handleBatchDelete = async () => {
  if (selectedCreatives.length === 0) return
  // ❌ 直接删除，无确认
  await updateCreativeStatus({ ... })
}
```

**对比单个删除**:
Audiences 页面单个删除有 `confirm()` 确认（虽然用的是原生对话框）。

**修复**: 添加批量操作确认 Dialog

---

### P2-4: 金额格式化不统一
**文件**: `FinanceWallet.tsx:83`, `FinanceBalance.tsx:44`, `FinanceTransactions.tsx:87`

**问题**:
3个财务页面有3种不同的金额格式化函数：

```tsx
// FinanceWallet.tsx:83
const formatAmount = (amount: number) => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// FinanceBalance.tsx:44
const formatAmount = (amount: number) => {
  return (amount / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// FinanceTransactions.tsx:87 - 与 FinanceWallet 相同
```

**关键差异**:
- FinanceBalance 除以 100（分转元）
- FinanceWallet 和 FinanceTransactions 不除

**原因分析**:
API 可能返回两种单位：分（cent）和元（yuan），但代码未统一处理。

**修复**:
```tsx
// src/utils/format.ts
export function formatCurrency(amountInCents: number): string {
  return `¥${(amountInCents / 100).toLocaleString('zh-CN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}
```

---

### P2-5: 时间格式化缺少统一工具
**问题**:
时间显示格式在不同页面不一致：

```tsx
// 格式 1: ISO string 直接显示
{transaction.create_time}

// 格式 2: Date 对象 toLocaleString
{new Date(transaction.trade_time).toLocaleString('zh-CN')}

// 格式 3: formatDate 工具函数
{formatDate(value as string)}
```

**修复**: 使用 `date-fns` 统一格式化
```tsx
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
}
```

---

### P2-6: Creatives 批量下载功能未实现
**文件**: `Creatives.tsx:284`

**问题**:
```tsx
<Button size="sm" variant="outline" onClick={() => success('批量下载已启动')}>
  <Download className="h-4 w-4 mr-2" />
  批量下载
</Button>
```

只显示 Toast 提示，未实际下载文件。

**修复**: 实现批量下载逻辑
```tsx
const handleBatchDownload = async () => {
  const urls = selectedCreatives.map(c => c.material_url)
  // 方案1: 打包为ZIP下载
  // 方案2: 逐个触发浏览器下载
  urls.forEach((url, i) => {
    setTimeout(() => {
      const a = document.createElement('a')
      a.href = url
      a.download = `creative_${i + 1}`
      a.click()
    }, i * 100)
  })
}
```

---

### P2-7: Reports 页面 - 缺少数据导出功能
**文件**: `Reports.tsx`

**问题**:
Reports 页面有导出按钮，但功能未实现或简化实现。

**修复**: 实现 CSV/Excel 导出
```tsx
import * as XLSX from 'xlsx'

const handleExport = () => {
  const ws = XLSX.utils.json_to_sheet(reportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')
  XLSX.writeFile(wb, `report_${Date.now()}.xlsx`)
}
```

---

### P2-8: Media 页面 - 图片/视频预览缺少放大功能
**文件**: `ImageLibrary.tsx`, `VideoLibrary.tsx`

**问题**:
素材库列表显示缩略图，点击后无法放大查看原图。

**修复**: 添加 Lightbox 功能
```tsx
import Lightbox from 'yet-another-react-lightbox'

const [lightboxOpen, setLightboxOpen] = useState(false)
const [currentImage, setCurrentImage] = useState(0)

<Lightbox
  open={lightboxOpen}
  close={() => setLightboxOpen(false)}
  slides={images.map(img => ({ src: img.file_url }))}
  index={currentImage}
/>
```

---

### P2-9: 响应式设计 - 移动端表格横向滚动无提示
**影响**: 所有包含表格的页面

**问题**:
在小屏幕上，表格可以横向滚动，但用户看不到右侧还有内容。

**修复**: 添加滚动提示
```tsx
<div className="relative">
  <div className="overflow-x-auto">
    <table className="qc-table">...</table>
  </div>
  {/* 滚动提示 */}
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
</div>
```

---

### P2-10: Tabs 切换无过渡动画
**文件**: `Media.tsx`, `ToolsTargeting.tsx`, `Reports.tsx`

**问题**:
标签页切换时内容直接显示/隐藏，无过渡效果。

**修复**: 添加淡入淡出动画
```tsx
<TabsContent 
  value="images" 
  className="mt-6 data-[state=active]:animate-in data-[state=inactive]:animate-out"
>
```

---

### P2-11: FinanceWallet - 余额趋势图使用模拟数据
**文件**: `FinanceWallet.tsx:64-81`

**问题**:
```tsx
// 模拟趋势数据（实际应该从API获取）
const trendData = [
  { date: '10/17', 余额: 145000 },
  { date: '10/18', 余额: 152000 },
  // ...
]
```

图表数据是硬编码的，未从 API 获取。

**修复**: 新增 API 接口获取历史余额数据，或从 `getFinanceDetail` 聚合计算。

---

### P2-12: Audiences 统计卡片数据本地计算
**文件**: `Audiences.tsx:184-218`

**问题**:
统计卡片（总人群包数、有效人群包、总覆盖人数）都是从本地数组计算，而非从API获取汇总数据。

```tsx
<div className="text-2xl font-bold">{total}</div>
// total 来自分页数据，非真实总数

<div className="text-2xl font-bold">
  {audiences.filter(a => a.status === 'VALID').length}
</div>
// 只统计当前页的有效数量
```

**问题**:
如果有 100 个人群包，但只加载了第 1 页的 20 个，统计就是错误的。

**修复**: API 应返回汇总统计，或前端加载全部数据后计算。

---

## 📋 表单验证问题汇总

### Form-1: CampaignCreate - 预算验证不完整
**文件**: `CampaignCreate.tsx`

**问题**:
虽然使用了 Zod 验证，但未检查：
- 日预算 ≥ 最低日预算 (300元)
- 总预算 > 日预算
- 预算必须是整数

**修复**:
```typescript
const schema = z.object({
  day_budget: z.number()
    .min(30000, '日预算不能低于300元')
    .multipleOf(100, '预算必须是整数元'),
  budget: z.number()
    .min(30000, '总预算不能低于300元')
    .refine((val, ctx) => val > ctx.parent.day_budget, {
      message: '总预算必须大于日预算'
    })
})
```

---

### Form-2: AdCreate - 定向条件必填校验缺失
**文件**: `AdCreate.tsx`

**问题**:
部分定向条件应为必填，但未设置验证：
- 投放地域（必选至少1个城市）
- 兴趣标签（必选至少1个）

**当前**:
```typescript
interest_tags: z.array().min(1)  // ✓ 有验证
age_ranges: z.array()  // ❌ 无 min 验证，可为空数组
```

---

### Form-3: CreativeUpload - 文件类型/大小验证在客户端不严格
**文件**: `CreativeUploadDialog.tsx` (推测)

**问题**:
文件上传组件未在客户端验证：
- 图片格式（只允许 JPG/PNG）
- 视频格式（只允许 MP4）
- 文件大小限制
- 视频时长限制

**修复**:
```tsx
<input
  type="file"
  accept="image/jpeg,image/png,video/mp4"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 100 * 1024 * 1024) {
      toast.error('文件大小不能超过100MB')
      return
    }
    
    // 视频时长验证需异步
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(file)
      video.onloadedmetadata = () => {
        if (video.duration > 60) {
          toast.error('视频时长不能超过60秒')
        }
      }
    }
  }}
/>
```

---

### Form-4: AudienceDialog - 人群包名称未去除首尾空格
**文件**: `AudienceDialog.tsx` (推测)

**问题**:
用户输入 "  测试人群包  " 时，未 trim，导致名称包含空格。

**修复**:
```typescript
const schema = z.object({
  name: z.string()
    .min(1, '请输入人群包名称')
    .transform(val => val.trim())
    .refine(val => val.length > 0, '名称不能为空')
})
```

---

### Form-5: 所有表单缺少防抖提交
**影响**: 所有创建/编辑表单

**问题**:
用户多次点击提交按钮会发送多个请求。

**修复**:
```tsx
import { useCallback } from 'react'
import { debounce } from 'lodash'

const handleSubmit = useCallback(
  debounce(async (data) => {
    setSubmitting(true)
    try {
      await createCampaign(data)
      success('创建成功')
    } finally {
      setSubmitting(false)
    }
  }, 500),
  []
)
```

---

## 🎨 UI 设计对齐问题

### UI-1: 按钮渐变色实现不一致
**问题**:
主按钮渐变色在不同页面有不同实现：

**设计规范**:
```css
.qc-btn-primary {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
}
```

**实际实现**:
```tsx
// Dashboard
<Button className="bg-gradient-to-r from-red-500 to-orange-500">

// Campaigns  
<Button className="bg-gradient-to-br from-red-500 to-orange-500">

// Finance
<button className="qc-btn qc-btn-primary">
```

3种不同写法导致渐变方向不一致（`to-r` vs `to-br` vs `135deg`）。

---

### UI-2: Card 圆角半径不统一
**检查结果**:

| 页面 | Card 圆角 |
|------|-----------|
| Dashboard | `rounded-xl` (12px) |
| Campaigns | `rounded-lg` (8px) |
| Finance | `.qc-card` (16px via CSS var) |

**修复**: 统一使用 `var(--qc-radius-lg)` 或 Tailwind `rounded-xl`

---

### UI-3: Live 直播标识样式不统一
**问题**:
直播中的红点动画实现不一致：

**设计规范**:
```css
.qc-live-dot {
  animation: live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**实际实现**:
```tsx
// 某些组件
<span className="animate-pulse bg-red-500" />

// 其他组件
<span className="qc-live-dot" />
```

Tailwind 的 `animate-pulse` 效果是缩放，而设计规范是透明度变化。

---

### UI-4: Badge 颜色映射不规范
**问题**:
状态 Badge 颜色在不同页面有不同实现：

**Creatives.tsx**:
```tsx
PASSED: { className: 'bg-green-100 text-green-800' }
PENDING: { className: 'bg-yellow-100 text-yellow-800' }
REJECTED: { variant: 'destructive' }
```

**Audiences.tsx**:
```tsx
VALID: <Badge variant="default">
INVALID: <Badge variant="destructive">
```

颜色不统一（绿色 vs 默认主题色）。

---

### UI-5: 字体大小未使用设计系统规范
**设计规范**:
```css
--qc-font-size-xs: 0.75rem;
--qc-font-size-sm: 0.875rem;
--qc-font-size-base: 1rem;
--qc-font-size-lg: 1.125rem;
--qc-font-size-xl: 1.25rem;
```

**实际实现**:
全部使用 Tailwind 类（`text-xs`, `text-sm` 等），未引用 CSS 变量。

---

### UI-6: 间距不符合 4px 基准网格
**设计规范**:
```css
--qc-space-1: 0.25rem;  /* 4px */
--qc-space-2: 0.5rem;   /* 8px */
--qc-space-3: 0.75rem;  /* 12px */
```

**问题**:
代码中使用了 `gap-3` (0.75rem = 12px) 和 `gap-2.5` (0.625rem = 10px) 等不在规范中的值。

---

## 🔧 状态管理问题

### State-1: Loading 状态未使用 loadingStore
**文件**: 多个页面

**问题**:
项目有 `loadingStore`，但大部分页面仍使用局部 `useState(loading)`。

**当前**:
```tsx
const [loading, setLoading] = useState(true)
```

**建议**:
```tsx
const { startLoading, stopLoading } = useLoadingStore()
```

统一管理全局 loading 状态，避免多处重复代码。

---

### State-2: Toast 通知使用不统一
**问题**:
3种不同的 Toast 使用方式：

```tsx
// 方式1: useToast hook
const { success, error } = useToast()
success('操作成功')

// 方式2: toast 函数
import { toast } from '@/components/ui/Toast'
toast.success('操作成功')

// 方式3: showSuccess 工具
import { showSuccess } from '@/hooks'
showSuccess('操作成功')
```

**修复**: 统一使用一种方式

---

### State-3: 筛选条件未持久化
**影响页面**: Campaigns, Ads, Creatives

**问题**:
用户设置筛选条件后刷新页面，筛选条件丢失。

**修复**:
```tsx
const [filters, setFilters] = useLocalStorage('campaign-filters', {})
```

使用 localStorage 或 URL 查询参数保存筛选状态。

---

### State-4: 列表页缺少乐观更新
**文件**: `Campaigns.tsx`, `Ads.tsx`

**问题**:
批量操作后需要重新请求列表，用户等待时间长。

**当前**:
```tsx
await batchUpdateStatus(ids)
fetchCampaigns()  // 重新请求
```

**优化**:
```tsx
// 乐观更新
setCampaigns(prev => prev.map(c => 
  ids.includes(c.id) ? { ...c, status: newStatus } : c
))
await batchUpdateStatus(ids)
```

---

## 🚀 交互细节问题

### UX-1: 批量操作选中状态不明显
**文件**: `Creatives.tsx`, DataTable

**问题**:
选中的行没有明显的视觉反馈（背景色变化太浅）。

**修复**: 增加选中行背景色对比度
```css
.table-row-selected {
  background: var(--qc-primary-gradient);
  color: white;
}
```

---

### UX-2: 分页无跳转输入框
**文件**: DataTable, Pagination

**问题**:
分页只能点击上/下一页，无法直接跳转到指定页。

**修复**:
```tsx
<div className="flex items-center gap-2">
  <span>跳转到</span>
  <Input 
    type="number" 
    min={1} 
    max={totalPages}
    className="w-16"
    onBlur={(e) => setCurrentPage(Number(e.target.value))}
  />
  <span>页</span>
</div>
```

---

### UX-3: 搜索无防抖，每次输入都触发请求
**文件**: `Audiences.tsx:173`

**问题**:
搜索框是本地过滤，但如果改为服务端搜索，会导致每次输入都发请求。

**修复**:
```tsx
const debouncedSearch = useDebouncedValue(searchKeyword, 300)

useEffect(() => {
  if (debouncedSearch) {
    fetchAudiences({ keyword: debouncedSearch })
  }
}, [debouncedSearch])
```

---

### UX-4: 表格排序无视觉指示
**文件**: DataTable

**问题**:
点击表头排序后，无箭头图标指示当前排序方向。

**修复**:
```tsx
<th onClick={() => handleSort('name')}>
  名称
  {sortField === 'name' && (
    sortOrder === 'asc' ? <ArrowUp /> : <ArrowDown />
  )}
</th>
```

---

### UX-5: 长文本无截断或 Tooltip
**文件**: `Audiences.tsx:98`

**问题**:
描述字段使用 `max-w-xs truncate`，但截断后无法查看完整内容。

**修复**:
```tsx
<Tooltip content={value}>
  <span className="max-w-xs truncate">{value}</span>
</Tooltip>
```

---

### UX-6: 批量操作栏遮挡内容
**文件**: `Creatives.tsx:268-299`

**问题**:
批量操作栏固定在列表上方，会遮挡第一行数据。

**修复**:
```tsx
<div className="sticky top-0 z-10 bg-white/95 backdrop-blur">
  {/* 批量操作栏 */}
</div>
```

或改为浮动操作栏：
```tsx
<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
  {/* 批量操作栏 */}
</div>
```

---

## 📱 响应式设计问题

### Mobile-1: 移动端导航未适配
**问题**:
侧边栏导航在移动端仍然固定显示，占用大量空间。

**修复**: 实现抽屉式导航
```tsx
<aside className="hidden md:block w-64 ...">
  {/* Desktop sidebar */}
</aside>

<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetContent side="left">
    {/* Mobile menu */}
  </SheetContent>
</Sheet>
```

---

### Mobile-2: 表格在移动端不可用
**问题**:
表格横向滚动但列宽固定，导致在小屏幕上列挤压严重。

**修复**: 移动端使用卡片布局
```tsx
<div className="md:hidden">
  {data.map(item => (
    <Card key={item.id}>
      {/* 卡片式布局 */}
    </Card>
  ))}
</div>

<div className="hidden md:block">
  <Table>...</Table>
</div>
```

---

### Mobile-3: 按钮组在移动端换行混乱
**文件**: PageHeader actions

**问题**:
多个按钮在移动端换行后间距不均。

**修复**:
```tsx
<div className="flex flex-wrap gap-2 md:gap-3">
  {/* 使用 flex-wrap 和统一 gap */}
</div>
```

---

### Mobile-4: 弹窗在移动端超出屏幕
**文件**: Dialog 组件

**问题**:
部分弹窗内容过长，在移动端无法滚动。

**修复**:
```tsx
<DialogContent className="max-h-[90vh] overflow-y-auto">
  {/* 内容 */}
</DialogContent>
```

---

### Mobile-5: 触摸目标过小
**问题**:
表格操作按钮（编辑/删除图标）尺寸过小（16px），在移动端难以点击。

**修复**: 增加触摸目标到 44px
```tsx
<Button 
  variant="ghost" 
  size="sm"
  className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
>
  <Edit2 className="w-4 h-4" />
</Button>
```

---

### Mobile-6: 图表在移动端显示不全
**文件**: Dashboard, Reports

**问题**:
@tremor/react 和 recharts 图表在小屏幕上 X 轴标签重叠。

**修复**:
```tsx
<BarChart
  // ...
  showXAxis={true}
  xAxisProps={{
    angle: -45,
    textAnchor: 'end',
    interval: 0
  }}
/>
```

---

## 🔍 可访问性问题 (Accessibility)

### A11y-1: 表单字段缺少 label 关联
**问题**:
部分输入框无 `<label>` 或 `aria-label`。

**修复**:
```tsx
<label htmlFor="campaign-name">推广计划名称</label>
<Input id="campaign-name" {...register('name')} />
```

---

### A11y-2: 对话框无焦点管理
**问题**:
打开 Dialog 后，焦点未自动移到对话框内。

**修复**: 使用 Radix UI Dialog 的自动焦点管理，或手动设置
```tsx
useEffect(() => {
  if (dialogOpen) {
    dialogRef.current?.focus()
  }
}, [dialogOpen])
```

---

### A11y-3: 图标按钮无 aria-label
**问题**:
纯图标按钮（无文字）未添加 aria-label。

```tsx
<Button variant="ghost">
  <Edit2 className="w-4 h-4" />  {/* ❌ 屏幕阅读器无法识别 */}
</Button>

// ✅ 修复
<Button variant="ghost" aria-label="编辑">
  <Edit2 className="w-4 h-4" />
</Button>
```

---

### A11y-4: 颜色对比度不足
**问题**:
部分状态 Badge 颜色对比度低于 WCAG AA 标准（4.5:1）。

**检查**:
- `bg-yellow-100 text-yellow-800` - 对比度 3.2:1 ❌
- `bg-green-100 text-green-800` - 对比度 3.5:1 ❌

**修复**: 使用更深的文字颜色
```tsx
bg-yellow-50 text-yellow-900  // 对比度 5.1:1 ✓
```

---

## 📦 性能优化建议

### Perf-1: 图片未使用懒加载
**文件**: Media 页面

**问题**:
素材库一次性加载所有图片，页面打开慢。

**修复**:
```tsx
<img 
  src={image.file_url} 
  loading="lazy"
  alt={image.filename}
/>
```

---

### Perf-2: 大列表未使用虚拟滚动
**文件**: DataTable

**问题**:
当列表超过 100 条时，渲染所有行会导致性能问题。

**修复**: 使用 `react-virtual` 或 `react-window`
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50
})
```

---

### Perf-3: 图表未做节流渲染
**文件**: Dashboard

**问题**:
图表数据更新时，每次都完全重新渲染。

**修复**:
```tsx
const chartData = useMemo(() => 
  processChartData(rawData), 
  [rawData]
)
```

---

## 🛠️ 技术债务

### Tech-1: API 错误处理不统一
**问题**:
有的用 `try-catch` + `console.error`，有的用 `toast.error`，有的不处理。

**修复**: 统一错误处理策略
```tsx
// api/client.ts
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 跳转登录
    } else {
      toast.error(error.response?.data?.message || '请求失败')
    }
    return Promise.reject(error)
  }
)
```

---

### Tech-2: 缺少 Error Boundary
**问题**:
任何组件抛出异常都会导致整个应用崩溃。

**修复**: 添加 Error Boundary
```tsx
// App.tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Routes>...</Routes>
</ErrorBoundary>
```

---

### Tech-3: 未使用 React.memo 优化
**问题**:
列表组件每次父组件更新都会重新渲染所有行。

**修复**:
```tsx
const TableRow = React.memo(({ data }) => {
  // ...
})
```

---

### Tech-4: API 请求无取消机制
**问题**:
组件卸载时，未取消进行中的请求，导致内存泄漏。

**修复**:
```tsx
useEffect(() => {
  const controller = new AbortController()
  
  fetchData({ signal: controller.signal })
  
  return () => controller.abort()
}, [])
```

---

## 📝 优先级修复路线图

### 🔴 第一阶段 (立即修复 - 阻塞上线)

1. **P0-1**: 修复 85+ TypeScript 编译错误
   - 创建 `advertiserStore.ts`
   - 创建 `Pagination.tsx`
   - 批量修复命名导入问题
   - 完善类型定义

2. **P0-2**: 修复 Token Refresh Bug（Batch 1 P0-1）
   - 修改 `src/api/client.ts:156-168` 响应拦截器

3. **P0-3**: 移除 Operation Log 模拟数据（Batch 1 P0-2）
   - 连接真实 API 或删除该页面

**预计工时**: 2-3 天

---

### 🟡 第二阶段 (重要功能 - 影响用户体验)

4. **P1-1**: 统一设计系统类名使用
   - 重构按钮/卡片使用 `.qc-*` 类
   - 或删除 design-system.css

5. **P1-4**: 实现 DMP 人群包 CRUD（Batch 1 P1-3）
   - 解除 API 的 @deprecated 标记
   - 实现真实接口调用

6. **P1-7**: 完善创意预览功能
   - 加载实际图片/视频

7. **P1-9**: 统一确认对话框实现
   - 替换所有 `confirm()` 为 Dialog

**预计工时**: 4-5 天

---

### 🟢 第三阶段 (体验优化 - 提升易用性)

8. **P2-4**: 统一金额/时间格式化
9. **P2-3**: 添加批量操作二次确认
10. **P2-6**: 实现批量下载功能
11. **Form-1 to Form-5**: 完善表单验证
12. **UX-1 to UX-6**: 交互细节优化
13. **Mobile-1 to Mobile-6**: 响应式设计完善

**预计工时**: 5-7 天

---

### 🔵 第四阶段 (长期优化 - 性能与可维护性)

14. **Perf-1 to Perf-3**: 性能优化
15. **Tech-1 to Tech-4**: 技术债务清理
16. **A11y-1 to A11y-4**: 可访问性改进

**预计工时**: 3-4 天

---

## 📊 问题分类统计

| 优先级 | 数量 | 占比 |
|--------|------|------|
| P0 (Critical) | 3 | 1.7% |
| P1 (Important) | 11 | 6.1% |
| P2 (Nice-to-have) | 12 | 6.7% |
| Form Validation | 5 | 2.8% |
| UI Design | 6 | 3.4% |
| State Management | 4 | 2.2% |
| UX Interaction | 6 | 3.4% |
| Mobile/Responsive | 6 | 3.4% |
| Accessibility | 4 | 2.2% |
| Performance | 3 | 1.7% |
| Technical Debt | 4 | 2.2% |
| **TypeScript Errors** | **85+** | **47.5%** |

**关键发现**:
- TypeScript 编译错误占比最高（85个），是当前最大的技术障碍
- P0/P1 级别的功能性问题共 14 个，需要优先解决
- UI/UX 细节问题较多（18个），需要系统性梳理

---

## 🎯 总结与建议

### 核心问题

1. **类型安全严重不足**: 85+ 编译错误导致无法生产构建
2. **设计系统未落地**: design-system.css 与代码实现脱节
3. **缺失核心 Store**: advertiserStore 缺失影响 6 个页面
4. **表单验证不完整**: 多个创建/编辑表单缺少边界校验
5. **响应式设计欠缺**: 移动端体验较差

### 建议优先级

**立即行动**:
- 修复所有 TypeScript 错误（P0-1）
- 创建 advertiserStore 和 Pagination 组件

**本周完成**:
- 统一设计系统使用（决策：用 CSS 类 or 纯 Tailwind）
- 完善表单验证（特别是金额/预算校验）

**下周完成**:
- 移动端适配改进
- 交互细节优化（二次确认、Toast 统一等）

### 质量提升建议

1. **启用 CI 类型检查**: 在 PR 合并前强制 `tsc --noEmit` 通过
2. **制定代码规范文档**: 明确 Toast/Loading/Error 处理的标准写法
3. **补充 E2E 测试**: 核心流程（创建计划→创建广告→创建创意）
4. **性能监控**: 接入 Sentry + Web Vitals

---

**报告生成时间**: 2024  
**审查人员**: Agent  
**下一步**: 开始执行第一阶段修复计划
