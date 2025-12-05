import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeOAuthCode } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { fetchUser } = useAuthStore()
  const [error, setError] = useState<string>('')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [step, setStep] = useState<string>('初始化...')

  useEffect(() => {
    const handleCallback = async () => {
      // 获取URL参数
      const params = new URLSearchParams(window.location.search)
      // 兼容千川的 auth_code 参数名（千川回调使用 auth_code 而不是 code）
      const code = params.get('code') || params.get('auth_code')
      const state = params.get('state')
      const savedState = sessionStorage.getItem('oauth_state')

      console.log('🔵 [AuthCallback] URL params:', {
        code: code ? `${code.substring(0, 20)}...` : 'null',
        state,
        savedState,
        fullUrl: window.location.href
      })

      // 验证code参数
      if (!code) {
        setError('授权失败：缺少授权码')
        setErrorDetails('URL中没有找到code或auth_code参数')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      // State验证（CSRF防护）
      // 生产环境必须验证，开发环境可配置跳过
      const isDev = import.meta.env.DEV
      const skipStateValidation = isDev && import.meta.env.VITE_SKIP_STATE_VALIDATION === 'true'
      
      if (state !== savedState) {
        console.warn('⚠️ State验证失败:', {
          received: state,
          expected: savedState,
          isDev,
          skipStateValidation
        })
        
        if (!skipStateValidation) {
          // 生产环境或未配置跳过时，强制阻断
          setError('授权验证失败')
          setErrorDetails('State参数不匹配，可能存在CSRF攻击风险。请从登录页面重新授权。')
          sessionStorage.removeItem('oauth_state')
          setTimeout(() => navigate('/login'), 3000)
          return
        }
        // 开发环境且配置了跳过，仅警告继续
        console.warn('⚠️ 开发环境跳过State验证，生产环境此请求会被拒绝')
      }

      try {
        // Step 1: Exchange OAuth code
        setStep('正在交换授权码...')
        console.log('🔵 Step 1: Exchanging OAuth code...')
        console.log('  - Code:', `${code.substring(0, 30)  }...`)

        // 传递state给后端用于安全审计
        const exchangeResult = await exchangeOAuthCode(code, state || undefined)
        console.log('✅ Step 1 Success: OAuth code exchanged', exchangeResult)

        // 清除保存的state
        sessionStorage.removeItem('oauth_state')

        // Step 2: Fetch user info
        setStep('正在获取用户信息...')
        console.log('🔵 Step 2: Fetching user info...')

        // 检查 cookie 是否已设置
        console.log('📝 Current cookies:', document.cookie)

        await fetchUser()
        console.log('✅ Step 2 Success: User info fetched')

        // Step 3: Navigate to dashboard
        setStep('登录成功，正在跳转...')
        console.log('🔵 Step 3: Navigating to dashboard...')
        navigate('/dashboard', { replace: true })
      } catch (err) {
        console.error('❌ OAuth callback error:', err)
        const errorObj = err as {
          message?: string;
          response?: { data?: { message?: string; code?: number }; status?: number };
          stack?: string
        }

        const errorInfo = {
          message: errorObj.message || String(err),
          responseData: errorObj.response?.data,
          status: errorObj.response?.status,
        }
        console.error('  - Error details:', errorInfo)

        // 根据错误类型设置不同的提示
        let userError = '登录失败，请重试'
        let details = ''

        if (errorObj.response?.status === 401) {
          userError = '认证失败'
          details = '会话可能已过期或Cookie未正确设置'
        } else if (errorObj.response?.status === 500) {
          userError = '服务器错误'
          details = errorObj.response?.data?.message || '后端处理出错'
        } else if (!errorObj.response) {
          userError = '网络错误'
          details = '无法连接到服务器'
        } else {
          details = errorObj.response?.data?.message || errorObj.message || ''
        }

        setError(userError)
        setErrorDetails(details)
        setTimeout(() => navigate('/login'), 5000)
      }
    }

    handleCallback()
  }, [navigate, fetchUser])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          {errorDetails && (
            <p className="text-sm text-gray-500 mb-2 bg-gray-100 p-2 rounded">{errorDetails}</p>
          )}
          <p className="text-gray-600">5秒后返回登录页...</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            立即返回登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">正在登录...</h2>
        <p className="text-gray-600">{step}</p>
      </div>
    </div>
  )
}
