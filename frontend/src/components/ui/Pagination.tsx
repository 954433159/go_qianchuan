import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import Button from './Button'

export interface PaginationProps {
  current: number
  total: number
  pageSize?: number
  onChange?: (page: number) => void
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  className?: string
}

export default function Pagination({
  current = 1,
  total = 0,
  pageSize = 10,
  onChange,
  showSizeChanger = false,
  showQuickJumper = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  className = ''
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onChange?.(page)
  }

  const renderPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // 显示的页码数量
    
    if (totalPages <= showPages + 2) {
      // 页数较少，全部显示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 页数较多，显示部分
      pages.push(1)
      
      if (current <= 3) {
        for (let i = 2; i <= showPages; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 2) {
        pages.push('...')
        for (let i = totalPages - showPages + 1; i < totalPages; i++) {
          pages.push(i)
        }
        pages.push(totalPages)
      } else {
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const startItem = (current - 1) * pageSize + 1
  const endItem = Math.min(current * pageSize, total)

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* 数据统计 */}
      <div className="text-sm text-muted-foreground">
        显示 {startItem} - {endItem} 条，共 {total} 条
      </div>

      <div className="flex items-center gap-2">
        {/* 每页条数选择器 */}
        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} 条/页
              </option>
            ))}
          </select>
        )}

        {/* 页码按钮 */}
        <div className="flex items-center gap-1">
          {/* 首页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={current === 1}
            aria-label="首页"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* 上一页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            aria-label="上一页"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* 页码列表 */}
          {renderPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-400">
                  ...
                </span>
              )
            }
            
            const pageNum = page as number
            return (
              <Button
                key={pageNum}
                variant={current === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="min-w-[36px]"
              >
                {pageNum}
              </Button>
            )
          })}

          {/* 下一页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            aria-label="下一页"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* 尾页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={current === totalPages}
            aria-label="尾页"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 快速跳转 */}
        {showQuickJumper && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
              onBlur={(e) => {
                const value = Number(e.target.value)
                if (value >= 1 && value <= totalPages) {
                  handlePageChange(value)
                }
                e.target.value = ''
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                }
              }}
            />
            <span className="text-sm text-muted-foreground">页</span>
          </div>
        )}
      </div>
    </div>
  )
}
