import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addAwemeAuth } from '@/api/advertiser'
import { ArrowLeft, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export default function AwemeAuthAdd() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [formData, setFormData] = useState({
    aweme_id: '',
    auth_type: 'VIDEO' as 'VIDEO' | 'PRODUCT' | 'LIVE',
    advertiser_id: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await addAwemeAuth({
        advertiser_id: Number(formData.advertiser_id),
        aweme_id: formData.aweme_id,
        auth_type: formData.auth_type
      })
      success('抖音号授权添加成功')
      navigate('/aweme-auth')
    } catch (err) {
      showError('授权添加失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="添加抖音号授权"
        description="为广告账户添加抖音号授权"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '抖音号授权', href: '/aweme-auth' },
          { label: '添加授权' }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/aweme-auth')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>授权信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                广告主ID *
              </label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                value={formData.advertiser_id}
                onChange={(e) => setFormData({ ...formData, advertiser_id: e.target.value })}
                placeholder="请输入广告主ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                抖音号ID *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                value={formData.aweme_id}
                onChange={(e) => setFormData({ ...formData, aweme_id: e.target.value })}
                placeholder="请输入抖音号ID，如: aweme_123456"
              />
              <p className="mt-1 text-sm text-gray-500">
                抖音号ID可在抖音开放平台获取
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                授权类型 *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                value={formData.auth_type}
                onChange={(e) => setFormData({ ...formData, auth_type: e.target.value as 'VIDEO' | 'PRODUCT' | 'LIVE' })}
              >
                <option value="VIDEO">视频授权</option>
                <option value="PRODUCT">商品授权</option>
                <option value="LIVE">直播授权</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                选择授权类型：视频、商品或直播授权
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">授权说明</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• 授权后，系统可以使用该抖音号进行广告投放</li>
                <li>• 可以获取抖音号的粉丝数据、视频素材等信息</li>
                <li>• 授权有效期为1年，到期需重新授权</li>
                <li>• 可随时解除授权关系</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? '添加中...' : '添加授权'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/aweme-auth')}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
