import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Button, Badge } from '@/components/ui'
import { Tag, Search } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

// 模拟品牌数据
const mockBrands = [
  { id: '1', name: '华为', category: '手机数码', level: 1 },
  { id: '2', name: '小米', category: '手机数码', level: 1 },
  { id: '3', name: 'OPPO', category: '手机数码', level: 1 },
  { id: '4', name: 'vivo', category: '手机数码', level: 1 },
  { id: '5', name: '苹果', category: '手机数码', level: 1 },
  { id: '6', name: '耐克', category: '运动服饰', level: 1 },
  { id: '7', name: '阿迪达斯', category: '运动服饰', level: 1 },
  { id: '8', name: '特斯拉', category: '汽车', level: 1 },
]

export default function BrandList() {
  const { success } = useToast()
  const [selected, setSelected] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBrands = mockBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏷️ 品牌定向列表"
        description="根据用户关注的品牌进行定向投放"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '定向工具', href: '/tools/targeting' },
          { label: '品牌定向' }
        ]}
        actions={<Button onClick={() => success(`已选择 ${selected.length} 个品牌`)}>应用选择</Button>}
      />

      <Card>
        <CardHeader><CardTitle>品牌搜索</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="搜索品牌名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button onClick={() => {/* 搜索功能已通过 onChange 实时过滤实现 */}}>
              <Search className="h-4 w-4 mr-2" /> 搜索
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredBrands.map(brand => (
              <div
                key={brand.id}
                className={`border rounded-lg p-3 cursor-pointer transition ${
                  selected.includes(brand.id) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => {
                  if (selected.includes(brand.id)) {
                    setSelected(selected.filter(id => id !== brand.id))
                  } else {
                    setSelected([...selected, brand.id])
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{brand.name}</span>
                </div>
                <p className="text-xs text-gray-500">{brand.category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selected.length > 0 && (
        <Card>
          <CardHeader><CardTitle>已选择的品牌 ({selected.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockBrands
                .filter(b => selected.includes(b.id))
                .map(b => (
                  <Badge key={b.id} variant="default" className="cursor-pointer" onClick={() => setSelected(selected.filter(id => id !== b.id))}>
                    {b.name} ✕
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>使用说明</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 品牌定向基于用户的品牌关注和购买偏好</p>
          <p>• 适合针对特定品牌用户进行营销</p>
          <p>• 可以选择多个品牌进行组合定向</p>
        </CardContent>
      </Card>
    </div>
  )
}
