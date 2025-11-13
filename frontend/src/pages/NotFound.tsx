import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

/**
 * 404 Not Found Page
 * 当用户访问不存在的路由时显示
 */
export default function NotFound() {
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
        {/* 404 大数字 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <div className="mt-4 text-2xl font-semibold text-gray-900">
            页面未找到
          </div>
          <p className="mt-2 text-gray-600">
            抱歉，您访问的页面不存在或已被移除
          </p>
        </div>

        {/* 操作按钮 */}
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

        {/* 帮助信息 */}
        <div className="mt-12 text-sm text-gray-500">
          <p>如果您认为这是一个错误，请联系系统管理员</p>
        </div>
      </div>
    </div>
  )
}
