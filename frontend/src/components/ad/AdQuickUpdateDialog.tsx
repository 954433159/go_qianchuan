import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/components/ui/Toast'
import { Info, DollarSign, Target, MapPin, Clock } from 'lucide-react'

// 更新类型
export type UpdateType = 'budget' | 'bid' | 'roi' | 'region' | 'schedule'

// 更新值类型
type BudgetValues = z.infer<typeof budgetSchema>
type BidValues = z.infer<typeof bidSchema>
type RoiValues = z.infer<typeof roiSchema>
type RegionValues = z.infer<typeof regionSchema>
type ScheduleValues = z.infer<typeof scheduleSchema>

type UpdateValues = BudgetValues | BidValues | RoiValues | RegionValues | ScheduleValues

interface AdQuickUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  updateType: UpdateType
  adIds: number[]
  onUpdate: (values: UpdateValues) => Promise<void>
}

// 预算更新schema
const budgetSchema = z.object({
  budget: z.number().min(300, '预算不能低于300元'),
  budget_mode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL']),
})

// 出价更新schema
const bidSchema = z.object({
  bid: z.number().min(0.01, '出价必须大于0'),
})

// ROI目标更新schema
const roiSchema = z.object({
  roi_goal: z.number().min(0.1, 'ROI目标必须大于0'),
})

// 地域更新schema
const regionSchema = z.object({
  regions: z.array(z.string()).min(1, '请至少选择一个地域'),
})

// 投放时间更新schema
const scheduleSchema = z.object({
  schedule_type: z.enum(['SCHEDULE_FROM_NOW', 'SCHEDULE_START_END']),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
})

// 获取对应的schema
const getSchema = (type: UpdateType) => {
  switch (type) {
    case 'budget':
      return budgetSchema
    case 'bid':
      return bidSchema
    case 'roi':
      return roiSchema
    case 'region':
      return regionSchema
    case 'schedule':
      return scheduleSchema
    default:
      return budgetSchema
  }
}

// 获取对应的图标
const getIcon = (type: UpdateType) => {
  switch (type) {
    case 'budget':
      return DollarSign
    case 'bid':
      return Target
    case 'roi':
      return Target
    case 'region':
      return MapPin
    case 'schedule':
      return Clock
    default:
      return Info
  }
}

// 获取对应的标题
const getTitle = (type: UpdateType) => {
  switch (type) {
    case 'budget':
      return '💵 批量更新预算'
    case 'bid':
      return '💰 批量更新出价'
    case 'roi':
      return '🎯 批量更新ROI目标'
    case 'region':
      return '📍 批量更新地域'
    case 'schedule':
      return '⏰ 批量更新投放时间'
    default:
      return '更新设置'
  }
}

// 获取对应的描述
const getDescription = (type: UpdateType, count: number) => {
  return `已选择 ${count} 个计划，将批量更新${getTitle(type).replace(/[💵💰🎯📍⏰]/gu, '').trim()}`
}

export default function AdQuickUpdateDialog({
  open,
  onOpenChange,
  updateType,
  adIds,
  onUpdate,
}: AdQuickUpdateDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const Icon = getIcon(updateType)

  const form = useForm({
    resolver: zodResolver(getSchema(updateType)),
    defaultValues:
      updateType === 'budget'
        ? { budget: 500, budget_mode: 'BUDGET_MODE_DAY' }
        : updateType === 'bid'
        ? { bid: 5.0 }
        : updateType === 'roi'
        ? { roi_goal: 2.0 }
        : updateType === 'region'
        ? { regions: [] }
        : { schedule_type: 'SCHEDULE_FROM_NOW', start_time: '', end_time: '' },
  })

  const onSubmit = async (values: UpdateValues) => {
    setSubmitting(true)
    try {
      await onUpdate(values)
      toast.success('更新成功')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to update:', error)
      toast.error('更新失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-red-600" />
            {getTitle(updateType)}
          </DialogTitle>
          <DialogDescription>{getDescription(updateType, adIds.length)}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 预算更新 */}
            {updateType === 'budget' && (
              <>
                <FormField
                  control={form.control}
                  name="budget_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预算类型</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预算金额 (元)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="请输入预算金额"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>建议日预算不低于 ¥300</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* 出价更新 */}
            {updateType === 'bid' && (
              <FormField
                control={form.control}
                name="bid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出价金额 (元)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="请输入新的出价"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                      <strong>建议出价范围:</strong> ¥2.50 - ¥8.00
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ROI目标更新 */}
            {updateType === 'roi' && (
              <FormField
                control={form.control}
                name="roi_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ROI目标</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="请输入ROI目标"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      ROI = 转化价值 / 广告消耗，建议设置在 1.5 - 5.0 之间
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 地域更新 */}
            {updateType === 'region' && (
              <FormField
                control={form.control}
                name="regions"
                render={() => (
                  <FormItem>
                    <FormLabel>投放地域</FormLabel>
                    <FormControl>
                      <Input placeholder="请选择投放地域（功能开发中）" disabled />
                    </FormControl>
                    <FormDescription>支持省市级地域定向</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 投放时间更新 */}
            {updateType === 'schedule' && (
              <>
                <FormField
                  control={form.control}
                  name="schedule_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>投放时间类型</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择投放时间类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SCHEDULE_FROM_NOW">长期投放</SelectItem>
                          <SelectItem value="SCHEDULE_START_END">自定义时间段</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" loading={submitting}>
                确认更新
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

