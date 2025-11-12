import { Link } from 'react-router-dom'
import { 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  TrendingUp,
  Eye
} from 'lucide-react'
import { Campaign } from '@/store/campaignStore'
import { 
  formatGMV, 
  formatROI, 
  formatPercent,
  getROIClassName,
  getDeliveryStatusConfig 
} from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface CampaignCardProps {
  campaign: Campaign
  isSelected?: boolean
  onSelect?: () => void
  onStatusChange?: (status: string) => void
  onDelete?: () => void
}

export default function CampaignCard({
  campaign,
  isSelected = false,
  onSelect,
  onStatusChange,
  onDelete,
}: CampaignCardProps) {
  const statusConfig = getDeliveryStatusConfig(campaign.status)
  const budgetUsageRate = campaign.budget > 0 ? campaign.spend / campaign.budget : 0
  
  return (
    <div className={cn(
      'qc-card group relative',
      isSelected && 'ring-2 ring-[#EF4444]'
    )}>
      {/* 选择框 */}
      {onSelect && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-gray-300 text-[#EF4444] focus:ring-[#EF4444]"
          />
        </div>
      )}
      
      {/* 操作菜单 */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* 标题和状态 */}
      <div className="mb-4 pl-8">
        <Link 
          to={`/campaigns/${campaign.id}`}
          className="text-lg font-semibold text-gray-900 hover:text-[#EF4444] transition-colors"
        >
          {campaign.name}
        </Link>
        
        <div className="flex items-center gap-2 mt-2">
          <span className={statusConfig.className}>
            {statusConfig.text}
          </span>
          <span className="text-sm text-gray-500">
            ID: {campaign.id}
          </span>
        </div>
      </div>
      
      {/* 核心数据指标 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* 预算和花费 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">预算/花费</div>
          <div className="font-semibold text-gray-900">
            {formatGMV(campaign.budget)}
          </div>
          <div className="text-sm text-gray-600">
            {formatGMV(campaign.spend)}
          </div>
          {/* 预算使用进度 */}
          <div className="qc-progress mt-1">
            <div 
              className="qc-progress-bar" 
              style={{ width: `${Math.min(budgetUsageRate * 100, 100)}%` }}
            />
          </div>
        </div>
        
        {/* 展现和点击 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">展现/点击</div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {campaign.impressions.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            点击: {campaign.clicks.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            CTR: {formatPercent(campaign.ctr)}
          </div>
        </div>
        
        {/* ROI */}
        <div>
          <div className="text-xs text-gray-500 mb-1">ROI</div>
          <div className={cn('text-2xl font-bold', getROIClassName(campaign.roi))}>
            {formatROI(campaign.roi)}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>转化: {campaign.conversions}</span>
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        {campaign.status === 'ACTIVE' ? (
          <button
            onClick={() => onStatusChange?.('PAUSED')}
            className="flex-1 qc-btn-secondary text-sm"
          >
            <Pause className="w-4 h-4 mr-1" />
            暂停
          </button>
        ) : (
          <button
            onClick={() => onStatusChange?.('ACTIVE')}
            className="flex-1 qc-btn-primary text-sm"
          >
            <Play className="w-4 h-4 mr-1" />
            启动
          </button>
        )}
        
        <Link
          to={`/campaigns/${campaign.id}/edit`}
          className="flex-1 qc-btn-secondary text-sm"
        >
          <Edit className="w-4 h-4 mr-1" />
          编辑
        </Link>
        
        <button
          onClick={onDelete}
          className="qc-btn-secondary text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
