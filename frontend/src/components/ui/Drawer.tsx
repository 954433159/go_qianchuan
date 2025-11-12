import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  placement?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const placementStyles = {
  left: 'left-0 top-0 bottom-0',
  right: 'right-0 top-0 bottom-0',
  top: 'top-0 left-0 right-0',
  bottom: 'bottom-0 left-0 right-0',
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
}

const animationStyles = {
  left: {
    enter: 'animate-in slide-in-from-left',
    exit: 'animate-out slide-out-to-left',
  },
  right: {
    enter: 'animate-in slide-in-from-right',
    exit: 'animate-out slide-out-to-right',
  },
  top: {
    enter: 'animate-in slide-in-from-top',
    exit: 'animate-out slide-out-to-top',
  },
  bottom: {
    enter: 'animate-in slide-in-from-bottom',
    exit: 'animate-out slide-out-to-bottom',
  },
}

export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'right',
  size = 'md',
  className,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  const isVertical = placement === 'left' || placement === 'right'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed z-50 bg-background shadow-lg transition-transform duration-300',
          placementStyles[placement],
          isVertical && sizeStyles[size],
          isVertical && 'w-full',
          !isVertical && 'w-full',
          animationStyles[placement].enter,
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
