import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from './Checkbox'
import Loading from './Loading'
import EmptyState from './EmptyState'
import Input from './Input'
import Button from './Button'

export interface ColumnDef<T> {
  key: string
  label: string
  dataIndex?: keyof T
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  searchable?: boolean
  onSearch?: (query: string) => void
  pagination?: boolean
  pageSize?: number
  rowKey?: keyof T | ((row: T) => string | number)
  className?: string
  emptyText?: string
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  selectable = false,
  onSelectionChange,
  searchable = false,
  onSearch,
  pagination = true,
  pageSize = 10,
  rowKey = 'id' as keyof T,
  className,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const getRowKey = (row: T): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row)
    }
    return row[rowKey] as string | number
  }

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key)
      if (!column?.dataIndex) return 0

      const aValue = a[column.dataIndex]
      const bValue = b[column.dataIndex]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig, columns])

  // Searching
  const searchedData = useMemo(() => {
    if (!searchQuery) return sortedData

    return sortedData.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [sortedData, searchQuery])

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return searchedData

    const startIndex = (currentPage - 1) * pageSize
    return searchedData.slice(startIndex, startIndex + pageSize)
  }, [searchedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(searchedData.length / pageSize)

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' }
        }
        return null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(paginatedData.map(getRowKey))
      setSelectedRows(allKeys)
      onSelectionChange?.(paginatedData)
    } else {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (row: T, checked: boolean) => {
    const key = getRowKey(row)
    const newSelection = new Set(selectedRows)

    if (checked) {
      newSelection.add(key)
    } else {
      newSelection.delete(key)
    }

    setSelectedRows(newSelection)
    const selected = data.filter((r) => newSelection.has(getRowKey(r)))
    onSelectionChange?.(selected)
  }

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.has(getRowKey(row)))

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {searchable && (
        <div className="flex gap-2">
          <Input
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onSearch?.(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium',
                    column.sortable && 'cursor-pointer select-none hover:bg-muted',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="text-muted-foreground">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState title={emptyText} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const key = getRowKey(row)
                const isSelected = selectedRows.has(key)

                return (
                  <tr
                    key={String(key)}
                    className={cn(
                      'border-t hover:bg-muted/50 transition-colors',
                      isSelected && 'bg-muted/50'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked: boolean | 'indeterminate') =>
                            handleSelectRow(row, checked as boolean)
                          }
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(
                              column.dataIndex ? row[column.dataIndex] : undefined,
                              row,
                              index
                            )
                          : column.dataIndex
                          ? String((row[column.dataIndex] as string | number | boolean) ?? '')
                          : ''}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            显示 {(currentPage - 1) * pageSize + 1} 到{' '}
            {Math.min(currentPage * pageSize, searchedData.length)} 条，共{' '}
            {searchedData.length} 条
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
