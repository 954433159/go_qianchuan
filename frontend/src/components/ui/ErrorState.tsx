import { AlertCircle } from 'lucide-react'
import Button from './Button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function ErrorState({
  title = '出错了',
  description = '加载数据时遇到问题,请稍后重试',
  icon,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 text-destructive">
        {icon || <AlertCircle className="h-16 w-16" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
