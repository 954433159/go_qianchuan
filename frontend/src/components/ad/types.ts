import * as z from 'zod'

// 表单验证schema
export const adFormSchema = z.object({
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

export type AdFormValues = z.infer<typeof adFormSchema>
