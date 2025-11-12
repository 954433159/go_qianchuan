# 前端重构方案 02 - 导航与路由架构重构

> **目标**: 建立完整的导航与路由系统，对齐静态页面的228个功能模块，提供清晰的信息架构

## 📋 目录

1. [现状分析](#现状分析)
2. [导航结构对比](#导航结构对比)
3. [路由架构设计](#路由架构设计)
4. [导航组件设计](#导航组件设计)
5. [实施步骤](#实施步骤)
6. [验收标准](#验收标准)

---

## 现状分析

### 静态页面导航结构 (nav-component.js)

静态页面定义了**8大模块、共228个页面**的完整导航结构：

```javascript
// 导航模块统计
工作台 (1页)           - dashboard.html
投放中心 (6页)         - campaigns, promotions, uni-promotions, suixintui, creatives, media-library
数据中心 (6页)         - reports, report-uni-promotion, suixintui-report, live-data, report-custom, product-competition
商品与直播 (4页)       - products, live-rooms, brands, shops
定向工具 (5页)         - keywords, audiences, audience-file-upload, interest-keyword, orientation-package
达人中心 (3页)         - author-search, author-category, author-live-list
账户设置 (4页)         - accounts, aweme-accounts, finance-wallet, oauth-authorize
工具箱 (4页)           - industry-list, log-query, tools-estimate-audience, creative-word-select
```

### 当前前端路由 (App.tsx)

当前仅实现了**18个页面路由**：

```typescript
// 现有页面
/dashboard              - Dashboard
/advertisers           - Advertisers
/campaigns             - Campaigns (混淆了campaign和ad概念)
/ads                   - Ads
/creatives             - Creatives
/media                 - Media
/audiences             - Audiences
/reports               - Reports
/tools/targeting       - ToolsTargeting
// ... 及相关详情和编辑页面
```

**缺失模块（18个主要模块）:**
1. ❌ 推广计划（Promotions/Ads）- 与Campaigns混淆
2. ❌ 全域推广（Uni-Promotions）
3. ❌ 随心推（Suixintui）
4. ❌ 直播管理（Live Rooms）
5. ❌ 商品管理（Products）
6. ❌ 品牌管理（Brands）
7. ❌ 店铺管理（Shops）
8. ❌ 关键词管理（Keywords）
9. ❌ 兴趣词库（Interest Keywords）
10. ❌ 行为词库（Action Keywords）
11. ❌ 创意词包（Creative Words）
12. ❌ 财务管理（Finance）
13. ❌ 抖音号管理（Aweme Accounts）
14. ❌ 达人中心（Author Center）
15. ❌ 行业工具（Industry Tools）
16. ❌ 日志查询（Log Query）
17. ❌ 竞品分析（Product Competition）
18. ❌ OAuth授权（OAuth Authorize）

---

## 导航结构对比

### 静态页面完整导航（nav-component.js）

```javascript
const navigationStructure = [
  {
    title: '工作台',
    items: [
      { name: '今日数据', href: 'dashboard.html', icon: 'chart' }
    ]
  },
  {
    title: '投放中心',
    items: [
      { name: '广告组', href: 'campaigns.html', icon: 'folder' },
      { name: '推广计划', href: 'promotions.html', icon: 'megaphone' },
      { name: '全域推广', href: 'uni-promotions.html', icon: 'globe' },
      { name: '随心推', href: 'suixintui.html', icon: 'zap' },
      { name: '创意管理', href: 'creatives.html', icon: 'image' },
      { name: '素材中心', href: 'media-library.html', icon: 'photo' }
    ]
  },
  {
    title: '数据中心',
    items: [
      { name: '广告报表', href: 'reports.html', icon: 'bar-chart' },
      { name: '全域报表', href: 'report-uni-promotion.html', icon: 'globe' },
      { name: '随心推报表', href: 'suixintui-report.html', icon: 'pie-chart' },
      { name: '直播数据', href: 'live-data.html', icon: 'trending-up' },
      { name: '自定义报表', href: 'report-custom.html', icon: 'sliders' },
      { name: '竞品分析', href: 'product-competition.html', icon: 'compare' }
    ]
  },
  {
    title: '商品与直播',
    items: [
      { name: '商品库', href: 'products.html', icon: 'package' },
      { name: '直播间', href: 'live-rooms.html', icon: 'video-camera', badge: '3', badgeColor: 'red' },
      { name: '品牌管理', href: 'brands.html', icon: 'award' },
      { name: '店铺管理', href: 'shops.html', icon: 'shopping-bag' }
    ]
  },
  {
    title: '定向工具',
    items: [
      { name: '关键词管理', href: 'keywords.html', icon: 'search' },
      { name: '人群包', href: 'audiences.html', icon: 'users-three' },
      { name: '上传人群', href: 'audience-file-upload-small.html', icon: 'upload' },
      { name: '兴趣词库', href: 'interest-keyword.html', icon: 'heart' },
      { name: '定向包', href: 'orientation-package.html', icon: 'package-open' }
    ]
  },
  {
    title: '达人中心',
    items: [
      { name: '达人搜索', href: 'author-search.html', icon: 'search' },
      { name: '类目推荐', href: 'author-category.html', icon: 'users-group' },
      { name: '合作管理', href: 'author-live-list.html', icon: 'user-star' }
    ]
  },
  {
    title: '账户设置',
    items: [
      { name: '账户信息', href: 'accounts.html', icon: 'users' },
      { name: '抖音号管理', href: 'aweme-accounts.html', icon: 'video' },
      { name: '资金管理', href: 'finance-wallet.html', icon: 'wallet' },
      { name: 'OAuth授权', href: 'oauth-authorize.html', icon: 'key' }
    ]
  },
  {
    title: '工具箱',
    items: [
      { name: '行业分析', href: 'industry-list.html', icon: 'briefcase' },
      { name: '日志查询', href: 'log-query.html', icon: 'file-text' },
      { name: '定向预估', href: 'tools-estimate-audience.html', icon: 'crosshair' },
      { name: '创意词包', href: 'creative-word-select.html', icon: 'book' }
    ]
  }
]
```

### 当前前端导航（Sidebar.tsx）

```typescript
const menuGroups: MenuGroup[] = [
  {
    title: '概览',
    items: [
      { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
    ]
  },
  {
    title: '广告管理',  // ❌ 模块命名不准确
    items: [
      { path: '/advertisers', label: '广告主', icon: Building2 },
      { path: '/campaigns', label: '广告计划', icon: Megaphone },  // ❌ 应该是"广告组"
      { path: '/ads', label: '广告', icon: Target },  // ❌ 应该是"推广计划"
    ]
  },
  {
    title: '内容管理',  // ❌ 缺少大量模块
    items: [
      { path: '/creatives', label: '创意', icon: Palette },
      { path: '/media', label: '媒体库', icon: Image },
    ]
  },
  {
    title: '工具',  // ❌ 缺少大量工具
    items: [
      { path: '/tools/targeting', label: '定向工具', icon: Crosshair },
      { path: '/audiences', label: '人群包', icon: Users },
    ]
  },
  {
    title: '数据分析',  // ❌ 只有1个报表
    items: [
      { path: '/reports', label: '数据报表', icon: BarChart3 },
    ]
  }
]
```

**对比结论:**
- 静态页面: 8大模块、33个一级菜单、228个功能页面
- 当前前端: 5大模块、11个一级菜单、18个功能页面
- **缺失率**: 约 92% 的功能页面未实现

---

## 路由架构设计

### 1. 路由层级结构

```
/                              # 根路由（重定向到/dashboard）
├── /login                     # 登录页
├── /auth/
│   └── /callback              # OAuth回调
│
├── /dashboard                 # 工作台
│
├── /advertisers/              # 广告主管理（已有）
│   ├── /                      # 列表
│   └── /:id                   # 详情
│
├── /campaigns/                # 广告组管理（术语修正）
│   ├── /                      # 列表
│   ├── /new                   # 新建
│   ├── /:id                   # 详情
│   └── /:id/edit              # 编辑
│
├── /promotions/               # 推广计划（新增 - 对应原ads）
│   ├── /                      # 列表
│   ├── /new                   # 新建
│   ├── /:id                   # 详情
│   └── /:id/edit              # 编辑
│
├── /uni-promotions/           # 全域推广（新增）
│   ├── /                      # 列表
│   ├── /new                   # 新建
│   ├── /:id                   # 详情
│   └── /:id/edit              # 编辑
│
├── /suixintui/                # 随心推（新增）
│   ├── /                      # 订单列表
│   ├── /new                   # 新建订单
│   ├── /:id                   # 订单详情
│   └── /estimate              # 效果预估
│
├── /creatives/                # 创意管理（已有）
│   ├── /                      # 列表
│   └── /upload                # 上传
│
├── /media/                    # 素材中心（已有）
│   ├── /                      # 媒体库
│   ├── /images                # 图片素材
│   ├── /videos                # 视频素材
│   └── /upload                # 上传素材
│
├── /reports/                  # 数据报表（扩展）
│   ├── /                      # 广告报表（默认）
│   ├── /ad                    # 广告报表
│   ├── /creative              # 创意报表
│   ├── /material              # 素材报表
│   ├── /uni-promotion         # 全域报表
│   ├── /suixintui             # 随心推报表
│   ├── /live                  # 直播数据
│   ├── /custom                # 自定义报表
│   └── /competition           # 竞品分析
│
├── /products/                 # 商品管理（新增）
│   ├── /                      # 商品库
│   ├── /:id                   # 商品详情
│   └── /analyze               # 商品分析
│
├── /live/                     # 直播管理（新增）
│   ├── /rooms                 # 直播间列表
│   ├── /rooms/:id             # 直播间详情
│   ├── /data                  # 直播数据
│   └── /replay                # 直播回放
│
├── /brands/                   # 品牌管理（新增）
│   ├── /                      # 品牌列表
│   └── /:id                   # 品牌详情
│
├── /shops/                    # 店铺管理（新增）
│   ├── /                      # 店铺列表
│   └── /:id                   # 店铺详情
│
├── /audiences/                # 人群包管理（扩展）
│   ├── /                      # 人群包列表
│   ├── /new                   # 新建人群包
│   ├── /:id                   # 人群包详情
│   ├── /upload                # 上传人群
│   ├── /groups                # 人群分组
│   └── /orientation-packages  # 定向包
│
├── /keywords/                 # 关键词管理（新增）
│   ├── /                      # 关键词列表
│   ├── /suggest               # 关键词推荐
│   ├── /negative              # 否定词管理
│   └── /compliance            # 合规校验
│
├── /tools/                    # 工具箱（扩展）
│   ├── /targeting             # 定向工具（已有）
│   ├── /interest-keywords     # 兴趣词库
│   ├── /action-keywords       # 行为词库
│   ├── /creative-words        # 创意词包
│   ├── /industry              # 行业分析
│   ├── /estimate-audience     # 定向预估
│   └── /coupon                # 优惠券工具
│
├── /authors/                  # 达人中心（新增）
│   ├── /search                # 达人搜索
│   ├── /category              # 类目推荐
│   ├── /similar               # 相似达人
│   └── /cooperation           # 合作管理
│
├── /accounts/                 # 账户管理（新增）
│   ├── /info                  # 账户信息
│   ├── /budget                # 账户预算
│   ├── /security              # 安全设置
│   └── /operation-log         # 操作日志
│
├── /aweme/                    # 抖音号管理（新增）
│   ├── /                      # 抖音号列表
│   ├── /auth                  # 授权管理
│   └── /:id                   # 抖音号详情
│
├── /finance/                  # 财务管理（新增）
│   ├── /wallet                # 钱包
│   ├── /transactions          # 交易明细
│   ├── /invoices              # 发票管理
│   └── /reconciliation        # 对账单
│
├── /oauth/                    # OAuth授权（新增）
│   ├── /authorize             # 授权
│   └── /tokens                # Token管理
│
└── /logs/                     # 日志管理（新增）
    └── /query                 # 日志查询
```

### 2. 路由配置文件结构

```
frontend/src/
├── routes/
│   ├── index.tsx              # 主路由配置
│   ├── public.tsx             # 公开路由
│   ├── protected.tsx          # 受保护路由
│   ├── workbench.tsx          # 工作台路由
│   ├── advertising.tsx        # 投放中心路由
│   ├── data.tsx               # 数据中心路由
│   ├── commerce.tsx           # 商品与直播路由
│   ├── targeting.tsx          # 定向工具路由
│   ├── authors.tsx            # 达人中心路由
│   ├── accounts.tsx           # 账户设置路由
│   └── tools.tsx              # 工具箱路由
└── ...
```

### 3. 路由实现代码

`src/routes/index.tsx`:

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from '@/components/layout/Layout'
import Loading from '@/components/ui/Loading'
import { ProtectedRoute } from './protected'

// 懒加载路由配置
import { workbenchRoutes } from './workbench'
import { advertisingRoutes } from './advertising'
import { dataRoutes } from './data'
import { commerceRoutes } from './commerce'
import { targetingRoutes } from './targeting'
import { authorsRoutes } from './authors'
import { accountsRoutes } from './accounts'
import { toolsRoutes } from './tools'

// 公开路由
const Login = lazy(() => import('@/pages/Login'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))

const LoadingScreen = () => <Loading fullScreen text="加载中..." size="lg" />

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* 受保护路由 */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* 默认重定向到工作台 */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* 工作台 */}
          {workbenchRoutes}
          
          {/* 投放中心 */}
          {advertisingRoutes}
          
          {/* 数据中心 */}
          {dataRoutes}
          
          {/* 商品与直播 */}
          {commerceRoutes}
          
          {/* 定向工具 */}
          {targetingRoutes}
          
          {/* 达人中心 */}
          {authorsRoutes}
          
          {/* 账户设置 */}
          {accountsRoutes}
          
          {/* 工具箱 */}
          {toolsRoutes}
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
```

`src/routes/advertising.tsx`:

```typescript
import { lazy } from 'react'
import { Route } from 'react-router-dom'

// 投放中心页面
const Campaigns = lazy(() => import('@/pages/Campaigns'))
const CampaignDetail = lazy(() => import('@/pages/CampaignDetail'))
const CampaignCreate = lazy(() => import('@/pages/CampaignCreate'))
const CampaignEdit = lazy(() => import('@/pages/CampaignEdit'))

const Promotions = lazy(() => import('@/pages/Promotions'))
const PromotionDetail = lazy(() => import('@/pages/PromotionDetail'))
const PromotionCreate = lazy(() => import('@/pages/PromotionCreate'))
const PromotionEdit = lazy(() => import('@/pages/PromotionEdit'))

const UniPromotions = lazy(() => import('@/pages/UniPromotions'))
const UniPromotionDetail = lazy(() => import('@/pages/UniPromotionDetail'))
const UniPromotionCreate = lazy(() => import('@/pages/UniPromotionCreate'))

const Suixintui = lazy(() => import('@/pages/Suixintui'))
const SuixintuiCreate = lazy(() => import('@/pages/SuixintuiCreate'))
const SuixintuiDetail = lazy(() => import('@/pages/SuixintuiDetail'))
const SuixintuiEstimate = lazy(() => import('@/pages/SuixintuiEstimate'))

const Creatives = lazy(() => import('@/pages/Creatives'))
const CreativeUpload = lazy(() => import('@/pages/CreativeUpload'))

const Media = lazy(() => import('@/pages/Media'))
const MediaImages = lazy(() => import('@/pages/MediaImages'))
const MediaVideos = lazy(() => import('@/pages/MediaVideos'))
const MediaUpload = lazy(() => import('@/pages/MediaUpload'))

export const advertisingRoutes = (
  <>
    {/* 广告组 */}
    <Route path="/campaigns" element={<Campaigns />} />
    <Route path="/campaigns/new" element={<CampaignCreate />} />
    <Route path="/campaigns/:id" element={<CampaignDetail />} />
    <Route path="/campaigns/:id/edit" element={<CampaignEdit />} />
    
    {/* 推广计划 */}
    <Route path="/promotions" element={<Promotions />} />
    <Route path="/promotions/new" element={<PromotionCreate />} />
    <Route path="/promotions/:id" element={<PromotionDetail />} />
    <Route path="/promotions/:id/edit" element={<PromotionEdit />} />
    
    {/* 全域推广 */}
    <Route path="/uni-promotions" element={<UniPromotions />} />
    <Route path="/uni-promotions/new" element={<UniPromotionCreate />} />
    <Route path="/uni-promotions/:id" element={<UniPromotionDetail />} />
    
    {/* 随心推 */}
    <Route path="/suixintui" element={<Suixintui />} />
    <Route path="/suixintui/new" element={<SuixintuiCreate />} />
    <Route path="/suixintui/:id" element={<SuixintuiDetail />} />
    <Route path="/suixintui/estimate" element={<SuixintuiEstimate />} />
    
    {/* 创意管理 */}
    <Route path="/creatives" element={<Creatives />} />
    <Route path="/creatives/upload" element={<CreativeUpload />} />
    
    {/* 素材中心 */}
    <Route path="/media" element={<Media />} />
    <Route path="/media/images" element={<MediaImages />} />
    <Route path="/media/videos" element={<MediaVideos />} />
    <Route path="/media/upload" element={<MediaUpload />} />
  </>
)
```

---

## 导航组件设计

### 1. 完整导航配置

创建 `src/config/navigation.ts`:

```typescript
import {
  LayoutDashboard,
  Folder,
  Megaphone,
  Globe,
  Zap,
  Palette,
  Image,
  BarChart3,
  PieChart,
  TrendingUp,
  Sliders,
  GitCompare,
  Package,
  Video,
  Award,
  ShoppingBag,
  Search,
  Users,
  Upload,
  Heart,
  PackageOpen,
  UserSearch,
  UsersRound,
  UserStar,
  UserCircle,
  Wallet,
  Key,
  Briefcase,
  FileText,
  Crosshair,
  Book,
  Hash,
  Target,
  DollarSign,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  badge?: string
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow'
  children?: NavItem[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navigationConfig: NavGroup[] = [
  {
    title: '工作台',
    items: [
      {
        path: '/dashboard',
        label: '今日数据',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: '投放中心',
    items: [
      {
        path: '/campaigns',
        label: '广告组',
        icon: Folder,
      },
      {
        path: '/promotions',
        label: '推广计划',
        icon: Megaphone,
      },
      {
        path: '/uni-promotions',
        label: '全域推广',
        icon: Globe,
      },
      {
        path: '/suixintui',
        label: '随心推',
        icon: Zap,
      },
      {
        path: '/creatives',
        label: '创意管理',
        icon: Palette,
      },
      {
        path: '/media',
        label: '素材中心',
        icon: Image,
      },
    ],
  },
  {
    title: '数据中心',
    items: [
      {
        path: '/reports',
        label: '广告报表',
        icon: BarChart3,
      },
      {
        path: '/reports/uni-promotion',
        label: '全域报表',
        icon: Globe,
      },
      {
        path: '/reports/suixintui',
        label: '随心推报表',
        icon: PieChart,
      },
      {
        path: '/reports/live',
        label: '直播数据',
        icon: TrendingUp,
      },
      {
        path: '/reports/custom',
        label: '自定义报表',
        icon: Sliders,
      },
      {
        path: '/reports/competition',
        label: '竞品分析',
        icon: GitCompare,
      },
    ],
  },
  {
    title: '商品与直播',
    items: [
      {
        path: '/products',
        label: '商品库',
        icon: Package,
      },
      {
        path: '/live/rooms',
        label: '直播间',
        icon: Video,
        badge: '3',
        badgeColor: 'red',
      },
      {
        path: '/brands',
        label: '品牌管理',
        icon: Award,
      },
      {
        path: '/shops',
        label: '店铺管理',
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: '定向工具',
    items: [
      {
        path: '/keywords',
        label: '关键词管理',
        icon: Search,
      },
      {
        path: '/audiences',
        label: '人群包',
        icon: Users,
      },
      {
        path: '/audiences/upload',
        label: '上传人群',
        icon: Upload,
      },
      {
        path: '/tools/interest-keywords',
        label: '兴趣词库',
        icon: Heart,
      },
      {
        path: '/audiences/orientation-packages',
        label: '定向包',
        icon: PackageOpen,
      },
    ],
  },
  {
    title: '达人中心',
    items: [
      {
        path: '/authors/search',
        label: '达人搜索',
        icon: UserSearch,
      },
      {
        path: '/authors/category',
        label: '类目推荐',
        icon: UsersRound,
      },
      {
        path: '/authors/cooperation',
        label: '合作管理',
        icon: UserStar,
      },
    ],
  },
  {
    title: '账户设置',
    items: [
      {
        path: '/accounts/info',
        label: '账户信息',
        icon: UserCircle,
      },
      {
        path: '/aweme',
        label: '抖音号管理',
        icon: Video,
      },
      {
        path: '/finance/wallet',
        label: '资金管理',
        icon: Wallet,
      },
      {
        path: '/oauth/authorize',
        label: 'OAuth授权',
        icon: Key,
      },
    ],
  },
  {
    title: '工具箱',
    items: [
      {
        path: '/tools/industry',
        label: '行业分析',
        icon: Briefcase,
      },
      {
        path: '/logs/query',
        label: '日志查询',
        icon: FileText,
      },
      {
        path: '/tools/estimate-audience',
        label: '定向预估',
        icon: Crosshair,
      },
      {
        path: '/tools/creative-words',
        label: '创意词包',
        icon: Book,
      },
    ],
  },
]
```

### 2. 增强型侧边栏组件

创建 `src/components/layout/Sidebar.tsx` (重构版):

```typescript
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigationConfig } from '@/config/navigation'
import type { NavItem } from '@/config/navigation'

export default function Sidebar() {
  const location = useLocation()
  
  // 判断菜单项是否激活
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }
  
  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-73px)] overflow-y-auto">
      <nav className="p-4 space-y-6">
        {navigationConfig.map((group) => (
          <div key={group.title}>
            {/* Group Title */}
            <h3 className="mb-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h3>
            
            {/* Menu Items */}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <MenuItem key={item.path} item={item} isActive={isActive(item.path)} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

interface MenuItemProps {
  item: NavItem
  isActive: boolean
}

function MenuItem({ item, isActive }: MenuItemProps) {
  const Icon = item.icon
  
  return (
    <li>
      <NavLink
        to={item.path}
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive && [
            'bg-gradient-to-r from-qc-red to-qc-orange text-white font-medium',
            'hover:from-qc-red/90 hover:to-qc-orange/90',
            'shadow-sm',
          ]
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1">{item.label}</span>
        
        {/* Badge */}
        {item.badge && (
          <span className={cn(
            'ml-auto px-2 py-0.5 text-xs font-medium rounded-full',
            {
              'bg-red-100 text-red-600': item.badgeColor === 'red',
              'bg-blue-100 text-blue-600': item.badgeColor === 'blue',
              'bg-green-100 text-green-600': item.badgeColor === 'green',
              'bg-yellow-100 text-yellow-600': item.badgeColor === 'yellow',
            }
          )}>
            {item.badge}
          </span>
        )}
        
        {/* Chevron */}
        <ChevronRight className={cn(
          'w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity',
          isActive && 'opacity-100'
        )} />
      </NavLink>
    </li>
  )
}
```

### 3. 面包屑组件

创建 `src/components/common/Breadcrumbs.tsx`:

```typescript
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigationConfig } from '@/config/navigation'

interface BreadcrumbItem {
  label: string
  path?: string
}

export default function Breadcrumbs() {
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(location.pathname)
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {/* Home */}
      <Link
        to="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          {item.path && index < breadcrumbs.length - 1 ? (
            <Link
              to={item.path}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              index === breadcrumbs.length - 1 && 'text-foreground font-medium'
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // 遍历导航配置，查找匹配的路径
  for (const group of navigationConfig) {
    for (const item of group.items) {
      if (pathname.startsWith(item.path)) {
        breadcrumbs.push({
          label: group.title,
        })
        breadcrumbs.push({
          label: item.label,
          path: item.path,
        })
        
        // 如果有子路径，添加更多面包屑
        const remainingPath = pathname.replace(item.path, '')
        if (remainingPath) {
          const subSegments = remainingPath.split('/').filter(Boolean)
          subSegments.forEach((segment, index) => {
            const label = formatSegmentLabel(segment)
            breadcrumbs.push({
              label,
              path: index < subSegments.length - 1
                ? `${item.path}/${subSegments.slice(0, index + 1).join('/')}`
                : undefined,
            })
          })
        }
        
        return breadcrumbs
      }
    }
  }
  
  // 默认面包屑
  return segments.map((segment, index) => ({
    label: formatSegmentLabel(segment),
    path: index < segments.length - 1
      ? `/${segments.slice(0, index + 1).join('/')}`
      : undefined,
  }))
}

function formatSegmentLabel(segment: string): string {
  // 特殊处理的标签
  const labelMap: Record<string, string> = {
    'new': '新建',
    'edit': '编辑',
    'detail': '详情',
    'upload': '上传',
    'list': '列表',
  }
  
  return labelMap[segment] || segment
}
```

---

## 实施步骤

### 阶段 1: 路由重构（3-5天）

**Day 1-2: 路由配置迁移**
1. 创建路由目录结构 `src/routes/`
2. 拆分路由模块文件（8个模块文件）
3. 创建导航配置 `src/config/navigation.ts`
4. 更新主路由文件 `App.tsx`

**Day 3-4: 页面占位创建**
为所有缺失的页面创建占位组件：
```typescript
// src/pages/[PageName].tsx
export default function PageName() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">页面名称</h1>
      <p>功能开发中...</p>
    </div>
  )
}
```

**Day 5: 测试与调优**
- 测试所有路由可访问性
- 验证路由守卫正常工作
- 检查懒加载性能

### 阶段 2: 导航组件重构（2-3天）

**Day 1: Sidebar 组件**
1. 重构 Sidebar 组件
2. 实现导航配置驱动
3. 添加徽章、图标支持
4. 实现激活状态判断

**Day 2: Breadcrumbs 组件**
1. 创建面包屑组件
2. 实现路径自动生成
3. 集成到 PageHeader

**Day 3: Header 组件**
1. 更新 Header 组件
2. 添加用户菜单
3. 添加通知中心
4. 添加快捷搜索

### 阶段 3: 页面实现（按优先级）

**高优先级（2周）:**
1. Promotions（推广计划） - 3天
2. UniPromotions（全域推广） - 3天
3. Suixintui（随心推） - 2天
4. Products（商品管理） - 2天
5. Live Rooms（直播管理） - 2天
6. Keywords（关键词管理） - 2天

**中优先级（2周）:**
7. Brands（品牌管理） - 2天
8. Shops（店铺管理） - 2天
9. Finance（财务管理） - 2天
10. Aweme（抖音号管理） - 2天
11. Authors（达人中心） - 3天
12. Reports扩展（报表模块） - 3天

**低优先级（1周）:**
13. Tools扩展（工具箱） - 3天
14. OAuth（授权管理） - 2天
15. Logs（日志查询） - 2天

---

## 验收标准

### 1. 路由完整性

- [ ] 所有8大模块路由配置完成
- [ ] 33个一级菜单路由可访问
- [ ] 至少实现80%核心功能页面（约183页）
- [ ] 路由守卫正确保护受限页面
- [ ] 404页面正常工作

### 2. 导航功能

- [ ] 侧边栏正确显示所有菜单项
- [ ] 菜单项激活状态正确
- [ ] 面包屑自动生成并准确
- [ ] 徽章（如直播间数量）动态更新
- [ ] 菜单支持折叠/展开（可选）

### 3. 用户体验

- [ ] 页面切换流畅（< 200ms）
- [ ] 懒加载工作正常
- [ ] 无路由跳转白屏
- [ ] 后退/前进按钮正常工作
- [ ] URL状态可收藏

### 4. 代码质量

- [ ] 路由配置模块化清晰
- [ ] 导航配置数据驱动
- [ ] TypeScript类型完整
- [ ] 无硬编码路径
- [ ] 代码通过Lint检查

### 5. 性能指标

- [ ] 首屏路由加载 < 1s
- [ ] 页面切换 < 200ms
- [ ] Bundle size 合理（< 500KB per route）
- [ ] 懒加载 chunks 正常分割

---

## 风险与应对

### 风险 1: 页面数量过多

**描述**: 228个页面开发工作量巨大

**应对措施**:
- 采用分阶段实施策略
- 创建页面模板和生成脚本
- 复用组件和逻辑
- 优先实现核心功能页面

### 风险 2: 路由层级复杂

**描述**: 多层嵌套路由可能导致配置混乱

**应对措施**:
- 使用模块化路由配置
- 建立路由命名规范
- 提供路由文档和示例
- 使用TypeScript类型约束

### 风险 3: 导航性能问题

**描述**: 33个一级菜单可能影响侧边栏渲染性能

**应对措施**:
- 使用虚拟列表（如果需要）
- 实现菜单懒加载
- 优化React re-render
- 使用 React.memo 优化组件

### 风险 4: 概念混淆

**描述**: Campaign/Ad/Promotion 概念需要明确区分

**应对措施**:
- 建立术语对照表
- 在代码中使用明确命名
- 提供开发文档说明
- Code Review 把关

---

## 时间估算

| 阶段 | 工作内容 | 预计时间 | 人力 |
|------|---------|---------|------|
| 阶段1 | 路由重构 | 3-5天 | 1人 |
| 阶段2 | 导航组件 | 2-3天 | 1人 |
| 阶段3 | 页面实现（高优先级） | 2周 | 3-4人 |
| 阶段3 | 页面实现（中优先级） | 2周 | 2-3人 |
| 阶段3 | 页面实现（低优先级） | 1周 | 1-2人 |
| **总计** | - | **5-6周** | **3-4人** |

---

## 参考资源

- 静态页面导航: `html/qianchuan/nav-component.js`
- React Router 文档: https://reactrouter.com
- 路由最佳实践: https://reactrouter.com/en/main/start/concepts
- 代码分割: https://react.dev/reference/react/lazy

---

**文档版本**: v1.0  
**创建日期**: 2025-11-11  
**最后更新**: 2025-11-11  
**负责人**: 前端团队
