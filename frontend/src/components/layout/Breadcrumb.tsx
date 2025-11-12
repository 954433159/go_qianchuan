import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { getBreadcrumbs } from '@/config/routes'
import { cn } from '@/lib/utils'

export default function Breadcrumb() {
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(location.pathname)
  
  // 如果只有首页,不显示面包屑
  if (breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        const isFirst = index === 0
        
        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className={cn(
                  'hover:text-[#EF4444] transition-colors flex items-center gap-1',
                  isFirst && 'text-gray-500'
                )}
              >
                {isFirst && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1',
                  isLast && 'text-gray-900 font-medium'
                )}
              >
                {isFirst && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
