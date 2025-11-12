import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Breadcrumb from './Breadcrumb'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* 面包屑导航 */}
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          {/* 页面内容 */}
          <div className="space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
