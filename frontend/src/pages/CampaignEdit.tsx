import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getCampaignDetail, updateCampaign } from '@/api/campaign'
import { Campaign } from '@/api/types'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
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
import { ArrowLeft } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

// 表单验证schema
const campaignFormSchema = z.object({
  name: z.string()
    .min(1, '请输入计划名称')
    .max(50, '计划名称不能超过50个字符'),
  budget: z.number()
    .min(BUDGET_LIMITS.MIN_DAY_BUDGET / 100, `预算不能低于${BUDGET_LIMITS.MIN_DAY_BUDGET / 100}元`)
    .max(BUDGET_LIMITS.MAX_BUDGET / 100, `预算不能超过${BUDGET_LIMITS.MAX_BUDGET / 100}元`),
  budget_mode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_INFINITE']),
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

export default function CampaignEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
  })

  const fetchCampaignDetail = async (campaignId: number) => {
    setLoading(true)
    setError(false)
    try {
      const data = await getCampaignDetail(1, campaignId)
      setCampaign(data)
      
      // 填充表单
      form.reset({
        name: data.name,
        budget: data.budget / 100, // 分转元
        budget_mode: data.budget_mode as 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE',
      })
    } catch (err) {
      console.error('Failed to fetch campaign detail:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCampaignDetail(parseInt(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSubmit = async (values: CampaignFormValues) => {
    if (!campaign) return

    setSubmitting(true)
    try {
      await updateCampaign({
        advertiser_id: campaign.advertiser_id,
        campaign_id: campaign.id,
        name: values.name,
        budget: values.budget * 100, // 元转分
        budget_mode: values.budget_mode,
      })
      
      toast.success('广告计划更新成功')
      
      // 返回详情页
      navigate(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Failed to update campaign:', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text="加载广告计划..." />
  }

  if (error || !campaign) {
    return (
      <ErrorState
        title="加载失败"
        description="无法加载广告计划，请稍后重试"
        action={{
          label: '重新加载',
          onClick: () => fetchCampaignDetail(parseInt(id!)),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`编辑计划：${campaign.name}`}
        description={`计划 ID: ${campaign.id}`}
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '广告计划', href: '/campaigns' },
          { label: campaign.name, href: `/campaigns/${campaign.id}` },
          { label: '编辑' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回详情
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {/* 操作按钮 */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button type="submit" loading={submitting}>
                  保存修改
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
