import { useState } from 'react'
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
import { useCampaignMutations } from '@/hooks'
import { BUDGET_LIMITS } from '@/constants'

// 表单验证schema
const campaignFormSchema = z.object({
  name: z.string()
    .min(1, '请输入计划名称')
    .max(50, '计划名称不能超过50个字符'),
  budget: z.number()
    .min(BUDGET_LIMITS.MIN_DAY_BUDGET / 100, `预算不能低于${BUDGET_LIMITS.MIN_DAY_BUDGET / 100}元`)
    .max(BUDGET_LIMITS.MAX_BUDGET / 100, `预算不能超过${BUDGET_LIMITS.MAX_BUDGET / 100}元`),
  budget_mode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_INFINITE']),
  landing_type: z.enum(['LINK', 'APP', 'MICRO_GAME', 'DPA']),
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  advertiserId: number
  onSuccess?: () => void
}

export default function CreateCampaignDialog({
  open,
  onOpenChange,
  advertiserId,
  onSuccess,
}: CreateCampaignDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const { create } = useCampaignMutations()

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: '',
      budget: 300,
      budget_mode: 'BUDGET_MODE_DAY',
      landing_type: 'LINK',
    },
  })

  const onSubmit = async (values: CampaignFormValues) => {
    setSubmitting(true)
    try {
      await create({
        advertiser_id: advertiserId,
        name: values.name,
        budget: values.budget * 100, // 元转分
        budget_mode: values.budget_mode,
        landing_type: values.landing_type,
      })
      
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>创建广告计划</DialogTitle>
          <DialogDescription>
            填写以下信息创建新的广告计划
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 计划名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>计划名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：春节大促-图文" {...field} />
                  </FormControl>
                  <FormDescription>
                    建议使用清晰易识别的名称
                  </FormDescription>
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
                        <SelectValue placeholder="选择预算类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUDGET_MODE_DAY">日预算</SelectItem>
                      <SelectItem value="BUDGET_MODE_INFINITE">不限</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>推广目的 *</FormLabel>
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
                创建计划
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
