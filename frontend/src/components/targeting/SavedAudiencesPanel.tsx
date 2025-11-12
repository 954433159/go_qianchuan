import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Users, Plus, ChevronRight } from 'lucide-react'
import { getAudienceList, Audience } from '@/api/tools'
import Loading from '@/components/ui/Loading'
import { Link } from 'react-router-dom'

interface SavedAudiencesPanelProps {
  advertiserId?: number
  onSave?: () => void
}

export default function SavedAudiencesPanel({ 
  advertiserId = 1,
  onSave 
}: SavedAudiencesPanelProps) {
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAudiences = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAudienceList({
        advertiser_id: advertiserId,
        page: 1,
        page_size: 5,
      })
      setAudiences(data.list || [])
    } catch (error) {
      console.error('Failed to fetch audiences:', error)
    } finally {
      setLoading(false)
    }
  }, [advertiserId])

  useEffect(() => {
    fetchAudiences()
  }, [fetchAudiences])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">已保存受众</CardTitle>
          <Link to="/audiences">
            <Button variant="ghost" size="sm">
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {onSave && (
          <Button
            className="w-full"
            variant="outline"
            onClick={onSave}
          >
            <Plus className="w-4 h-4 mr-2" />
            保存当前配置
          </Button>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loading text="加载中..." />
          </div>
        ) : audiences.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            暂无已保存受众
          </div>
        ) : (
          <div className="space-y-2">
            {audiences.map((audience) => (
              <Link
                key={audience.id}
                to={`/audiences?id=${audience.id}`}
                className="block p-3 border rounded-lg hover:border-primary hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{audience.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(audience.cover_num / 10000).toFixed(1)}万人
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {audience.status === 'VALID' ? '有效' : '无效'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
