# 组件库开发指南

**目标**: 完善组件库，支持静态页面所有功能
**范围**: 基础UI组件 + 业务组件

---

## 📦 现有组件清单

### 基础UI组件 (26个)
```
src/components/ui/
├── Accordion.tsx ✅
├── Avatar.tsx ✅
├── Badge.tsx ✅ (需增强)
├── Button.tsx ✅
├── Card.tsx ✅
├── Checkbox.tsx ✅
├── Dialog.tsx ✅
├── DropdownMenu.tsx ✅
├── EmptyState.tsx ✅
├── ErrorBoundary.tsx ✅
├── ErrorState.tsx ✅
├── Form.tsx ✅
├── Input.tsx ✅
├── Loading.tsx ✅
├── Modal.tsx ✅ (可删除，与Dialog重复)
├── PageHeader.tsx ✅
├── Popover.tsx ✅
├── Progress.tsx ✅
├── RadioGroup.tsx ✅
├── Select.tsx ✅
├── Separator.tsx ✅
├── Slider.tsx ✅
├── Switch.tsx ✅
├── Table.tsx ✅ (基础版，需增强)
├── Tabs.tsx ✅
├── Toast.tsx ✅
└── Tooltip.tsx ✅
```

### 业务组件 (26个)
```
src/components/
├── layout/
│   ├── Header.tsx ✅
│   ├── Layout.tsx ✅
│   └── Sidebar.tsx ✅
├── common/
│   └── Breadcrumbs.tsx ✅
├── targeting/
│   ├── workbench/
│   │   ├── AnalysisResult.tsx ✅
│   │   ├── AudienceEstimator.tsx ✅
│   │   ├── BehaviorTraits.tsx ✅
│   │   ├── DemographicsBreakdown.tsx ✅
│   │   ├── HeatmapPlaceholder.tsx ✅ (占位，需实现)
│   │   └── InterestLibrary.tsx ✅ (部分)
│   ├── ActionSelector.tsx ✅
│   ├── DeviceBrandSelector.tsx ✅
│   ├── InterestSelector.tsx ✅
│   ├── PlatformNetworkCarrierSelector.tsx ✅
│   ├── RegionSelector.tsx ✅
│   ├── RelatedToolsPanel.tsx ✅
│   ├── SavedAudiencesPanel.tsx ✅
│   └── TargetingSelector.tsx ✅
├── campaign/
│   ├── CreateCampaignDialog.tsx ✅
│   └── CampaignTable.tsx ✅
├── ad/
│   └── CreateAdDialog.tsx ✅
├── creative/
│   └── CreativeUploadDialog.tsx ✅
└── audience/
    └── AudienceDialog.tsx ✅
```

---

## 🚨 缺失关键组件

### 高优先级 (P0)

#### 1. Heatmap - 地域热力图
**文件**: `src/components/ui/Heatmap.tsx`
**用途**: 地域热力图可视化

```typescript
interface HeatmapProps {
  data: Array<{ province: string; city: string; value: number }>
  xKey: string
  yKey: string
  colorScale: 'blue' | 'red' | 'green' | 'purple'
  width?: number
  height?: number
}

export default function Heatmap({
  data,
  xKey,
  yKey,
  colorScale,
  width = 800,
  height = 400
}: HeatmapProps) {
  // 使用 D3.js 或 Chart.js 实现热力图
  // 支持鼠标悬停显示详细数据
  // 支持点击钻取
  return <div>/* ... */</div>
}
```

#### 2. Tag & TagInput - 标签组件
**文件**: `src/components/ui/Tag.tsx` 和 `TagInput.tsx`

```typescript
// Tag.tsx
interface TagProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  onClose?: () => void
}

export default function Tag({ label, variant, size, closable, onClose }: TagProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-1 text-sm',
      variantStyles[variant],
      sizeStyles[size]
    )}>
      {label}
      {closable && <X className="ml-1 h-3 w-3 cursor-pointer" onClick={onClose} />}
    </span>
  )
}

// TagInput.tsx
interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
}

export default function TagInput({ value, onChange, placeholder, maxTags, suggestions }: TagInputProps) {
  // 支持输入自动补全
  // 支持添加/删除标签
  // 支持键盘操作 (Enter添加, Backspace删除)
  return <div>/* ... */</div>
}
```

#### 3. DataTable - 高级表格
**文件**: `src/components/ui/DataTable.tsx`
**基于**: 现有Table.tsx增强

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  searchable?: boolean
  filterable?: boolean
  pagination?: boolean
  pageSize?: number
}

interface ColumnDef<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  render?: (value: any, row: T) => React.ReactNode
}

export default function DataTable<T>(props: DataTableProps<T>) {
  // 集成排序、筛选、分页
  // 支持行选择
  // 支持列宽拖拽
  // 支持固定表头
  return <table>/* ... */</table>
}
```

#### 4. FilterPanel - 筛选面板
**文件**: `src/components/ui/FilterPanel.tsx`

```typescript
interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'number' | 'date' | 'dateRange'
  options?: Array<{ label: string; value: string }>
}

interface FilterPanelProps {
  fields: FilterField[]
  onFilter: (filters: Record<string, any>) => void
  onReset?: () => void
  layout?: 'vertical' | 'horizontal'
  columnCount?: number
}

export default function FilterPanel({ fields, onFilter, onReset, layout, columnCount }: FilterPanelProps) {
  // 根据字段类型渲染不同的控件
  // 支持水平/垂直布局
  // 支持重置功能
  return (
    <Card>
      <CardContent>
        <div className={cn(
          'grid gap-4',
          layout === 'horizontal'
            ? `grid-cols-${columnCount || 4}`
            : 'grid-cols-1'
        )}>
          {fields.map(field => (
            <FilterField key={field.key} field={field} />
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onReset}>重置</Button>
          <Button onClick={() => onFilter(getCurrentFilters())}>应用筛选</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 5. ActivityFeed - 活动流
**文件**: `src/components/ui/ActivityFeed.tsx`

```typescript
interface Activity {
  id: string
  message: string
  timestamp: string
  type: 'create' | 'update' | 'delete' | 'status_change'
  status?: 'success' | 'warning' | 'error' | 'info'
  user?: string
  details?: Record<string, any>
}

interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
  showTimestamp?: boolean
  groupByDate?: boolean
}

export default function ActivityFeed({ activities, maxItems, showTimestamp, groupByDate }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.slice(0, maxItems).map(activity => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className={cn(
            'h-2 w-2 rounded-full mt-2',
            activityStatusColors[activity.status]
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-sm">{activity.message}</p>
            {showTimestamp && (
              <p className="text-xs text-gray-500 mt-1">
                {formatTimeAgo(activity.timestamp)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### 6. Drawer - 抽屉组件
**文件**: `src/components/ui/Drawer.tsx`

```typescript
interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function Drawer({ open, onClose, children, side, size }: DrawerProps) {
  // 抽屉从右侧/左侧/顶部/底部滑出
  // 支持遮罩层点击关闭
  // 支持ESC键关闭
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'fixed z-50 bg-white shadow-xl',
              side === 'right' && `top-0 right-0 h-full w-${size}`,
              side === 'left' && `top-0 left-0 h-full w-${size}`,
              side === 'top' && `top-0 left-0 w-full h-${size}`,
              side === 'bottom' && `bottom-0 left-0 w-full h-${size}`
            )}
            initial={getInitialPosition(side)}
            animate={{ x: 0, y: 0 }}
            exit={getExitPosition(side)}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

#### 7. CreativePreview - 创意预览
**文件**: `src/components/ui/CreativePreview.tsx`

```typescript
interface Creative {
  id: number
  title: string
  material_type: 'IMAGE' | 'VIDEO'
  image_url?: string
  video_url?: string
  audit_status: 'PASSED' | 'PENDING' | 'REJECTED'
  specs?: {
    width: number
    height: number
    size: number
    duration?: number
  }
}

interface CreativePreviewProps {
  creative: Creative
  showInfo?: boolean
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function CreativePreview({ creative, showInfo, showActions, onEdit, onDelete }: CreativePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gray-100">
        {creative.material_type === 'VIDEO' ? (
          <video
            src={creative.video_url}
            poster={creative.image_url}
            className="w-full h-full object-cover"
            controls
          />
        ) : (
          <img
            src={creative.image_url}
            alt={creative.title}
            className="w-full h-full object-cover"
          />
        )}
        {creative.audit_status === 'REJECTED' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="error">已拒绝</Badge>
          </div>
        )}
      </div>
      {showInfo && (
        <CardContent className="p-4">
          <h4 className="font-medium truncate">{creative.title}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {creative.specs?.width} × {creative.specs?.height}
            {creative.specs?.duration && ` • ${creative.specs.duration}秒`}
          </p>
        </CardContent>
      )}
      {showActions && (
        <CardContent className="p-4 pt-0">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>编辑</Button>
            <Button size="sm" variant="outline" danger onClick={onDelete}>删除</Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
```

---

### 中优先级 (P1)

#### 8. ProgressBar - 进度条 (增强版)
**文件**: `src/components/ui/ProgressBar.tsx`

```typescript
interface ProgressBarProps {
  value: number
  max?: number
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  showLabel?: boolean
  labelPosition?: 'left' | 'right' | 'inside'
  size?: 'sm' | 'md' | 'lg'
  striped?: boolean
  animated?: boolean
}

export default function ProgressBar({ value, max, color, showLabel, labelPosition, size, striped, animated }: ProgressBarProps) {
  const percentage = (value / (max || 100)) * 100

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span>{value}</span>
          <span>{max || 100}</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full', sizeStyles[size])}>
        <motion.div
          className={cn(
            'h-full rounded-full',
            colorStyles[color],
            striped && 'bg-striped',
            animated && 'animate-progress'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
        {showLabel && labelPosition === 'inside' && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 9. DateRangePicker - 日期范围选择器
**文件**: `src/components/ui/DateRangePicker.tsx`

```typescript
interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  value?: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
  format?: string
  presets?: Array<{ label: string; range: DateRange }>
}

export default function DateRangePicker({ value, onChange, placeholder, format, presets }: DateRangePickerProps) {
  // 使用 react-day-picker 实现
  // 支持预设选项 (今天、昨天、近7天、近30天)
  // 支持自定义范围
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Calendar className="mr-2 h-4 w-4" />
          {value ? formatDateRange(value, format) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r">
            {presets?.map(preset => (
              <Button
                key={preset.label}
                variant="ghost"
                onClick={() => onChange(preset.range)}
                className="w-full justify-start"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

#### 10. StatCard - 统计卡片 (增强版)
**文件**: `src/components/ui/StatCard.tsx`

```typescript
interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ComponentType<{ className?: string }>
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  trend?: Array<{ date: string; value: number }>
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  action?: {
    label: string
    onClick: () => void
  }
}

export default function StatCard({ title, value, icon: Icon, change, trend, color, action }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className={cn(
                  'h-4 w-4',
                  change.type === 'increase' ? 'text-green-600' :
                  change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'
                )} />
                <span className={cn(
                  change.type === 'increase' ? 'text-green-600' :
                  change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'
                )}>
                  {change.value > 0 ? '+' : ''}{change.value}%
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('p-3 rounded-lg', colorStyles[color])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4">
            <Sparkline data={trend} />
          </div>
        )}
        {action && (
          <Button variant="link" className="mt-4 h-auto p-0" onClick={action.onClick}>
            {action.label} →
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

#### 11. SearchBox - 搜索框 (增强版)
**文件**: `src/components/ui/SearchBox.tsx`

```typescript
interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  debounceMs?: number
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function SearchBox({ value, onChange, onSearch, placeholder, suggestions, debounceMs, clearable, size }: SearchBoxProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debouncedValue = useDebounce(value, debounceMs || 300)

  useEffect(() => {
    if (onSearch && debouncedValue) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, onSearch])

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        size={size}
        className={cn(clearable && value && 'pr-10')}
      />
      {clearable && value && (
        <X
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
          onClick={() => onChange('')}
        />
      )}
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(suggestion)
                setShowSuggestions(false)
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### 12. Skeleton - 骨架屏
**文件**: `src/components/ui/Skeleton.tsx`

```typescript
interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export default function Skeleton({ className, width, height, rounded }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        rounded && 'rounded-md',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

// 预定义的骨架屏模式
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && 'w-3/4',
            i !== 0 && i !== lines - 1 && 'w-full'
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* 表行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
```

---

## 🎨 设计系统规范

### 颜色系统
```typescript
// src/styles/colors.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
}
```

### 间距系统
```typescript
// src/styles/spacing.ts
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
}
```

### 字体系统
```typescript
// src/styles/typography.ts
export const typography = {
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

---

## 📋 开发规范

### 1. 组件命名规范
- 文件名: PascalCase (如: `DataTable.tsx`)
- 组件名: PascalCase (如: `export default function DataTable()`)
- props接口: ComponentNameProps (如: `interface DataTableProps`)

### 2. 样式规范
- 使用Tailwind CSS
- 自定义样式使用`cn()`工具函数合并className
- 避免内联样式

### 3. 可访问性规范
- 所有交互元素必须有`role`或`aria-*`属性
- 键盘导航支持 (Tab, Enter, Escape)
- 颜色对比度符合WCAG 2.1 AA标准
- 图片必须有`alt`属性

### 4. 性能规范
- 大列表使用虚拟化 (`react-window`)
- 图片使用懒加载 (`loading="lazy"`)
- 组件使用`React.memo`优化
- 避免不必要的re-render

---

## 🧪 测试规范

### 单元测试
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes', () => {
    render(<Button variant="primary">Click me</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')
  })
})
```

### 视觉回归测试
- 使用`@storybook/addon-storyshots`进行快照测试
- 关键组件编写Storybook stories
- 使用`reg-suit`进行视觉回归对比

---

## 📚 文档规范

### Storybook Stories
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
}
```

### API文档
```typescript
/**
 * Button组件 - 用于触发操作
 *
 * @example
 * 基本用法
 * ```tsx
 * <Button onClick={() => console.log('clicked')}>Click me</Button>
 * ```
 *
 * @example
 * 不同变体
 * ```tsx
 * <Button variant="primary">Primary</Button>
 * <Button variant="secondary">Secondary</Button>
 * ```
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否为加载状态 */
  loading?: boolean
  /** 子元素 */
  children: React.ReactNode
}

export default function Button({ variant, size, loading, children, ...props }: ButtonProps) {
  return <button>/* ... */</button>
}
```

---

## 🚀 实施计划

### 阶段1 (3天)
- [ ] Heatmap
- [ ] Tag & TagInput
- [ ] DataTable
- [ ] FilterPanel

### 阶段2 (2天)
- [ ] ActivityFeed
- [ ] Drawer
- [ ] CreativePreview

### 阶段3 (2天)
- [ ] ProgressBar (增强版)
- [ ] DateRangePicker
- [ ] StatCard (增强版)
- [ ] SearchBox (增强版)
- [ ] Skeleton

### 阶段4 (1天)
- [ ] 完善测试覆盖率至80%
- [ ] 编写Storybook文档
- [ ] 代码审查和优化

---

**文档版本**: v1.0
**创建日期**: 2025-11-10
