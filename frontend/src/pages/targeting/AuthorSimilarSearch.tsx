import { useState } from 'react'
import { getAwemeAuthorInfo, AwemeAuthor } from '@/api/tools'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Badge } from '@/components/ui'
import { User, Users } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function AuthorSimilarSearch() {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [authors, setAuthors] = useState<AwemeAuthor[]>([])
  const [selected, setSelected] = useState<string[]>([])

  const fetchAuthors = async () => {
    setLoading(true)
    try {
      const data = await getAwemeAuthorInfo({ label_ids: [1], behaviors: ['FOLLOWED_USER'] })
      setAuthors(data)
    } catch (error) {
      showError('获取达人信息失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading size="lg" text="搜索中..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="👥 达人相似搜索"
        description="基于达人粉丝画像寻找相似目标用户"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '定向工具', href: '/tools/targeting' },
          { label: '达人相似搜索' }
        ]}
        actions={<Button onClick={() => success(`已选择 ${selected.length} 个达人`)}>应用选择</Button>}
      />

      <Card>
        <CardHeader><CardTitle>搜索达人</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={fetchAuthors} className="mb-4">
            <Users className="h-4 w-4 mr-2" /> 加载推荐达人
          </Button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {authors.map(author => (
              <div
                key={author.id}
                className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition"
                onClick={() => {
                  if (selected.includes(author.id)) {
                    setSelected(selected.filter(id => id !== author.id))
                  } else {
                    setSelected([...selected, author.id])
                  }
                }}
              >
                <User className="h-8 w-8 text-gray-400 mb-2" />
                <p className="font-medium truncate">{author.name}</p>
                {author.follower_count && (
                  <p className="text-sm text-gray-500">粉丝: {author.follower_count.toLocaleString()}</p>
                )}
                {selected.includes(author.id) && (
                  <Badge variant="success" className="mt-2">已选择</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>功能说明</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 选择目标达人后，系统会分析其粉丝画像</p>
          <p>• 自动找到相似兴趣和行为特征的用户群体</p>
          <p>• 适合品牌寻找潜在目标客户</p>
        </CardContent>
      </Card>
    </div>
  )
}
