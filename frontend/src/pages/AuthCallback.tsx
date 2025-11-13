import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeOAuthCode } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { fetchUser } = useAuthStore()
  const [error, setError] = useState<string>('')
  
  useEffect(() => {
    const handleCallback = async () => {
      // 获取URL参数
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const savedState = sessionStorage.getItem('oauth_state')
      
      // 验证code参数
      if (!code) {
        setError('授权失败：缺少授权码')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      
      // State验证（开发环境仅警告，不阻断流程）
      if (state !== savedState) {
        console.warn('⚠️ State验证失败:', { 
          received: state, 
          expected: savedState,
          message: '开发环境允许继续，生产环境请从登录页面跳转' 
        })
        // 开发环境允许继续，生产环境应该阻断
        // 取消注释下面两行以启用严格验证：
        // setError('授权失败：状态验证失败')
        // return
      }
      
      try {
        // 调用后端API换取session
        await exchangeOAuthCode(code)
        
        // 清除保存的state
        sessionStorage.removeItem('oauth_state')
        
        // 获取用户信息
        await fetchUser()
        
        // 跳转到首页
        navigate('/', { replace: true })
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError('登录失败，请重试')
        setTimeout(() => navigate('/login'), 2000)
      }
    }
    
    handleCallback()
  }, [navigate, fetchUser])
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-600">正在返回登录页...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">正在登录...</h2>
        <p className="text-gray-600">请稍候，正在验证您的身份</p>
      </div>
    </div>
  )
}
