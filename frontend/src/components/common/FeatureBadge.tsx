import { AlertCircle, Construction, TestTube2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FeatureStatus = 'not-implemented' | 'mock-data' | 'beta' | 'experimental' | 'coming-soon'

interface FeatureBadgeProps {
  status: FeatureStatus
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<FeatureStatus, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  'not-implemented': {
    label: '暂未实现',
    icon: Construction,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  'mock-data': {
    label: '演示数据',
    icon: TestTube2,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
  },
  'beta': {
    label: '测试版',
    icon: Sparkles,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
  },
  'experimental': {
    label: '实验性',
    icon: TestTube2,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  'coming-soon': {
    label: '即将推出',
    icon: AlertCircle,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-300',
  },
}

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    iconSize: 'w-3 h-3',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    iconSize: 'w-4 h-4',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-4 py-2',
    text: 'text-base',
    iconSize: 'w-5 h-5',
    gap: 'gap-2',
  },
}

export default function FeatureBadge({
  status,
  className,
  showIcon = true,
  size = 'sm',
}: FeatureBadgeProps) {
  const config = statusConfig[status]
  const sizeStyles = sizeConfig[size]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeStyles.padding,
        sizeStyles.text,
        sizeStyles.gap,
        className
      )}
    >
      {showIcon && <Icon className={sizeStyles.iconSize} />}
      {config.label}
    </span>
  )
}

// Banner component for page-level feature status
interface FeatureBannerProps {
  status: FeatureStatus
  title?: string
  description?: string
  className?: string
}

export function FeatureBanner({
  status,
  title,
  description,
  className,
}: FeatureBannerProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const defaultMessages: Record<FeatureStatus, { title: string; description: string }> = {
    'not-implemented': {
      title: '功能开发中',
      description: '此功能正在开发中，敬请期待。如需使用，请联系管理员。',
    },
    'mock-data': {
      title: '演示数据',
      description: '当前显示的是演示数据，仅供参考。真实数据功能正在开发中。',
    },
    'beta': {
      title: '测试版功能',
      description: '此功能正在测试中，可能存在不稳定情况。',
    },
    'experimental': {
      title: '实验性功能',
      description: '此功能为实验性功能，后续可能会有较大变动。',
    },
    'coming-soon': {
      title: '即将推出',
      description: '此功能即将推出，请持续关注更新。',
    },
  }

  const message = defaultMessages[status]

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.textColor)} />
        <div className="flex-1">
          <h3 className={cn('font-semibold mb-1', config.textColor)}>
            {title || message.title}
          </h3>
          <p className={cn('text-sm', config.textColor, 'opacity-90')}>
            {description || message.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// Overlay component for disabled features
interface FeatureOverlayProps {
  status: FeatureStatus
  message?: string
  children?: React.ReactNode
}

export function FeatureOverlay({
  status,
  message,
  children,
}: FeatureOverlayProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div className={cn('text-center p-6 max-w-md', config.textColor)}>
          <Icon className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">
            {message || `此功能${config.label}`}
          </p>
        </div>
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  )
}
