import { useState, useEffect } from 'react'
import { Zap, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export default function Login() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  const handleOAuthLogin = () => {
    console.log('🎯 [Login] handleOAuthLogin called')
    const appId = import.meta.env.VITE_OAUTH_APP_ID
    const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI

    console.log('📋 [Login] Environment check:', {
      appId: appId,
      redirectUri: redirectUri,
      env: import.meta.env
    })

    // 校验配置
    if (!appId || appId === 'YOUR_APP_ID_HERE') {
      console.error('❌ [Login] App ID not configured:', appId)
      alert('请先配置OAuth AppID\n\n修改文件: frontend/.env\n设置: VITE_OAUTH_APP_ID=您的实际AppID')
      return
    }

    const state = Math.random().toString(36).substring(7)

    // 存储state用于回调验证
    sessionStorage.setItem('oauth_state', state)
    console.log('✅ [Login] State saved:', state)

    // 跳转到千川OAuth授权页
    // rid参数从千川平台获取，用于标识授权请求
    // 注意：rid是可选参数，移除硬编码值，让系统自动处理
    const encodedRedirectUri = encodeURIComponent(redirectUri)
    const oauthUrl = `https://qianchuan.jinritemai.com/openapi/qc/audit/oauth.html?app_id=${appId}&state=${state}&material_auth=1&redirect_uri=${encodedRedirectUri}`

    console.log('🚀 [Login] Redirecting to OAuth URL:', oauthUrl)
    console.log('📌 [Login] Opening URL in current window')
    window.location.href = oauthUrl
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 pb-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      {/* Main content */}
      <div className={`max-w-md w-full mx-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Brand Logo at top */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Zap className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">千川SDK管理平台</h1>
          <p className="text-white text-opacity-90">巨量千川 · 直播电商推广</p>
        </div>

        {/* Login Card - simplified */}
        <Card className="shadow-2xl border-0 bg-white rounded-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Application info */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center border-2 border-red-200">
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-2xl">🎯</div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">第三方应用请求授权</h2>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-red-600">千川SDK管理平台</span> 
                希望获得您千川账户的访问权限
              </p>
            </div>

            {/* Permissions */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                应用将获得以下权限
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <input type="checkbox" checked disabled className="mt-1 mr-3 w-4 h-4 text-red-500 rounded cursor-not-allowed" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">基础权限（必需）</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      读取账户信息、查看推广数据、管理推广计划
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <input type="checkbox" checked readOnly className="mt-1 mr-3 w-4 h-4 text-red-500 rounded" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">素材权限（推荐）</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      上传、管理广告素材（图片、视频）
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">安全提示</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    授权后，应用将能够代表您进行广告投放操作。请确保您信任该应用。您可以随时在账户设置中撤销授权。
                  </p>
                </div>
              </div>
            </div>

            {/* Auth button */}
            <button
              onClick={handleOAuthLogin}
              className="w-full py-3 text-base font-semibold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              同意并授权
            </button>

            {/* Privacy policy */}
            <p className="text-xs text-center text-gray-500">
              授权即表示您同意 
              <a href="#" className="text-red-500 hover:underline">《千川开放平台用户协议》</a> 和 
              <a href="#" className="text-red-500 hover:underline">《隐私政策》</a>
            </p>
          </CardContent>
        </Card>

        {/* Bottom security badge */}
        <div className="text-center mt-6">
          <p className="text-white text-opacity-80 text-sm flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256位SSL加密传输 · 数据安全保护
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-6 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-sm text-white text-opacity-80">
          © 2025 千川SDK管理平台 · Powered by 
          <span className="font-semibold"> Qianchuan API</span>
        </p>
      </div>
    </div>
  )
}
