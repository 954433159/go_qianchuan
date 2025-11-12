import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import InterestSelector from '@/components/targeting/InterestSelector'

interface InterestLibraryProps {
  advertiserId?: number
}

export default function InterestLibrary({ advertiserId = 1 }: InterestLibraryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>兴趣标签库</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          浏览和搜索兴趣标签，了解每个标签的覆盖人群规模
        </p>
      </CardHeader>
      <CardContent>
        <InterestSelector
          advertiserId={advertiserId}
          value={[]}
          onChange={(value) => {
            console.log('Selected interests:', value)
          }}
        />
      </CardContent>
    </Card>
  )
}
