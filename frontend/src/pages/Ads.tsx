import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdList } from '@/api/ad'
import { Ad } from '@/api/types'
import { PageHeader, EmptyState, Loading, Button, Card, CardContent } from '@/components/ui'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { Plus, Target, LayoutGrid, List, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePromotionStore } from '@/store/promotionStore'
import { useUIStore } from '@/store/uiStore'
import { PAGINATION } from '@/constants/pagination'
import CreateAdDialog from '@/components/ad/CreateAdDialog'
import PromotionCard from '@/components/promotion/PromotionCard'
import FilterBar, { FilterConfig } from '@/components/common/FilterBar'
import { toast } from '@/components/ui/Toast'

export default function Ads() {
  const { confirm, ConfirmDialog } = useConfirm()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [localLoading, setLocalLoading] = useState(true)
  const { user } = useAuthStore()
  const { pageLayout, setPageLayout } = useUIStore()
  const {
    selectedIds,
    filters,
    setPromotions,
    toggleSelect,
    clearSelection,
    setFilters,
    clearFilters,
    getFilteredPromotions,
    getLearningPromotions,
    batchUpdateStatus,
    batchDelete,
  } = usePromotionStore()
  
  const fetchAds = async () => {
    if (!user?.advertiserId) {
      toast.error('未获取到广告主ID，请重新登录')
      navigate('/login')
      return
    }
    
    setLocalLoading(true)
    try {
      const data = await getAdList({
        advertiser_id: user.advertiserId,
        page: PAGINATION.DEFAULT_PAGE,
        page_size: PAGINATION.MAX_PAGE_SIZE
      })
      // 转换为 Store 需要的格式
      const formattedPromotions = (data.list || []).map((ad: Ad) => {
        // 使用API返回的真实数据
        const stat = ad.stat || {}
        const audience = ad.audience || {}
        
        return {
          id: String(ad.id),
          campaign_id: String(ad.campaign_id || ''),
          name: ad.name,
          status: ad.status === 'ENABLE' ? 'ACTIVE' : 'PAUSED',
          learning_status: typeof ad.learning_phase === 'string' ? ad.learning_phase : 'NONE',
          budget_mode: typeof ad.budget_mode === 'string' ? ad.budget_mode : 'BUDGET_MODE_DAY',
          budget: ad.budget || 0,
          bid: ad.bid || 0,
          spend: stat.cost || 0,
          impressions: stat.show_cnt || 0,
          clicks: stat.click_cnt || 0,
          conversions: stat.convert_cnt || 0,
          ctr: stat.ctr || 0,
          cpc: stat.avg_click_cost || 0,
          cvr: stat.convert_rate || 0,
          roi: stat.roi || 0,
          targeting_info: {
            gender: audience.gender,
            age_range: audience.age || [],
            regions: audience.district || [],
          },
          creative_ids: Array.isArray((ad as Record<string, unknown>).creative_list) 
            ? ((ad as Record<string, unknown>).creative_list as string[]) 
            : [],
          created_at: ad.create_time || new Date().toISOString(),
          updated_at: ad.modify_time || new Date().toISOString(),
        }
      })
      setPromotions(formattedPromotions)
    } catch (error) {
      toast.error('加载推广计划失败，请稍后重试')
    } finally {
      setLocalLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.advertiserId])
  
  const filteredPromotions = getFilteredPromotions()
  const learningPromotions = getLearningPromotions()
  
  const filterConfigs: FilterConfig[] = [
    {
      key: 'searchQuery',
      label: '搜索',
      type: 'search',
      placeholder: '搜索推广计划名称...'
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '投放中', value: 'ACTIVE' },
        { label: '已暂停', value: 'PAUSED' },
      ]
    },
    {
      key: 'learning_status',
      label: '学习期',
      type: 'select',
      options: [
        { label: '学习中', value: 'LEARNING' },
        { label: '学习成功', value: 'LEARNED' },
        { label: '学习失败', value: 'FAILED' },
      ]
    }
  ]
  
  const handleBatchAction = async (action: 'pause' | 'start' | 'delete') => {
    if (selectedIds.length === 0) return
    
    switch (action) {
      case 'pause':
        batchUpdateStatus(selectedIds, 'PAUSED')
        break
      case 'start':
        batchUpdateStatus(selectedIds, 'ACTIVE')
        break
      case 'delete': {
        const confirmed = await confirm({
          title: '批量删除推广计划',
          description: `确定要删除 ${selectedIds.length} 个推广计划吗？删除后将无法恢复。`,
          confirmText: '删除',
          variant: 'destructive',
        })
        if (confirmed) {
          batchDelete(selectedIds)
        }
        break
      }
    }
    clearSelection()
  }
  
  if (localLoading) {
    return <Loading size="lg" text="加载中..." />
  }
  
  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6">
        {/* 快捷工具卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          onClick={() => navigate('/ads/learning-status')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">学习期管理</h3>
                <p className="text-sm text-blue-700">查看学习期状态</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
          onClick={() => navigate('/ads/low-quality')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">低效计划</h3>
                <p className="text-sm text-orange-700">诊断低效计划</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          onClick={() => navigate('/ads/suggest-tools')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">智能建议</h3>
                <p className="text-sm text-purple-700">获取投放建议</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PageHeader
        title="推广计划"
        description="管理推广计划，监控学习期状态和 ROI"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* 布局切换 */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setPageLayout('card')}
                className={`p-1.5 rounded ${pageLayout === 'card' ? 'bg-[#EF4444] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPageLayout('table')}
                className={`p-1.5 rounded ${pageLayout === 'table' ? 'bg-[#EF4444] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Link to="/ads/new">
              <button className="qc-btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                创建推广计划
              </button>
            </Link>
          </div>
        }
      />
      
      {/* 学习期提示 */}
      {learningPromotions.length > 0 && (
        <div className="qc-card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">学习期提示</h4>
              <p className="text-sm text-blue-700">
                当前有 <span className="font-semibold">{learningPromotions.length}</span> 个推广计划处于学习期，建议保持稳定投放。
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 筛选器 */}
      <FilterBar
        filters={filterConfigs}
        values={filters}
        onChange={(key, value) => setFilters({ [key]: value })}
        onClear={clearFilters}
      />
      
      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <div className="qc-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              已选择 <span className="font-semibold text-gray-900">{selectedIds.length}</span> 个推广计划
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBatchAction('start')}
                className="qc-btn-secondary text-sm"
              >
                批量启动
              </button>
              <button
                onClick={() => handleBatchAction('pause')}
                className="qc-btn-secondary text-sm"
              >
                批量暂停
              </button>
              <button
                onClick={() => handleBatchAction('delete')}
                className="qc-btn-secondary text-sm text-red-600 hover:bg-red-50"
              >
                批量删除
              </button>
              <button
                onClick={clearSelection}
                className="qc-btn-secondary text-sm"
              >
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 推广计划列表 */}
      {!localLoading && filteredPromotions.length === 0 ? (
        <EmptyState
          icon={<Target className="h-16 w-16" />}
          title="暂无推广计划"
          description="您还没有创建任何推广计划，点击右上角按钮创建您的第一个计划。"
          action={{
            label: '创建推广计划',
            onClick: () => navigate('/ads/new')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              isSelected={selectedIds.includes(promotion.id)}
              onSelect={() => toggleSelect(promotion.id)}
              onStatusChange={(status) => {
                batchUpdateStatus([promotion.id], status)
              }}
            />
          ))}
        </div>
      )}

      <CreateAdDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        advertiserId={user?.advertiserId || 0}
        onSuccess={fetchAds}
      />
    </div>
    </>
  )
}
