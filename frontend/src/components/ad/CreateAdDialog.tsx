import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import TargetingSelector, { TargetingValue } from '@/components/targeting/TargetingSelector'
import RegionSelector from '@/components/targeting/RegionSelector'
import DeviceBrandSelector from '@/components/targeting/DeviceBrandSelector'
import PlatformNetworkCarrierSelector from '@/components/targeting/PlatformNetworkCarrierSelector'
import { getAudienceList, Audience } from '@/api/tools'
import { useAdMutations } from '@/hooks'

// 表单验证schema
const adFormSchema = z.object({
  campaign_id: z.number().min(1, '请选择广告计划'),
  ad_name: z.string()
    .min(1, '请输入广告名称')
    .max(50, '广告名称不能超过50个字符'),
  budget: z.number()
    .min(300, '预算不能低于300元')
    .max(999999, '预算不能超过999999元'),
  budget_mode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL']),
  schedule_type: z.enum(['SCHEDULE_FROM_NOW', 'SCHEDULE_START_END']),
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
})

type AdFormValues = z.infer<typeof adFormSchema>

interface CreateAdDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  advertiserId: number
  campaignId?: number
  onSuccess?: () => void
}

export default function CreateAdDialog({
  open,
  onOpenChange,
  advertiserId,
  campaignId,
  onSuccess,
}: CreateAdDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [targeting, setTargeting] = useState<TargetingValue>({})
  const { create } = useAdMutations()

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      campaign_id: campaignId || 0,
      ad_name: '',
      budget: 300,
      budget_mode: 'BUDGET_MODE_DAY',
      schedule_type: 'SCHEDULE_FROM_NOW',
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

  // 加载人群包列表
  useEffect(() => {
    const fetchAudiences = async () => {
      if (!advertiserId) return
      try {
        const { list } = await getAudienceList({ advertiser_id: advertiserId })
        setAudiences(list.filter(a => a.status === 'VALID'))
      } catch (error) {
        console.error('Failed to load audiences:', error)
      }
    }
    if (open) {
      fetchAudiences()
    }
  }, [advertiserId, open])

  const onSubmit = async (values: AdFormValues) => {
    setSubmitting(true)
    try {
      await create({
        advertiser_id: advertiserId,
        campaign_id: values.campaign_id,
        ad_name: values.ad_name,
        delivery_setting: {
          budget: values.budget * 100,
          budget_mode: values.budget_mode,
          start_time: new Date().toISOString(),
          schedule_type: values.schedule_type,
        },
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
      
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create ad:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建广告</DialogTitle>
          <DialogDescription>
            填写以下信息创建新的广告
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 广告计划ID */}
            <FormField
              control={form.control}
              name="campaign_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>广告计划ID *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="输入广告计划ID"
                      {...field}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 广告名称 */}
            <FormField
              control={form.control}
              name="ad_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>广告名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：春节大促-信息流" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 预算 */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预算 (元) *</FormLabel>
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

            {/* 预算类型 */}
            <FormField
              control={form.control}
              name="budget_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预算类型 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUDGET_MODE_DAY">日预算</SelectItem>
                      <SelectItem value="BUDGET_MODE_TOTAL">总预算</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 性别定向 */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>性别定向 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
                  <FormLabel>创意模式 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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

            {/* 定向选择和人群包 */}
            <Accordion type="single" collapsible className="border rounded-lg">
              <AccordionItem value="targeting" className="border-0">
                <AccordionTrigger className="px-4">
                  兴趣行为定向 (可选)
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <TargetingSelector
                    advertiserId={advertiserId}
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
                  地域定向 (可选)
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <FormField
                    control={form.control}
                    name="regions"
                    render={({ field }) => (
                      <FormItem>
                        <RegionSelector
                          advertiserId={advertiserId}
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
                  设备定向 (可选)
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <FormField
                    control={form.control}
                    name="device_brands"
                    render={({ field }) => (
                      <FormItem>
                        <DeviceBrandSelector
                          advertiserId={advertiserId}
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
                  平台/网络/运营商定向 (可选)
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
                  人群包选择 (可选)
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button type="submit" loading={submitting}>
                创建广告
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
