import { useEffect, useState } from 'react'
import { getIndustry, Industry } from '@/api/tools'
import {
  Card, CardContent, CardHeader, CardTitle,
  PageHeader, Loading, Button, Badge,
  Table, TableColumn
} from '@/components/ui'
import { Building2, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function IndustryList() {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<number[]>([])
  const [level, setLevel] = useState<number>(1)

  useEffect(() => {
    fetchIndustries()
  }, [level])

  const fetchIndustries = async () => {
    setLoading(true)
    try {
      const data = await getIndustry({ level })
      setIndustries(data)
    } catch (error) {
      console.error('Failed to fetch industries:', error)
      showError('获取行业列表失败')
      setIndustries([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (industryId: number) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter(id => id !== industryId))
    } else {
      setSelectedIndustries([...selectedIndustries, industryId])
    }
  }

  const handleApply = () => {
    success(`已选择 ${selectedIndustries.length} 个行业`)
  }

  const columns: TableColumn<Industry>[] = [
    {
      key: 'select',
      title: '选择',
      width: '80px',
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedIndustries.includes(record.id)}
          onChange={() => handleSelect(record.id)}
          className="h-4 w-4 rounded border-gray-300"
        />
      )
    },
    {
      key: 'name',
      title: '行业名称',
      dataIndex: 'name',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value as string}</span>
          {record.level < 3 && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'level',
      title: '级别',
      dataIndex: 'level',
      width: '100px',
      render: (value) => {
        const levelMap: Record<number, { label: string; variant: 'default' | 'secondary' | 'success' }> = {
          1: { label: '一级', variant: 'default' },
          2: { label: '二级', variant: 'secondary' },
          3: { label: '三级', variant: 'success' }
        }
        const config = levelMap[value as number] || { label: `${value}级`, variant: 'default' as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '120px'
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载行业列表..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏭 行业定向"
        description="选择目标行业进行精准定向投放"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '定向工具', href: '/tools/targeting' },
          { label: '行业定向' }
        ]}
        actions={
          <Button onClick={handleApply} disabled={selectedIndustries.length === 0}>
            应用选择 ({selectedIndustries.length})
          </Button>
        }
      />

      {/* 级别筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium">行业级别:</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((l) => (
                <Button
                  key={l}
                  variant={level === l ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLevel(l)}
                >
                  {l}级行业
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 选中的行业 */}
      {selectedIndustries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>已选择的行业 ({selectedIndustries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {industries
                .filter(ind => selectedIndustries.includes(ind.id))
                .map(ind => (
                  <Badge
                    key={ind.id}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => handleSelect(ind.id)}
                  >
                    {ind.name} ✕
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 行业列表 */}
      <Card>
        <CardHeader>
          <CardTitle>行业列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns as any}
            dataSource={industries}
            rowKey={(record) => String(record.id)}
          />
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• 行业定向可以帮助您精准触达特定行业的用户</p>
            <p>• 一级行业涵盖范围最广，三级行业最精准</p>
            <p>• 建议选择与您的产品或服务相关的行业</p>
            <p>• 可以同时选择多个行业进行组合定向</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
