# 前端重构方案 09 - 数据可视化增强

## 当前数据可视化方案

**技术栈**: Tremor React (基于 Recharts)

**已实现图表**:
- AreaChart (面积图)
- BarChart (柱状图)
- LineChart (折线图)
- DonutChart (环形图)

## 静态页面数据可视化分析

### Chart.js 配置分析

```javascript
// 静态页面使用 Chart.js 3.x
{
  type: 'line',
  data: {
    labels: [...],
    datasets: [{
      data: [...],
      borderColor: 'rgb(239, 68, 68)', // 千川红
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4, // 曲线平滑度
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ef4444',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '¥' + value.toLocaleString()
        }
      }
    }
  }
}
```

## Tremor 配置增强

### 1. 主题定制

```typescript
// lib/chartTheme.ts
export const qianchuanChartTheme = {
  colors: {
    primary: ['#ef4444', '#f97316', '#fb923c'],
    secondary: ['#64748b', '#94a3b8', '#cbd5e1'],
    success: ['#10b981', '#34d399', '#6ee7b7'],
    warning: ['#f59e0b', '#fbbf24', '#fcd34d'],
    danger: ['#ef4444', '#f87171', '#fca5a5']
  },
  grid: {
    strokeDasharray: '3 3',
    stroke: '#e2e8f0'
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderColor: '#ef4444',
    borderWidth: 1
  }
}

// 应用主题
<AreaChart
  data={data}
  categories={['GMV', '花费']}
  colors={qianchuanChartTheme.colors.primary}
  valueFormatter={(value) => `¥${value.toLocaleString()}`}
/>
```

### 2. 图表包装组件

```typescript
// components/charts/QCAreaChart.tsx
export function QCAreaChart({
  data,
  categories,
  showLegend = false,
  valueFormatter,
  ...props
}: Props) {
  return (
    <AreaChart
      data={data}
      categories={categories}
      colors={['#ef4444', '#f97316']}
      showLegend={showLegend}
      showGridLines={true}
      curveType="natural"
      valueFormatter={valueFormatter}
      className="h-72"
      {...props}
    />
  )
}

// components/charts/QCLineChart.tsx
export function QCLineChart({
  data,
  categories,
  showPoints = true,
  ...props
}: Props) {
  return (
    <LineChart
      data={data}
      categories={categories}
      colors={['#ef4444']}
      showAnimation={true}
      showGridLines={true}
      connectNulls={true}
      curveType="monotone"
      {...props}
    />
  )
}

// components/charts/QCBarChart.tsx
export function QCBarChart({
  data,
  categories,
  layout = 'vertical',
  ...props
}: Props) {
  return (
    <BarChart
      data={data}
      categories={categories}
      colors={['#ef4444', '#f97316']}
      layout={layout}
      showAnimation={true}
      {...props}
    />
  )
}
```

### 3. 自定义图表

#### GMV趋势图

```typescript
// components/charts/GMVTrendChart.tsx
export function GMVTrendChart({ data, range }: Props) {
  const chartData = data.map(d => ({
    日期: format(d.date, 'MM-dd'),
    GMV: d.gmv,
    目标: d.target
  }))
  
  return (
    <div className="qc-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">GMV趋势</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-qc-red" />
            <span className="text-sm">实际GMV</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm">目标GMV</span>
          </div>
        </div>
      </div>
      
      <QCAreaChart
        data={chartData}
        categories={['GMV', '目标']}
        valueFormatter={(val) => `¥${(val / 10000).toFixed(1)}万`}
      />
    </div>
  )
}
```

#### ROI分布图

```typescript
// components/charts/ROIDistributionChart.tsx
export function ROIDistributionChart({ data }: Props) {
  const distribution = [
    { 
      name: '优秀 (>5)', 
      count: data.filter(d => d.roi > 5).length,
      color: '#10b981'
    },
    { 
      name: '良好 (3-5)', 
      count: data.filter(d => d.roi >= 3 && d.roi <= 5).length,
      color: '#f59e0b'
    },
    { 
      name: '较差 (<3)', 
      count: data.filter(d => d.roi < 3).length,
      color: '#ef4444'
    }
  ]
  
  return (
    <div className="qc-card">
      <h3 className="text-lg font-semibold mb-4">ROI分布</h3>
      <DonutChart
        data={distribution}
        category="count"
        index="name"
        colors={distribution.map(d => d.color)}
        valueFormatter={(val) => `${val}个计划`}
      />
    </div>
  )
}
```

#### 消耗与转化对比图

```typescript
// components/charts/CostConversionChart.tsx
export function CostConversionChart({ data }: Props) {
  const chartData = data.map(d => ({
    时段: d.hour + ':00',
    消耗: d.cost,
    转化: d.conversions
  }))
  
  return (
    <div className="qc-card">
      <h3 className="text-lg font-semibold mb-4">消耗与转化对比</h3>
      <BarChart
        data={chartData}
        categories={['消耗', '转化']}
        colors={['#ef4444', '#10b981']}
        valueFormatter={(val) => val.toLocaleString()}
        yAxisWidth={60}
      />
    </div>
  )
}
```

### 4. 实时数据图表

```typescript
// hooks/useRealtimeChart.ts
export function useRealtimeChart(
  fetchData: () => Promise<any[]>,
  interval = 10000
) {
  const [data, setData] = useState<any[]>([])
  
  useEffect(() => {
    const fetch = async () => {
      const newData = await fetchData()
      setData(prev => {
        const combined = [...prev, ...newData]
        // 保留最近30个数据点
        return combined.slice(-30)
      })
    }
    
    fetch()
    const timer = setInterval(fetch, interval)
    return () => clearInterval(timer)
  }, [])
  
  return data
}

// 使用
function LiveDataChart() {
  const data = useRealtimeChart(
    () => reportAPI.getRealtime({ metric: 'gmv' }),
    10000
  )
  
  return (
    <QCLineChart
      data={data}
      categories={['value']}
      showAnimation={true}
    />
  )
}
```

## 数据格式化工具

```typescript
// lib/chartUtils.ts

// 货币格式化
export function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`
  }
  return `¥${value.toLocaleString()}`
}

// 百分比格式化
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

// ROI格式化
export function formatROI(value: number): string {
  return value.toFixed(2)
}

// 数量格式化
export function formatNumber(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString()
}

// 日期范围生成
export function generateDateRange(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1)
    return format(date, 'MM-dd')
  })
}
```

## 图表组件清单

| 组件名 | 用途 | 页面 |
|--------|------|------|
| GMVTrendChart | GMV趋势 | 工作台 |
| ROIDistributionChart | ROI分布 | 工作台 |
| CostConversionChart | 消耗转化对比 | 数据报表 |
| PromotionPerformanceChart | 计划效果对比 | 推广计划 |
| CreativePerformanceChart | 创意效果对比 | 创意管理 |
| AudienceDistributionChart | 受众分布 | 数据报表 |
| TimeDistributionChart | 时段分布 | 数据报表 |
| LiveViewerChart | 直播观看人数 | 直播间 |
| ProductSalesChart | 商品销售趋势 | 商品管理 |

## 实施步骤

1. **创建图表主题配置** (1天)
   - 定义千川配色方案
   - 配置 Tremor 主题
   - 创建格式化工具

2. **封装基础图表组件** (2天)
   - QCAreaChart
   - QCLineChart
   - QCBarChart
   - QCDonutChart

3. **实现业务图表组件** (5天)
   - GMVTrendChart
   - ROIDistributionChart
   - CostConversionChart
   - 其他6个业务图表

4. **实时数据集成** (2天)
   - useRealtimeChart hook
   - WebSocket 支持（可选）
   - 数据缓存策略

5. **测试与优化** (2天)
   - 性能测试
   - 响应式适配
   - 交互优化

## 总时间: 12天 (1-2人)

---

**文档版本**: v1.0  
**创建日期**: 2025-11-11
