import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateAdScheduleDate } from '@/api/ad'
import { PageHeader, Button, Card, CardContent, Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Calendar, Clock, AlertCircle } from 'lucide-react'

type ScheduleType = 'immediate' | 'scheduled' | 'range'

export default function AdUpdateSchedule() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [adId, setAdId] = useState<number | null>(null)
  const [scheduleType, setScheduleType] = useState<ScheduleType>('immediate')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const id = searchParams.get('ad_id')
    if (id) {
      setAdId(Number(id))
    } else {
      toast.error('未指定广告ID')
      navigate('/ads')
    }
  }, [searchParams, navigate])

  const handleSubmit = async () => {
    if (!user?.advertiserId || !adId) {
      toast.error('参数错误')
      return
    }

    if (scheduleType === 'scheduled' && !startDate) {
      toast.error('请选择开始时间')
      return
    }

    if (scheduleType === 'range' && (!startDate || !endDate)) {
      toast.error('请选择开始和结束时间')
      return
    }

    setLoading(true)
    try {
      await updateAdScheduleDate({
        advertiser_id: user.advertiserId,
        ad_id: adId,
        start_time: scheduleType === 'immediate' ? new Date().toISOString() : startDate,
        end_time: scheduleType === 'range' ? endDate : undefined,
      })
      
      toast.success('投放时间更新成功')
      navigate('/ads')
    } catch (error) {
      console.error('Failed to update schedule:', error)
      toast.error('更新投放时间失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="修改投放时间"
        description="设置广告计划的投放时间段"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '推广计划', href: '/ads' },
          { label: '修改投放时间' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/ads')}>
              取消
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <Clock className="w-4 h-4 mr-2" />
              确认修改
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 广告ID提示 */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  广告ID: {adId}
                </p>
                <p className="text-xs text-blue-700">
                  将修改此广告的投放时间设置
                </p>
              </div>
            </div>

            {/* 投放方式选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                投放方式 <span className="text-red-500">*</span>
              </label>
              <Select
                value={scheduleType}
                onValueChange={(value) => setScheduleType(value as ScheduleType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">立即开始投放</SelectItem>
                  <SelectItem value="scheduled">指定开始时间</SelectItem>
                  <SelectItem value="range">指定时间段</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 时间设置 */}
            {scheduleType !== 'immediate' && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    开始时间 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {scheduleType === 'range' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      结束时间 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 说明信息 */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">投放说明</p>
              <ul className="list-disc list-inside space-y-1">
                <li>立即开始：广告将在提交后立即开始投放</li>
                <li>指定开始时间：广告将在指定时间开始投放，持续到手动停止</li>
                <li>指定时间段：广告将在指定时间段内投放，到期自动停止</li>
              </ul>
            </div>

            {/* 预览信息 */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">修改预览</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">投放方式:</span>
                  <span className="font-medium">
                    {scheduleType === 'immediate' && '立即投放'}
                    {scheduleType === 'scheduled' && '定时投放'}
                    {scheduleType === 'range' && '时段投放'}
                  </span>
                </div>
                {scheduleType !== 'immediate' && startDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">开始时间:</span>
                    <span className="font-medium">
                      {new Date(startDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {scheduleType === 'range' && endDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">结束时间:</span>
                    <span className="font-medium">
                      {new Date(endDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
