import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const loadingVariants = cva(
  'animate-spin rounded-full border-b-2 border-primary',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  className?: string
  text?: string
  fullScreen?: boolean
}

export default function Loading({ 
  size, 
  className, 
  text,
  fullScreen = false 
}: LoadingProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      fullScreen && 'min-h-screen',
      className
    )}>
      <div className={loadingVariants({ size })} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

// Spinner component for inline use
export function Spinner({ size = 'sm', className }: LoadingProps) {
  return <div className={cn(loadingVariants({ size }), className)} />
}
