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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { createAudience, updateAudience, Audience } from '@/api/tools'
import { showSuccess, showError } from '@/hooks'

// 表单验证schema
const audienceFormSchema = z.object({
  name: z.string()
    .min(1, '请输入人群包名称')
    .max(50, '名称不能超过50个字符'),
  description: z.string().optional(),
  upload_type: z.enum(['FILE', 'API']),
  data: z.string().optional(), // 用于存储手机号等数据，换行分隔
})

type AudienceFormValues = z.infer<typeof audienceFormSchema>

interface AudienceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  advertiserId: number
  audience?: Audience | null // 如果传入则为编辑模式
  onSuccess?: () => void
}

export default function AudienceDialog({
  open,
  onOpenChange,
  advertiserId,
  audience,
  onSuccess,
}: AudienceDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const isEditMode = !!audience

  const form = useForm<AudienceFormValues>({
    resolver: zodResolver(audienceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      upload_type: 'API',
      data: '',
    },
  })

  // 编辑模式时填充表单
  useEffect(() => {
    if (audience && open) {
      form.reset({
        name: audience.name,
        description: audience.description || '',
        upload_type: (audience.upload_type as 'FILE' | 'API') || 'API',
        data: '',
      })
    } else if (!open) {
      form.reset()
    }
  }, [audience, open, form])

  const onSubmit = async (values: AudienceFormValues) => {
    setSubmitting(true)
    try {
      if (isEditMode && audience) {
        // 编辑模式
        await updateAudience({
          advertiser_id: advertiserId,
          audience_id: audience.id,
          name: values.name,
          description: values.description,
        })
        showSuccess('更新人群包成功')
      } else {
        // 创建模式
        const dataArray = values.data 
          ? values.data.split('\n').map(s => s.trim()).filter(Boolean)
          : undefined

        await createAudience({
          advertiser_id: advertiserId,
          name: values.name,
          description: values.description,
          upload_type: values.upload_type,
          data: dataArray,
        })
        showSuccess('创建人群包成功')
      }
      
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      showError(isEditMode ? '更新人群包失败' : '创建人群包失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '编辑人群包' : '创建人群包'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? '修改人群包信息' : '填写以下信息创建新的人群包'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 人群包名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>人群包名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：高价值用户" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 描述 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="人群包描述（可选）"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode && (
              <>
                {/* 上传方式 */}
                <FormField
                  control={form.control}
                  name="upload_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上传方式 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="API">API上传</SelectItem>
                          <SelectItem value="FILE">文件上传</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 数据输入 */}
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户数据（可选）</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="每行一个手机号或IMEI，例如：&#10;13800138000&#10;13900139000"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
                {isEditMode ? '保存' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
