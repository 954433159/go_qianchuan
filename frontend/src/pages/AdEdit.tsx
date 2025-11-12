import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getAdDetail, updateAd } from '@/api/ad'
import { Ad } from '@/api/types'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Loading, ErrorState } from '@/components/ui'
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
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toast'

// 表单验证schema (只允许编辑部分字段)
const adEditFormSchema = z.object({
  ad_name: z.string()
    .min(1, '请输入广告名称')
    .max(50, '广告名称不能超过50个字符'),
  budget: z.number()
    .min(300, '预算不能低于300元')
    .max(999999, '预算不能超过999999元'),
  budget_mode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL']),
})

type AdEditFormValues = z.infer<typeof adEditFormSchema>

export default function AdEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const advertiserId = user?.advertiserId || 1

  const form = useForm<AdEditFormValues>({
    resolver: zodResolver(adEditFormSchema),
    defaultValues: {
      ad_name: '',
      budget: 300,
      budget_mode: 'BUDGET_MODE_DAY',
    },
  })

  const fetchAdDetail = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAdDetail(advertiserId, Number(id))
      setAd(data)
      
      // 预填充表单
      form.reset({
        ad_name: data.name,
        budget: data.delivery_setting?.budget ? data.delivery_setting.budget / 100 : 300,
        budget_mode: data.delivery_setting?.budget_mode || 'BUDGET_MODE_DAY',
      })
    } catch (err) {
      console.error('Failed to fetch ad detail:', err)
      setError('加载广告详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchAdDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSubmit = async (values: AdEditFormValues) => {
    if (!id) return
    
    setSubmitting(true)
    try {
      await updateAd({
        advertiser_id: advertiserId,
        ad_id: Number(id),
        ad_name: values.ad_name,
        delivery_setting: {
          budget: values.budget * 100,
          budget_mode: values.budget_mode,
        },
      })

      toast.success('广告更新成功')
      navigate(`/ads/${id}`)
    } catch (error) {
      console.error('Failed to update ad:', error)
      toast.error('广告更新失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text="加载中..." size="lg" />
  }

  if (error || !ad) {
    return (
      <ErrorState
        title="加载失败"
        description={error || '广告不存在'}
        action={{
          label: '重试',
          onClick: fetchAdDetail
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="编辑广告"
        description={`正在编辑: ${ad.name}`}
        breadcrumbs={[
          { label: '工作台', href: '/' },
          { label: '广告', href: '/ads' },
          { label: ad.name, href: `/ads/${id}` },
          { label: '编辑' }
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate(`/ads/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回详情
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>广告信息</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                  <strong>提示：</strong>定向设置、创意模式等字段不可修改，如需调整请创建新广告。
                </p>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/ads/${id}`)}
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
