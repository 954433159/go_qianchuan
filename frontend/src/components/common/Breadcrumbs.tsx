import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="面包屑导航" className={cn('flex items-center space-x-1 text-sm', className)}>
      {/* Home Icon */}
      <Link
        to="/dashboard"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="返回工作台"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
