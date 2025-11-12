import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'search' | 'dateRange'
  options?: FilterOption[]
  placeholder?: string
}

interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
  onClear?: () => void
  className?: string
}

export default function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some(v => 
    v !== undefined && v !== '' && v !== null
  )
  
  return (
    <div className={cn('qc-card', className)}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* 筛选图标 */}
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter className="w-5 h-5" />
          <span>筛选</span>
        </div>
        
        {/* 筛选项 */}
        {filters.map((filter) => (
          <div key={filter.key} className="flex-1 min-w-[200px]">
            {filter.type === 'search' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={filter.placeholder || `搜索${filter.label}`}
                  value={values[filter.key] || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="qc-input pl-10"
                />
              </div>
            )}
            
            {filter.type === 'select' && filter.options && (
              <select
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="qc-input"
              >
                <option value="">全部{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {filter.type === 'dateRange' && (
              <input
                type="date"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="qc-input"
              />
            )}
          </div>
        ))}
        
        {/* 清除按钮 */}
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#EF4444] transition-colors"
          >
            <X className="w-4 h-4" />
            清除筛选
          </button>
        )}
      </div>
    </div>
  )
}
