import { useState, useEffect } from 'react'
import { LogIn, Zap, Shield, BarChart3, TrendingUp, Users, Target, ArrowRight, Star, Rocket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function Login() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  const handleOAuthLogin = () => {
    const appId = import.meta.env.VITE_OAUTH_APP_ID
    
    // 校验配置
    if (!appId || appId === 'YOUR_APP_ID_HERE') {
      alert('请先配置OAuth AppID\n\n修改文件: frontend/.env\n设置: VITE_OAUTH_APP_ID=您的实际AppID')
      return
    }
    
    const redirectUri = encodeURIComponent(import.meta.env.VITE_OAUTH_REDIRECT_URI)
    const state = Math.random().toString(36).substring(7)
    
    // 存储state用于回调验证
    sessionStorage.setItem('oauth_state', state)
    
    // 跳转到千川OAuth授权页
    const oauthUrl = `https://qianchuan.jinritemai.com/openapi/qc/audit/oauth.html?app_id=${appId}&state=${state}&material_auth=1&redirect_uri=${redirectUri}`
    window.location.href = oauthUrl
  }

  const features = [
    {
      icon: Shield,
      title: '企业级安全',
      description: 'OAuth 2.0 标准授权，数据加密传输',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: '智能分析',
      description: '实时数据报表，深度洞察广告效果',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Rocket,
      title: '高效投放',
      description: '一站式管理，快速创建和优化广告',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { label: '广告主', value: '10,000+', icon: Users },
    { label: '日均投放', value: '¥500万+', icon: TrendingUp },
    { label: '转化率提升', value: '35%', icon: Target }
  ]

  const testimonials = [
    { name: '电商品牌 A', content: '投放效率提升 50%，ROI 显著改善', rating: 5 },
    { name: '本地生活 B', content: '界面简洁易用，数据分析很专业', rating: 5 },
    { name: '教育机构 C', content: '客服响应快，功能持续优化', rating: 5 }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 pb-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Main content */}
      <div className={`relative z-10 w-full max-w-7xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Left side - Branding (3 columns) */}
          <div className="hidden lg:block lg:col-span-3 space-y-8">
            {/* Logo & Title */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl">
                    <Zap className="h-11 w-11 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    千川SDK管理平台
                  </h1>
                  <p className="text-base text-muted-foreground mt-2">
                    Qianchuan SDK Management Platform
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-foreground leading-tight">
                智能广告投放，助力业务增长
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                专为千川广告主打造的一站式管理平台，提供账户管理、广告投放、数据分析等全流程服务，让广告投放更简单、更高效。
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-2">
                    <stat.icon className="h-6 w-6 text-primary" />
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">核心功能</h3>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start gap-4 p-5 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">用户评价</h3>
              <div className="grid gap-3">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-border/30"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                        <div className="flex gap-0.5">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{testimonial.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Login card (2 columns) */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur-sm bg-white/95">
              <CardContent className="p-8 space-y-6">
                {/* Mobile logo */}
                <div className="lg:hidden text-center space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-md opacity-50" />
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                      <Zap className="h-9 w-9 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    千川SDK管理平台
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    广告投放全流程管理系统
                  </p>
                </div>

                {/* Welcome text */}
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    欢迎回来 👋
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    使用千川账号登录以继续
                  </p>
                </div>

                {/* Features list for mobile */}
                <div className="lg:hidden space-y-3 py-2">
                  {[
                    { icon: Shield, text: 'OAuth 2.0 安全认证' },
                    { icon: BarChart3, text: '实时数据报表分析' },
                    { icon: Rocket, text: '一站式广告投放' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Login button */}
                <Button
                  onClick={handleOAuthLogin}
                  className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  使用千川账号登录
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-muted-foreground">安全登录</span>
                  </div>
                </div>

                {/* Info text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg p-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>首次使用需要授权访问千川广告账户</span>
                  </div>
                  <p className="text-center text-xs text-muted-foreground leading-relaxed">
                    登录即表示您同意我们的
                    <a href="#" className="text-primary hover:underline">服务条款</a>
                    和
                    <a href="#" className="text-primary hover:underline">隐私政策</a>
                  </p>
                </div>

                {/* Mobile stats */}
                <div className="lg:hidden grid grid-cols-3 gap-3 pt-2">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-6 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-sm text-muted-foreground">
          © 2025 千川SDK管理平台 · Powered by 
          <span className="font-semibold text-primary"> Qianchuan API</span>
        </p>
      </div>
    </div>
  )
}
