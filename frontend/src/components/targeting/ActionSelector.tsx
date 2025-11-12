import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import Loading from '@/components/ui/Loading'
import { getActionList, searchAction, Action } from '@/api/tools'
import { cn } from '@/lib/utils'

interface ActionSelectorProps {
  advertiserId: number
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export default function ActionSelector({
  advertiserId,
  value = [],
  onChange,
  className,
}: ActionSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [actions, setActions] = useState<Action[]>([])
  const [searchResults, setSearchResults] = useState<Action[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>(value)

  // 加载行为列表
  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true)
      try {
        const data = await getActionList({ advertiser_id: advertiserId })
        setActions(data)
      } catch (error) {
        console.error('Failed to load actions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (advertiserId) {
      fetchActions()
    }
  }, [advertiserId])

  // 搜索行为
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const data = await searchAction({
        advertiser_id: advertiserId,
        keyword: searchKeyword,
      })
      setSearchResults(data)
    } catch (error) {
      console.error('Failed to search actions:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // 选择/取消选择行为
  const handleToggle = (actionId: string) => {
    const newSelected = selectedIds.includes(actionId)
      ? selectedIds.filter(id => id !== actionId)
      : [...selectedIds, actionId]
    
    setSelectedIds(newSelected)
    onChange(newSelected)
  }

  // 移除已选择的行为
  const handleRemove = (actionId: string) => {
    const newSelected = selectedIds.filter(id => id !== actionId)
    setSelectedIds(newSelected)
    onChange(newSelected)
  }

  // 清空选择
  const handleClearAll = () => {
    setSelectedIds([])
    onChange([])
  }

  const displayActions = searchKeyword ? searchResults : actions

  return (
    <div className={cn('space-y-4', className)}>
      {/* 搜索框 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="搜索行为关键词..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={!searchKeyword.trim() || searchLoading}
          loading={searchLoading}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* 已选择的行为 */}
      {selectedIds.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              已选择 ({selectedIds.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              清空
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIds.map(id => {
              const action = [...actions, ...searchResults].find(a => a.id === id)
              if (!action) return null
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {action.name} ({action.days}天)
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* 行为列表 */}
      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading text="加载中..." />
          </div>
        ) : displayActions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchKeyword ? '未找到匹配的行为' : '暂无行为数据'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayActions.map(action => (
              <label
                key={action.id}
                className="flex items-start gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded"
              >
                <Checkbox
                  checked={selectedIds.includes(action.id)}
                  onCheckedChange={() => handleToggle(action.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {action.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {action.days}天 · 覆盖 {action.num ? (action.num / 10000).toFixed(1) : '0.0'}万人
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
