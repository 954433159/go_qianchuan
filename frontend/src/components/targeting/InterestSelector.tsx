import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import Loading from '@/components/ui/Loading'
import { getInterestList, searchInterest, Interest } from '@/api/tools'
import { cn } from '@/lib/utils'

interface InterestSelectorProps {
  advertiserId: number
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export default function InterestSelector({
  advertiserId,
  value = [],
  onChange,
  className,
}: InterestSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [interests, setInterests] = useState<Interest[]>([])
  const [searchResults, setSearchResults] = useState<Interest[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>(value)

  // 加载兴趣列表
  useEffect(() => {
    const fetchInterests = async () => {
      setLoading(true)
      try {
        const data = await getInterestList({ advertiser_id: advertiserId })
        setInterests(data)
      } catch (error) {
        console.error('Failed to load interests:', error)
      } finally {
        setLoading(false)
      }
    }

    if (advertiserId) {
      fetchInterests()
    }
  }, [advertiserId])

  // 搜索兴趣
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const data = await searchInterest({
        advertiser_id: advertiserId,
        keyword: searchKeyword,
      })
      setSearchResults(data)
    } catch (error) {
      console.error('Failed to search interests:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // 选择/取消选择兴趣
  const handleToggle = (interestId: string) => {
    const newSelected = selectedIds.includes(interestId)
      ? selectedIds.filter(id => id !== interestId)
      : [...selectedIds, interestId]
    
    setSelectedIds(newSelected)
    onChange(newSelected)
  }

  // 移除已选择的兴趣
  const handleRemove = (interestId: string) => {
    const newSelected = selectedIds.filter(id => id !== interestId)
    setSelectedIds(newSelected)
    onChange(newSelected)
  }

  // 清空选择
  const handleClearAll = () => {
    setSelectedIds([])
    onChange([])
  }

  const displayInterests = searchKeyword ? searchResults : interests

  return (
    <div className={cn('space-y-4', className)}>
      {/* 搜索框 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="搜索兴趣关键词..."
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

      {/* 已选择的兴趣 */}
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
              const interest = [...interests, ...searchResults].find(i => i.id === id)
              if (!interest) return null
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {interest.name}
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

      {/* 兴趣列表 */}
      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading text="加载中..." />
          </div>
        ) : displayInterests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchKeyword ? '未找到匹配的兴趣' : '暂无兴趣数据'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayInterests.map(interest => (
              <label
                key={interest.id}
                className="flex items-start gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded"
              >
                <Checkbox
                  checked={selectedIds.includes(interest.id)}
                  onCheckedChange={() => handleToggle(interest.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {interest.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    覆盖 {interest.num ? (interest.num / 10000).toFixed(1) : '0.0'}万人
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
