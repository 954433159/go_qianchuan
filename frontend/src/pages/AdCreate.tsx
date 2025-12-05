import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Video, ShoppingBag, Play, Check, Info } from 'lucide-react'
import { PageHeader } from '@/components/ui'
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
import { Card, CardContent } from '@/components/ui/Card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import TargetingSelector, { TargetingValue } from '@/components/targeting/TargetingSelector'
import RegionSelector from '@/components/targeting/RegionSelector'
import DeviceBrandSelector from '@/components/targeting/DeviceBrandSelector'
import PlatformNetworkCarrierSelector from '@/components/targeting/PlatformNetworkCarrierSelector'
import { getAudienceList, Audience } from '@/api/tools'
import { useAdMutations } from '@/hooks'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { formatTimeForSDK } from '@/utils/time-format'

// 推广目标配置
const PROMOTION_TYPES = [
  {
    value: 'LIVE_ROOM',
    label: '直播间推广',
    description: '为直播间引流，提升观看人数和GMV',
    icon: Video,
    recommended: true,
    features: ['增加直播间曝光', '提升观看人数', '促进商品成交'],
  },
  {
    value: 'PRODUCT',
    label: '商品推广',
    description: '单独推广爆款商品，提高销量和转化',
    icon: ShoppingBag,
    recommended: false,
    features: ['精准商品推广', '提高点击转化', '快速清库存'],
  },
  {
    value: 'VIDEO',
    label: '短视频带货',
    description: '通过短视频内容推广商品，提高转化',
    icon: Play,
    recommended: false,
    features: ['视频内容种草', '商品挂车推广', '自然流量转化'],
  },
]

// 表单验证schema
const adFormSchema = z.object({
  // 步骤1：推广目标
  promotion_type: z.enum(['LIVE_ROOM', 'PRODUCT', 'VIDEO']),
  ad_name: z.string()
    .min(1, '请输入计划名称')
    .max(50, '计划名称不能超过50个字符'),
  schedule_type: z.enum(['SCHEDULE_FROM_NOW', 'SCHEDULE_START_END']),
  start_time: z.string().optional(),
  end_time: z.string().optional(),

  // 步骤2：推广对象（暂时简化）
  campaign_id: z.number().min(1, '请选择广告组'),

  // 步骤3：预算出价
  budget: z.number()
    .min(300, '预算不能低于300元')
    .max(999999, '预算不能超过999999元'),
  budget_mode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL']),

  // 步骤4：定向设置
  gender: z.enum(['NONE', 'MALE', 'FEMALE']),
  age_ranges: z.array(z.string()).min(1, '请至少选择一个年龄段'),
  creative_mode: z.enum(['CUSTOM', 'PROGRAMMATIC']),
  // 定向选择（可选）
  interest_tags: z.array(z.string()).optional(),
  action_tags: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  device_brands: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  networks: z.array(z.string()).optional(),
  carriers: z.array(z.string()).optional(),
  // 人群包（可选）
  audience_id: z.number().optional(),
}).refine(
  (data) => {
    // 当 schedule_type 为 SCHEDULE_START_END 时，end_time 必填
    if (data.schedule_type === 'SCHEDULE_START_END') {
      return data.start_time && data.end_time
    }
    return true
  },
  {
    message: '投放时间类型为「设置开始和结束时间」时，开始时间和结束时间为必填项',
    path: ['end_time'],
  }
)

type AdFormValues = z.infer<typeof adFormSchema>

export default function AdCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [targeting, setTargeting] = useState<TargetingValue>({})
  const [currentStep, setCurrentStep] = useState(1)
  const { create } = useAdMutations()
  const { user } = useAuthStore()

  // 从URL参数或用户状态获取广告主ID
  const campaignIdFromUrl = Number(searchParams.get('campaign_id')) || undefined
  const advertiserIdFromUrl = Number(searchParams.get('advertiser_id')) || user?.advertiserId || undefined

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      promotion_type: 'LIVE_ROOM',
      campaign_id: campaignIdFromUrl || 0,
      ad_name: '',
      budget: 300,
      budget_mode: 'BUDGET_MODE_DAY',
      schedule_type: 'SCHEDULE_FROM_NOW',
      start_time: undefined,
      end_time: undefined,
      gender: 'NONE',
      age_ranges: ['AGE_18_23', 'AGE_24_30'],
      creative_mode: 'CUSTOM',
      interest_tags: [],
      action_tags: [],
      regions: [],
      device_brands: [],
      platforms: [],
      networks: [],
      carriers: [],
      audience_id: undefined,
    },
  })

  // 步骤配置
  const steps = [
    { number: 1, label: '推广目标' },
    { number: 2, label: '推广对象' },
    { number: 3, label: '预算出价' },
    { number: 4, label: '定向设置' },
    { number: 5, label: '确认提交' },
  ]

  const handleNext = async () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = await form.trigger(['promotion_type', 'ad_name', 'schedule_type'])
    } else if (currentStep === 2) {
      isValid = await form.trigger(['campaign_id'])
    } else if (currentStep === 3) {
      isValid = await form.trigger(['budget', 'budget_mode'])
    } else if (currentStep === 4) {
      isValid = await form.trigger(['gender', 'age_ranges'])
    }

    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  // 加载人群包列表
  useEffect(() => {
    const fetchAudiences = async () => {
      if (!advertiserIdFromUrl) return
      try {
        const { list } = await getAudienceList({ advertiser_id: advertiserIdFromUrl })
        setAudiences(list.filter(a => a.status === 'VALID'))
      } catch (error) {
        console.error('Failed to load audiences:', error)
      }
    }
    fetchAudiences()
  }, [advertiserIdFromUrl])

  const onSubmit = async (values: AdFormValues) => {
    setSubmitting(true)
    try {
      // 准备时间参数，转换为SDK格式
      let deliverySetting: {
        budget: number
        budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
        schedule_type: 'SCHEDULE_FROM_NOW' | 'SCHEDULE_START_END'
        start_time: string
        end_time?: string
      }

      if (values.schedule_type === 'SCHEDULE_START_END') {
        // SCHEDULE_START_END 需要传 start_time 和 end_time，格式为 SDK 格式
        deliverySetting = {
          budget: values.budget * 100,
          budget_mode: values.budget_mode,
          schedule_type: values.schedule_type,
          start_time: values.start_time ? formatTimeForSDK(values.start_time) : formatTimeForSDK(new Date()),
          end_time: values.end_time ? formatTimeForSDK(values.end_time) : undefined,
        }
      } else {
        // SCHEDULE_FROM_NOW 只需要 start_time
        deliverySetting = {
          budget: values.budget * 100,
          budget_mode: values.budget_mode,
          schedule_type: values.schedule_type,
          start_time: formatTimeForSDK(new Date()),
        }
      }

      await create({
        advertiser_id: advertiserIdFromUrl!, // Non-null assertion safe: validated above
        campaign_id: values.campaign_id,
        ad_name: values.ad_name,
        delivery_setting: deliverySetting,
        audience: {
          gender: values.gender,
          age: values.age_ranges,
          region: values.regions && values.regions.length > 0 ? values.regions : ['110000'],
          interest_tags: values.interest_tags,
          action_tags: values.action_tags,
          device_brand_ids: values.device_brands,
          platform: values.platforms,
          network: values.networks,
          carrier: values.carriers,
          audience_package_ids: values.audience_id ? [values.audience_id] : undefined,
        },
        creative_material_mode: values.creative_mode,
      })

      toast.success('广告创建成功')
      
      // 导航回列表或计划详情页
      if (campaignIdFromUrl) {
        navigate(`/campaigns/${campaignIdFromUrl}`)
      } else {
        navigate('/ads')
      }
    } catch (error) {
      console.error('Failed to create ad:', error)
      toast.error('广告创建失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 验证广告主ID是否存在
  if (!advertiserIdFromUrl) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="📢 创建推广计划"
          description="按照步骤填写信息，创建新的推广计划"
          breadcrumbs={[
            { label: '工作台', href: '/' },
            { label: '推广计划', href: '/ads' },
            { label: '创建计划' },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">缺少广告主ID</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                创建广告计划需要广告主ID。请从广告主页面进入，或确保已正确登录并选择了广告主。
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/advertisers')}>
                  去选择广告主
                </Button>
                <Button onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📢 创建推广计划"
        description="按照步骤填写信息，创建新的推广计划"
        breadcrumbs={[
          { label: '工作台', href: '/' },
          { label: '推广计划', href: '/ads' },
          { label: '创建计划' },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        }
      />

      {/* 步骤指示器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-colors',
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
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-600'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4 transition-colors',
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 第一步：推广目标 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">选择推广目标</h2>
                    <p className="text-gray-600">根据您的营销目标选择最合适的推广方式</p>
                  </div>

                  {/* 推广类型选择 */}
                  <FormField
                    control={form.control}
                    name="promotion_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {PROMOTION_TYPES.map((type) => {
                              const Icon = type.icon
                              const isSelected = field.value === type.value

                              return (
                                <label
                                  key={type.value}
                                  className={cn(
                                    'border-2 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all',
                                    isSelected
                                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                                      : 'border-gray-300 hover:border-orange-500'
                                  )}
                                  onClick={() => field.onChange(type.value)}
                                >
                                  <input
                                    type="radio"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={() => field.onChange(type.value)}
                                  />
                                  <div className="flex items-center justify-between mb-4">
                                    <div
                                      className={cn(
                                        'flex h-14 w-14 items-center justify-center rounded-lg',
                                        isSelected
                                          ? 'bg-gradient-to-br from-red-500 to-orange-500'
                                          : 'bg-gradient-to-br from-purple-100 to-pink-100'
                                      )}
                                    >
                                      <Icon
                                        className={cn(
                                          'h-8 w-8',
                                          isSelected ? 'text-white' : 'text-purple-600'
                                        )}
                                      />
                                    </div>
                                    {type.recommended && (
                                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                        推荐
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.label}</h3>
                                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                                  <ul className="space-y-2 text-sm text-gray-700">
                                    {type.features.map((feature, idx) => (
                                      <li key={idx} className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </label>
                              )
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 计划基本信息 */}
                  <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">计划基本信息</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 计划名称 */}
                      <FormField
                        control={form.control}
                        name="ad_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              计划名称 <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="请输入计划名称，例如：美妆直播间-618大促" maxLength={50} {...field} />
                            </FormControl>
                            <FormDescription className="flex items-start gap-1">
                              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              建议包含：推广对象+活动主题，便于后续管理
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 推广时间 */}
                      <FormField
                        control={form.control}
                        name="schedule_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              推广时间 <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择推广时间" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SCHEDULE_FROM_NOW">长期投放</SelectItem>
                                <SelectItem value="SCHEDULE_START_END">自定义时间段</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="flex items-start gap-1">
                              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              长期投放适合常规推广，自定义适合活动期间
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 时间范围设置（当 schedule_type 为 SCHEDULE_START_END 时显示） */}
                    {form.watch('schedule_type') === 'SCHEDULE_START_END' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                        <FormField
                          control={form.control}
                          name="start_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                开始时间 <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormDescription>
                                选择广告开始投放的时间
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                结束时间 <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormDescription>
                                选择广告结束投放的时间
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* 预算设置提醒 */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-green-600" />
                      预算设置提醒
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600 mb-1">建议日预算</p>
                        <p className="text-lg font-bold text-green-600">¥500 - ¥2000</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">建议CPA出价</p>
                        <p className="text-lg font-bold text-orange-600">¥0.8 - ¥2.5</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">预估日消耗</p>
                        <p className="text-lg font-bold text-blue-600">¥300 - ¥800</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      💡 以上数据基于同类计划平均表现，实际消耗以投放效果为准
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      返回
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      下一步：选择推广对象
                    </Button>
                  </div>
                </div>
              )}

              {/* 第二步：推广对象 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">选择推广对象</h2>
                    <p className="text-gray-600">选择要关联的广告组</p>
                  </div>

                  {/* 广告组ID */}
                  <FormField
                    control={form.control}
                    name="campaign_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          广告组ID <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="输入广告组ID"
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          请输入已创建的广告组ID，或先创建广告组
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={handlePrev}>
                      上一步
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      下一步：预算出价
                    </Button>
                  </div>
                </div>
              )}

              {/* 第三步：预算出价 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">设置预算和出价</h2>
                    <p className="text-gray-600">合理设置预算有助于控制成本</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              <SelectItem value="BUDGET_MODE_TOTAL">总预算</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            日预算：每日消耗不超过设定金额
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            日预算最低300元
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={handlePrev}>
                      上一步
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      下一步：定向设置
                    </Button>
                  </div>
                </div>
              )}

              {/* 第四步：定向设置 */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">定向设置</h2>
                    <p className="text-gray-600">精准定向目标人群，提高转化效果</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 性别定向 */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            性别定向 <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择性别" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NONE">不限</SelectItem>
                              <SelectItem value="MALE">男</SelectItem>
                              <SelectItem value="FEMALE">女</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 创意模式 */}
                    <FormField
                      control={form.control}
                      name="creative_mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            创意模式 <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择创意模式" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CUSTOM">自定义创意</SelectItem>
                              <SelectItem value="PROGRAMMATIC">程序化创意</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 定向选择和人群包 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">高级定向设置 (可选)</h3>
                    <Accordion type="single" collapsible className="border rounded-lg">
                  <AccordionItem value="targeting" className="border-0">
                    <AccordionTrigger className="px-4">
                      兴趣行为定向
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <TargetingSelector
                        advertiserId={advertiserIdFromUrl}
                        value={targeting}
                        onChange={(value) => {
                          setTargeting(value)
                          form.setValue('interest_tags', value.interests || [])
                          form.setValue('action_tags', value.actions || [])
                        }}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="region" className="border-0">
                    <AccordionTrigger className="px-4">
                      地域定向
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <FormField
                        control={form.control}
                        name="regions"
                        render={({ field }) => (
                          <FormItem>
                            <RegionSelector
                              advertiserId={advertiserIdFromUrl}
                              value={field.value || []}
                              onChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="device" className="border-0">
                    <AccordionTrigger className="px-4">
                      设备定向
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <FormField
                        control={form.control}
                        name="device_brands"
                        render={({ field }) => (
                          <FormItem>
                            <DeviceBrandSelector
                              advertiserId={advertiserIdFromUrl}
                              value={field.value || []}
                              onChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="platform" className="border-0">
                    <AccordionTrigger className="px-4">
                      平台/网络/运营商定向
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <PlatformNetworkCarrierSelector
                        platforms={form.watch('platforms') || []}
                        networks={form.watch('networks') || []}
                        carriers={form.watch('carriers') || []}
                        onPlatformsChange={(value) => form.setValue('platforms', value)}
                        onNetworksChange={(value) => form.setValue('networks', value)}
                        onCarriersChange={(value) => form.setValue('carriers', value)}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="audience" className="border-0">
                    <AccordionTrigger className="px-4">
                      人群包选择
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <FormField
                        control={form.control}
                        name="audience_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>选择人群包</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择人群包（可选）" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {audiences.map((audience) => (
                                  <SelectItem key={audience.id} value={audience.id.toString()}>
                                    {audience.name} ({(audience.cover_num / 10000).toFixed(1)}万人)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={handlePrev}>
                      上一步
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      下一步：确认提交
                    </Button>
                  </div>
                </div>
              )}

              {/* 第五步：确认提交 */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">确认提交</h2>
                    <p className="text-gray-600">请确认以下信息无误后提交</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">推广目标</label>
                        <p className="mt-1 text-base text-gray-900">
                          {PROMOTION_TYPES.find(t => t.value === form.watch('promotion_type'))?.label}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">计划名称</label>
                        <p className="mt-1 text-base text-gray-900">{form.watch('ad_name')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">推广时间</label>
                        <p className="mt-1 text-base text-gray-900">
                          {form.watch('schedule_type') === 'SCHEDULE_FROM_NOW' ? '长期投放' : '自定义时间段'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">广告组ID</label>
                        <p className="mt-1 text-base text-gray-900">{form.watch('campaign_id')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">预算类型</label>
                        <p className="mt-1 text-base text-gray-900">
                          {form.watch('budget_mode') === 'BUDGET_MODE_DAY' ? '日预算' : '总预算'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">预算金额</label>
                        <p className="mt-1 text-base text-gray-900">¥{form.watch('budget')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">性别定向</label>
                        <p className="mt-1 text-base text-gray-900">
                          {form.watch('gender') === 'NONE' && '不限'}
                          {form.watch('gender') === 'MALE' && '男'}
                          {form.watch('gender') === 'FEMALE' && '女'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">创意模式</label>
                        <p className="mt-1 text-base text-gray-900">
                          {form.watch('creative_mode') === 'CUSTOM' ? '自定义创意' : '程序化创意'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">💡 推广建议</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• <strong>直播间推广</strong>适合正在直播或即将开播的场景，能快速引流提升GMV</li>
                          <li>• <strong>商品推广</strong>适合主打爆款单品，精准触达目标用户提高转化率</li>
                          <li>• <strong>短视频带货</strong>适合通过视频内容种草商品，挂车推广实现自然流量转化</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
