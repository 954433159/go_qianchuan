import { useState, useEffect } from 'react'
import { Video, Play, Eye, Heart, MessageCircle, Share2, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface AwemeVideo {
  item_id: string
  title: string
  cover_url: string
  duration: number
  create_time: number
  statistics: {
    play_count: number
    digg_count: number
    comment_count: number
    share_count: number
  }
}

interface AwemeVideoSelectorProps {
  advertiserId: number
  awemeId?: string
  value?: string[]
  onChange?: (selectedIds: string[]) => void
  multiple?: boolean
  maxSelection?: number
}

export default function AwemeVideoSelector({
  advertiserId,
  awemeId,
  value = [],
  onChange,
  multiple = true,
  maxSelection = 10,
}: AwemeVideoSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState<AwemeVideo[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(value)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    if (awemeId) {
      loadVideos()
    }
  }, [awemeId, advertiserId])

  useEffect(() => {
    setSelectedIds(value)
  }, [value])

  const loadVideos = async () => {
    setLoading(true)
    try {
      // TODO: 调用API获取抖音号视频列表
      // const data = await awemeApi.getVideos(advertiserId, awemeId)
      
      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setVideos([
        {
          item_id: '7123456789012345678',
          title: '春季新品发布 | 限时优惠中',
          cover_url: 'https://via.placeholder.com/300x400',
          duration: 45,
          create_time: Date.now() - 86400000 * 2,
          statistics: {
            play_count: 125000,
            digg_count: 8500,
            comment_count: 320,
            share_count: 450,
          },
        },
        {
          item_id: '7123456789012345679',
          title: '夏季大促来袭 | 全场5折起',
          cover_url: 'https://via.placeholder.com/300x400',
          duration: 60,
          create_time: Date.now() - 86400000 * 5,
          statistics: {
            play_count: 98000,
            digg_count: 6200,
            comment_count: 280,
            share_count: 380,
          },
        },
        {
          item_id: '7123456789012345680',
          title: '好物推荐 | 这款产品太好用了',
          cover_url: 'https://via.placeholder.com/300x400',
          duration: 30,
          create_time: Date.now() - 86400000 * 7,
          statistics: {
            play_count: 156000,
            digg_count: 12000,
            comment_count: 520,
            share_count: 680,
          },
        },
      ])
    } catch (error) {
      console.error('Failed to load aweme videos:', error)
      toast.error('加载视频列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (itemId: string) => {
    let newSelectedIds: string[]

    if (multiple) {
      if (selectedIds.includes(itemId)) {
        newSelectedIds = selectedIds.filter((id) => id !== itemId)
      } else {
        if (selectedIds.length >= maxSelection) {
          toast.warning(`最多只能选择 ${maxSelection} 个视频`)
          return
        }
        newSelectedIds = [...selectedIds, itemId]
      }
    } else {
      newSelectedIds = [itemId]
    }

    setSelectedIds(newSelectedIds)
    onChange?.(newSelectedIds)
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`
    }
    return num.toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-4">
      {/* 搜索和统计 */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="搜索视频标题..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="max-w-xs"
        />
        <div className="text-sm text-gray-600">
          已选择 <span className="font-semibold text-orange-600">{selectedIds.length}</span> /{' '}
          {maxSelection} 个视频
        </div>
      </div>

      {/* 视频列表 */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          icon={<Video className="h-16 w-16" />}
          title="暂无视频"
          description={searchKeyword ? '没有找到匹配的视频' : '该抖音号暂无视频'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => {
            const isSelected = selectedIds.includes(video.item_id)

            return (
              <Card
                key={video.item_id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg',
                  isSelected && 'ring-2 ring-orange-500 bg-orange-50'
                )}
                onClick={() => handleSelect(video.item_id)}
              >
                <CardContent className="p-0">
                  {/* 视频封面 */}
                  <div className="relative aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={video.cover_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    {/* 时长 */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {formatDuration(video.duration)}
                    </div>
                    {/* 选中标记 */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* 视频信息 */}
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Badge variant="default" className="text-xs">
                        {formatDate(video.create_time)}
                      </Badge>
                    </div>
                    {/* 数据统计 */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(video.statistics.play_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(video.statistics.digg_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatNumber(video.statistics.comment_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {formatNumber(video.statistics.share_count)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 底部提示 */}
      {videos.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          💡 <strong>提示：</strong>选择高播放量、高互动的视频作为素材，可以提升广告效果
        </div>
      )}
    </div>
  )
}

