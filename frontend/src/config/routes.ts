/**
 * 千川平台路由配置
 * 根据静态页面设计和重构方案定义完整的路由结构
 */

import { lazy } from 'react'

// 懒加载页面组件
const Login = lazy(() => import('../pages/Login'))
const AuthCallback = lazy(() => import('../pages/AuthCallback'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const NotFound = lazy(() => import('../pages/NotFound'))

// 投放中心
const Advertisers = lazy(() => import('../pages/Advertisers'))
const AdvertiserDetail = lazy(() => import('../pages/AdvertiserDetail'))
const Campaigns = lazy(() => import('../pages/Campaigns'))
const CampaignDetail = lazy(() => import('../pages/CampaignDetail'))
const CampaignCreate = lazy(() => import('../pages/CampaignCreate'))
const CampaignEdit = lazy(() => import('../pages/CampaignEdit'))
const Ads = lazy(() => import('../pages/Ads'))
const AdDetail = lazy(() => import('../pages/AdDetail'))
const AdCreate = lazy(() => import('../pages/AdCreate'))
const AdEdit = lazy(() => import('../pages/AdEdit'))
const Creatives = lazy(() => import('../pages/Creatives'))
const CreativeUpload = lazy(() => import('../pages/CreativeUpload'))

// 数据中心
const Reports = lazy(() => import('../pages/Reports'))

// 素材管理
const Media = lazy(() => import('../pages/Media'))

// 定向工具
const Audiences = lazy(() => import('../pages/Audiences'))
const ToolsTargeting = lazy(() => import('../pages/ToolsTargeting'))

// 财务管理
const FinanceWallet = lazy(() => import('../pages/FinanceWallet'))
const FinanceBalance = lazy(() => import('../pages/FinanceBalance'))
const FinanceTransactions = lazy(() => import('../pages/FinanceTransactions'))
const TransferCreate = lazy(() => import('../pages/TransferCreate'))
const TransferCommit = lazy(() => import('../pages/TransferCommit'))
const RefundCreate = lazy(() => import('../pages/RefundCreate'))
const RefundCommit = lazy(() => import('../pages/RefundCommit'))

// 全域推广
const UniPromotions = lazy(() => import('../pages/UniPromotions'))
const UniPromotionDetail = lazy(() => import('../pages/UniPromotionDetail'))
const UniPromotionCreate = lazy(() => import('../pages/UniPromotionCreate'))
const UniPromotionEdit = lazy(() => import('../pages/UniPromotionEdit'))

// 随心推
const AwemeOrders = lazy(() => import('../pages/AwemeOrders'))
const AwemeOrderDetail = lazy(() => import('../pages/AwemeOrderDetail'))
const AwemeOrderCreate = lazy(() => import('../pages/AwemeOrderCreate'))
const AwemeOrderEffect = lazy(() => import('../pages/AwemeOrderEffect'))
const AwemeTools = lazy(() => import('../pages/AwemeTools'))

// 路由项类型定义
export interface RouteItem {
  path: string
  component: React.ComponentType
  exact?: boolean
  protected?: boolean
}

// 公开路由 (不需要登录)
export const publicRoutes: RouteItem[] = [
  { path: '/login', component: Login },
  { path: '/auth/callback', component: AuthCallback },
  { path: '*', component: NotFound }, // 404 page
]

// 受保护路由 (需要登录)
export const protectedRoutes: RouteItem[] = [
  // 工作台
  { path: '/dashboard', component: Dashboard, protected: true },
  
  // 投放中心 - 广告主
  { path: '/advertisers', component: Advertisers, protected: true },
  { path: '/advertisers/:id', component: AdvertiserDetail, protected: true },
  
  // 投放中心 - 广告组 (Campaigns)
  { path: '/campaigns', component: Campaigns, protected: true },
  { path: '/campaigns/new', component: CampaignCreate, protected: true },
  { path: '/campaigns/:id', component: CampaignDetail, protected: true },
  { path: '/campaigns/:id/edit', component: CampaignEdit, protected: true },
  
  // 投放中心 - 推广计划 (Ads/Promotions)
  { path: '/ads', component: Ads, protected: true },
  { path: '/ads/new', component: AdCreate, protected: true },
  { path: '/ads/:id', component: AdDetail, protected: true },
  { path: '/ads/:id/edit', component: AdEdit, protected: true },
  
  // 投放中心 - 创意
  { path: '/creatives', component: Creatives, protected: true },
  { path: '/creatives/upload', component: CreativeUpload, protected: true },
  
  // 素材管理
  { path: '/media', component: Media, protected: true },
  
  // 数据中心
  { path: '/reports', component: Reports, protected: true },
  
  // 定向工具
  { path: '/audiences', component: Audiences, protected: true },
  { path: '/tools/targeting', component: ToolsTargeting, protected: true },

  // 财务管理
  { path: '/finance/wallet', component: FinanceWallet, protected: true },
  { path: '/finance/balance', component: FinanceBalance, protected: true },
  { path: '/finance/transactions', component: FinanceTransactions, protected: true },
  { path: '/finance/transfer/create', component: TransferCreate, protected: true },
  { path: '/finance/transfer/commit', component: TransferCommit, protected: true },
  { path: '/finance/refund/create', component: RefundCreate, protected: true },
  { path: '/finance/refund/commit', component: RefundCommit, protected: true },

  // 全域推广
  { path: '/uni-promotions', component: UniPromotions, protected: true },
  { path: '/uni-promotions/new', component: UniPromotionCreate, protected: true },
  { path: '/uni-promotions/:id', component: UniPromotionDetail, protected: true },
  { path: '/uni-promotions/:id/edit', component: UniPromotionEdit, protected: true },

  // 随心推
  { path: '/aweme-orders', component: AwemeOrders, protected: true },
  { path: '/aweme-orders/new', component: AwemeOrderCreate, protected: true },
  { path: '/aweme-orders/:id', component: AwemeOrderDetail, protected: true },
  { path: '/aweme-orders/:id/effect', component: AwemeOrderEffect, protected: true },
  { path: '/aweme/tools', component: AwemeTools, protected: true },
]

// 导航菜单配置
export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  badge?: string
}

/**
 * 千川平台主导航菜单
 * 基于静态页面 nav-component.js 的 8 大模块结构
 */
export const mainNavigation: MenuItem[] = [
  {
    id: 'dashboard',
    label: '工作台',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'delivery',
    label: '投放中心',
    icon: 'Megaphone',
    children: [
      { id: 'advertisers', label: '广告主管理', path: '/advertisers' },
      { id: 'campaigns', label: '广告组', path: '/campaigns' },
      { id: 'ads', label: '推广计划', path: '/ads' },
      { id: 'creatives', label: '创意管理', path: '/creatives' },
    ],
  },
  {
    id: 'account',
    label: '账户管理',
    icon: 'Users',
    children: [
      { id: 'account-center', label: '账户中心', path: '/account-center' },
      { id: 'account-budget', label: '预算管理', path: '/account/budget' },
      { id: 'aweme-auth', label: '抖音号授权', path: '/aweme-auth' },
      { id: 'operation-log', label: '操作日志', path: '/operation-log' },
    ],
  },
  {
    id: 'data',
    label: '数据中心',
    icon: 'BarChart3',
    children: [
      { id: 'reports', label: '数据报表', path: '/reports' },
      { id: 'live-data', label: '直播数据概览', path: '/live-data' },
      { id: 'live-rooms', label: '直播间管理', path: '/live-rooms' },
      { id: 'product-analyse', label: '商品效果分析', path: '/product-analyse' },
      { id: 'product-compare', label: '商品对比分析', path: '/product-compare' },
    ],
  },
  {
    id: 'assets',
    label: '素材管理',
    icon: 'Image',
    children: [
      { id: 'media', label: '媒体库', path: '/media' },
    ],
  },
  {
    id: 'targeting',
    label: '定向工具',
    icon: 'Target',
    children: [
      { id: 'audiences', label: '受众包', path: '/audiences' },
      { id: 'keywords', label: '关键词管理', path: '/keywords' },
      { id: 'targeting-tools', label: '定向工具', path: '/tools/targeting' },
    ],
  },
  {
    id: 'finance',
    label: '财务管理',
    icon: 'Wallet',
    children: [
      { id: 'finance-wallet', label: '钱包管理', path: '/finance/wallet' },
      { id: 'finance-balance', label: '余额查询', path: '/finance/balance' },
      { id: 'finance-transactions', label: '财务流水', path: '/finance/transactions' },
      { id: 'finance-transfer', label: '转账管理', path: '/finance/transfer/create' },
      { id: 'finance-refund', label: '退款管理', path: '/finance/refund/create' },
    ],
  },
  {
    id: 'uni-promotion',
    label: '全域推广',
    icon: 'Globe',
    path: '/uni-promotions',
  },
  {
    id: 'aweme',
    label: '随心推',
    icon: 'Heart',
    children: [
      { id: 'aweme-orders', label: '订单管理', path: '/aweme-orders' },
      { id: 'aweme-tools', label: '工具集', path: '/aweme/tools' },
    ],
  },
]

/**
 * 获取当前路由的面包屑
 */
export function getBreadcrumbs(pathname: string): { label: string; path?: string }[] {
  const breadcrumbs: { label: string; path?: string }[] = [
    { label: '首页', path: '/dashboard' },
  ]
  
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // 路由标签映射
  const routeLabels: Record<string, string> = {
    'dashboard': '工作台',
    'advertisers': '广告主管理',
    'campaigns': '广告组',
    'ads': '推广计划',
    'creatives': '创意管理',
    'media': '媒体库',
    'reports': '数据报表',
    'live-data': '直播数据概览',
    'live-rooms': '直播间管理',
    'product-analyse': '商品效果分析',
    'product-compare': '商品对比分析',
    'audiences': '受众包',
    'tools': '工具',
    'targeting': '定向工具',
    'finance': '财务管理',
    'wallet': '钱包管理',
    'balance': '余额查询',
    'transactions': '财务流水',
    'transfer': '转账管理',
    'refund': '退款管理',
    'create': '创建',
    'commit': '提交',
    'new': '新建',
    'edit': '编辑',
    'upload': '上传',
    'uni-promotions': '全域推广',
    'aweme-orders': '随心推',
    'aweme': '随心推',
    'orders': '订单管理',
    'effect': '效果分析',
  }
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // 跳过ID段
    if (/^\d+$/.test(segment)) {
      breadcrumbs.push({ label: '详情' })
      return
    }
    
    const label = routeLabels[segment] || segment
    // 最后一个不需要链接
    if (index === pathSegments.length - 1) {
      breadcrumbs.push({ label })
    } else {
      breadcrumbs.push({ label, path: currentPath })
    }
  })
  
  return breadcrumbs
}

/**
 * 根据路径查找菜单项
 */
export function findMenuItemByPath(path: string): MenuItem | null {
  function search(items: MenuItem[]): MenuItem | null {
    for (const item of items) {
      if (item.path === path) return item
      if (item.children) {
        const found = search(item.children)
        if (found) return found
      }
    }
    return null
  }
  return search(mainNavigation)
}
