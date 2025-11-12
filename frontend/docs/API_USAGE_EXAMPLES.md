# API使用示例

## 目录
1. [广告计划高级功能](#广告计划高级功能)
2. [账户管理](#账户管理)
3. [素材管理](#素材管理)
4. [资金管理](#资金管理)
5. [随心推](#随心推)
6. [全域推广](#全域推广)

---

## 广告计划高级功能

### 1. 批量更新出价

```typescript
import { updateAdBid } from '@/api/ad'

// 批量调整多个计划的出价
const handleBatchUpdateBid = async () => {
  try {
    const result = await updateAdBid({
      advertiser_id: 123456,
      ad_ids: [10001, 10002, 10003],
      bid: 5.5 // 新出价：5.5元
    })
    console.log('更新成功:', result.ad_ids)
  } catch (error) {
    console.error('更新失败:', error)
  }
}
```

### 2. 获取智能建议出价

```typescript
import { getSuggestBid } from '@/api/ad'

// 获取建议出价
const handleGetSuggestBid = async () => {
  try {
    const result = await getSuggestBid({
      advertiser_id: 123456,
      campaign_id: 789,
      delivery_setting: {
        budget: 1000,
        budget_mode: 'BUDGET_MODE_DAY'
      }
    })
    
    console.log('建议出价:', result.suggested_bid)
    console.log('出价范围:', result.bid_range)
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

### 3. 查看学习期状态

```typescript
import { getAdLearningStatus } from '@/api/ad'

// 批量查询计划学习期状态
const handleCheckLearningStatus = async () => {
  try {
    const statusList = await getAdLearningStatus(
      123456,
      [10001, 10002, 10003]
    )
    
    statusList.forEach(status => {
      console.log(`计划 ${status.ad_id}:`, status.learning_phase)
      // LEARNING: 学习中
      // LEARNED: 已学习
      // FAILED: 学习失败
    })
  } catch (error) {
    console.error('查询失败:', error)
  }
}
```

---

## 账户管理

### 1. 获取已授权抖音号

```typescript
import { getAuthorizedAwemeList } from '@/api/advertiser'

// 获取千川账户下所有授权的抖音号
const handleGetAwemeList = async () => {
  try {
    const result = await getAuthorizedAwemeList(123456, 1, 20)
    
    result.list.forEach(aweme => {
      console.log('抖音号:', aweme.aweme_name)
      console.log('授权状态:', aweme.auth_status)
      console.log('头像:', aweme.aweme_avatar)
    })
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

### 2. 更新账户预算

```typescript
import { updateAccountBudget } from '@/api/advertiser'

// 设置账户日预算
const handleUpdateBudget = async () => {
  try {
    await updateAccountBudget({
      advertiser_id: 123456,
      budget: 10000, // 日预算 10000元
      budget_mode: 'BUDGET_MODE_DAY'
    })
    console.log('预算更新成功')
  } catch (error) {
    console.error('更新失败:', error)
  }
}
```

---

## 素材管理

### 1. 获取抖音号下的视频

```typescript
import { getAwemeVideos } from '@/api/file'

// 获取某个抖音号下的所有视频
const handleGetAwemeVideos = async () => {
  try {
    const result = await getAwemeVideos({
      advertiser_id: 123456,
      aweme_id: 'douyin_12345',
      page: 1,
      page_size: 20
    })
    
    result.list.forEach(video => {
      console.log('视频标题:', video.title)
      console.log('封面:', video.cover_url)
      console.log('时长:', video.duration)
      console.log('点赞数:', video.statistics.digg_count)
    })
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

### 2. 批量删除视频素材

```typescript
import { deleteVideos } from '@/api/file'

// 批量删除不需要的视频
const handleDeleteVideos = async () => {
  try {
    const result = await deleteVideos({
      advertiser_id: 123456,
      video_ids: ['video_001', 'video_002', 'video_003']
    })
    console.log('已删除:', result.video_ids)
  } catch (error) {
    console.error('删除失败:', error)
  }
}
```

### 3. 获取低效素材

```typescript
import { getIneffectiveVideos } from '@/api/file'

// 获取近7天的低效素材
const handleGetIneffectiveVideos = async () => {
  try {
    const videoIds = await getIneffectiveVideos({
      advertiser_id: 123456,
      start_time: '2025-11-04',
      end_time: '2025-11-11'
    })
    
    console.log('低效素材ID列表:', videoIds)
    // 可以基于此列表进行批量删除或优化
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

---

## 资金管理

### 1. 查看钱包信息

```typescript
import { getWalletInfo } from '@/api/finance'

// 获取账户钱包详细信息
const handleGetWallet = async () => {
  try {
    const wallet = await getWalletInfo(123456)
    
    console.log('账户余额:', wallet.balance)
    console.log('现金余额:', wallet.cash)
    console.log('赠款余额:', wallet.grant)
    console.log('可用余额:', wallet.valid_balance)
    console.log('冻结金额:', wallet.frozen_balance)
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

### 2. 查询财务流水

```typescript
import { getFinanceDetail } from '@/api/finance'

// 查询近30天的财务流水
const handleGetFinanceDetail = async () => {
  try {
    const result = await getFinanceDetail({
      advertiser_id: 123456,
      start_time: '2025-10-12',
      end_time: '2025-11-11',
      page: 1,
      page_size: 50
    })
    
    result.list.forEach(record => {
      console.log('时间:', record.trade_time)
      console.log('类型:', record.trade_type_name)
      console.log('金额:', record.amount)
      console.log('余额:', record.balance_after)
    })
  } catch (error) {
    console.error('查询失败:', error)
  }
}
```

---

## 随心推

### 1. 创建随心推订单

```typescript
import { createAwemeOrder } from '@/api/aweme'

// 为一个短视频创建随心推订单
const handleCreateOrder = async () => {
  try {
    const order = await createAwemeOrder({
      advertiser_id: 123456,
      aweme_id: 'douyin_12345',
      item_id: 'video_789',
      order_name: '双11爆款推广',
      budget: 500,
      delivery_mode: 'DELIVERY_MODE_STANDARD',
      delivery_setting: {
        start_time: '2025-11-11 00:00:00',
        end_time: '2025-11-11 23:59:59'
      },
      audience_targeting: {
        gender: 'FEMALE',
        age: ['AGE_24_30', 'AGE_31_40'],
        region: ['110000', '310000'] // 北京、上海
      },
      roi_goal: 3.5
    })
    
    console.log('订单创建成功:', order.order_id)
  } catch (error) {
    console.error('创建失败:', error)
  }
}
```

### 2. 获取投放效果预估

```typescript
import { getEstimateProfit } from '@/api/aweme'

// 在创建订单前预估效果
const handleEstimateProfit = async () => {
  try {
    const estimate = await getEstimateProfit({
      advertiser_id: 123456,
      aweme_id: 'douyin_12345',
      item_id: 'video_789',
      budget: 500,
      delivery_mode: 'DELIVERY_MODE_STANDARD',
      external_action: 'AD_CONVERT_TYPE_LIVE_SUCCESSPAGE_ORDER'
    })
    
    console.log('预估观看:', estimate.estimated_views)
    console.log('预估点击:', estimate.estimated_clicks)
    console.log('预估转化:', estimate.estimated_conversions)
    console.log('预估ROI:', estimate.estimated_roi)
  } catch (error) {
    console.error('预估失败:', error)
  }
}
```

### 3. 追加订单预算

```typescript
import { addAwemeOrderBudget } from '@/api/aweme'

// 为表现好的订单追加预算
const handleAddBudget = async () => {
  try {
    await addAwemeOrderBudget({
      advertiser_id: 123456,
      order_id: 'order_abc',
      add_budget: 200 // 追加200元
    })
    console.log('预算追加成功')
  } catch (error) {
    console.error('追加失败:', error)
  }
}
```

---

## 全域推广

### 1. 创建全域推广计划

```typescript
import { createUniPromotion } from '@/api/uniPromotion'

// 创建一个全域推广计划
const handleCreateUniPromotion = async () => {
  try {
    const result = await createUniPromotion({
      advertiser_id: 123456,
      ad_name: '全域直播推广计划',
      marketing_goal: 'LIVE', // 直播推广
      marketing_scene: ['SCENE_FEED', 'SCENE_SEARCH'], // 信息流+搜索
      budget: 5000,
      budget_mode: 'BUDGET_MODE_DAY',
      roi_goal: 4.0,
      aweme_id: 'douyin_12345',
      delivery_setting: {
        start_time: '2025-11-11 00:00:00'
      }
    })
    
    console.log('全域推广创建成功:', result.ad_id)
  } catch (error) {
    console.error('创建失败:', error)
  }
}
```

### 2. 批量更新全域推广预算

```typescript
import { updateUniPromotionBudget } from '@/api/uniPromotion'

// 批量调整多个全域推广计划的预算
const handleBatchUpdateBudget = async () => {
  try {
    const result = await updateUniPromotionBudget({
      advertiser_id: 123456,
      ad_ids: [20001, 20002, 20003],
      budget: 8000,
      budget_mode: 'BUDGET_MODE_DAY'
    })
    
    console.log('预算更新成功:', result.ad_ids)
  } catch (error) {
    console.error('更新失败:', error)
  }
}
```

### 3. 获取全域推广列表

```typescript
import { getUniPromotionList } from '@/api/uniPromotion'

// 获取所有全域推广计划
const handleGetList = async () => {
  try {
    const result = await getUniPromotionList({
      advertiser_id: 123456,
      filtering: {
        status: ['ACTIVE'],
        marketing_goal: ['LIVE', 'PRODUCT']
      },
      page: 1,
      page_size: 20
    })
    
    result.list.forEach(ad => {
      console.log('计划名称:', ad.ad_name)
      console.log('营销目标:', ad.marketing_goal)
      console.log('预算:', ad.budget)
      console.log('ROI目标:', ad.roi_goal)
    })
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

---

## 错误处理最佳实践

### 统一错误处理

```typescript
import { toast } from '@/components/ui/Toast'

// 封装API调用，统一错误处理
export const withErrorHandler = async <T,>(
  apiCall: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await apiCall()
  } catch (error: any) {
    const message = errorMessage || error?.message || '操作失败'
    toast.error(message)
    console.error('API Error:', error)
    return null
  }
}

// 使用示例
const handleAction = async () => {
  const result = await withErrorHandler(
    () => updateAdBid({ 
      advertiser_id: 123456,
      ad_ids: [10001],
      bid: 5.5
    }),
    '更新出价失败'
  )
  
  if (result) {
    toast.success('出价更新成功')
  }
}
```

### Loading状态管理

```typescript
import { useState } from 'react'
import { getSuggestBid } from '@/api/ad'

const AdBidForm = () => {
  const [loading, setLoading] = useState(false)
  const [suggestedBid, setSuggestedBid] = useState<number | null>(null)
  
  const handleGetSuggestion = async () => {
    setLoading(true)
    try {
      const result = await getSuggestBid({
        advertiser_id: 123456,
        campaign_id: 789
      })
      setSuggestedBid(result.suggested_bid)
    } catch (error) {
      toast.error('获取建议失败')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button onClick={handleGetSuggestion} disabled={loading}>
      {loading ? '获取中...' : '获取建议出价'}
    </button>
  )
}
```

---

## React Hook 封装示例

### useAdSuggestion Hook

```typescript
// hooks/useAdSuggestion.ts
import { useState } from 'react'
import { getSuggestBid, getSuggestRoiGoal, getSuggestBudget } from '@/api/ad'

export const useAdSuggestion = (advertiserId: number, campaignId?: number) => {
  const [loading, setLoading] = useState(false)
  
  const getBidSuggestion = async (deliverySetting: any) => {
    setLoading(true)
    try {
      return await getSuggestBid({
        advertiser_id: advertiserId,
        campaign_id: campaignId,
        delivery_setting: deliverySetting
      })
    } finally {
      setLoading(false)
    }
  }
  
  const getRoiSuggestion = async (deliverySetting: any) => {
    setLoading(true)
    try {
      return await getSuggestRoiGoal({
        advertiser_id: advertiserId,
        campaign_id: campaignId,
        delivery_setting: deliverySetting
      })
    } finally {
      setLoading(false)
    }
  }
  
  const getBudgetSuggestion = async (deliverySetting: any) => {
    setLoading(true)
    try {
      return await getSuggestBudget({
        advertiser_id: advertiserId,
        campaign_id: campaignId,
        delivery_setting: deliverySetting
      })
    } finally {
      setLoading(false)
    }
  }
  
  return {
    loading,
    getBidSuggestion,
    getRoiSuggestion,
    getBudgetSuggestion
  }
}
```

---

**文档版本：** v1.0  
**最后更新：** 2025-11-11
