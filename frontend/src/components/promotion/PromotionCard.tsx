import { Link } from 'react-router-dom'
import { 
  Play, 
  Pause, 
  Edit, 
  Target,
  Image as ImageIcon,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { Promotion } from '@/store/promotionStore'
import { 
  formatGMV, 
  formatROI, 
  formatPercent,
  getROIClassName,
  getDeliveryStatusConfig,
  getLearningStatusConfig
} from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface PromotionCardProps {
  promotion: Promotion
  isSelected?: boolean
  onSelect?: () => void
  onStatusChange?: (status: string) => void
}

export default function PromotionCard({
  promotion,
  isSelected = false,
  onSelect,
  onStatusChange,
}: PromotionCardProps) {
  const statusConfig = getDeliveryStatusConfig(promotion.status)
  const learningConfig = getLearningStatusConfig(promotion.learning_status)
  
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
      
      {/* 标题区 */}
      <div className="mb-4 pl-8">
        <Link 
          to={`/ads/${promotion.id}`}
          className="text-lg font-semibold text-gray-900 hover:text-[#EF4444] transition-colors block"
        >
          {promotion.name}
        </Link>
        
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={statusConfig.className}>
            {statusConfig.text}
          </span>
          <span className={learningConfig.className}>
            {learningConfig.text}
          </span>
          <span className="text-xs text-gray-500">
            ID: {promotion.id}
          </span>
        </div>
      </div>
      
      {/* 关键指标 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* 预算和出价 */}
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <DollarSign className="w-3 h-3" />
            <span>预算/出价</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatGMV(promotion.budget)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            出价: {formatGMV(promotion.bid)}
          </div>
        </div>
        
        {/* 消耗 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">消耗</div>
          <div className="text-sm font-semibold text-gray-900">
            {formatGMV(promotion.spend)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            CPC: {formatGMV(promotion.cpc)}
          </div>
        </div>
        
        {/* 转化 */}
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>转化</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {promotion.conversions}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            CVR: {formatPercent(promotion.cvr)}
          </div>
        </div>
        
        {/* ROI */}
        <div>
          <div className="text-xs text-gray-500 mb-1">ROI</div>
          <div className={cn('text-xl font-bold', getROIClassName(promotion.roi))}>
            {formatROI(promotion.roi)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {promotion.roi > 5 ? '优秀' : promotion.roi >= 3 ? '良好' : '待优化'}
          </div>
        </div>
      </div>
      
      {/* 定向信息 */}
      {promotion.targeting_info && Object.keys(promotion.targeting_info).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <Target className="w-3 h-3" />
            <span>定向信息</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {promotion.targeting_info.gender && (
              <span className="px-2 py-1 bg-white rounded border border-gray-200">
                {promotion.targeting_info.gender === 'MALE' ? '男性' : 
                 promotion.targeting_info.gender === 'FEMALE' ? '女性' : '不限'}
              </span>
            )}
            {promotion.targeting_info.age_range && promotion.targeting_info.age_range.length > 0 && (
              <span className="px-2 py-1 bg-white rounded border border-gray-200">
                年龄: {promotion.targeting_info.age_range.join(', ')}
              </span>
            )}
            {promotion.targeting_info.regions && promotion.targeting_info.regions.length > 0 && (
              <span className="px-2 py-1 bg-white rounded border border-gray-200">
                {promotion.targeting_info.regions.length}个地区
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* 创意信息 */}
      {promotion.creative_ids && promotion.creative_ids.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <ImageIcon className="w-3 h-3" />
            <span>关联创意</span>
          </div>
          <div className="flex gap-2">
            {promotion.creative_ids.slice(0, 3).map((id) => (
              <div
                key={id}
                className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
              >
                <ImageIcon className="w-5 h-5" />
              </div>
            ))}
            {promotion.creative_ids.length > 3 && (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                +{promotion.creative_ids.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 操作按钮 */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        {promotion.status === 'ACTIVE' ? (
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
          to={`/ads/${promotion.id}/edit`}
          className="flex-1 qc-btn-secondary text-sm"
        >
          <Edit className="w-4 h-4 mr-1" />
          编辑
        </Link>
        
        <Link
          to={`/ads/${promotion.id}`}
          className="qc-btn-secondary text-sm"
        >
          详情
        </Link>
      </div>
    </div>
  )
}
