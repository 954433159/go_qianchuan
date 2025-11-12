import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import { mainNavigation, MenuItem } from '@/config/routes'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: Icons.LayoutDashboard,
  Megaphone: Icons.Megaphone,
  BarChart3: Icons.BarChart3,
  Image: Icons.Image,
  Target: Icons.Target,
  Wallet: Icons.Wallet,
  Users: Icons.Users,
}

// 递归渲染菜单项组件
function NavMenuItem({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.path ? location.pathname === item.path : false
  const isChildActive = hasChildren && item.children?.some(child => 
    location.pathname.startsWith(child.path || '')
  )
  
  const Icon = item.icon ? iconMap[item.icon] : null
  
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
            'hover:bg-gray-100 text-gray-700 font-medium',
            isChildActive && 'bg-gradient-to-r from-red-50 to-orange-50 text-[#EF4444]'
          )}
        >
          {Icon && <Icon className="w-5 h-5 shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          <Icons.ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map(child => (
              <NavMenuItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <NavLink
      to={item.path || '#'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
          'hover:bg-gray-100 text-gray-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]',
          isActive && [
            'bg-gradient-to-r from-[#EF4444] to-[#F97316] text-white font-medium',
            'hover:shadow-[0_4px_12px_-2px_rgba(239,68,68,0.3)]',
            'hover:from-[#DC2626] hover:to-[#EA580C]',
          ]
        )
      }
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span className="flex-1">{item.label}</span>
      {!isActive && (
        <Icons.ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-2">
        {mainNavigation.map((item) => (
          <NavMenuItem key={item.id} item={item} />
        ))}
      </nav>
    </aside>
  )
}
