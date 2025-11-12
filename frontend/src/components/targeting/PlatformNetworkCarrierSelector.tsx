import { Checkbox } from '@/components/ui/Checkbox'
import { getPlatforms, getNetworks, getCarriers } from '@/api/tools'
import { cn } from '@/lib/utils'

interface PlatformNetworkCarrierSelectorProps {
  platforms?: string[]
  networks?: string[]
  carriers?: string[]
  onPlatformsChange?: (value: string[]) => void
  onNetworksChange?: (value: string[]) => void
  onCarriersChange?: (value: string[]) => void
  className?: string
}

export default function PlatformNetworkCarrierSelector({
  platforms = [],
  networks = [],
  carriers = [],
  onPlatformsChange,
  onNetworksChange,
  onCarriersChange,
  className,
}: PlatformNetworkCarrierSelectorProps) {
  const platformOptions = getPlatforms()
  const networkOptions = getNetworks()
  const carrierOptions = getCarriers()

  const handlePlatformToggle = (value: string) => {
    const newPlatforms = platforms.includes(value)
      ? platforms.filter(p => p !== value)
      : [...platforms, value]
    onPlatformsChange?.(newPlatforms)
  }

  const handleNetworkToggle = (value: string) => {
    const newNetworks = networks.includes(value)
      ? networks.filter(n => n !== value)
      : [...networks, value]
    onNetworksChange?.(newNetworks)
  }

  const handleCarrierToggle = (value: string) => {
    const newCarriers = carriers.includes(value)
      ? carriers.filter(c => c !== value)
      : [...carriers, value]
    onCarriersChange?.(newCarriers)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 平台定向 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">平台类型</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {platformOptions.map(platform => (
            <label
              key={platform.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded"
            >
              <Checkbox
                checked={platforms.includes(platform.value)}
                onCheckedChange={() => handlePlatformToggle(platform.value)}
              />
              <span className="text-sm text-foreground">{platform.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 网络定向 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">网络类型</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {networkOptions.map(network => (
            <label
              key={network.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded"
            >
              <Checkbox
                checked={networks.includes(network.value)}
                onCheckedChange={() => handleNetworkToggle(network.value)}
              />
              <span className="text-sm text-foreground">{network.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 运营商定向 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">运营商</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {carrierOptions.map(carrier => (
            <label
              key={carrier.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded"
            >
              <Checkbox
                checked={carriers.includes(carrier.value)}
                onCheckedChange={() => handleCarrierToggle(carrier.value)}
              />
              <span className="text-sm text-foreground">{carrier.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
