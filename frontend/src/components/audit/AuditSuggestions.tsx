import { AlertCircle, CheckCircle, XCircle, Info, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export interface AuditSuggestion {
  type: 'error' | 'warning' | 'success' | 'info'
  title: string
  description: string
  suggestions?: string[]
}

interface AuditSuggestionsProps {
  suggestions: AuditSuggestion[]
  title?: string
  className?: string
}

const getIcon = (type: AuditSuggestion['type']) => {
  switch (type) {
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-600" />
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />
  }
}

const getBadgeVariant = (type: AuditSuggestion['type']) => {
  switch (type) {
    case 'error':
      return 'destructive'
    case 'warning':
      return 'warning'
    case 'success':
      return 'success'
    case 'info':
      return 'default'
  }
}

const getTypeLabel = (type: AuditSuggestion['type']) => {
  switch (type) {
    case 'error':
      return '不通过'
    case 'warning':
      return '需优化'
    case 'success':
      return '通过'
    case 'info':
      return '提示'
  }
}

const getBgColor = (type: AuditSuggestion['type']) => {
  switch (type) {
    case 'error':
      return 'bg-red-50 border-red-200'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200'
    case 'success':
      return 'bg-green-50 border-green-200'
    case 'info':
      return 'bg-blue-50 border-blue-200'
  }
}

export default function AuditSuggestions({
  suggestions,
  title = '审核建议',
  className = '',
}: AuditSuggestionsProps) {
  if (suggestions.length === 0) {
    return null
  }

  // 统计各类型数量
  const stats = suggestions.reduce(
    (acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-600" />
            {title}
          </div>
          <div className="flex items-center gap-2">
            {stats.error && (
              <Badge variant="destructive" className="text-xs">
                {stats.error} 个问题
              </Badge>
            )}
            {stats.warning && (
              <Badge variant="warning" className="text-xs">
                {stats.warning} 个警告
              </Badge>
            )}
            {stats.success && (
              <Badge variant="success" className="text-xs">
                {stats.success} 个通过
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getBgColor(suggestion.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getIcon(suggestion.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
                      {getTypeLabel(suggestion.type)}
                    </Badge>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {suggestion.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                  {suggestion.suggestions && suggestion.suggestions.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-300">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        💡 优化建议：
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {suggestion.suggestions.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-medium mb-1">审核说明</p>
              <ul className="space-y-0.5 text-blue-800">
                <li>• <strong>不通过</strong>：必须修改，否则无法投放</li>
                <li>• <strong>需优化</strong>：建议优化，可能影响投放效果</li>
                <li>• <strong>通过</strong>：符合平台规范，可以正常投放</li>
                <li>• <strong>提示</strong>：参考信息，帮助提升投放效果</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 示例数据生成函数
export const generateMockAuditSuggestions = (): AuditSuggestion[] => {
  return [
    {
      type: 'error',
      title: '标题包含违禁词',
      description: '检测到标题中包含"最好"、"第一"等绝对化用语，违反广告法规定',
      suggestions: [
        '将"最好"改为"优质"、"推荐"等词汇',
        '将"第一"改为"领先"、"优选"等词汇',
        '避免使用绝对化、夸大性表述',
      ],
    },
    {
      type: 'warning',
      title: '图片清晰度不足',
      description: '素材图片分辨率为 800x600，低于推荐的 1080x1080',
      suggestions: [
        '建议使用 1080x1080 或更高分辨率的图片',
        '确保图片清晰，避免模糊、失真',
        '使用高质量的原图，避免二次压缩',
      ],
    },
    {
      type: 'warning',
      title: '文案长度过短',
      description: '创意文案仅有 8 个字，建议增加到 15-30 字以提升吸引力',
      suggestions: [
        '增加产品卖点描述，如"限时优惠"、"包邮到家"',
        '添加用户痛点，如"解决XX问题"',
        '突出产品特色，如"新品上市"、"爆款推荐"',
      ],
    },
    {
      type: 'success',
      title: '素材规格符合要求',
      description: '图片尺寸、格式、大小均符合平台规范',
    },
    {
      type: 'info',
      title: '建议添加行动号召',
      description: '文案中可以添加"立即购买"、"点击了解"等行动号召语，提升点击率',
      suggestions: [
        '在文案结尾添加"立即抢购"、"点击查看"',
        '使用"限时优惠"、"今日特价"等紧迫感词汇',
        '添加"包邮"、"送礼"等利益点',
      ],
    },
  ]
}

