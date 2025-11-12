import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

interface AgeGroup {
  range: string
  percentage: number
}

interface DemographicsBreakdownProps {
  ageGroups?: AgeGroup[]
}

const defaultAgeGroups: AgeGroup[] = [
  { range: '18-24岁', percentage: 28 },
  { range: '25-34岁', percentage: 42 },
  { range: '35-44岁', percentage: 22 },
  { range: '45岁以上', percentage: 8 },
]

export default function DemographicsBreakdown({ 
  ageGroups = defaultAgeGroups 
}: DemographicsBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>人群特征分布</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ageGroups.map((group) => (
          <div key={group.range}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{group.range}</span>
              <span className="font-medium">{group.percentage}%</span>
            </div>
            <Progress value={group.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
