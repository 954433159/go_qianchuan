# 千川设计系统使用指南

## 概述

千川平台前端采用统一的设计系统，基于千川品牌红橙渐变色（#EF4444 → #F97316），提供一致的视觉体验和开发规范。

## 设计token

### 颜色系统

#### 主色调
```tsx
import { QCColors } from '@/lib/design-tokens'

// 千川红橙渐变
QCColors.primaryRed        // #EF4444
QCColors.primaryOrange     // #F97316
```

#### 功能色
```tsx
QCColors.success    // #10B981 - 成功/学习成功
QCColors.warning    // #F59E0B - 警告/学习中
QCColors.danger     // #EF4444 - 错误/失败
QCColors.info       // #3B82F6 - 信息
```

#### ROI 指示色
```tsx
QCColors.roiExcellent  // #10B981 - ROI > 5
QCColors.roiGood       // #F59E0B - ROI 3-5
QCColors.roiPoor       // #EF4444 - ROI < 3
```

### CSS变量

所有颜色和间距都已定义为CSS变量，可直接使用：

```css
/* 主色调 */
var(--qc-primary-red)
var(--qc-primary-orange)

/* 功能色 */
var(--qc-success)
var(--qc-warning)
var(--qc-danger)

/* 间距 (基于 4px) */
var(--qc-space-1)  /* 4px */
var(--qc-space-2)  /* 8px */
var(--qc-space-4)  /* 16px */

/* 圆角 */
var(--qc-radius-sm)  /* 4px */
var(--qc-radius-md)  /* 8px */
var(--qc-radius-lg)  /* 12px */

/* 阴影 */
var(--qc-shadow-sm)
var(--qc-shadow-md)
var(--qc-shadow-primary)
```

## 组件样式类

### 按钮

```tsx
// 主要按钮 - 千川渐变
<button className="qc-btn-primary">
  创建推广计划
</button>

// 次要按钮
<button className="qc-btn-secondary">
  取消
</button>

// 边框按钮
<button className="qc-btn-outline">
  查看详情
</button>
```

### 卡片

```tsx
// 基础卡片
<div className="qc-card">
  <div className="qc-card-header">
    <h3 className="qc-card-title">标题</h3>
  </div>
  <div>内容</div>
</div>
```

### 徽章

```tsx
// 状态徽章
<span className="qc-badge-success">投放中</span>
<span className="qc-badge-warning">学习中</span>
<span className="qc-badge-danger">已暂停</span>
<span className="qc-badge-info">待审核</span>
<span className="qc-badge-primary">千川品牌</span>
```

### 输入框

```tsx
<input className="qc-input" placeholder="请输入..." />
```

### 进度条

```tsx
<div className="qc-progress">
  <div className="qc-progress-bar" style={{ width: '60%' }} />
</div>
```

### GMV 高亮

```tsx
// GMV 数值使用千川渐变文字
<span className="qc-gmv-highlight">
  ¥120,000
</span>
```

### ROI 指示器

```tsx
// 根据ROI值自动着色
<span className="qc-roi-excellent">6.8</span>  // ROI > 5 绿色
<span className="qc-roi-good">4.2</span>       // ROI 3-5 黄色
<span className="qc-roi-poor">2.1</span>       // ROI < 3 红色
```

### 直播状态点

```tsx
// 直播中的脉冲动画点
<span className="qc-live-dot" />
```

## 工具函数

### 格式化函数

```tsx
import {
  formatGMV,
  formatROI,
  formatPercent,
  formatNumber
} from '@/lib/design-tokens'

formatGMV(123456)        // "¥12.3万"
formatROI(6.789)         // "6.79"
formatPercent(0.234)     // "23.4%"
formatNumber(12345)      // "1.2万"
```

### ROI 工具

```tsx
import { getROIClassName, getROIColor } from '@/lib/design-tokens'

const roi = 6.5
const className = getROIClassName(roi)  // "qc-roi-excellent"
const color = getROIColor(roi)          // "#10B981"

// 使用示例
<span className={getROIClassName(roi)}>
  {formatROI(roi)}
</span>
```

### 状态配置

```tsx
import {
  getStatusBadgeClass,
  getLearningStatusConfig,
  getDeliveryStatusConfig
} from '@/lib/design-tokens'

// 通用状态徽章
<span className={getStatusBadgeClass('active')}>
  激活
</span>

// 学习期状态
const learningConfig = getLearningStatusConfig('LEARNING')
<span className={learningConfig.className}>
  {learningConfig.text}  // "学习中"
</span>

// 投放状态
const deliveryConfig = getDeliveryStatusConfig('ACTIVE')
<span className={deliveryConfig.className}>
  {deliveryConfig.text}  // "投放中"
</span>
```

## 路由和导航

### 使用路由配置

```tsx
import { mainNavigation, getBreadcrumbs } from '@/config/routes'

// 获取导航菜单
const nav = mainNavigation

// 获取当前页面面包屑
const breadcrumbs = getBreadcrumbs(location.pathname)
```

### 面包屑组件

```tsx
import Breadcrumb from '@/components/layout/Breadcrumb'

// 在Layout中自动显示
<Breadcrumb />
```

## 状态管理

### Campaign Store 使用示例

```tsx
import { useCampaignStore } from '@/store/campaignStore'

function CampaignList() {
  const {
    campaigns,
    selectedIds,
    filters,
    setCampaigns,
    toggleSelect,
    setFilters,
    getFilteredCampaigns
  } = useCampaignStore()
  
  const filteredCampaigns = getFilteredCampaigns()
  
  return (
    <div>
      {filteredCampaigns.map(campaign => (
        <div key={campaign.id} className="qc-card">
          <h3>{campaign.name}</h3>
          <span className={getROIClassName(campaign.roi)}>
            ROI: {formatROI(campaign.roi)}
          </span>
        </div>
      ))}
    </div>
  )
}
```

## Tailwind 扩展

### 千川颜色类

```tsx
// 使用 Tailwind 类名
<div className="bg-qc-red text-white">千川红</div>
<div className="bg-qc-orange text-white">千川橙</div>
<div className="text-qc-success">成功绿</div>

// 使用渐变
<div className="bg-gradient-to-br from-qc-red to-qc-orange">
  千川品牌渐变
</div>
```

## 最佳实践

### 1. 优先使用设计系统组件类

```tsx
// ✅ 推荐
<button className="qc-btn-primary">确定</button>

// ❌ 不推荐
<button className="bg-red-500 text-white px-4 py-2 rounded">确定</button>
```

### 2. 使用工具函数格式化数据

```tsx
// ✅ 推荐
<span>{formatGMV(gmv)}</span>

// ❌ 不推荐
<span>¥{gmv.toLocaleString()}</span>
```

### 3. ROI 显示统一使用颜色分级

```tsx
// ✅ 推荐
<span className={getROIClassName(roi)}>
  {formatROI(roi)}
</span>

// ❌ 不推荐
<span className="text-green-500">
  {roi.toFixed(2)}
</span>
```

### 4. 状态徽章使用配置函数

```tsx
// ✅ 推荐
const config = getDeliveryStatusConfig(status)
<span className={config.className}>{config.text}</span>

// ❌ 不推荐
<span className={status === 'ACTIVE' ? 'bg-green-100' : 'bg-red-100'}>
  {status}
</span>
```

## 响应式设计

所有组件都支持响应式设计，使用 Tailwind 的响应式前缀：

```tsx
<div className="qc-card sm:p-4 md:p-6 lg:p-8">
  内容自适应不同屏幕
</div>
```

## 动画

使用千川设计系统预定义的过渡动画：

```tsx
// 使用 CSS 变量
<button style={{ transition: 'var(--qc-transition-base)' }}>
  按钮
</button>

// 直播状态点自带脉冲动画
<span className="qc-live-dot" />

// 慢速脉冲动画
<div className="animate-pulse-slow">
  加载中...
</div>
```

## 注意事项

1. **保持一致性**：优先使用设计系统提供的组件和工具函数
2. **避免硬编码**：使用 CSS 变量和设计 token 而非直接写颜色值
3. **类型安全**：利用 TypeScript 类型定义确保代码健壮性
4. **性能优化**：使用状态管理避免prop drilling和重复请求
5. **可维护性**：遵循命名规范，使用语义化的类名和函数名
