import { useState } from 'react'
import { Image as ImageIcon, Video } from 'lucide-react'
import { PageHeader, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import ImageLibrary from '@/components/media/ImageLibrary'
import VideoLibrary from '@/components/media/VideoLibrary'
import { useAuthStore } from '@/store/authStore'

export default function Media() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('images')
  const advertiserId = user?.advertiserId || 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="媒体管理"
        description="上传和管理广告素材（图片、视频）"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            图片库
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            视频库
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-6">
          <ImageLibrary advertiserId={advertiserId} />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <VideoLibrary advertiserId={advertiserId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
