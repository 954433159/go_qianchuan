import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Upload, Image as ImageIcon, Video } from 'lucide-react'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import Input from '@/components/ui/Input'
import { uploadImage, uploadVideo } from '@/api/file'
import { createCreative } from '@/api/creative'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'

export default function CreativeUpload() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const advertiserId = user?.advertiserId || 1
  const adIdFromUrl = searchParams.get('ad_id')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      toast.error('请选择图片或视频文件')
      return
    }
    
    // Check file size
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024 // 100MB for video, 5MB for image
    if (file.size > maxSize) {
      toast.error(`文件大小超出限制（${isVideo ? '100MB' : '5MB'}）`)
      return
    }
    
    // Set file and type
    setSelectedFile(file)
    setUploadType(isVideo ? 'video' : 'image')
    
    // Auto-fill title from filename
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
    
    // Generate preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error('请填写标题并选择文件')
      return
    }

    setUploading(true)
    try {
      // Upload file first
      let materialId: string
      if (uploadType === 'image') {
        const result = await uploadImage({
          advertiser_id: advertiserId,
          file: selectedFile,
          upload_type: 'UPLOAD_BY_FILE',
        })
        materialId = result.id
      } else {
        const result = await uploadVideo({
          advertiser_id: advertiserId,
          file: selectedFile,
          video_signature: `video_${Date.now()}`,
        })
        materialId = result.id
      }

      // Create creative
      await createCreative({
        advertiser_id: advertiserId,
        ad_id: adIdFromUrl ? Number(adIdFromUrl) : 1, // Use ad_id from URL or placeholder
        creative_material_mode: 'CUSTOM',
        title,
        image_ids: uploadType === 'image' ? [materialId] : undefined,
        video_id: uploadType === 'video' ? materialId : undefined,
      })

      toast.success('创意上传成功')
      
      // Navigate back
      if (adIdFromUrl) {
        navigate(`/ads/${adIdFromUrl}`)
      } else {
        navigate('/creatives')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('创意上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="上传创意"
        description="上传图片或视频素材创建新的创意"
        breadcrumbs={[
          { label: '工作台', href: '/' },
          { label: '创意', href: '/creatives' },
          { label: '上传创意' }
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/creatives')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>创意信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                创意标题 <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入创意标题"
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                建议使用描述性标题，方便后续管理
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                素材文件 <span className="text-red-500">*</span>
              </label>
              
              {selectedFile ? (
                <div className="border-2 border-border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      {uploadType === 'image' && previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="预览"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : uploadType === 'video' && previewUrl ? (
                        <video
                          src={previewUrl}
                          className="w-32 h-32 object-cover rounded-lg"
                          controls
                        />
                      ) : (
                        <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                          {uploadType === 'image' ? (
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          ) : (
                            <Video className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {uploadType === 'image' ? (
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Video className="w-5 h-5 text-purple-600" />
                        )}
                        <span className="font-medium">{uploadType === 'image' ? '图片' : '视频'}</span>
                      </div>
                      <p className="text-sm font-medium mb-1 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        大小: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={uploading}
                        className="mt-3"
                      >
                        重新选择
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium mb-2">
                    拖拽文件到此处，或点击选择文件
                  </p>
                  <p className="text-xs text-muted-foreground mb-6">
                    <span className="block mb-1">
                      <strong>图片：</strong>JPG、PNG、GIF，≤5MB
                    </span>
                    <span className="block">
                      <strong>视频：</strong>MP4、MOV，≤100MB，5-60秒
                    </span>
                  </p>
                  <label htmlFor="creative-upload" className="inline-block cursor-pointer">
                    <Button asChild disabled={uploading}>
                      <span>选择文件</span>
                    </Button>
                  </label>
                  <input
                    id="creative-upload"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              )}
            </div>

            {/* Upload Tips */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">上传规范</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 图片分辨率建议：1920x1080px 或更高</li>
                <li>• 视频分辨率建议：1080P 或更高</li>
                <li>• 视频时长：5-60秒</li>
                <li>• 确保素材内容符合平台规范，避免审核不通过</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/creatives')}
                disabled={uploading}
              >
                取消
              </Button>
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={!selectedFile || !title.trim()}
              >
                {uploading ? '上传中...' : '确定上传'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
