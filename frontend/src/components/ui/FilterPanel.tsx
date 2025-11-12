import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'
import Input from './Input'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'number' | 'date' | 'dateRange'
  options?: Array<{ label: string; value: string | number }>
  placeholder?: string
}

export interface FilterPanelProps {
  fields: FilterField[]
  values: Record<string, unknown>
  onChange: (values: Record<string, unknown>) => void
  onApply?: () => void
  onReset?: () => void
  className?: string
  collapsed?: boolean
}

export default function FilterPanel({
  fields,
  values,
  onChange,
  onApply,
  onReset,
  className,
  collapsed = false,
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const handleFieldChange = (key: string, value: unknown) => {
    onChange({
      ...values,
      [key]: value,
    })
  }

  const handleReset = () => {
    const emptyValues: Record<string, unknown> = {}
    fields.forEach((field) => {
      emptyValues[field.key] = ''
    })
    onChange(emptyValues)
    onReset?.()
  }

  const activeFilterCount = Object.values(values).filter(
    (v) => v !== '' && v !== null && v !== undefined
  ).length

  if (isCollapsed) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(false)}
        >
          <Filter className="mr-2 h-4 w-4" />
          筛选
          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          筛选条件
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium">{field.label}</label>
              {field.type === 'text' && (
                <Input
                  value={(values[field.key] as string) || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
              {field.type === 'number' && (
                <Input
                  type="number"
                  value={(values[field.key] as string) || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
              {field.type === 'select' && field.options && (
                <select
                  value={(values[field.key] as string) || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{field.placeholder || '请选择'}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'date' && (
                <Input
                  type="date"
                  value={(values[field.key] as string) || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                />
              )}
              {field.type === 'dateRange' && (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={(values[`${field.key}_start`] as string) || ''}
                    onChange={(e) =>
                      handleFieldChange(`${field.key}_start`, e.target.value)
                    }
                    placeholder="开始日期"
                  />
                  <Input
                    type="date"
                    value={(values[`${field.key}_end`] as string) || ''}
                    onChange={(e) =>
                      handleFieldChange(`${field.key}_end`, e.target.value)
                    }
                    placeholder="结束日期"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={onApply} size="sm">
            应用筛选
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            重置
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
