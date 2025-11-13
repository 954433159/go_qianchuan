import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'

/**
 * 403 Forbidden Page
 * 当用户访问无权限的资源时显示
 */
export default function Forbidden() {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/dashboard')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* 403 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        
        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            访问被拒绝
          </h2>
          <p className="text-gray-600">
            抱歉，您没有权限访问此页面。<br />
            请确认您的账户具有相应的访问权限。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            需要帮助？
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            如果您认为这是一个错误，请联系管理员申请权限。
          </p>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• 确认您的账户已登录</li>
            <li>• 联系管理员开通访问权限</li>
            <li>• 检查是否访问了正确的URL</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
