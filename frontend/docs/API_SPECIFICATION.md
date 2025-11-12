# API接口规范文档

## 📋 文档说明

本文档定义了前端与后端API的接口规范，供后端团队参考实现。

**文档版本：** v1.0  
**创建日期：** 2025-11-11  
**适用范围：** 千川SDK管理平台

---

## 🌐 通用规范

### 1. 基础信息

**Base URL:** `/api` (开发环境通过Vite代理到后端)

**Content-Type:** `application/json`

**Authentication:** HttpOnly Cookie (session-based)

### 2. 统一响应格式

所有API响应遵循统一格式：

```typescript
interface ApiResponse<T = any> {
  code: number      // 0=成功, 非0=失败
  message: string   // 错误消息或成功提示
  data: T           // 业务数据
}
```

**成功响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 123,
    "name": "示例数据"
  }
}
```

**失败响应示例：**
```json
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

### 3. HTTP状态码

| 状态码 | 说明 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 正常返回数据 |
| 400 | 参数错误 | 返回错误信息 |
| 401 | 未授权 | 触发Token刷新或跳转登录 |
| 403 | 禁止访问 | 提示权限不足 |
| 404 | 资源不存在 | 提示资源未找到 |
| 429 | 请求过多 | 触发重试机制 |
| 500 | 服务器错误 | 提示系统错误 |

### 4. 分页规范

**请求参数：**
```typescript
{
  page: number        // 页码，从1开始
  page_size: number   // 每页数量，默认20
}
```

**响应格式：**
```typescript
{
  list: T[]           // 数据列表
  total: number       // 总数量
  page_info?: {       // 可选的分页信息
    page: number
    page_size: number
    total_count: number
    total_page: number
  }
}
```

---

## 📝 API接口清单

### 1. 广告计划API (`/qianchuan/ad/*`)

#### 1.1 批量更新出价

**接口：** `POST /qianchuan/ad/update/bid`

**请求参数：**
```typescript
{
  advertiser_id: number    // 广告主ID
  ad_ids: number[]         // 计划ID列表
  bid: number              // 新出价（单位：元）
}
```

**响应数据：**
```typescript
{
  ad_ids: number[]         // 更新成功的计划ID列表
}
```

**示例：**
```json
// 请求
{
  "advertiser_id": 123456,
  "ad_ids": [10001, 10002, 10003],
  "bid": 5.5
}

// 响应
{
  "code": 0,
  "message": "success",
  "data": {
    "ad_ids": [10001, 10002, 10003]
  }
}
```

#### 1.2 批量更新预算

**接口：** `POST /qianchuan/ad/update/budget`

**请求参数：**
```typescript
{
  advertiser_id: number
  ad_ids: number[]
  budget: number                              // 预算金额
  budget_mode?: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
}
```

#### 1.3 更新ROI目标

**接口：** `POST /qianchuan/ad/update/roi-goal`

**请求参数：**
```typescript
{
  advertiser_id: number
  ad_id: number
  roi_goal: number          // ROI目标值
}
```

#### 1.4 获取学习期状态

**接口：** `GET /qianchuan/ad/learning-status`

**请求参数：**
```typescript
{
  advertiser_id: number
  ad_ids: string            // 逗号分隔的ID列表 "1,2,3"
}
```

**响应数据：**
```typescript
{
  list: [
    {
      ad_id: number
      learning_phase: 'LEARNING' | 'LEARNED' | 'FAILED'
      learning_stage?: string
    }
  ]
}
```

#### 1.5 获取建议出价

**接口：** `POST /qianchuan/ad/suggest-bid`

**请求参数：**
```typescript
{
  advertiser_id: number
  campaign_id?: number
  delivery_setting?: {
    budget: number
    budget_mode: string
  }
  audience?: Record<string, any>
}
```

**响应数据：**
```typescript
{
  suggested_bid: number
  bid_range: {
    min: number
    max: number
  }
}
```

---

### 2. 账户管理API (`/qianchuan/advertiser/*`)

#### 2.1 获取已授权抖音号

**接口：** `GET /qianchuan/advertiser/aweme/authorized`

**请求参数：**
```typescript
{
  advertiser_id: number
  page?: number
  page_size?: number
}
```

**响应数据：**
```typescript
{
  list: [
    {
      aweme_id: string
      aweme_name: string
      aweme_avatar: string
      auth_status: 'AUTHORIZED' | 'UNAUTHORIZED'
      auth_time?: string
    }
  ],
  total: number
}
```

#### 2.2 获取账户预算

**接口：** `GET /qianchuan/advertiser/budget/get`

**请求参数：**
```typescript
{
  advertiser_id: number
}
```

**响应数据：**
```typescript
{
  advertiser_id: number
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE'
}
```

#### 2.3 更新账户预算

**接口：** `POST /qianchuan/advertiser/budget/update`

**请求参数：**
```typescript
{
  advertiser_id: number
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE'
}
```

---

### 3. 素材管理API (`/qianchuan/file/*`)

#### 3.1 获取抖音号下的视频

**接口：** `GET /qianchuan/file/video/aweme/get`

**请求参数：**
```typescript
{
  advertiser_id: number
  aweme_id: string
  page?: number
  page_size?: number
  count?: number
}
```

**响应数据：**
```typescript
{
  list: [
    {
      item_id: string
      title: string
      cover_url: string
      video_url: string
      duration: number
      create_time: string
      statistics: {
        digg_count: number
        comment_count: number
        share_count: number
        play_count: number
      }
    }
  ],
  cursor: number
  has_more: boolean
}
```

#### 3.2 批量删除视频

**接口：** `POST /qianchuan/file/video/delete`

**请求参数：**
```typescript
{
  advertiser_id: number
  video_ids: string[]
}
```

**响应数据：**
```typescript
{
  video_ids: string[]     // 成功删除的视频ID列表
}
```

#### 3.3 获取低效素材

**接口：** `GET /qianchuan/file/video/ineffective/get`

**请求参数：**
```typescript
{
  advertiser_id: number
  start_time: string      // 格式: YYYY-MM-DD
  end_time: string
}
```

**响应数据：**
```typescript
{
  video_ids: string[]     // 低效素材ID列表
}
```

---

### 4. 资金管理API (`/qianchuan/finance/*`)

#### 4.1 获取钱包信息

**接口：** `GET /qianchuan/finance/wallet/get`

**请求参数：**
```typescript
{
  advertiser_id: number
}
```

**响应数据：**
```typescript
{
  advertiser_id: number
  balance: number          // 账户余额
  cash: number             // 现金余额
  grant: number            // 赠款余额
  rebate: number           // 返点余额
  frozen_balance: number   // 冻结金额
  valid_balance: number    // 可用余额
  wallet_type: 'PREPAY' | 'POSTPAY'
}
```

#### 4.2 获取财务流水

**接口：** `GET /qianchuan/finance/detail/get`

**请求参数：**
```typescript
{
  advertiser_id: number
  start_time: string       // 格式: YYYY-MM-DD
  end_time: string
  trade_type?: string[]    // 交易类型筛选
  page?: number
  page_size?: number
}
```

**响应数据：**
```typescript
{
  list: [
    {
      trade_no: string
      trade_time: string
      trade_type: 'RECHARGE' | 'CONSUME' | 'REFUND' | 'TRANSFER'
      trade_type_name: string
      amount: number
      balance_after: number
      remark?: string
    }
  ],
  total: number
}
```

---

### 5. 随心推API (`/qianchuan/aweme/order/*`)

#### 5.1 创建随心推订单

**接口：** `POST /qianchuan/aweme/order/create`

**请求参数：**
```typescript
{
  advertiser_id: number
  aweme_id: string
  item_id: string          // 视频ID
  order_name: string
  budget: number
  delivery_mode: 'DELIVERY_MODE_STANDARD' | 'DELIVERY_MODE_ACCELERATE'
  delivery_setting: {
    start_time: string
    end_time?: string
  }
  audience_targeting?: {
    gender?: 'NONE' | 'MALE' | 'FEMALE'
    age?: string[]
    region?: string[]
    interest_tags?: string[]
  }
  external_action?: string
  roi_goal?: number
}
```

**响应数据：**
```typescript
{
  order_id: string
  advertiser_id: number
  aweme_id: string
  item_id: string
  order_name: string
  status: string
  budget: number
  create_time: string
  // ... 其他字段
}
```

#### 5.2 获取订单列表

**接口：** `GET /qianchuan/aweme/order/get`

**请求参数：**
```typescript
{
  advertiser_id: number
  aweme_id?: string
  filtering?: {
    order_ids?: string[]
    status?: string[]
  }
  page?: number
  page_size?: number
}
```

#### 5.3 获取效果预估

**接口：** `GET /qianchuan/aweme/estimate-profit`

**请求参数：**
```typescript
{
  advertiser_id: number
  aweme_id: string
  item_id: string
  budget: number
  delivery_mode: string
  external_action: string
}
```

**响应数据：**
```typescript
{
  estimated_views: number
  estimated_clicks: number
  estimated_conversions: number
  estimated_roi?: number
}
```

---

### 6. 全域推广API (`/qianchuan/uni-promotion/*`)

#### 6.1 创建全域推广

**接口：** `POST /qianchuan/uni-promotion/create`

**请求参数：**
```typescript
{
  advertiser_id: number
  ad_name: string
  marketing_goal: 'LIVE' | 'PRODUCT' | 'FANS' | 'BRAND'
  marketing_scene: string[]
  budget: number
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
  roi_goal?: number
  aweme_id?: string
  product_id?: string
  delivery_setting?: {
    start_time: string
    end_time?: string
  }
}
```

**响应数据：**
```typescript
{
  ad_id: number
}
```

#### 6.2 获取全域推广列表

**接口：** `GET /qianchuan/uni-promotion/list`

**请求参数：**
```typescript
{
  advertiser_id: number
  filtering?: {
    ad_ids?: number[]
    status?: string[]
    marketing_goal?: string[]
  }
  page?: number
  page_size?: number
}
```

---

## 🔒 安全规范

### 1. 认证机制

- 使用HttpOnly Cookie存储session
- Cookie应设置SameSite=Strict防止CSRF
- Token有效期：30分钟
- Refresh Token有效期：7天

### 2. CSRF保护

前端会在请求头中携带CSRF Token：
```
X-CSRF-Token: <token_from_meta_tag>
```

### 3. 请求限流

建议实施以下限流策略：
- 单个IP：100 req/min
- 单个用户：200 req/min
- 敏感操作（如转账）：10 req/min

---

## 🐛 错误码定义

| 错误码 | 说明 | 前端处理 |
|--------|------|----------|
| 0 | 成功 | 正常处理 |
| 400 | 参数错误 | 提示用户检查输入 |
| 401 | 未登录 | 跳转登录页 |
| 403 | 权限不足 | 提示权限不足 |
| 404 | 资源不存在 | 提示资源未找到 |
| 429 | 请求过多 | 等待后重试 |
| 500 | 服务器错误 | 提示系统错误 |
| 1001 | 广告主不存在 | 提示选择有效广告主 |
| 1002 | 计划不存在 | 提示计划已删除 |
| 1003 | 余额不足 | 提示充值 |
| 1004 | 审核未通过 | 展示审核原因 |

---

## ⚡ 性能要求

### 1. 响应时间

- 查询接口：< 500ms (P95)
- 创建/更新接口：< 1s (P95)
- 批量操作：< 2s (P95)

### 2. 并发支持

- 支持100+ QPS
- 批量接口单次最多处理100条

### 3. 数据量限制

- 列表查询：page_size最大1000
- 批量操作：单次最多100条
- 文件上传：最大100MB

---

## 📚 参考资料

- [千川SDK官方文档](../QIANCHUAN.md)
- [API使用示例](./API_USAGE_EXAMPLES.md)
- [前端API实现](../src/api/)

---

**文档维护：** 前端团队  
**审核人：** 后端团队  
**最后更新：** 2025-11-11
