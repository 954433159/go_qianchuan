import { useState } from 'react'
import { CheckSquare, Square, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface BatchAction<T = unknown> {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  onClick: (selectedItems: T[]) => void | Promise<void>
  disabled?: (selectedItems: T[]) => boolean
  confirm?: {
    title: string
    description: string
  }
}

interface BatchOperatorProps<T> {
  items: T[]
  selectedItems: T[]
  onSelectionChange: (items: T[]) => void
  actions: BatchAction<T>[]
  keyExtractor: (item: T) => string | number
  className?: string
  disabled?: boolean
}

export function BatchOperator<T>({
  items,
  selectedItems,
  onSelectionChange,
  actions,
  keyExtractor,
  className,
  disabled = false
}: BatchOperatorProps<T>) {
  const [loading, setLoading] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const isAllSelected = items.length > 0 && selectedItems.length === items.length
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange([...items])
    }
  }

  const handleAction = async (action: BatchAction<T>) => {
    if (disabled || !selectedItems.length) return

    // 检查是否禁用
    if (action.disabled && action.disabled(selectedItems)) {
      return
    }

    // 确认对话框
    if (action.confirm) {
      const confirmed = window.confirm(
        `${action.confirm.title}\n\n${action.confirm.description}\n\n已选择 ${selectedItems.length} 项，确认继续？`
      )
      if (!confirmed) return
    }

    setLoading(action.key)
    try {
      await action.onClick(selectedItems)
      // 操作成功后清空选择
      onSelectionChange([])
    } catch (error) {
      console.error(`Batch action ${action.key} failed:`, error)
    } finally {
      setLoading(null)
      setDropdownOpen(false)
    }
  }

  // 分离主要操作和次要操作
  const primaryActions = actions.slice(0, 2)
  const secondaryActions = actions.slice(2)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 全选按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSelectAll}
        disabled={disabled || items.length === 0}
        className="gap-2"
      >
        {isAllSelected ? (
          <CheckSquare className="h-4 w-4" />
        ) : isIndeterminate ? (
          <div className="h-4 w-4 border-2 border-primary rounded flex items-center justify-center">
            <div className="h-2 w-2 bg-primary" />
          </div>
        ) : (
          <Square className="h-4 w-4" />
        )}
        <span className="text-sm">
          {selectedItems.length > 0 ? `已选 ${selectedItems.length}` : '全选'}
        </span>
      </Button>

      {selectedItems.length > 0 && (
        <>
          {/* 分隔线 */}
          <div className="h-6 w-px bg-border" />

          {/* 主要操作按钮 */}
          {primaryActions.map((action) => {
            const ActionIcon = action.icon
            const isDisabled = disabled || (action.disabled && action.disabled(selectedItems))
            const isLoading = loading === action.key

            return (
              <Button
                key={action.key}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => handleAction(action)}
                disabled={isDisabled || isLoading}
                className="gap-2"
              >
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                {isLoading ? '处理中...' : action.label}
              </Button>
            )
          })}

          {/* 更多操作下拉菜单 */}
          {secondaryActions.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={disabled}
                className="gap-1"
              >
                更多操作
                <ChevronDown className="h-4 w-4" />
              </Button>

              {dropdownOpen && (
                <>
                  {/* 遮罩层 */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />

                  {/* 下拉菜单 */}
                  <div className="absolute left-0 top-full mt-1 z-20 min-w-[160px] rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
                    {secondaryActions.map((action) => {
                      const ActionIcon = action.icon
                      const isDisabled = action.disabled && action.disabled(selectedItems)
                      const isLoading = loading === action.key

                      return (
                        <button
                          key={action.key}
                          onClick={() => handleAction(action)}
                          disabled={isDisabled || isLoading}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                            'hover:bg-accent focus:bg-accent',
                            'disabled:opacity-50 disabled:pointer-events-none',
                            action.variant === 'destructive' && 'text-destructive'
                          )}
                        >
                          {ActionIcon && <ActionIcon className="h-4 w-4" />}
                          {isLoading ? '处理中...' : action.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
