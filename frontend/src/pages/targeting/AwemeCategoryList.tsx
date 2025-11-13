import { useState } from 'react'
import { getAwemeCategory, AwemeCategory } from '@/api/tools'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Badge } from '@/components/ui'
import { Video } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function AwemeCategoryList() {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<AwemeCategory[]>([])
  const [selected, setSelected] = useState<number[]>([])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await getAwemeCategory()
      setCategories(data)
    } catch (error) {
      showError('获取抖音类目失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading size="lg" text="加载中..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="📱 抖音类目定向"
        description="根据抖音内容类目进行定向投放"
        actions={<Button onClick={() => success(`已选择 ${selected.length} 个类目`)}>应用</Button>}
      />
      <Card>
        <CardHeader><CardTitle>类目列表</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={fetchCategories} className="mb-4">加载类目</Button>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Badge key={cat.id} variant="outline" className="cursor-pointer">
                <Video className="h-3 w-3 mr-1" /> {cat.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
