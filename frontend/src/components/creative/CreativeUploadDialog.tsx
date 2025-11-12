import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Upload, Image as ImageIcon, Video } from 'lucide-react'
import { uploadImage, uploadVideo } from '@/api/file'
import { createCreative } from '@/api/creative'
import { toast } from '@/components/ui/Toast'

interface CreativeUploadDialogProps {
  open: boolean
  onClose: () => void
  advertiserId: number
  onSuccess?: () => void
}

export default function CreativeUploadDialog({
  open,
  onClose,
  advertiserId,
  onSuccess,
}: CreativeUploadDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
    
    setSelectedFile(file)
    setUploadType(isVideo ? 'video' : 'image')
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
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
          upload_type: 'UPLOAD_TYPE_IMAGE',
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
        ad_id: 1, // Placeholder ad_id, should be replaced with actual ad_id
        creative_material_mode: 'CUSTOM',
        title,
        image_ids: uploadType === 'image' ? [materialId] : undefined,
        video_id: uploadType === 'video' ? materialId : undefined,
      })

      toast.success('创意上传成功')
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('创意上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setTitle('')
      setSelectedFile(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传创意</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">创意标题</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入创意标题"
              disabled={uploading}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">素材文件</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              {selectedFile ? (
                <div className="space-y-2">
                  {uploadType === 'image' ? (
                    <ImageIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
                  ) : (
                    <Video className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto" />
                  )}
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploading}
                  >
                    重新选择
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    支持图片（JPG、PNG、GIF，≤5MB）<br />
                    或视频（MP4、MOV，≤100MB，5-60秒）
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
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            取消
          </Button>
          <Button
            onClick={handleUpload}
            loading={uploading}
            disabled={!selectedFile || !title.trim()}
          >
            {uploading ? '上传中...' : '确定上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
