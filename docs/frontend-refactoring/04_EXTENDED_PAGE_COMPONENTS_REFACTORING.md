# 前端重构方案 04 - 扩展功能页面组件实现

> **目标**: 实现扩展业务页面（直播、商品、随心推、全域推广、财务、达人中心等）

## 📋 页面清单

### 高优先级页面 (P1)
1. **Products** - 商品管理
2. **Live Rooms** - 直播间管理
3. **Uni Promotions** - 全域推广
4. **Suixintui** - 随心推

### 中优先级页面 (P2)
5. **Finance** - 财务管理
6. **Aweme Accounts** - 抖音号管理
7. **Brands** - 品牌管理
8. **Shops** - 店铺管理

### 低优先级页面 (P3)
9. **Authors** - 达人中心
10. **OAuth** - 授权管理

---

## 1. Products 页面实现

### 页面结构
```tsx
<ProductsPage>
  <PageHeader title="商品库" />
  <StatsGrid>
    <StatCard label="商品总数" value={1248} />
    <StatCard label="可投商品" value={856} />
    <StatCard label="热销商品" value={124} />
    <StatCard label="本月GMV" value="¥2.4M" />
  </StatsGrid>
  <FilterPanel>
    <SearchInput />
    <CategoryFilter />
    <StatusFilter />
    <PriceRangeFilter />
  </FilterPanel>
  <ProductGrid />
</ProductsPage>
```

### ProductCard 组件
```tsx
interface Product {
  id: string
  name: string
  image: string
  price: number
  sales: number
  stock: number
  category: string
  status: 'available' | 'unavailable'
  promotionCount: number
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="qc-card">
      <img src={product.image} className="aspect-square object-cover rounded-lg" />
      <h4 className="font-semibold mt-2">{product.name}</h4>
      <p className="text-qc-red text-lg font-bold">¥{product.price}</p>
      <div className="flex gap-2 text-sm text-gray-600">
        <span>销量: {product.sales}</span>
        <span>库存: {product.stock}</span>
      </div>
      <button className="qc-btn qc-btn-primary w-full mt-2">添加到推广</button>
    </div>
  )
}
```

---

## 2. Live Rooms 页面实现

### 页面结构
```tsx
<LiveRoomsPage>
  <PageHeader title="直播间管理" />
  <LiveStatusBar>
    <LiveCounter status="live" count={3} />
    <LiveCounter status="scheduled" count={5} />
    <LiveCounter status="ended" count={12} />
  </LiveStatusBar>
  <LiveRoomGrid />
</LiveRoomsPage>
```

### LiveRoomCard 组件
```tsx
interface LiveRoom {
  id: string
  name: string
  awemeName: string
  status: 'live' | 'scheduled' | 'ended'
  startTime: string
  viewers: number
  sales: number
  products: number
  thumbnail: string
}

export function LiveRoomCard({ room }: { room: LiveRoom }) {
  return (
    <div className="qc-card">
      <div className="relative">
        <img src={room.thumbnail} className="aspect-video object-cover rounded-lg" />
        {room.status === 'live' && (
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
            <span className="qc-live-dot"></span>
            直播中
          </div>
        )}
        {room.status === 'live' && (
          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
            {room.viewers.toLocaleString()} 人观看
          </div>
        )}
      </div>
      <h4 className="font-semibold mt-3">{room.name}</h4>
      <p className="text-sm text-gray-600">主播: {room.awemeName}</p>
      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
        <div className="text-center">
          <p className="text-gray-600">观看</p>
          <p className="font-semibold">{formatNumber(room.viewers)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">商品</p>
          <p className="font-semibold">{room.products}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">销售额</p>
          <p className="font-semibold text-success">¥{formatNumber(room.sales)}</p>
        </div>
      </div>
    </div>
  )
}
```

---

## 3. Uni Promotions 页面实现

### 页面结构
```tsx
<UniPromotionsPage>
  <PageHeader 
    title="全域推广" 
    description="跨直播间、短视频全场景推广"
    actions={<CreateButton />}
  />
  <StatsGrid>
    <StatCard label="推广中" value={12} />
    <StatCard label="今日消耗" value="¥24.5K" />
    <StatCard label="今日GMV" value="¥486K" />
    <StatCard label="ROI" value={19.8} />
  </StatsGrid>
  <FilterPanel />
  <UniPromotionList />
</UniPromotionsPage>
```

### UniPromotionCard 组件
```tsx
interface UniPromotion {
  id: string
  name: string
  awemeId: string
  awemeName: string
  status: 'active' | 'paused'
  objective: 'product' | 'live'
  budget: number
  spent: number
  gmv: number
  roi: number
  scenes: string[]  // ['直播间', '短视频', '商品详情页']
}

export function UniPromotionCard({ promotion }: { promotion: UniPromotion }) {
  return (
    <div className="qc-card qc-card-interactive">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-lg">{promotion.name}</h4>
          <p className="text-sm text-gray-600">抖音号: {promotion.awemeName}</p>
        </div>
        <StatusBadge status={promotion.status} />
      </div>
      
      {/* 投放场景 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {promotion.scenes.map(scene => (
          <span key={scene} className="qc-badge qc-badge-info">{scene}</span>
        ))}
      </div>
      
      {/* 数据指标 */}
      <div className="grid grid-cols-4 gap-3">
        <MetricBox label="预算" value={`¥${promotion.budget}`} />
        <MetricBox label="消耗" value={`¥${promotion.spent}`} />
        <MetricBox label="GMV" value={`¥${promotion.gmv}`} />
        <MetricBox label="ROI" value={promotion.roi} className="qc-roi-excellent" />
      </div>
    </div>
  )
}
```

---

## 4. Suixintui 页面实现

### 页面结构
```tsx
<SuixintuiPage>
  <PageHeader 
    title="随心推" 
    description="快速提升短视频和直播热度"
    actions={<CreateOrderButton />}
  />
  <QuickActions>
    <ActionCard title="效果预估" icon={<Calculator />} />
    <ActionCard title="建议出价" icon={<DollarSign />} />
    <ActionCard title="配额查询" icon={<Info />} />
  </QuickActions>
  <OrderList />
</SuixintuiPage>
```

### SuixintuiOrderCard 组件
```tsx
interface SuixintuiOrder {
  id: string
  name: string
  type: 'video' | 'live'
  videoTitle?: string
  thumbnail: string
  status: 'active' | 'completed' | 'terminated'
  budget: number
  spent: number
  startTime: string
  endTime: string
  views: number
  likes: number
  shares: number
}

export function SuixintuiOrderCard({ order }: { order: SuixintuiOrder }) {
  return (
    <div className="qc-card">
      <div className="flex gap-4">
        <img src={order.thumbnail} className="w-32 h-32 object-cover rounded-lg" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold">{order.name}</h4>
              {order.videoTitle && (
                <p className="text-sm text-gray-600">{order.videoTitle}</p>
              )}
            </div>
            <StatusBadge status={order.status} />
          </div>
          
          <div className="grid grid-cols-4 gap-3 mt-3">
            <MetricBox label="预算" value={`¥${order.budget}`} />
            <MetricBox label="已花费" value={`¥${order.spent}`} />
            <MetricBox label="观看" value={formatNumber(order.views)} />
            <MetricBox label="互动" value={formatNumber(order.likes + order.shares)} />
          </div>
          
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{order.startTime} - {order.endTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Finance 页面实现

### 钱包页面
```tsx
<FinanceWalletPage>
  <PageHeader title="资金管理" />
  
  {/* 账户余额 */}
  <Card className="qc-card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
    <CardContent className="p-6">
      <p className="text-sm text-gray-600 mb-2">账户余额</p>
      <p className="text-5xl font-bold qc-text-gradient mb-4">
        ¥{balance.toLocaleString()}
      </p>
      <div className="flex gap-3">
        <button className="qc-btn qc-btn-primary">充值</button>
        <button className="qc-btn qc-btn-secondary">提现</button>
        <button className="qc-btn qc-btn-secondary">明细</button>
      </div>
    </CardContent>
  </Card>
  
  {/* 交易记录 */}
  <TransactionList />
</FinanceWalletPage>
```

---

## 6. Authors 页面实现

### 达人搜索页面
```tsx
<AuthorSearchPage>
  <PageHeader title="达人搜索" />
  
  <SearchPanel>
    <Input placeholder="搜索达人昵称、抖音号" />
    <CategoryFilter />
    <FansRangeFilter />
    <PriceRangeFilter />
  </SearchPanel>
  
  <AuthorGrid>
    {authors.map(author => (
      <AuthorCard key={author.id} author={author} />
    ))}
  </AuthorGrid>
</AuthorSearchPage>
```

### AuthorCard 组件
```tsx
interface Author {
  id: string
  name: string
  avatar: string
  fans: number
  category: string
  avgPrice: number
  avgViews: number
  cooperationCount: number
}

export function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="qc-card text-center">
      <img src={author.avatar} className="w-20 h-20 rounded-full mx-auto mb-3" />
      <h4 className="font-semibold">{author.name}</h4>
      <p className="text-sm text-gray-600">{author.category}</p>
      
      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
        <div>
          <p className="text-gray-600">粉丝</p>
          <p className="font-semibold">{formatNumber(author.fans)}</p>
        </div>
        <div>
          <p className="text-gray-600">场均观看</p>
          <p className="font-semibold">{formatNumber(author.avgViews)}</p>
        </div>
      </div>
      
      <div className="mt-3 text-qc-red font-semibold">
        ¥{author.avgPrice.toLocaleString()} / 场
      </div>
      
      <button className="qc-btn qc-btn-primary w-full mt-3">联系合作</button>
    </div>
  )
}
```

---

## 实施时间表

| 页面 | 优先级 | 预计时间 | 依赖 |
|------|--------|---------|------|
| Products | P1 | 3天 | 商品API |
| Live Rooms | P1 | 3天 | 直播API |
| Uni Promotions | P1 | 4天 | 全域API |
| Suixintui | P1 | 3天 | 随心推API |
| Finance | P2 | 2天 | 财务API |
| Aweme Accounts | P2 | 2天 | 抖音号API |
| Brands | P2 | 2天 | 品牌API |
| Shops | P2 | 2天 | 店铺API |
| Authors | P3 | 3天 | 达人API |
| OAuth | P3 | 2天 | OAuth API |

**总计**: 26天（约5-6周，2-3人并行）

---

**文档版本**: v1.0  
**创建日期**: 2025-11-11  
**负责人**: 前端团队
