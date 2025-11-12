import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import Loading from '@/components/ui/Loading'
import { getDeviceBrandList, DeviceBrand } from '@/api/tools'
import { cn } from '@/lib/utils'

interface DeviceBrandSelectorProps {
  advertiserId: number
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export default function DeviceBrandSelector({
  advertiserId,
  value = [],
  onChange,
  className,
}: DeviceBrandSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState<'IOS' | 'ANDROID'>('ANDROID')
  const [brands, setBrands] = useState<DeviceBrand[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(value)

  // 加载设备品牌列表
  useEffect(() => {
    const fetchBrands = async () => {
      if (!advertiserId) return
      setLoading(true)
      try {
        const data = await getDeviceBrandList({
          advertiser_id: advertiserId,
          platform,
        })
        setBrands(data)
      } catch (error) {
        console.error('Failed to load device brands:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [advertiserId, platform])

  // 选择/取消选择品牌
  const handleToggle = (brandId: string) => {
    const newSelected = selectedIds.includes(brandId)
      ? selectedIds.filter(id => id !== brandId)
      : [...selectedIds, brandId]
    
    setSelectedIds(newSelected)
    onChange(newSelected)
  }

  // 移除已选择的品牌
  const handleRemove = (brandId: string) => {
    const newSelected = selectedIds.filter(id => id !== brandId)
    setSelectedIds(newSelected)
    onChange(newSelected)
  }

  // 清空选择
  const handleClearAll = () => {
    setSelectedIds([])
    onChange([])
  }

  // 获取品牌名称
  const getBrandName = (brandId: string): string => {
    return brands.find(b => b.id === brandId)?.name || brandId
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 平台选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">选择平台</label>
        <Select value={platform} onValueChange={(value: 'IOS' | 'ANDROID') => setPlatform(value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANDROID">Android</SelectItem>
            <SelectItem value="IOS">iOS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 已选择的品牌 */}
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
            {selectedIds.map(id => (
              <Badge
                key={id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {getBrandName(id)}
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 品牌列表 */}
      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading text="加载中..." />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无设备品牌数据
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brands.map(brand => (
              <label
                key={brand.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded"
              >
                <Checkbox
                  checked={selectedIds.includes(brand.id)}
                  onCheckedChange={() => handleToggle(brand.id)}
                />
                <span className="text-sm font-medium text-foreground">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
