import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Building2, Users, CreditCard, Plus, RefreshCw, Eye, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { getAdvertiserList, getShopInfo, getAgentInfo } from '@/api/advertiser'
import { Advertiser } from '@/api/types'
import { useToast } from '@/hooks/useToast'

interface ShopAccount {
  shop_id: string
  shop_name: string
  shop_type: string
  advertiser_count: number
  aweme_count: number
  status: string
}

interface AgentAccount {
  agent_id: string
  agent_name: string
  company: string
  advertiser_count: number
  total_balance: number
}

interface AwemeAccount {
  aweme_id: string
  aweme_name: string
  aweme_avatar: string
  followers_count: number
  auth_status: string
  shop_name?: string
}

export default function AccountCenter() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // 数据状态
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [shops, setShops] = useState<ShopAccount[]>([])
  const [agents, setAgents] = useState<AgentAccount[]>([])
  const [awemes, setAwemes] = useState<AwemeAccount[]>([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // 获取广告主列表
      const advertiserResponse = await getAdvertiserList({ page: 1, page_size: 50 })
      setAdvertisers(advertiserResponse.list || [])

      // Mock店铺数据
      const mockShops: ShopAccount[] = [
        {
          shop_id: 'shop_001',
          shop_name: '美妆旗舰店',
          shop_type: 'DOUYIN_SHOP',
          advertiser_count: 3,
          aweme_count: 5,
          status: 'NORMAL'
        },
        {
          shop_id: 'shop_002',
          shop_name: '服饰专卖店',
          shop_type: 'DOUYIN_SHOP',
          advertiser_count: 2,
          aweme_count: 3,
          status: 'NORMAL'
        },
        {
          shop_id: 'shop_003',
          shop_name: '数码生活馆',
          shop_type: 'DOUYIN_SHOP',
          advertiser_count: 4,
          aweme_count: 6,
          status: 'NORMAL'
        }
      ]
      setShops(mockShops)

      // Mock代理商数据
      const mockAgents: AgentAccount[] = [
        {
          agent_id: 'agent_001',
          agent_name: '星河传媒',
          company: 'XX营销科技有限公司',
          advertiser_count: 8,
          total_balance: 125000
        },
        {
          agent_id: 'agent_002',
          agent_name: '云端广告',
          company: 'YY广告传媒集团',
          advertiser_count: 5,
          total_balance: 89000
        }
      ]
      setAgents(mockAgents)

      // Mock抖音号数据
      const mockAwemes: AwemeAccount[] = [
        {
          aweme_id: 'aweme_001',
          aweme_name: '@xiaomei_beauty',
          aweme_avatar: 'https://via.placeholder.com/48',
          followers_count: 125600,
          auth_status: 'AUTHORIZED',
          shop_name: '美妆旗舰店'
        },
        {
          aweme_id: 'aweme_002',
          aweme_name: '@fashion_store',
          aweme_avatar: 'https://via.placeholder.com/48',
          followers_count: 89300,
          auth_status: 'AUTHORIZED',
          shop_name: '服饰专卖店'
        },
        {
          aweme_id: 'aweme_003',
          aweme_name: '@tech_life',
          aweme_avatar: 'https://via.placeholder.com/48',
          followers_count: 67800,
          auth_status: 'AUTHORIZED',
          shop_name: '数码生活馆'
        }
      ]
      setAwemes(mockAwemes)

    } catch (error) {
      console.error('Failed to fetch account data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 统计数据
  const stats = [
    {
      title: '授权店铺',
      value: shops.length,
      subtitle: `${shops.filter(s => s.status === 'NORMAL').length}个正常`,
      icon: Store,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      onClick: () => setActiveTab('shops')
    },
    {
      title: '代理商',
      value: agents.length,
      subtitle: `管理${agents.reduce((sum, a) => sum + a.advertiser_count, 0)}个账户`,
      icon: Building2,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      onClick: () => setActiveTab('agents')
    },
    {
      title: '授权抖音号',
      value: awemes.length,
      subtitle: `${awemes.filter(a => a.auth_status === 'AUTHORIZED').length}个已授权`,
      icon: Users,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      onClick: () => setActiveTab('awemes')
    },
    {
      title: '广告账户',
      value: advertisers.length,
      subtitle: `${advertisers.filter(a => a.status === 'ENABLE').length}个启用`,
      icon: CreditCard,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      onClick: () => setActiveTab('advertisers')
    }
  ]

  if (loading) {
    return <Loading size="lg" text="加载账户数据..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏢 账户中心"
        description="统一管理店铺、代理商、抖音号和广告账户"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户中心' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAllData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button onClick={() => navigate('/account/budget')}>
              <Settings className="h-4 w-4 mr-2" />
              预算管理
            </Button>
          </div>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={stat.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="shops">店铺</TabsTrigger>
          <TabsTrigger value="agents">代理商</TabsTrigger>
          <TabsTrigger value="awemes">抖音号</TabsTrigger>
          <TabsTrigger value="advertisers">广告账户</TabsTrigger>
        </TabsList>

        {/* 总览 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 关联关系图 */}
            <Card>
              <CardHeader>
                <CardTitle>账户关联关系</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shops.slice(0, 3).map((shop) => (
                    <div key={shop.shop_id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Store className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{shop.shop_name}</div>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span>{shop.advertiser_count} 个广告账户</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{shop.aweme_count} 个抖音号</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/shops/${shop.shop_id}`)}
                        >
                          查看
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/aweme-auth/add')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加抖音号授权
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/account/budget')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    账户预算管理
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/operation-log')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    查看操作日志
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/advertisers')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    广告主列表
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 店铺列表 */}
        <TabsContent value="shops">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>店铺列表 ({shops.length})</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加店铺
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shops.map((shop) => (
                  <div key={shop.shop_id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-lg">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">{shop.shop_name}</div>
                          <div className="text-sm text-gray-500">ID: {shop.shop_id}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className="bg-green-100 text-green-800">
                              {shop.status === 'NORMAL' ? '正常' : shop.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {shop.advertiser_count} 个账户
                            </span>
                            <span className="text-sm text-gray-600">
                              {shop.aweme_count} 个抖音号
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/shops/${shop.shop_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 代理商列表 */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>代理商列表 ({agents.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.agent_id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500 rounded-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">{agent.agent_name}</div>
                          <div className="text-sm text-gray-500">{agent.company}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">
                              管理 {agent.advertiser_count} 个账户
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              ¥{agent.total_balance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/agents/${agent.agent_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 抖音号列表 */}
        <TabsContent value="awemes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>抖音号列表 ({awemes.length})</CardTitle>
                <Button size="sm" onClick={() => navigate('/aweme-auth/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加授权
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {awemes.map((aweme) => (
                  <div key={aweme.aweme_id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                          {aweme.aweme_name[1]}
                        </div>
                        <div>
                          <div className="font-medium text-lg">{aweme.aweme_name}</div>
                          <div className="text-sm text-gray-500">
                            粉丝: {(aweme.followers_count / 1000).toFixed(1)}K
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className="bg-green-100 text-green-800">
                              {aweme.auth_status === 'AUTHORIZED' ? '已授权' : '未授权'}
                            </Badge>
                            {aweme.shop_name && (
                              <span className="text-sm text-blue-600">{aweme.shop_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          详情
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 广告账户列表 */}
        <TabsContent value="advertisers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>广告账户列表 ({advertisers.length})</CardTitle>
                <Button size="sm" onClick={() => navigate('/advertisers')}>
                  查看全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advertisers.slice(0, 10).map((advertiser) => (
                  <div key={advertiser.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500 rounded-lg">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">{advertiser.name}</div>
                          <div className="text-sm text-gray-500">{advertiser.company || '无公司信息'}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={advertiser.status === 'ENABLE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {advertiser.status === 'ENABLE' ? '启用' : '禁用'}
                            </Badge>
                            <span className="text-sm font-semibold text-green-600">
                              ¥{advertiser.balance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/advertisers/${advertiser.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
