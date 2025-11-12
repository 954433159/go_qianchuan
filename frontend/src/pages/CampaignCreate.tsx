import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createCampaign } from '@/api/campaign'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { BUDGET_LIMITS } from '@/constants'
import { ArrowLeft, Video, ShoppingBag, Users, Check } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

// 表单验证schema
const campaignFormSchema = z.object({
  name: z.string()
    .min(1, '请输入广告组名称')
    .max(50, '广告组名称不能超过50个字符'),
  objective: z.enum(['LIVE', 'PRODUCT', 'FANS']),
  budget: z.number()
    .min(BUDGET_LIMITS.MIN_DAY_BUDGET / 100, `预算不能低于${BUDGET_LIMITS.MIN_DAY_BUDGET / 100}元`)
    .max(BUDGET_LIMITS.MAX_BUDGET / 100, `预算不能超过${BUDGET_LIMITS.MAX_BUDGET / 100}元`),
  budget_mode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_INFINITE']),
  landing_type: z.enum(['LINK', 'APP', 'MICRO_GAME', 'DPA']),
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

// 推广目标配置
const OBJECTIVES = [
  {
    value: 'LIVE',
    label: '直播推广',
    description: '推广直播间，提升直播GMV',
    icon: Video,
    recommended: true,
  },
  {
    value: 'PRODUCT',
    label: '商品推广',
    description: '推广商品，提升商品销量',
    icon: ShoppingBag,
    recommended: false,
  },
  {
    value: 'FANS',
    label: '涨粉推广',
    description: '增加账号粉丝数量',
    icon: Users,
    recommended: false,
  },
]

export default function CampaignCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const advertiserId = parseInt(searchParams.get('advertiser_id') || '1')
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: '',
      objective: 'LIVE',
      budget: 300,
      budget_mode: 'BUDGET_MODE_DAY',
      landing_type: 'LINK',
    },
  })

  // 步骤配置
  const steps = [
    { number: 1, label: '基础信息' },
    { number: 2, label: '预算设置' },
    { number: 3, label: '确认提交' },
  ]

  const handleNext = async () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = await form.trigger(['name', 'objective'])
    } else if (currentStep === 2) {
      isValid = await form.trigger(['budget', 'budget_mode'])
    }

    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const onSubmit = async (values: CampaignFormValues) => {
    setSubmitting(true)
    try {
      const result = await createCampaign({
        advertiser_id: advertiserId,
        name: values.name,
        budget: values.budget * 100, // 元转分
        budget_mode: values.budget_mode,
        landing_type: values.landing_type,
      })
      
      toast.success('广告计划创建成功')
      
      // 跳转到详情页
      navigate(`/campaigns/${result.campaign_id}`)
    } catch (error) {
      console.error('Failed to create campaign:', error)
      toast.error('创建失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📁 创建广告组"
        description="为您的推广活动创建一个新的广告组"
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '广告组', href: '/campaigns' },
          { label: '创建广告组' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        }
      />

      {/* 步骤指示器 */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors',
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    currentStep >= step.number ? 'text-red-600' : 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-4 transition-colors',
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 第一步：基础信息 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">第一步：基础信息</h3>

                  {/* 广告组名称 */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          广告组名称 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="请输入广告组名称，建议包含推广目标" maxLength={50} {...field} />
                        </FormControl>
                        <FormDescription>
                          最多50个字符，建议使用易于识别的名称
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 推广目标 */}
                  <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          推广目标 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {OBJECTIVES.map((objective) => {
                              const Icon = objective.icon
                              const isSelected = field.value === objective.value

                              return (
                                <label
                                  key={objective.value}
                                  className={cn(
                                    'relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md',
                                    isSelected
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  )}
                                  onClick={() => field.onChange(objective.value)}
                                >
                                  <input
                                    type="radio"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={() => field.onChange(objective.value)}
                                  />
                                  <div className="text-center">
                                    <div
                                      className={cn(
                                        'w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center',
                                        isSelected
                                          ? 'bg-gradient-to-br from-red-100 to-orange-100'
                                          : 'bg-gray-100'
                                      )}
                                    >
                                      <Icon
                                        className={cn(
                                          'w-8 h-8',
                                          isSelected ? 'text-red-600' : 'text-gray-600'
                                        )}
                                      />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                      {objective.label}
                                    </h4>
                                    <p className="text-xs text-gray-600">{objective.description}</p>
                                    {objective.recommended && (
                                      <span className="inline-block mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                                        推荐
                                      </span>
                                    )}
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 操作按钮 */}
                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/campaigns')}
                    >
                      取消
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      下一步
                    </Button>
                  </div>
                </div>
              )}

              {/* 第二步：预算设置 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">第二步：预算设置</h3>

                  {/* 预算类型 */}
                  <FormField
                    control={form.control}
                    name="budget_mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          预算类型 <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择预算类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BUDGET_MODE_DAY">日预算</SelectItem>
                            <SelectItem value="BUDGET_MODE_INFINITE">不限</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          日预算：每日消耗不超过设定金额；不限：总预算内不限制每日消耗
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 预算金额 */}
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          预算金额 (元) <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="300"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          日预算最低300元，建议根据推广目标合理设置
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 推广目的 */}
                  <FormField
                    control={form.control}
                    name="landing_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          推广目的 <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择推广目的" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LINK">销售线索收集</SelectItem>
                            <SelectItem value="APP">APP推广</SelectItem>
                            <SelectItem value="MICRO_GAME">小游戏推广</SelectItem>
                            <SelectItem value="DPA">商品目录推广</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 操作按钮 */}
                  <div className="flex justify-between gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={handlePrev}>
                      上一步
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      下一步
                    </Button>
                  </div>
                </div>
              )}

              {/* 第三步：确认提交 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">第三步：确认提交</h3>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">广告组名称</label>
                        <p className="mt-1 text-base text-gray-900">{form.watch('name')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">推广目标</label>
                        <p className="mt-1 text-base text-gray-900">
                          {OBJECTIVES.find(o => o.value === form.watch('objective'))?.label}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">预算类型</label>
                        <p className="mt-1 text-base text-gray-900">
                          {form.watch('budget_mode') === 'BUDGET_MODE_DAY' ? '日预算' : '不限'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">预算金额</label>
                        <p className="mt-1 text-base text-gray-900">¥{form.watch('budget')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">推广目的</label>
                        <p className="mt-1 text-base text-gray-900">
                          {form.watch('landing_type') === 'LINK' && '销售线索收集'}
                          {form.watch('landing_type') === 'APP' && 'APP推广'}
                          {form.watch('landing_type') === 'MICRO_GAME' && '小游戏推广'}
                          {form.watch('landing_type') === 'DPA' && '商品目录推广'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 mt-0.5">ℹ️</div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">温馨提示：</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>创建后可在广告组详情页进行编辑</li>
                          <li>建议先创建广告组，再创建推广计划</li>
                          <li>合理设置预算有助于控制成本</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-between gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={handlePrev}>
                      上一步
                    </Button>
                    <Button type="submit" loading={submitting}>
                      确认创建
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
