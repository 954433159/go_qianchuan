import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Loading from '@/components/ui/Loading'
import { getRegionList, Region } from '@/api/tools'
import { cn } from '@/lib/utils'

interface RegionSelectorProps {
  advertiserId: number
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export default function RegionSelector({
  advertiserId,
  value = [],
  onChange,
  className,
}: RegionSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Region[]>([])
  const [cities, setCities] = useState<Region[]>([])
  const [districts, setDistricts] = useState<Region[]>([])
  
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>(value)

  // 加载省份列表
  useEffect(() => {
    const fetchProvinces = async () => {
      if (!advertiserId) return
      setLoading(true)
      try {
        const data = await getRegionList({
          advertiser_id: advertiserId,
          level: 1,
        })
        setProvinces(data)
      } catch (error) {
        console.error('Failed to load provinces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProvinces()
  }, [advertiserId])

  // 加载城市列表
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedProvince) {
        setCities([])
        return
      }

      try {
        const data = await getRegionList({
          advertiser_id: advertiserId,
          level: 2,
          parent_id: selectedProvince,
        })
        setCities(data)
      } catch (error) {
        console.error('Failed to load cities:', error)
      }
    }

    fetchCities()
  }, [advertiserId, selectedProvince])

  // 加载区县列表
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedCity) {
        setDistricts([])
        return
      }

      try {
        const data = await getRegionList({
          advertiser_id: advertiserId,
          level: 3,
          parent_id: selectedCity,
        })
        setDistricts(data)
      } catch (error) {
        console.error('Failed to load districts:', error)
      }
    }

    fetchDistricts()
  }, [advertiserId, selectedCity])

  // 添加地域
  const handleAddRegion = () => {
    const regionId = selectedDistrict || selectedCity || selectedProvince
    if (!regionId || selectedRegions.includes(regionId)) return

    const newRegions = [...selectedRegions, regionId]
    setSelectedRegions(newRegions)
    onChange(newRegions)

    // 重置选择
    setSelectedProvince('')
    setSelectedCity('')
    setSelectedDistrict('')
  }

  // 移除地域
  const handleRemove = (regionId: string) => {
    const newRegions = selectedRegions.filter(id => id !== regionId)
    setSelectedRegions(newRegions)
    onChange(newRegions)
  }

  // 清空选择
  const handleClearAll = () => {
    setSelectedRegions([])
    onChange([])
  }

  // 获取地域名称
  const getRegionName = (regionId: string): string => {
    const allRegions = [...provinces, ...cities, ...districts]
    return allRegions.find(r => r.id === regionId)?.name || regionId
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading text="加载地域数据..." />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 地域选择器 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">选择地域</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* 省份 */}
          <Select
            value={selectedProvince}
            onValueChange={(value) => {
              setSelectedProvince(value)
              setSelectedCity('')
              setSelectedDistrict('')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择省份" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 城市 */}
          <Select
            value={selectedCity}
            onValueChange={(value) => {
              setSelectedCity(value)
              setSelectedDistrict('')
            }}
            disabled={!selectedProvince}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择城市" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 区县 */}
          <Select
            value={selectedDistrict}
            onValueChange={setSelectedDistrict}
            disabled={!selectedCity}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择区县" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={handleAddRegion}
          disabled={!selectedProvince}
          size="sm"
          className="w-full sm:w-auto"
        >
          添加地域
        </Button>
      </div>

      {/* 已选择的地域 */}
      {selectedRegions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              已选择 ({selectedRegions.length})
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
            {selectedRegions.map(regionId => (
              <Badge
                key={regionId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {getRegionName(regionId)}
                <button
                  type="button"
                  onClick={() => handleRemove(regionId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
