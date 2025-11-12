import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatGMV, formatPercent } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface GMVCardProps {
  todayGMV: number
  yesterdayGMV: number
  monthGMV: number
  targetGMV: number
  className?: string
}

export default function GMVCard({
  todayGMV,
  yesterdayGMV,
  monthGMV,
  targetGMV,
  className,
}: GMVCardProps) {
  // 计算增长率
  const growthRate = yesterdayGMV > 0 
    ? (todayGMV - yesterdayGMV) / yesterdayGMV 
    : 0
  
  const isPositive = growthRate >= 0
  
  // 计算目标完成率
  const completionRate = targetGMV > 0 ? monthGMV / targetGMV : 0
  
  return (
    <div className={cn('qc-card', className)}>
      {/* 标题 */}
      <div className="qc-card-header">
        <h3 className="qc-card-title flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span>GMV概览</span>
        </h3>
      </div>
      
      {/* 主要数据 - 今日GMV */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">今日GMV</div>
        <div className="flex items-baseline gap-3">
          <span className="qc-gmv-highlight text-4xl font-bold">
            {formatGMV(todayGMV)}
          </span>
          
          {/* 增长趋势 */}
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
            isPositive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatPercent(Math.abs(growthRate))}</span>
          </div>
        </div>
        
        {/* 对比昨日 */}
        <div className="text-sm text-gray-500 mt-2">
          较昨日 {formatGMV(yesterdayGMV)}
        </div>
      </div>
      
      {/* 次要数据 */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        {/* 本月GMV */}
        <div>
          <div className="text-sm text-gray-600 mb-1">本月GMV</div>
          <div className="text-xl font-bold text-gray-900">
            {formatGMV(monthGMV)}
          </div>
        </div>
        
        {/* 目标完成率 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">目标完成率</div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-gray-900">
              {formatPercent(completionRate)}
            </div>
            {completionRate >= 1 && (
              <span className="text-xs text-green-600 font-medium">
                已达标
              </span>
            )}
          </div>
          
          {/* 进度条 */}
          <div className="qc-progress mt-2">
            <div 
              className="qc-progress-bar" 
              style={{ width: `${Math.min(completionRate * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 提示信息 */}
      {completionRate < 0.5 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-700">
            💡 当前完成率较低，建议加大投放力度或优化推广策略
          </p>
        </div>
      )}
    </div>
  )
}
