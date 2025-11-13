import { useNavigate } from 'react-router-dom'
import { 
  PageHeader, Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui'
import { 
  Wand2, Target, Palette, BarChart3, 
  Users, FileText, DollarSign, Settings,
  TrendingUp, Search, Image, Video
} from 'lucide-react'

interface ToolCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  link: string
  bgColor: string
  iconColor: string
}

export default function ToolsCenter() {
  const navigate = useNavigate()

  const tools: ToolCard[] = [
    // 批量操作工具
    {
      id: 'batch-advertiser',
      title: '批量管理广告主',
      description: '批量启用/禁用、导出广告主数据',
      icon: Users,
      category: '批量操作',
      link: '/advertisers',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'batch-campaign',
      title: '批量管理计划',
      description: '批量创建、修改、启停广告计划',
      icon: FileText,
      category: '批量操作',
      link: '/campaigns',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'batch-budget',
      title: '批量预算调整',
      description: '批量修改广告计划预算和出价',
      icon: DollarSign,
      category: '批量操作',
      link: '/account/budget',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },

    // 定向工具
    {
      id: 'audience-recommend',
      title: '受众推荐',
      description: '基于AI算法的智能受众推荐',
      icon: Target,
      category: '定向工具',
      link: '/audiences',
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'audience-package',
      title: '受众包管理',
      description: '创建、管理和优化受众包',
      icon: Users,
      category: '定向工具',
      link: '/targeting/audience-packages',
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'region-tool',
      title: '地域定向工具',
      description: '按地域进行精准定向投放',
      icon: Search,
      category: '定向工具',
      link: '/targeting/region',
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400'
    },

    // 创意工具
    {
      id: 'creative-generator',
      title: '创意生成器',
      description: 'AI驱动的创意文案和标题生成',
      icon: Wand2,
      category: '创意工具',
      link: '/creatives/generator',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'material-library',
      title: '素材库管理',
      description: '统一管理图片、视频等素材',
      icon: Image,
      category: '创意工具',
      link: '/materials',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'video-editor',
      title: '视频编辑工具',
      description: '在线视频剪辑和效果处理',
      icon: Video,
      category: '创意工具',
      link: '/creatives/video-editor',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },

    // 数据分析工具
    {
      id: 'report-analysis',
      title: '数据报表',
      description: '多维度数据报表分析',
      icon: BarChart3,
      category: '数据分析',
      link: '/reports',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'material-efficiency',
      title: '素材效率分析',
      description: '分析素材投放效果和ROI',
      icon: TrendingUp,
      category: '数据分析',
      link: '/material-efficiency',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'optimization',
      title: '优化建议',
      description: '基于数据的智能优化建议',
      icon: Settings,
      category: '数据分析',
      link: '/optimization',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
  ]

  const categories = ['批量操作', '定向工具', '创意工具', '数据分析']

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '批量操作':
        return Wand2
      case '定向工具':
        return Target
      case '创意工具':
        return Palette
      case '数据分析':
        return BarChart3
      default:
        return Settings
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="工具中心"
        description="集成化的营销工具，助力广告投放效率提升"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '工具中心' }
        ]}
      />

      {/* 工具分类 */}
      {categories.map((category) => {
        const categoryTools = tools.filter(t => t.category === category)
        const CategoryIcon = getCategoryIcon(category)

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <CategoryIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{category}</h2>
              <span className="text-sm text-muted-foreground">
                ({categoryTools.length} 个工具)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryTools.map((tool) => {
                const ToolIcon = tool.icon

                return (
                  <Card
                    key={tool.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                    onClick={() => navigate(tool.link)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                          <ToolIcon className={`h-6 w-6 ${tool.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{tool.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* 快速访问统计 */}
      <Card>
        <CardHeader>
          <CardTitle>使用统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{tools.length}</p>
              <p className="text-sm text-muted-foreground">可用工具</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground">工具分类</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">全天候服务</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">免费使用</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
