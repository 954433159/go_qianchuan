import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export default function HeatmapPlaceholder() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-full mb-4">
            <MapPin className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">地域热力图</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            地图可视化功能正在开发中，将展示不同地区的受众分布密度和投放热度
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            即将接入地图 SDK（AMap/Mapbox）
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
