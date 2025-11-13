import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Form } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { TargetingValue } from '@/components/targeting/TargetingSelector'
import { getAudienceList, Audience } from '@/api/tools'
import { useAdMutations } from '@/hooks'
import AdBasicInfoStep from './AdBasicInfoStep'
import AdTargetingStep from './AdTargetingStep'
import AdAdvancedTargetingSection from './AdAdvancedTargetingSection'
import AdAudienceSection from './AdAudienceSection'
import { adFormSchema, AdFormValues } from './types'

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
            {/* 基础信息 */}
            <AdBasicInfoStep form={form} />

            {/* 基础定向 */}
            <AdTargetingStep form={form} />

            {/* 高级定向 */}
            <AdAdvancedTargetingSection
              form={form}
              advertiserId={advertiserId}
              targeting={targeting}
              onTargetingChange={setTargeting}
            />

            {/* 人群包 */}
            <AdAudienceSection form={form} audiences={audiences} />

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
