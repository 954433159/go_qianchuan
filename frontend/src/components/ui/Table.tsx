import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface TableColumn<T> {
  key: string
  title: string
  dataIndex?: keyof T
  render?: (value: unknown, record: T, index: number) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyText?: string
  rowKey?: keyof T | ((record: T) => string | number)
  onRow?: (record: T) => {
    onClick?: () => void
    className?: string
  }
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyText = '暂无数据',
  rowKey = 'id',
  onRow
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return (record[rowKey] as string | number) ?? index
  }
  
  const getCellValue = (column: TableColumn<T>, record: T, index: number): ReactNode => {
    if (column.render) {
      return column.render(
        column.dataIndex ? record[column.dataIndex] : record,
        record,
        index
      )
    }
    const value = column.dataIndex ? record[column.dataIndex] : ''
    return String(value ?? '')
  }
  
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-left'
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-card rounded-lg border" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="sr-only">加载中...</span>
      </div>
    )
  }
  
  return (
    <div className="w-full overflow-auto rounded-md border bg-card">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'h-12 px-4 font-medium text-muted-foreground',
                  getAlignClass(column.align)
                )}
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => {
              const rowProps = onRow?.(record) || {}
              return (
                <tr
                  key={getRowKey(record, index)}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    rowProps.onClick && 'cursor-pointer',
                    rowProps.className
                  )}
                  onClick={rowProps.onClick}
                  role={rowProps.onClick ? 'button' : undefined}
                  tabIndex={rowProps.onClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (rowProps.onClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      rowProps.onClick()
                    }
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
                        getAlignClass(column.align)
                      )}
                    >
                      {getCellValue(column, record, index)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
