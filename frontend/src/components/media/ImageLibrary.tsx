import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, Trash2, Download, Eye, Search, Filter, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { toast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { uploadImage } from '@/api/file'
import { cn } from '@/lib/utils'

export interface ImageFile {
  id: string
  name: string
  url: string
  size: number
  width: number
  height: number
  upload_time: number
  status: 'active' | 'deleted'
}

interface ImageLibraryProps {
  advertiserId: number
  selectable?: boolean
  multiple?: boolean
  value?: string[]
  onChange?: (selectedIds: string[]) => void
}

export default function ImageLibrary({
  advertiserId,
  selectable = false,
  multiple = false,
  value = [],
  onChange,
}: ImageLibraryProps) {
  const { confirm, ConfirmDialog } = useConfirm()
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(value)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'deleted'>('all')

  useEffect(() => {
    loadImages()
  }, [advertiserId])

  useEffect(() => {
    setSelectedIds(value)
  }, [value])

  const loadImages = async () => {
    setLoading(true)
    try {
      // TODO: 调用API获取图片列表
      // const data = await imageApi.getList(advertiserId)
      
      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setImages([
        {
          id: '1',
          name: '春季新品海报.jpg',
          url: 'https://via.placeholder.com/400x600',
          size: 245678,
          width: 1080,
          height: 1920,
          upload_time: Date.now() - 86400000 * 2,
          status: 'active',
        },
        {
          id: '2',
          name: '夏季促销banner.png',
          url: 'https://via.placeholder.com/800x400',
          size: 512345,
          width: 1920,
          height: 1080,
          upload_time: Date.now() - 86400000 * 5,
          status: 'active',
        },
        {
          id: '3',
          name: '产品详情图.jpg',
          url: 'https://via.placeholder.com/600x600',
          size: 189234,
          width: 1080,
          height: 1080,
          upload_time: Date.now() - 86400000 * 7,
          status: 'active',
        },
      ])
    } catch (error) {
      console.error('Failed to load images:', error)
      toast.error('加载图片列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 检查文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过10MB')
      return
    }

    setUploading(true)
    try {
      const result = await uploadImage({
        advertiser_id: advertiserId,
        file,
        upload_type: 'UPLOAD_BY_FILE',
      })

      const newImage: ImageFile = {
        id: result.id,
        name: file.name,
        url: result.url,
        size: result.size,
        width: result.width || 0,
        height: result.height || 0,
        upload_time: Date.now(),
        status: 'active',
      }

      setImages((prev) => [newImage, ...prev])
      toast.success('图片上传成功')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('图片上传失败')
    } finally {
      setUploading(false)
      // 重置input
      e.target.value = ''
    }
  }

  const handleSelect = (imageId: string) => {
    if (!selectable) return

    let newSelectedIds: string[]

    if (multiple) {
      if (selectedIds.includes(imageId)) {
        newSelectedIds = selectedIds.filter((id) => id !== imageId)
      } else {
        newSelectedIds = [...selectedIds, imageId]
      }
    } else {
      newSelectedIds = [imageId]
    }

    setSelectedIds(newSelectedIds)
    onChange?.(newSelectedIds)
  }

  const handleDelete = async (imageId: string) => {
    const confirmed = await confirm({
      title: '删除图片',
      description: '确定要删除这张图片吗？删除后将无法恢复。',
      confirmText: '删除',
      variant: 'destructive',
    })
    
    if (!confirmed) return

    try {
      // TODO: 调用API删除图片
      // await imageApi.delete(advertiserId, imageId)

      setImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('图片已删除')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('删除失败')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.name.toLowerCase().includes(searchKeyword.toLowerCase())
    const matchesFilter = filterStatus === 'all' || img.status === filterStatus
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
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
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
                      上传图片
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
                  placeholder="搜索图片名称..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 筛选 */}
            <div className="w-full md:w-48">
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="deleted">已删除</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>共 {filteredImages.length} 张图片</span>
            {selectable && (
              <span>
                已选择 <span className="font-semibold text-orange-600">{selectedIds.length}</span> 张
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 图片网格 */}
      {filteredImages.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-16 w-16" />}
          title="暂无图片"
          description={searchKeyword ? '没有找到匹配的图片' : '点击上传按钮添加图片'}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => {
            const isSelected = selectedIds.includes(image.id)

            return (
              <Card
                key={image.id}
                className={cn(
                  'overflow-hidden transition-all hover:shadow-lg',
                  selectable && 'cursor-pointer',
                  isSelected && 'ring-2 ring-orange-500'
                )}
                onClick={() => selectable && handleSelect(image.id)}
              >
                <CardContent className="p-0">
                  {/* 图片预览 */}
                  <div className="relative aspect-square bg-gray-100">
                    <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* 图片信息 */}
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate mb-2">{image.name}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {image.width} × {image.height}
                      </span>
                      <span>{formatFileSize(image.size)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatDate(image.upload_time)}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(image.url, '_blank')
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(image.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
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

