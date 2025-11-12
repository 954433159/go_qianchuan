import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAdvertiserInfo } from '@/api/advertiser'
import { Advertiser } from '@/api/types'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ArrowLeft, Building2, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function AdvertiserDetail() {
  const { id } = useParams<{ id: string }>()
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (id) {
      fetchAdvertiserDetail(parseInt(id))
    }
  }, [id])

  const fetchAdvertiserDetail = async (advertiserId: number) => {
    setLoading(true)
    setError(false)
    try {
      const response = await getAdvertiserInfo(advertiserId)
      setAdvertiser(response.data)
    } catch (err) {
      console.error('Failed to fetch advertiser detail:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text="加载广告主详情..." />
  }

  if (error || !advertiser) {
    return (
      <ErrorState
        title="加载失败"
        description="无法加载广告主详情，请稍后重试"
        action={{
          label: '重新加载',
          onClick: () => fetchAdvertiserDetail(parseInt(id!)),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={advertiser.name}
        description={`广告主 ID: ${advertiser.id}`}
        breadcrumbs={[
          { label: '工作台', href: '/dashboard' },
          { label: '广告主', href: '/advertisers' },
          { label: advertiser.name },
        ]}
        actions={
          <Link to="/advertisers">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </Link>
        }
      />

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>基本信息</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">广告主名称</p>
              <p className="font-medium">{advertiser.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">公司名称</p>
              <p className="font-medium">{advertiser.company}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">角色</p>
              <Badge variant="secondary">{advertiser.role}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">状态</p>
              <div className="flex items-center gap-2">
                {advertiser.status === 'ENABLE' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      启用
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-600" />
                    <Badge variant="secondary">禁用</Badge>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">创建时间</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{advertiser.create_time}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Balance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <CardTitle>账户余额</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">
              ¥{(advertiser.balance / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground">元</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            账户余额以分为单位存储，显示已转换为元
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={`/campaigns?advertiser_id=${advertiser.id}`}>
              <Button variant="outline" className="w-full">
                查看广告计划
              </Button>
            </Link>
            <Link to={`/ads?advertiser_id=${advertiser.id}`}>
              <Button variant="outline" className="w-full">
                查看广告
              </Button>
            </Link>
            <Link to={`/creatives?advertiser_id=${advertiser.id}`}>
              <Button variant="outline" className="w-full">
                查看创意
              </Button>
            </Link>
            <Link to={`/reports?advertiser_id=${advertiser.id}`}>
              <Button variant="outline" className="w-full">
                查看报表
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
