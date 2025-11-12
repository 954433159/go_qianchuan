import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCampaignList } from '@/api/campaign'
import { Campaign } from '@/api/types'
import { PageHeader, EmptyState, Loading } from '@/components/ui'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { Plus, Megaphone, LayoutGrid, List } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import CreateCampaignDialog from '@/components/campaign/CreateCampaignDialog'
import CampaignCard from '@/components/campaign/CampaignCard'
import FilterBar, { FilterConfig } from '@/components/common/FilterBar'

export default function Campaigns() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [localLoading, setLocalLoading] = useState(true)
  const { user } = useAuthStore()
  const { pageLayout, setPageLayout } = useUIStore()
  const {
    selectedIds,
    filters,
    setCampaigns,
    toggleSelect,
    clearSelection,
    setFilters,
    clearFilters,
    getFilteredCampaigns,
    batchUpdateStatus,
    batchDelete,
  } = useCampaignStore()
  
  const selectedAdvertiserId = user?.advertiserId || 1
  
  const fetchCampaigns = async () => {
    setLocalLoading(true)
    try {
      const data = await getCampaignList({
        advertiser_id: selectedAdvertiserId,
        page: 1,
        page_size: 100
      })
      // 转换为 Store 需要的格式
      const formattedCampaigns = (data.list || []).map((c: Campaign) => ({
        id: String(c.id),
        name: c.name,
        status: c.status === 'ENABLE' ? 'ACTIVE' : 'PAUSED',
        budget: c.budget || 0,
        spend: Math.random() * c.budget * 0.8, // Mock data
        impressions: Math.floor(Math.random() * 100000),
        clicks: Math.floor(Math.random() * 10000),
        conversions: Math.floor(Math.random() * 1000),
        ctr: Math.random() * 0.1,
        cpc: Math.random() * 5,
        roi: Math.random() * 10,
        created_at: c.create_time || new Date().toISOString(),
        updated_at: c.modify_time || new Date().toISOString(),
      }))
      setCampaigns(formattedCampaigns)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAdvertiserId])
  
  const filteredCampaigns = getFilteredCampaigns()
  
  const filterConfigs: FilterConfig[] = [
    {
      key: 'searchQuery',
      label: '搜索',
      type: 'search',
      placeholder: '搜索广告组名称...'
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '投放中', value: 'ACTIVE' },
        { label: '已暂停', value: 'PAUSED' },
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
          title: '批量删除广告组',
          description: `确定要删除 ${selectedIds.length} 个广告组吗？删除后将无法恢复。`,
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
        <PageHeader
        title="广告组"
        description="管理您的广告组，查看关键指标和 ROI"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '广告组' }
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
            
            <Link to="/campaigns/new">
              <button className="qc-btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                创建广告组
              </button>
            </Link>
          </div>
        }
      />
      
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
              已选择 <span className="font-semibold text-gray-900">{selectedIds.length}</span> 个广告组
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
      
      {/* 广告组列表 */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-16 w-16" />}
          title="暂无广告组"
          description="您还没有创建任何广告组，点击下方按钮创建您的第一个广告组。"
          action={{
            label: '创建广告组',
            onClick: () => setDialogOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedIds.includes(campaign.id)}
              onSelect={() => toggleSelect(campaign.id)}
              onStatusChange={(status) => {
                batchUpdateStatus([campaign.id], status)
              }}
              onDelete={async () => {
                const confirmed = await confirm({
                  title: '删除广告组',
                  description: '确定要删除该广告组吗？删除后将无法恢复。',
                  confirmText: '删除',
                  variant: 'destructive',
                })
                if (confirmed) {
                  batchDelete([campaign.id])
                }
              }}
            />
          ))}
        </div>
      )}

      <CreateCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        advertiserId={selectedAdvertiserId}
        onSuccess={fetchCampaigns}
      />
    </div>
    </>
  )
}
