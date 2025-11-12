import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import ActionSelector from '@/components/targeting/ActionSelector'

interface BehaviorTraitsProps {
  advertiserId?: number
}

export default function BehaviorTraits({ advertiserId = 1 }: BehaviorTraitsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>行为特征</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          根据用户的购物行为、内容互动、直播观看等行为特征进行定向
        </p>
      </CardHeader>
      <CardContent>
        <ActionSelector
          advertiserId={advertiserId}
          value={[]}
          onChange={(value) => {
            console.log('Selected actions:', value)
          }}
        />
      </CardContent>
    </Card>
  )
}
