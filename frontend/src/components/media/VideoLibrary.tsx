import { useState, useEffect } from 'react'
import { Upload, Video as VideoIcon, Trash2, Download, Play, Search, Filter, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { toast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { uploadVideo } from '@/api/file'
import { cn } from '@/lib/utils'

export interface VideoFile {
  id: string
  name: string
  url: string
  cover_url: string
  size: number
  width: number
  height: number
  duration: number
  upload_time: number
  status: 'active' | 'processing' | 'failed' | 'deleted'
}

interface VideoLibraryProps {
  advertiserId: number
  selectable?: boolean
  multiple?: boolean
  value?: string[]
  onChange?: (selectedIds: string[]) => void
}

export default function VideoLibrary({
  advertiserId,
  selectable = false,
  multiple = false,
  value = [],
  onChange,
}: VideoLibraryProps) {
  const { confirm, ConfirmDialog } = useConfirm()
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(value)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'processing' | 'failed'>('all')

  useEffect(() => {
    loadVideos()
  }, [advertiserId])

  useEffect(() => {
    setSelectedIds(value)
  }, [value])

  const loadVideos = async () => {
    setLoading(true)
    try {
      // TODO: 调用API获取视频列表
      // const data = await videoApi.getList(advertiserId)
      
      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setVideos([
        {
          id: '1',
          name: '产品介绍视频.mp4',
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          cover_url: 'https://via.placeholder.com/400x600',
          size: 15678900,
          width: 1080,
          height: 1920,
          duration: 30,
          upload_time: Date.now() - 86400000 * 2,
          status: 'active',
        },
        {
          id: '2',
          name: '直播预告.mp4',
          url: 'https://www.w3schools.com/html/movie.mp4',
          cover_url: 'https://via.placeholder.com/800x400',
          size: 8234567,
          width: 1920,
          height: 1080,
          duration: 15,
          upload_time: Date.now() - 86400000 * 5,
          status: 'active',
        },
        {
          id: '3',
          name: '用户评价合集.mp4',
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          cover_url: 'https://via.placeholder.com/600x600',
          size: 12456789,
          width: 1080,
          height: 1080,
          duration: 45,
          upload_time: Date.now() - 86400000 * 7,
          status: 'active',
        },
      ])
    } catch (error) {
      console.error('Failed to load videos:', error)
      toast.error('加载视频列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('请选择视频文件')
      return
    }

    // 检查文件大小（最大500MB）
    if (file.size > 500 * 1024 * 1024) {
      toast.error('视频大小不能超过500MB')
      return
    }

    setUploading(true)
    try {
      const result = await uploadVideo({
        advertiser_id: advertiserId,
        file,
        video_signature: `video_${Date.now()}`,
      })

      const newVideo: VideoFile = {
        id: result.id,
        name: file.name,
        url: result.url,
        cover_url: result.cover_url || '',
        size: result.size,
        width: result.width || 0,
        height: result.height || 0,
        duration: result.duration || 0,
        upload_time: Date.now(),
        status: 'processing',
      }

      setVideos((prev) => [newVideo, ...prev])
      toast.success('视频上传成功，正在处理中...')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('视频上传失败')
    } finally {
      setUploading(false)
      // 重置input
      e.target.value = ''
    }
  }

  const handleSelect = (videoId: string) => {
    if (!selectable) return

    let newSelectedIds: string[]

    if (multiple) {
      if (selectedIds.includes(videoId)) {
        newSelectedIds = selectedIds.filter((id) => id !== videoId)
      } else {
        newSelectedIds = [...selectedIds, videoId]
      }
    } else {
      newSelectedIds = [videoId]
    }

    setSelectedIds(newSelectedIds)
    onChange?.(newSelectedIds)
  }

  const handleDelete = async (videoId: string) => {
    const confirmed = await confirm({
      title: '删除视频',
      description: '确定要删除这个视频吗？删除后将无法恢复。',
      confirmText: '删除',
      variant: 'destructive',
    })
    
    if (!confirmed) return

    try {
      // TODO: 调用API删除视频
      // await videoApi.delete(advertiserId, videoId)

      setVideos((prev) => prev.filter((vid) => vid.id !== videoId))
      toast.success('视频已删除')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('删除失败')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes  } B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)  } KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)  } MB`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }

  const getStatusBadge = (status: VideoFile['status']) => {
    const statusConfig = {
      active: { label: '正常', variant: 'success' as const },
      processing: { label: '处理中', variant: 'warning' as const },
      failed: { label: '失败', variant: 'error' as const },
      deleted: { label: '已删除', variant: 'default' as const },
    }
    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredVideos = videos.filter((vid) => {
    const matchesSearch = vid.name.toLowerCase().includes(searchKeyword.toLowerCase())
    const matchesFilter = filterStatus === 'all' || vid.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-4">
        {/* 工具栏 */}
        <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 上传按钮 */}
            <div>
              <input
                type="file"
                accept="video/*"
                onChange={handleUpload}
                className="hidden"
                id="video-upload"
                disabled={uploading}
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <span className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                  'h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90',
                  uploading && 'opacity-50 pointer-events-none'
                )}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      上传视频
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* 搜索 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索视频名称..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 筛选 */}
            <div className="w-full md:w-48">
              <Select value={filterStatus} onValueChange={(v: string) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>共 {filteredVideos.length} 个视频</span>
            {selectable && (
              <span>
                已选择 <span className="font-semibold text-orange-600">{selectedIds.length}</span> 个
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 视频网格 */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          icon={<VideoIcon className="h-16 w-16" />}
          title="暂无视频"
          description={searchKeyword ? '没有找到匹配的视频' : '点击上传按钮添加视频'}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video) => {
            const isSelected = selectedIds.includes(video.id)

            return (
              <Card
                key={video.id}
                className={cn(
                  'overflow-hidden transition-all hover:shadow-lg',
                  selectable && 'cursor-pointer',
                  isSelected && 'ring-2 ring-orange-500'
                )}
                onClick={() => selectable && handleSelect(video.id)}
              >
                <CardContent className="p-0">
                  {/* 视频封面 */}
                  <div className="relative aspect-video bg-gray-100">
                    <img src={video.cover_url} alt={video.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    {/* 时长标签 */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(video.duration)}
                    </div>
                    {/* 选中标记 */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* 视频信息 */}
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate mb-2">{video.name}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {video.width} × {video.height}
                      </span>
                      <span>{formatFileSize(video.size)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{formatDate(video.upload_time)}</span>
                      {getStatusBadge(video.status)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(video.url, '_blank')
                        }}
                        disabled={video.status !== 'active'}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(video.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      </div>
    </>
  )
}

