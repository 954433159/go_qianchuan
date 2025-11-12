import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import { Users, Target, Lightbulb, ChevronRight } from 'lucide-react'

const tools = [
  {
    name: '人群包管理',
    path: '/audiences',
    icon: Users,
    description: '查看和管理已保存的人群包',
  },
  {
    name: '创建广告',
    path: '/ads',
    icon: Target,
    description: '使用当前定向创建新广告',
  },
]

const tips = [
  '目标人群规模合适',
  '建议增加行为定向',
  '竞争度适中',
  '可尝试测试新兴趣组合',
]

export default function RelatedToolsPanel() {
  return (
    <div className="space-y-6">
      {/* Quick Tips */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <CardTitle className="text-base">优化建议</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Related Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">相关工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary hover:bg-accent transition-colors group"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <tool.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{tool.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {tool.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
