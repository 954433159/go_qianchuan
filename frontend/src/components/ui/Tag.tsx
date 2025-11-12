import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TagProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  onClose?: () => void
  onClick?: () => void
  selected?: boolean
  className?: string
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
  success: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
  error: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export default function Tag({
  label,
  variant = 'default',
  size = 'md',
  closable = false,
  onClose,
  onClick,
  selected = false,
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-blue-500 ring-offset-1',
        className
      )}
      onClick={onClick}
    >
      {label}
      {closable && (
        <X
          className={cn(
            'ml-1 cursor-pointer hover:opacity-70',
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-3.5 w-3.5',
            size === 'lg' && 'h-4 w-4'
          )}
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
        />
      )}
    </span>
  )
}
