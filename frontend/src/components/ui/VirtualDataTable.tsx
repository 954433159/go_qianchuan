import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { List, ListImperativeAPI } from 'react-window'
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

export interface VirtualDataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  searchable?: boolean
  onSearch?: (query: string) => void
  rowKey?: keyof T | ((row: T) => string | number)
  className?: string
  emptyText?: string
  rowHeight?: number // 虚拟滚动行高
  virtualHeight?: number // 虚拟滚动容器高度
  threshold?: number // 启用虚拟滚动的阈值
}

export default function VirtualDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  selectable = false,
  onSelectionChange,
  searchable = false,
  onSearch,
  rowKey = 'id' as keyof T,
  className,
  emptyText = '暂无数据',
  rowHeight = 56, // 默认行高56px
  virtualHeight = 600, // 默认虚拟滚动容器高度600px
  threshold = 100, // 数据超过100条启用虚拟滚动
}: VirtualDataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const listRef = useRef<ListImperativeAPI>(null)

  const getRowKey = useCallback((row: T): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row)
    }
    return row[rowKey] as string | number
  }, [rowKey])

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

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' }
        }
        return null
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allKeys = new Set(searchedData.map(getRowKey))
      setSelectedRows(allKeys)
      onSelectionChange?.(searchedData)
    } else {
      setSelectedRows(new Set())
      onSelectionChange?.([]
)
    }
  }, [searchedData, getRowKey, onSelectionChange])

  const handleSelectRow = useCallback((row: T, checked: boolean) => {
    const key = getRowKey(row)
    setSelectedRows((prev) => {
      const newSelection = new Set(prev)
      if (checked) {
        newSelection.add(key)
      } else {
        newSelection.delete(key)
      }
      const selected = data.filter((r) => newSelection.has(getRowKey(r)))
      onSelectionChange?.(selected)
      return newSelection
    })
  }, [data, getRowKey, onSelectionChange])

  const isAllSelected = useMemo(() => {
    return searchedData.length > 0 &&
      searchedData.every((row) => selectedRows.has(getRowKey(row)))
  }, [searchedData, selectedRows, getRowKey])

  // 是否使用虚拟滚动 (暂时禁用)
  // TODO: Fix react-window v2 API compatibility
  const useVirtualization = false // searchedData.length > threshold

  // 虚拟滚动行渲染器
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = searchedData[index]
    if (!row) return null
    const key = getRowKey(row)
    const isSelected = selectedRows.has(key)

    return (
      <div
        style={style}
        className={cn(
          'flex border-b hover:bg-muted/50 transition-colors',
          isSelected && 'bg-muted/50'
        )}
      >
        {selectable && (
          <div className="w-12 px-4 py-3 flex items-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked: boolean | 'indeterminate') =>
                handleSelectRow(row, checked as boolean)
              }
            />
          </div>
        )}
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              'px-4 py-3 text-sm flex items-center',
              column.align === 'center' && 'justify-center',
              column.align === 'right' && 'justify-end'
            )}
            style={{ width: column.width || 'auto', flexShrink: 0 }}
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
          </div>
        ))}
      </div>
    )
  }, [searchedData, selectedRows, getRowKey, selectable, columns, handleSelectRow])

  useEffect(() => {
    // 数据变化时滚动到顶部
    // TODO: Fix react-window v2 API compatibility
    // if (listRef.current) {
    //   listRef.current.scrollToRow({ index: 0, align: 'start' })
    // }
  }, [searchedData.length])

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
            }}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          共 {searchedData.length} 条数据
          {selectedRows.size > 0 && ` (已选择 ${selectedRows.size} 条)`}
          {useVirtualization && ' • 使用虚拟滚动优化'}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 flex border-b">
          {selectable && (
            <div className="w-12 px-4 py-3 flex items-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </div>
          )}
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                'px-4 py-3 text-left text-sm font-medium flex items-center gap-2',
                column.sortable && 'cursor-pointer select-none hover:bg-muted',
                column.align === 'center' && 'justify-center',
                column.align === 'right' && 'justify-end'
              )}
              style={{ width: column.width || 'auto', flexShrink: 0 }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
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
          ))}
        </div>

        {/* Body */}
        {searchedData.length === 0 ? (
          <EmptyState title={emptyText} />
        ) : (
          // 普通渲染模式 (虚拟滚动暂时禁用)
          <div>
            {searchedData.map((row, index) => {
              const key = getRowKey(row)
              return (
                <Row
                  key={String(key)}
                  index={index}
                  style={{}}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
