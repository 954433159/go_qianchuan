import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateCampaignStatus } from '@/api/campaign'
import { PageHeader, Button, Card, CardContent } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { Zap, AlertCircle, Play, Pause, Trash2 } from 'lucide-react'

type OperationType = 'enable' | 'disable' | 'delete'

export default function CampaignBatchOperations() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { confirm, ConfirmDialog } = useConfirm()
  
  const [loading, setLoading] = useState(false)
  const [campaignIds, setCampaignIds] = useState<number[]>([])
  const [operation, setOperation] = useState<OperationType>('enable')

  useEffect(() => {
    const ids = searchParams.get('ids')
    if (ids) {
      setCampaignIds(ids.split(',').map(Number))
    } else {
      toast.error('未选择任何广告组')
      navigate('/campaigns')
    }
  }, [searchParams, navigate])

  const handleSubmit = async () => {
    if (!user?.advertiserId) {
      toast.error('未获取到广告主ID')
      return
    }

    if (campaignIds.length === 0) {
      toast.error('未选择任何广告组')
      return
    }

    // 删除操作需要二次确认
    if (operation === 'delete') {
      const confirmed = await confirm({
        title: '批量删除广告组',
        description: `确定要删除 ${campaignIds.length} 个广告组吗？删除后将无法恢复，且组内所有广告计划也将被删除。`,
        confirmText: '确认删除',
        variant: 'destructive',
      })
      
      if (!confirmed) return
    }

    setLoading(true)
    try {
      // 统一使用 updateCampaignStatus API
      const opt_status = operation === 'enable' ? 'ENABLE' : 
                        operation === 'disable' ? 'DISABLE' : 'DELETE'
      
      await updateCampaignStatus({
        advertiser_id: user.advertiserId,
        campaign_ids: campaignIds,
        opt_status,
      })
      
      const message = operation === 'enable' ? '启用' : 
                      operation === 'disable' ? '暂停' : '删除'
      toast.success(`成功${message} ${campaignIds.length} 个广告组`)
      
      navigate('/campaigns')
    } catch (error) {
      console.error('Failed to execute batch operation:', error)
      toast.error('批量操作失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const getOperationInfo = () => {
    switch (operation) {
      case 'enable':
        return {
          title: '批量启用',
          description: '启用后广告组将开始投放',
          icon: <Play className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        }
      case 'disable':
        return {
          title: '批量暂停',
          description: '暂停后广告组将停止投放',
          icon: <Pause className="w-5 h-5" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        }
      case 'delete':
        return {
          title: '批量删除',
          description: '删除后无法恢复，请谨慎操作',
          icon: <Trash2 className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        }
    }
  }

  const opInfo = getOperationInfo()

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6">
        <PageHeader
          title="批量操作广告组"
          description="对选中的广告组执行批量操作"
          breadcrumbs={[
            { label: '首页', href: '/dashboard' },
            { label: '广告组', href: '/campaigns' },
            { label: '批量操作' },
          ]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/campaigns')}>
                取消
              </Button>
              <Button 
                onClick={handleSubmit} 
                loading={loading}
                variant={operation === 'delete' ? 'destructive' : 'default'}
              >
                <Zap className="w-4 h-4 mr-2" />
                确认执行
              </Button>
            </div>
          }
        />

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    已选择 {campaignIds.length} 个广告组
                  </p>
                  <p className="text-xs text-blue-700">
                    将对这些广告组执行批量操作
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  选择操作 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={operation}
                  onValueChange={(value) => setOperation(value as OperationType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enable">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        启用广告组
                      </div>
                    </SelectItem>
                    <SelectItem value="disable">
                      <div className="flex items-center gap-2">
                        <Pause className="w-4 h-4" />
                        暂停广告组
                      </div>
                    </SelectItem>
                    <SelectItem value="delete">
                      <div className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-4 h-4" />
                        删除广告组
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-4">操作预览</h3>
                <div className={`${opInfo.bgColor} ${opInfo.borderColor} border rounded-lg p-4`}>
                  <div className="flex items-start gap-3">
                    <div className={opInfo.color}>
                      {opInfo.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${opInfo.color}`}>
                        {opInfo.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {opInfo.description}
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="text-gray-600">影响广告组数: </span>
                        <span className="font-medium">{campaignIds.length} 个</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
