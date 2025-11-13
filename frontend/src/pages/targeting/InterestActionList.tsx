import { useState } from 'react'
import { getInterestCategory, getInterestKeyword, getActionCategory, getActionKeyword, Interest, Action } from '@/api/tools'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Heart, Activity, Search } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function InterestActionList() {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [interests, setInterests] = useState<Interest[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedActions, setSelectedActions] = useState<string[]>([])

  const fetchInterestCategory = async () => {
    setLoading(true)
    try {
      const data = await getInterestCategory()
      setInterests(data)
    } catch (error) {
      showError('获取兴趣类目失败')
      setInterests([])
    } finally {
      setLoading(false)
    }
  }

  const searchInterest = async () => {
    if (!searchQuery) return
    setLoading(true)
    try {
      const data = await getInterestKeyword({ query_words: searchQuery })
      setInterests(data)
    } catch (error) {
      showError('搜索兴趣失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchActionCategory = async () => {
    setLoading(true)
    try {
      const data = await getActionCategory({ action_scene: ['E-COMMERCE'], action_days: 30 })
      setActions(data)
    } catch (error) {
      showError('获取行为类目失败')
      setActions([])
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    const total = selectedInterests.length + selectedActions.length
    success(`已选择 ${total} 个定向标签`)
  }

  if (loading) return <Loading size="lg" text="加载中..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="🎯 兴趣行为定向"
        description="基于用户兴趣和行为进行精准定向"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '定向工具', href: '/tools/targeting' },
          { label: '兴趣行为定向' }
        ]}
        actions={
          <Button onClick={handleApply}>
            应用选择 ({selectedInterests.length + selectedActions.length})
          </Button>
        }
      />

      <Tabs defaultValue="interest">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interest" onClick={fetchInterestCategory}>
            <Heart className="mr-2 h-4 w-4" /> 兴趣定向
          </TabsTrigger>
          <TabsTrigger value="action" onClick={fetchActionCategory}>
            <Activity className="mr-2 h-4 w-4" /> 行为定向
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interest">
          <Card>
            <CardHeader>
              <CardTitle>兴趣类目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="搜索兴趣关键词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={searchInterest}>
                  <Search className="h-4 w-4 mr-2" /> 搜索
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                  <Badge
                    key={interest.id}
                    variant={selectedInterests.includes(interest.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedInterests.includes(interest.id)) {
                        setSelectedInterests(selectedInterests.filter(id => id !== interest.id))
                      } else {
                        setSelectedInterests([...selectedInterests, interest.id])
                      }
                    }}
                  >
                    {interest.name} {interest.num ? `(${interest.num})` : ''}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action">
          <Card>
            <CardHeader>
              <CardTitle>行为类目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {actions.map(action => (
                  <Badge
                    key={action.id}
                    variant={selectedActions.includes(action.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedActions.includes(action.id)) {
                        setSelectedActions(selectedActions.filter(id => id !== action.id))
                      } else {
                        setSelectedActions([...selectedActions, action.id])
                      }
                    }}
                  >
                    {action.name} {action.num ? `(${action.num})` : ''}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
