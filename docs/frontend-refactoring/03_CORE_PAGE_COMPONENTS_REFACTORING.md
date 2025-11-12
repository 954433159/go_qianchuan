# 前端重构方案 03 - 核心业务页面组件重构

> **目标**: 重构核心业务页面（Dashboard、Campaigns、Promotions、Creatives、Reports），对齐静态页面设计，提升用户体验

## 📋 目录

1. [核心页面清单](#核心页面清单)
2. [Dashboard 重构方案](#dashboard-重构方案)
3. [Campaigns 重构方案](#campaigns-重构方案)
4. [Promotions 重构方案](#promotions-重构方案)
5. [Creatives 重构方案](#creatives-重构方案)
6. [Reports 重构方案](#reports-重构方案)
7. [实施路线图](#实施路线图)

---

## 核心页面清单

### 优先级定义

**P0 - 最高优先级（1-2周）:**
- Dashboard（工作台）
- Campaigns（广告组）
- Promotions（推广计划）

**P1 - 高优先级（2-3周）:**
- Creatives（创意管理）
- Reports（数据报表）

**P2 - 中优先级（3-4周）:**
- Media（素材中心）
- Audiences（人群包）

### 页面对比现状

| 页面 | 静态页面 | 当前实现 | 完成度 | 主要差距 |
|------|---------|---------|--------|---------|
| Dashboard | dashboard.html | Dashboard.tsx | 60% | GMV高亮、直播数据、实时更新 |
| Campaigns | campaigns.html | Campaigns.tsx | 40% | 概念混淆、缺少统计卡片、操作不完整 |
| Promotions | promotions.html | Ads.tsx | 30% | 命名错误、UI不符、功能缺失 |
| Creatives | creatives.html | Creatives.tsx | 50% | 缺少审核建议、批量操作 |
| Reports | reports.html | Reports.tsx | 70% | 缺少对比分析、趋势图不完整 |

---

## Dashboard 重构方案

### 1. 现状分析

**静态页面特点（dashboard.html）:**
- ✅ GMV 数据使用渐变色高亮显示
- ✅ 4个核心指标卡片（GMV、观看、点击、订单）
- ✅ 直播状态实时显示（脉冲动画）
- ✅ 近7天趋势图表（Chart.js）
- ✅ 热门广告计划 Top 5
- ✅ 直播间列表（带状态徽章）
- ✅ 最近活动时间线
- ✅ 快速入口（8个功能模块）

**当前实现问题（Dashboard.tsx）:**
- ❌ GMV 没有特殊高亮（应使用 qc-gmv-highlight）
- ❌ 缺少直播相关数据模块
- ❌ 缺少实时更新时间显示
- ❌ 快速入口只有8个（应对齐新增模块）
- ❌ 数据卡片没有趋势指示器
- ✅ Tremor 图表库已使用（保持）
- ✅ 活动列表已实现（优化样式）

### 2. 重构设计

#### 布局结构

```tsx
<Dashboard>
  {/* 页面头部 */}
  <PageHeader 
    title="今日实时数据"
    subtitle="更新时间: 14:32:05"
    actions={<NewPromotionButton />}
  />
  
  {/* 核心指标卡片 */}
  <MetricsGrid>
    <GMVCard />        {/* 特殊样式：渐变高亮 */}
    <ViewsCard />      {/* 直播观看 */}
    <ClicksCard />     {/* 商品点击 */}
    <OrdersCard />     {/* 成交订单 */}
  </MetricsGrid>
  
  {/* 数据趋势 + 转化漏斗 */}
  <Grid cols={3}>
    <TrendChart span={2} />    {/* 近7天趋势 */}
    <FunnelChart span={1} />   {/* 转化漏斗 */}
  </Grid>
  
  {/* 广告计划排行 */}
  <TopCampaignsCard />
  
  {/* 直播间状态 */}
  <LiveRoomsCard />
  
  {/* 快速入口 */}
  <QuickLinksGrid />
  
  {/* 最近活动 */}
  <RecentActivityCard />
</Dashboard>
```

#### 核心组件实现

**GMVCard 组件:**

```tsx
// src/components/dashboard/GMVCard.tsx
import { DollarSign, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface GMVCardProps {
  value: number
  change: number
  changeType: 'increase' | 'decrease'
}

export default function GMVCard({ value, change, changeType }: GMVCardProps) {
  return (
    <Card className="qc-card border-2 border-qc-orange/20 bg-gradient-to-br from-orange-50 to-red-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">今日GMV</p>
            <p className="text-xs text-gray-500">成交总额</p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-qc-orange to-qc-red">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {/* GMV 金额 - 使用渐变高亮 */}
        <p className="text-4xl font-bold qc-gmv-highlight mb-2">
          ¥{value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </p>
        
        {/* 趋势指示 */}
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            'flex items-center gap-1 font-medium',
            changeType === 'increase' ? 'text-success' : 'text-danger'
          )}>
            <ArrowUpRight className="h-4 w-4" />
            {changeType === 'increase' ? '+' : '-'}{Math.abs(change)}%
          </span>
          <span className="text-gray-600">vs 昨日</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

**LiveRoomsCard 组件:**

```tsx
// src/components/dashboard/LiveRoomsCard.tsx
import { Video, Users, ShoppingBag, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface LiveRoom {
  id: string
  name: string
  status: 'live' | 'scheduled' | 'ended'
  viewers: number
  sales: number
  products: number
}

export default function LiveRoomsCard({ rooms }: { rooms: LiveRoom[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          直播间状态
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rooms.map(room => (
            <div key={room.id} className="qc-card qc-card-interactive p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {room.status === 'live' && (
                    <span className="qc-live-dot"></span>
                  )}
                  <h4 className="font-semibold text-gray-900">{room.name}</h4>
                  <span className={cn(
                    'qc-badge',
                    {
                      'qc-badge-danger': room.status === 'live',
                      'qc-badge-warning': room.status === 'scheduled',
                      'qc-badge-info': room.status === 'ended',
                    }
                  )}>
                    {room.status === 'live' ? '直播中' : room.status === 'scheduled' ? '预约中' : '已结束'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">观看:</span>
                  <span className="font-semibold">{room.viewers.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">商品:</span>
                  <span className="font-semibold">{room.products}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">销售:</span>
                  <span className="font-semibold text-success">¥{room.sales.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**实时更新时间:**

```tsx
// src/hooks/useRealtimeUpdate.ts
import { useState, useEffect } from 'react'

export function useRealtimeUpdate(intervalMs: number = 5000) {
  const [updateTime, setUpdateTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setUpdateTime(new Date())
    }, intervalMs)
    
    return () => clearInterval(timer)
  }, [intervalMs])
  
  return updateTime
}

// 在 Dashboard 中使用
const updateTime = useRealtimeUpdate(5000) // 每5秒更新
const timeString = updateTime.toLocaleTimeString('zh-CN')
```

### 3. 实施步骤

**Day 1-2: GMV 卡片和核心指标**
1. 创建 GMVCard 组件（应用渐变高亮）
2. 创建其他指标卡片（ViewsCard、ClicksCard、OrdersCard）
3. 添加趋势指示器和动画效果
4. 实现实时更新时间

**Day 3: 直播模块**
1. 创建 LiveRoomsCard 组件
2. 实现直播状态脉冲动画
3. 添加直播间数据展示
4. 对接直播 API

**Day 4: 快速入口更新**
1. 更新 QuickLinks 配置（新增模块）
2. 优化图标和描述
3. 添加权限控制

**Day 5: 测试和优化**
1. 性能测试（首屏渲染）
2. 响应式布局测试
3. 数据刷新机制测试
4. 视觉对比验证

---

## Campaigns 重构方案

### 1. 现状分析

**静态页面特点（campaigns.html）:**
- ✅ 5个统计卡片（总数、投放中、消耗、GMV、ROI）
- ✅ 广告组卡片式列表（带状态边框）
- ✅ 每个卡片显示6个核心数据
- ✅ 进度条显示预算消耗
- ✅ 批量操作工具栏
- ✅ 筛选器（状态、类型）
- ✅ 排序功能（时间、消耗、ROI）

**当前实现问题（Campaigns.tsx）:**
- ❌ 术语混淆：当前叫"广告计划"，应该是"广告组"
- ❌ 使用简单表格，应该用卡片式布局
- ❌ 缺少统计卡片
- ❌ 缺少批量操作
- ❌ 缺少进度条显示
- ❌ 缺少筛选器面板

### 2. 重构设计

#### 页面结构

```tsx
<CampaignsPage>
  {/* 页面头部 */}
  <PageHeader 
    title="广告组管理"
    description="组织和管理您的广告推广活动"
    actions={<NewCampaignButton />}
  />
  
  {/* 统计卡片 */}
  <StatsGrid>
    <StatCard label="广告组总数" value={24} />
    <StatCard label="投放中" value={15} badge="live" />
    <StatCard label="今日消耗" value="¥18,456" change="+8.5%" />
    <StatCard label="今日GMV" value="¥287K" change="+12.3%" />
    <StatCard label="平均ROI" value={6.8} color="success" />
  </StatsGrid>
  
  {/* 筛选和操作栏 */}
  <FilterPanel>
    <SearchInput />
    <StatusFilter />
    <TypeFilter />
    <BatchActions />
    <SortOptions />
  </FilterPanel>
  
  {/* 广告组列表（卡片式） */}
  <CampaignCardList>
    {campaigns.map(campaign => (
      <CampaignCard key={campaign.id} campaign={campaign} />
    ))}
  </CampaignCardList>
</CampaignsPage>
```

#### 核心组件实现

**CampaignCard 组件:**

```tsx
// src/components/campaign/CampaignCard.tsx
import { useState } from 'react'
import { Edit, Pause, Play, Copy, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/DropdownMenu'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'ended'
  type: 'live' | 'product' | 'fans'
  budget: number
  spent: number
  gmv: number
  roi: number
  plans: number  // 关联计划数
  progress: number
  lastModified: string
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [selected, setSelected] = useState(false)
  
  const statusConfig = {
    active: { 
      label: '投放中', 
      color: 'qc-badge-success',
      borderColor: 'border-green-500'
    },
    paused: { 
      label: '已暂停', 
      color: 'qc-badge-warning',
      borderColor: 'border-yellow-500'
    },
    ended: { 
      label: '已结束', 
      color: 'qc-badge-info',
      borderColor: 'border-gray-500'
    }
  }
  
  const config = statusConfig[campaign.status]
  
  return (
    <div className={cn(
      'qc-card qc-card-interactive border-l-4',
      config.borderColor,
      campaign.status !== 'active' && 'opacity-90'
    )}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start flex-1">
          <input 
            type="checkbox" 
            checked={selected}
            onChange={(e) => setSelected(e.target.checked)}
            className="w-5 h-5 text-qc-red rounded mr-4 mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
              <span className={cn('qc-badge', config.color)}>
                {campaign.status === 'active' && <span className="qc-live-dot"></span>}
                {config.label}
              </span>
              <span className="qc-badge qc-badge-info">
                {campaign.type === 'live' ? '直播推广' : campaign.type === 'product' ? '商品推广' : '涨粉推广'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              ID: {campaign.id} | 创建时间: {campaign.lastModified}
            </p>
          </div>
        </div>
        
        {/* 操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem>
              {campaign.status === 'active' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  暂停
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  启动
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              复制
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* 数据指标 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
        <MetricBox label="关联计划" value={campaign.plans} />
        <MetricBox label="总预算" value={`¥${(campaign.budget / 1000).toFixed(1)}K`} />
        <MetricBox label="已消耗" value={`¥${(campaign.spent / 1000).toFixed(1)}K`} color="text-red-600" />
        <MetricBox label="今日GMV" value={`¥${(campaign.gmv / 1000).toFixed(0)}K`} color="text-orange-600" />
        <MetricBox label="ROI" value={campaign.roi} color={getROIClassName(campaign.roi)} />
        <MetricBox 
          label="进度" 
          value={`${campaign.progress}%`}
          extra={
            <div className="qc-progress mt-2">
              <div className="qc-progress-bar" style={{ width: `${campaign.progress}%` }}></div>
            </div>
          }
        />
      </div>
      
      {/* 底部操作栏 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            编辑
          </button>
          <button className={cn(
            'px-4 py-2 text-sm rounded-lg transition-colors',
            campaign.status === 'active' 
              ? 'border border-orange-300 text-orange-600 hover:bg-orange-50'
              : 'border border-green-300 text-green-600 hover:bg-green-50'
          )}>
            {campaign.status === 'active' ? '暂停' : '启动'}
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            复制
          </button>
        </div>
        <p className="text-xs text-gray-500">
          最后修改: 2小时前
        </p>
      </div>
    </div>
  )
}

function MetricBox({ 
  label, 
  value, 
  color = 'text-gray-900',
  extra 
}: { 
  label: string
  value: string | number
  color?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      {extra}
    </div>
  )
}
```

### 3. 实施步骤

**Day 1: 统计卡片和筛选器**
1. 创建统计卡片组件
2. 实现筛选器面板
3. 添加批量操作工具栏

**Day 2-3: CampaignCard 组件**
1. 创建卡片式列表布局
2. 实现6个数据指标展示
3. 添加进度条和状态边框
4. 实现操作菜单

**Day 4: API 对接和数据流**
1. 对接广告组列表 API
2. 实现筛选和排序逻辑
3. 实现批量操作 API
4. 添加数据刷新机制

**Day 5: 测试和优化**
1. 测试各种状态展示
2. 测试批量操作
3. 性能优化（列表虚拟滚动）

---

## Promotions 重构方案

### 1. 现状分析

**静态页面特点（promotions.html）:**
- ✅ 明确区分：推广计划（Promotion/Ad）
- ✅ 5个统计卡片
- ✅ 推广计划卡片列表
- ✅ 学习期状态显示
- ✅ 出价、预算、ROI 目标展示
- ✅ 定向信息概览
- ✅ 素材预览缩略图

**当前实现问题（Ads.tsx）:**
- ❌ 命名错误：应该叫 Promotions 而不是 Ads
- ❌ 简单表格布局，应该用卡片
- ❌ 缺少学习期状态
- ❌ 缺少定向信息展示
- ❌ 缺少素材预览

### 2. 重构设计

**文件重命名:**
```bash
# 重命名文件
mv src/pages/Ads.tsx src/pages/Promotions.tsx
mv src/pages/AdDetail.tsx src/pages/PromotionDetail.tsx
mv src/pages/AdCreate.tsx src/pages/PromotionCreate.tsx
mv src/pages/AdEdit.tsx src/pages/PromotionEdit.tsx
```

#### PromotionCard 组件

```tsx
// src/components/promotion/PromotionCard.tsx
interface Promotion {
  id: string
  name: string
  campaignId: string
  campaignName: string
  status: 'active' | 'paused' | 'learning' | 'ended'
  learningStatus?: 'learning' | 'learned' | 'failed'
  objective: 'live' | 'product' | 'app'
  bidType: 'auto' | 'manual'
  bidAmount?: number
  roiGoal?: number
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cvr: number
  cpc: number
  roi: number
  targeting: {
    regions: string[]
    age: string
    gender: string
    interests: string[]
  }
  creatives: {
    id: string
    type: 'image' | 'video'
    thumbnail: string
  }[]
}

export default function PromotionCard({ promotion }: { promotion: Promotion }) {
  return (
    <div className="qc-card qc-card-interactive">
      {/* 头部：计划信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{promotion.name}</h3>
            <StatusBadge status={promotion.status} />
            {promotion.learningStatus && (
              <LearningStatusBadge status={promotion.learningStatus} />
            )}
          </div>
          <p className="text-sm text-gray-600">
            所属广告组: {promotion.campaignName} | ID: {promotion.id}
          </p>
        </div>
      </div>
      
      {/* 出价和预算信息 */}
      <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <InfoItem 
          label="出价方式" 
          value={promotion.bidType === 'auto' ? '自动出价' : '手动出价'} 
        />
        {promotion.bidAmount && (
          <InfoItem label="出价金额" value={`¥${promotion.bidAmount}`} />
        )}
        {promotion.roiGoal && (
          <InfoItem label="ROI目标" value={promotion.roiGoal} />
        )}
        <InfoItem label="日预算" value={`¥${promotion.budget}`} />
      </div>
      
      {/* 数据指标 */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
        <MetricCard label="消耗" value={`¥${promotion.spent}`} />
        <MetricCard label="展示" value={formatNumber(promotion.impressions)} />
        <MetricCard label="点击" value={formatNumber(promotion.clicks)} />
        <MetricCard label="转化" value={formatNumber(promotion.conversions)} />
        <MetricCard label="CTR" value={`${(promotion.ctr * 100).toFixed(2)}%`} />
        <MetricCard label="CVR" value={`${(promotion.cvr * 100).toFixed(2)}%`} />
        <MetricCard label="CPC" value={`¥${promotion.cpc.toFixed(2)}`} />
        <MetricCard 
          label="ROI" 
          value={promotion.roi.toFixed(1)} 
          className={getROIClassName(promotion.roi)}
        />
      </div>
      
      {/* 定向信息 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">定向设置</h4>
        <div className="flex flex-wrap gap-2">
          {promotion.targeting.regions.map(region => (
            <span key={region} className="qc-badge qc-badge-info text-xs">
              {region}
            </span>
          ))}
          <span className="qc-badge qc-badge-info text-xs">
            {promotion.targeting.age}
          </span>
          <span className="qc-badge qc-badge-info text-xs">
            {promotion.targeting.gender}
          </span>
          {promotion.targeting.interests.slice(0, 3).map(interest => (
            <span key={interest} className="qc-badge qc-badge-info text-xs">
              {interest}
            </span>
          ))}
          {promotion.targeting.interests.length > 3 && (
            <span className="qc-badge qc-badge-info text-xs">
              +{promotion.targeting.interests.length - 3}
            </span>
          )}
        </div>
      </div>
      
      {/* 素材预览 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">创意素材</h4>
        <div className="flex gap-2">
          {promotion.creatives.slice(0, 4).map(creative => (
            <div 
              key={creative.id}
              className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img 
                src={creative.thumbnail} 
                alt="素材缩略图"
                className="w-full h-full object-cover"
              />
              {creative.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          ))}
          {promotion.creatives.length > 4 && (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-600">
              +{promotion.creatives.length - 4}
            </div>
          )}
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button className="qc-btn qc-btn-secondary text-sm">编辑</button>
          <button className="qc-btn qc-btn-secondary text-sm">
            {promotion.status === 'active' ? '暂停' : '启动'}
          </button>
          <button className="qc-btn qc-btn-secondary text-sm">复制</button>
        </div>
        <Link 
          to={`/promotions/${promotion.id}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          查看详情 →
        </Link>
      </div>
    </div>
  )
}

// 学习期状态徽章
function LearningStatusBadge({ status }: { status: string }) {
  const config = {
    learning: { label: '学习中', color: 'bg-blue-100 text-blue-700' },
    learned: { label: '已度过学习期', color: 'bg-green-100 text-green-700' },
    failed: { label: '学习失败', color: 'bg-red-100 text-red-700' },
  }[status]
  
  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', config.color)}>
      {config.label}
    </span>
  )
}
```

---

## Creatives 重构方案

### 1. 重构要点

**增强功能:**
- 创意审核建议展示
- 批量操作（启用、暂停、删除）
- 素材类型筛选（图片、视频、图文）
- 创意性能数据展示
- 素材预览和编辑

**CreativeCard 组件:**

```tsx
interface Creative {
  id: string
  name: string
  type: 'image' | 'video' | 'carousel'
  status: 'approved' | 'reviewing' | 'rejected'
  thumbnail: string
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cvr: number
  relatedAds: number
  auditSuggestions?: string[]
  createdAt: string
}

export default function CreativeCard({ creative }: { creative: Creative }) {
  return (
    <div className="qc-card group">
      {/* 素材预览 */}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img 
          src={creative.thumbnail}
          alt={creative.name}
          className="w-full h-full object-cover"
        />
        {creative.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="qc-btn qc-btn-primary">
              <Play className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={creative.status} />
        </div>
      </div>
      
      {/* 创意信息 */}
      <h4 className="font-semibold text-gray-900 mb-2">{creative.name}</h4>
      <p className="text-sm text-gray-600 mb-3">
        关联计划: {creative.relatedAds} | {getTypeLabel(creative.type)}
      </p>
      
      {/* 审核建议 */}
      {creative.auditSuggestions && creative.auditSuggestions.length > 0 && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p className="font-medium mb-1">审核建议:</p>
          <ul className="list-disc list-inside space-y-1">
            {creative.auditSuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 性能数据 */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
        <div>
          <p className="text-gray-600">展示</p>
          <p className="font-semibold">{formatNumber(creative.impressions)}</p>
        </div>
        <div>
          <p className="text-gray-600">CTR</p>
          <p className="font-semibold">{(creative.ctr * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-gray-600">CVR</p>
          <p className="font-semibold">{(creative.cvr * 100).toFixed(2)}%</p>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button className="flex-1 qc-btn qc-btn-secondary text-sm">编辑</button>
        <button className="flex-1 qc-btn qc-btn-secondary text-sm">
          {creative.status === 'approved' ? '暂停' : '启用'}
        </button>
      </div>
    </div>
  )
}
```

---

## Reports 重构方案

### 1. 重构要点

**增强功能:**
- 广告组对比分析
- 多维度趋势图（消耗、GMV、ROI）
- 分时段数据展示
- 自定义指标配置
- 报表导出（CSV、Excel）

**页面结构:**

```tsx
<ReportsPage>
  {/* 时间和维度选择 */}
  <FilterPanel>
    <DateRangePicker />
    <DimensionSelector />    {/* 日期、广告组、计划、创意 */}
    <MetricsSelector />      {/* 可选指标 */}
  </FilterPanel>
  
  {/* 核心指标汇总 */}
  <MetricsSummary />
  
  {/* 趋势对比图表 */}
  <Grid cols={2}>
    <TrendChart title="消耗趋势" />
    <TrendChart title="ROI趋势" />
  </Grid>
  
  {/* 广告组对比 */}
  <ComparisonSection />
  
  {/* 数据表格 */}
  <DataTable />
</ReportsPage>
```

---

## 实施路线图

### 总体时间规划

| 页面 | 优先级 | 预计时间 | 依赖 |
|------|--------|---------|------|
| Dashboard | P0 | 5天 | 设计系统 |
| Campaigns | P0 | 5天 | 设计系统、路由 |
| Promotions | P0 | 6天 | Campaigns完成 |
| Creatives | P1 | 4天 | 素材API |
| Reports | P1 | 6天 | 数据API |

### 并行开发策略

**Week 1-2 (P0 页面):**
- Developer 1: Dashboard
- Developer 2: Campaigns  
- Developer 3: Promotions (从Day 6开始)

**Week 3 (P1 页面):**
- Developer 1-2: Creatives
- Developer 3: Reports

**Week 4 (优化和测试):**
- 全员: 集成测试、性能优化、视觉验收

---

**文档版本**: v1.0  
**创建日期**: 2025-11-11  
**负责人**: 前端团队
