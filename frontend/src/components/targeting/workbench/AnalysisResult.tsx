import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, Users, DollarSign } from 'lucide-react'

interface AnalysisData {
  audienceSize: number
  activityRate: number
  competitionIndex: number
  suggestedCPC: number
}

interface AnalysisResultProps {
  data?: AnalysisData
}

const defaultData: AnalysisData = {
  audienceSize: 2500000,
  activityRate: 35,
  competitionIndex: 4.2,
  suggestedCPC: 5.8,
}

export default function AnalysisResult({ data = defaultData }: AnalysisResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>分析结果</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audience Size Highlight */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">预估受众规模</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {(data.audienceSize / 1000000).toFixed(1)}M+
            </p>
            <p className="text-sm text-muted-foreground">覆盖用户数</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <div className="flex justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{data.activityRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">活跃度</p>
          </div>

          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <div className="flex justify-center mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{data.competitionIndex}</p>
            <p className="text-sm text-muted-foreground mt-1">竞争指数</p>
          </div>

          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <div className="flex justify-center mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">¥{data.suggestedCPC}</p>
            <p className="text-sm text-muted-foreground mt-1">建议CPC</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
