import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authorizeShop } from '@/api/advertiser'
import { PageHeader, Button, Card, CardContent, Input } from '@/components/ui'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { Store, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react'

export default function AccountShopAuth() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [shopId, setShopId] = useState('')
  const [authSuccess, setAuthSuccess] = useState(false)

  const handleAuthorize = async () => {
    if (!user?.advertiserId) {
      toast.error('未获取到广告主ID')
      return
    }

    if (!shopId.trim()) {
      toast.error('请输入店铺ID')
      return
    }

    setLoading(true)
    try {
      await authorizeShop({
        advertiser_id: user.advertiserId,
        shop_id: shopId.trim(),
      })
      
      setAuthSuccess(true)
      toast.success('店铺授权成功')
      
      // 3秒后跳转回账户中心
      setTimeout(() => {
        navigate('/account-center')
      }, 3000)
    } catch (error) {
      console.error('Failed to authorize shop:', error)
      toast.error('店铺授权失败，请检查店铺ID是否正确')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="店铺新客定向授权"
        description="授权千川账户访问店铺新客数据，用于定向投放"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/account-center' },
          { label: '店铺授权' },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            {authSuccess ? (
              // 授权成功提示
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">授权成功</h3>
                <p className="text-gray-600 mb-4">
                  店铺已成功授权，即将返回账户中心...
                </p>
                <Button onClick={() => navigate('/account-center')}>
                  立即返回
                </Button>
              </div>
            ) : (
              // 授权表单
              <div className="space-y-6">
                {/* 说明信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-2">授权说明</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>授权后可使用店铺新客数据进行精准定向投放</li>
                        <li>仅授权数据查看和使用权限，不涉及店铺管理权限</li>
                        <li>授权有效期为1年，到期后需重新授权</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 店铺ID输入 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    店铺ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    placeholder="请输入抖音小店的店铺ID"
                    className="text-base"
                  />
                  <p className="text-xs text-gray-500">
                    您可以在抖音小店后台查看店铺ID
                  </p>
                </div>

                {/* 授权步骤 */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-3">授权步骤</h4>
                  <ol className="space-y-3">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        1
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">输入店铺ID</p>
                        <p className="text-xs text-gray-600">在上方输入框中填写抖音小店的店铺ID</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        2
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">确认授权</p>
                        <p className="text-xs text-gray-600">点击下方授权按钮提交授权请求</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        3
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">完成授权</p>
                        <p className="text-xs text-gray-600">系统将自动关联店铺数据，可立即使用新客定向功能</p>
                      </div>
                    </li>
                  </ol>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/account-center')}
                    disabled={loading}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAuthorize}
                    loading={loading}
                    disabled={!shopId.trim()}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    确认授权
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
