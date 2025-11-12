import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getShopInfo } from '@/api/advertiser'
import { Store, CheckCircle, Users, CreditCard, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Loading, Button, Badge } from '@/components/ui'

interface ShopDetail {
  shop_id: string
  shop_name: string
  shop_type: string
  status: string
  product_count: number
  authorized_advertiser_count: number
  authorized_aweme_count: number
  create_time: string
  auth_time: string
  new_customer_targeting: boolean
}

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState<ShopDetail | null>(null)

  useEffect(() => {
    if (id) {
      fetchShopDetail(id)
    }
  }, [id])

  const fetchShopDetail = async (shopId: string) => {
    setLoading(true)
    try {
      // Mock数据
      const mockShop: ShopDetail = {
        shop_id: shopId,
        shop_name: '美妆旗舰店',
        shop_type: 'DOUYIN_SHOP',
        status: 'NORMAL',
        product_count: 156,
        authorized_advertiser_count: 3,
        authorized_aweme_count: 5,
        create_time: '2023-06-15 10:30:00',
        auth_time: '2024-01-15 14:30:25',
        new_customer_targeting: true
      }
      setShop(mockShop)
    } catch (error) {
      console.error('Failed to fetch shop detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading size="lg" text="加载店铺详情..." />
  }

  if (!shop) {
    return <div>店铺不存在</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={shop.shop_name}
        description={`店铺ID: ${shop.shop_id}`}
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '账户管理', href: '/advertisers' },
          { label: '店铺详情' }
        ]}
        actions={
          <Link to="/advertisers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Button>
          </Link>
        }
      />

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <CardTitle>店铺信息</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">店铺名称</p>
              <p className="font-medium">{shop.shop_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">店铺ID</p>
              <p className="font-mono text-sm">{shop.shop_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">店铺类型</p>
              <Badge variant="secondary">
                {shop.shop_type === 'DOUYIN_SHOP' ? '抖音小店' : '其他'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">状态</p>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                {shop.status === 'NORMAL' ? '正常' : shop.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">商品数量</p>
              <p className="font-medium">{shop.product_count} 个</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">创建时间</p>
              <p className="font-medium">{shop.create_time}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authorization Info */}
      <Card>
        <CardHeader>
          <CardTitle>授权信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">关联广告账户</span>
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {shop.authorized_advertiser_count}
              </div>
              <p className="text-xs text-gray-500 mt-1">个账户</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">授权抖音号</span>
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {shop.authorized_aweme_count}
              </div>
              <p className="text-xs text-gray-500 mt-1">个抖音号</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">新客定向</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {shop.new_customer_targeting ? '已开启' : '未开启'}
              </div>
              <p className="text-xs text-gray-500 mt-1">授权状态</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>授权时间：</strong>{shop.auth_time}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>授权有效期：</strong>永久（可随时解除）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Advertisers */}
      <Card>
        <CardHeader>
          <CardTitle>关联广告账户</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">广告账户 {idx}</div>
                  <div className="text-sm text-gray-500">ID: 187654321098765{idx}</div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">启用</Badge>
                  <Button size="sm" variant="outline">查看</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Aweme Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>授权抖音号</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: '@xiaomei_beauty', fans: '125.6K' },
              { name: '@beauty_tips', fans: '89.3K' },
              { name: '@makeup_expert', fans: '67.8K' }
            ].map((aweme, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {aweme.name[1]}
                  </div>
                  <div>
                    <div className="font-medium">{aweme.name}</div>
                    <div className="text-sm text-gray-500">粉丝: {aweme.fans}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">已授权</Badge>
                  <Button size="sm" variant="outline">详情</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              刷新授权
            </Button>
            <Button variant="outline">
              新客定向设置
            </Button>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              解除店铺授权
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
