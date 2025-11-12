import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/layout/Layout'
import ToastContainer from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Loading from './components/ui/Loading'
import { useAuthStore } from './store/authStore'
import { useLoadingStore } from './store/loadingStore'

// 懒加载页面组件
const Login = lazy(() => import('./pages/Login'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Advertisers = lazy(() => import('./pages/Advertisers'))
const Campaigns = lazy(() => import('./pages/Campaigns'))
const Ads = lazy(() => import('./pages/Ads'))
const Creatives = lazy(() => import('./pages/Creatives'))
const Media = lazy(() => import('./pages/Media'))
const Reports = lazy(() => import('./pages/Reports'))
const Audiences = lazy(() => import('./pages/Audiences'))
const ToolsTargeting = lazy(() => import('./pages/ToolsTargeting'))
const AdvertiserDetail = lazy(() => import('./pages/AdvertiserDetail'))
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'))
const CampaignCreate = lazy(() => import('./pages/CampaignCreate'))
const CampaignEdit = lazy(() => import('./pages/CampaignEdit'))
const AdCreate = lazy(() => import('./pages/AdCreate'))
const AdDetail = lazy(() => import('./pages/AdDetail'))
const AdEdit = lazy(() => import('./pages/AdEdit'))
const CreativeUpload = lazy(() => import('./pages/CreativeUpload'))
const LearningStatusList = lazy(() => import('./pages/LearningStatusList'))
const LowQualityAdList = lazy(() => import('./pages/LowQualityAdList'))
const AdSuggestTools = lazy(() => import('./pages/AdSuggestTools'))
const AccountBudget = lazy(() => import('./pages/AccountBudget'))
const AwemeAuthList = lazy(() => import('./pages/AwemeAuthList'))
const AwemeAuthAdd = lazy(() => import('./pages/AwemeAuthAdd'))
const MaterialRelations = lazy(() => import('./pages/MaterialRelations'))
const MaterialEfficiency = lazy(() => import('./pages/MaterialEfficiency'))
const CreativeWordPackage = lazy(() => import('./pages/CreativeWordPackage'))
const AccountCenter = lazy(() => import('./pages/AccountCenter'))
const ShopDetail = lazy(() => import('./pages/ShopDetail'))
const AgentDetail = lazy(() => import('./pages/AgentDetail'))
const OperationLog = lazy(() => import('./pages/OperationLog'))
const CreativeDetail = lazy(() => import('./pages/CreativeDetail'))
const Keywords = lazy(() => import('./pages/Keywords'))
const LiveData = lazy(() => import('./pages/LiveData'))
const LiveRooms = lazy(() => import('./pages/LiveRooms'))
const LiveRoomDetail = lazy(() => import('./pages/LiveRoomDetail'))
const ProductAnalyse = lazy(() => import('./pages/ProductAnalyse'))
const ProductCompareStats = lazy(() => import('./pages/ProductCompareStats'))

// 财务管理页面
const FinanceWallet = lazy(() => import('./pages/FinanceWallet'))
const FinanceBalance = lazy(() => import('./pages/FinanceBalance'))
const FinanceTransactions = lazy(() => import('./pages/FinanceTransactions'))
const TransferCreate = lazy(() => import('./pages/TransferCreate'))
const TransferCommit = lazy(() => import('./pages/TransferCommit'))
const RefundCreate = lazy(() => import('./pages/RefundCreate'))
const RefundCommit = lazy(() => import('./pages/RefundCommit'))

// Loading组件 - 使用统一的Loading组件
const LoadingScreen = () => <Loading fullScreen text="加载中..." size="lg" />

// 受保护路由包装器
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  // 开发模式：允许通过 URL 参数 ?preview=true 跳过登录
  const isDevelopmentPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'true'
  
  if (!isAuthenticated && !isDevelopmentPreview) {
    return <Navigate to="/login" replace />
  }
  
  return <Layout>{children}</Layout>
}

function App() {
  const { isLoading, loadingText } = useLoadingStore()
  
  return (
    <ErrorBoundary>
      {/* 全局Loading层 */}
      {isLoading && <Loading fullScreen text={loadingText} size="lg" />}
      
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* 受保护路由 */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/advertisers" element={<ProtectedRoute><Advertisers /></ProtectedRoute>} />
          <Route path="/advertisers/:id" element={<ProtectedRoute><AdvertiserDetail /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/new" element={<ProtectedRoute><CampaignCreate /></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
          <Route path="/campaigns/:id/edit" element={<ProtectedRoute><CampaignEdit /></ProtectedRoute>} />
          <Route path="/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
          <Route path="/ads/new" element={<ProtectedRoute><AdCreate /></ProtectedRoute>} />
          <Route path="/ads/:id" element={<ProtectedRoute><AdDetail /></ProtectedRoute>} />
          <Route path="/ads/:id/edit" element={<ProtectedRoute><AdEdit /></ProtectedRoute>} />
          <Route path="/ads/learning-status" element={<ProtectedRoute><LearningStatusList /></ProtectedRoute>} />
          <Route path="/ads/low-quality" element={<ProtectedRoute><LowQualityAdList /></ProtectedRoute>} />
          <Route path="/ads/suggest-tools" element={<ProtectedRoute><AdSuggestTools /></ProtectedRoute>} />
          <Route path="/materials/relations" element={<ProtectedRoute><MaterialRelations /></ProtectedRoute>} />
          <Route path="/materials/efficiency" element={<ProtectedRoute><MaterialEfficiency /></ProtectedRoute>} />
          <Route path="/creatives" element={<ProtectedRoute><Creatives /></ProtectedRoute>} />
          <Route path="/creatives/upload" element={<ProtectedRoute><CreativeUpload /></ProtectedRoute>} />
          
          {/* 数据报表相关路由 */}
          <Route path="/live-data" element={<ProtectedRoute><LiveData /></ProtectedRoute>} />
          <Route path="/live-rooms" element={<ProtectedRoute><LiveRooms /></ProtectedRoute>} />
          <Route path="/live-rooms/:id" element={<ProtectedRoute><LiveRoomDetail /></ProtectedRoute>} />
          <Route path="/product-analyse" element={<ProtectedRoute><ProductAnalyse /></ProtectedRoute>} />
          <Route path="/product-compare" element={<ProtectedRoute><ProductCompareStats /></ProtectedRoute>} />
          <Route path="/creatives/word-package" element={<ProtectedRoute><CreativeWordPackage /></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
          <Route path="/audiences" element={<ProtectedRoute><Audiences /></ProtectedRoute>} />
          <Route path="/keywords" element={<ProtectedRoute><Keywords /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/tools/targeting" element={<ProtectedRoute><ToolsTargeting /></ProtectedRoute>} />
          
          {/* 账户管理相关路由 */}
          <Route path="/account-center" element={<ProtectedRoute><AccountCenter /></ProtectedRoute>} />
          <Route path="/account/budget" element={<ProtectedRoute><AccountBudget /></ProtectedRoute>} />
          <Route path="/aweme-auth" element={<ProtectedRoute><AwemeAuthList /></ProtectedRoute>} />
          <Route path="/aweme-auth/add" element={<ProtectedRoute><AwemeAuthAdd /></ProtectedRoute>} />
          <Route path="/shops/:id" element={<ProtectedRoute><ShopDetail /></ProtectedRoute>} />
          <Route path="/agents/:id" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
          <Route path="/operation-log" element={<ProtectedRoute><OperationLog /></ProtectedRoute>} />
          <Route path="/creatives/:id" element={<ProtectedRoute><CreativeDetail /></ProtectedRoute>} />

          {/* 财务管理路由 */}
          <Route path="/finance/wallet" element={<ProtectedRoute><FinanceWallet /></ProtectedRoute>} />
          <Route path="/finance/balance" element={<ProtectedRoute><FinanceBalance /></ProtectedRoute>} />
          <Route path="/finance/transactions" element={<ProtectedRoute><FinanceTransactions /></ProtectedRoute>} />
          <Route path="/finance/transfer/create" element={<ProtectedRoute><TransferCreate /></ProtectedRoute>} />
          <Route path="/finance/transfer/commit" element={<ProtectedRoute><TransferCommit /></ProtectedRoute>} />
          <Route path="/finance/refund/create" element={<ProtectedRoute><RefundCreate /></ProtectedRoute>} />
          <Route path="/finance/refund/commit" element={<ProtectedRoute><RefundCommit /></ProtectedRoute>} />

          {/* 默认路由 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404重定向 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
