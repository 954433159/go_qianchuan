import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { AdFormValues } from './types'

interface AdBasicInfoStepProps {
  form: UseFormReturn<AdFormValues>
}

export default function AdBasicInfoStep({ form }: AdBasicInfoStepProps) {
  return (
    <div className="space-y-4">
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
    </div>
  )
}
