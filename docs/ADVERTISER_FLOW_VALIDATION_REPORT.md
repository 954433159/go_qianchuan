# 广告主列表与详情功能验证报告

**验证时间**: 2025-11-10  
**验证方法**: 代码静态分析 + 链路追踪  
**验证状态**: ⚠️ 存在类型不匹配问题

---

## 🔗 完整调用链路

### 广告主列表功能
```
用户访问 /advertisers
    ↓
Advertisers.tsx (Line 21)
├─ useEffect 自动调用 fetchAdvertisers()
└─ fetchAdvertisers() (Line 24-34)
    ├─ setLoading(true)
    └─ getAdvertiserList({page: 1, page_size: 20})
        ↓
frontend/src/api/advertiser.ts:getAdvertiserList (Line 5-10)
└─ apiClient.get('/advertiser/list', {params})
    ↓
axios baseURL: http://localhost:8080/api
最终请求: GET /api/advertiser/list?page=1&page_size=20
    ↓
backend/cmd/server/main.go:109
└─ api.GET("/advertiser/list", advertiserHandler.List)
    ↓
backend/internal/handler/advertiser.go:List (Line 27-52)
├─ middleware.GetUserSession(c)
│   └─> 获取 userSession.AccessToken
├─ h.service.Manager.AdvertiserList (Line 30-34)
│   └─> SDK Call
│       ├─ AccessToken: userSession.AccessToken
│       ├─ AppId: h.service.Manager.Credentials.AppId
│       └─ Secret: h.service.Manager.Credentials.AppSecret
│           ↓
qianchuanSDK/advertiser.go:AdvertiserList (Line 40-44)
└─ GET https://api.oceanengine.com/open_api/qianchuan/advertiser/list
    └─> 返回 AdvertiserListRes
        ├─ Code: 0
        ├─ Message: "OK"
        └─ Data.List: []AdvertiserListResData
            ├─ AdvertiserId
            ├─ AdvertiserName
            ├─ IsValid
            └─ AccountRole
```

### 广告主详情功能
```
用户点击"查看"按钮 (Advertisers.tsx:159)
    ↓
handleViewDetails(record) (Line 90-93)
├─ setSelectedAdvertiser(advertiser)
└─ setDrawerOpen(true)
    └─> 展开侧边栏，显示已有的 advertiser 数据
    
若用户点击"查看完整信息" (Line 308-310)
    ↓
navigate(`/advertisers/${selectedAdvertiser.id}`)
    └─> 路由跳转（前端未实现详情页）
```

**API 端点**: `GET /api/advertiser/info?advertiser_id=xxx`
```
frontend/src/api/advertiser.ts:getAdvertiserInfo (Line 13-17)
└─ apiClient.get('/advertiser/info', {params: {advertiser_id}})
    ↓
backend/cmd/server/main.go:110
└─ api.GET("/advertiser/info", advertiserHandler.Info)
    ↓
backend/internal/handler/advertiser.go:Info (Line 55-90)
├─ 获取 advertiser_id 参数或使用当前 session 的 ID (Line 57-61)
├─ h.service.Manager.AdvertiserInfo (Line 63-67)
│   └─> SDK Call
│       ├─ AccessToken: userSession.AccessToken
│       ├─ AdvertiserIds: []int64{advertiserId}
│       └─ Fields: ["id", "name", "company", "first_industry_name", "second_industry_name"]
│           ↓
qianchuanSDK/advertiser.go:AdvertiserInfo (Line 287-302)
└─ GET https://api.oceanengine.com/open_api/qianchuan/advertiser/info
    └─> 返回 AdvertiserInfoRes
        ├─ Code: 0
        ├─ Message: "OK"
        └─ Data: []AdvertiserInfoResData
            ├─ ID
            ├─ Name
            ├─ Company
            ├─ FirstIndustryName
            ├─ SecondIndustryName
            ├─ Role
            ├─ Status
            ├─ Address
            └─ ... (其他18个字段)
```

---

## ❌ 严重问题

### 问题 1: 前后端字段类型完全不匹配 🚨

**前端期望的数据结构** (`frontend/src/api/types.ts:10-18`):
```typescript
export interface Advertiser {
  id: number
  name: string
  company: string
  role: string
  status: 'ENABLE' | 'DISABLE'
  balance: number          // ⚠️ 前端期望 balance
  create_time: string      // ⚠️ 前端期望 create_time
}
```

**SDK 返回的数据结构** (`qianchuanSDK/advertiser.go:26-31`):
```go
type AdvertiserListResData struct {
    AdvertiserId   int64  `json:"advertiser_id"`   // ⚠️ SDK返回 advertiser_id
    AdvertiserName string `json:"advertiser_name"` // ⚠️ SDK返回 advertiser_name
    IsValid        bool   `json:"is_valid"`
    AccountRole    string `json:"account_role"`
    // ❌ 没有 balance 字段
    // ❌ 没有 create_time 字段
}
```

**后端直接透传** (`backend/internal/handler/advertiser.go:48-50`):
```go
"data": gin.H{
    "list": resp.Data.List,  // ⚠️ 直接返回 SDK 数据，未转换
},
```

**问题分析**:
- 前端访问 `advertiser.id` → SDK 返回 `advertiser_id` → ❌ undefined
- 前端访问 `advertiser.name` → SDK 返回 `advertiser_name` → ❌ undefined
- 前端访问 `advertiser.balance` → SDK 无此字段 → ❌ undefined
- 前端访问 `advertiser.create_time` → SDK 无此字段 → ❌ undefined

**影响**:
- 前端页面显示空白或 undefined
- 统计卡片计算错误（balance 相关）
- 表格排序失败（基于 create_time）

---

### 问题 2: 广告主列表 API 不支持分页参数 ⚠️

**前端发送的请求** (`advertiser.ts:9`):
```typescript
getAdvertiserList({page: 1, page_size: 20})
```

**SDK API 定义** (`advertiser.go:14-19`):
```go
type AdvertiserListReq struct {
    AccessToken string
    AppId       int64
    Secret      string
    // ❌ 没有 Page 字段
    // ❌ 没有 PageSize 字段
}
```

**SDK API 文档说明** (Line 2):
> 巨量开放平台地址：https://open.oceanengine.com/doc/index.html?key=qianchuan&type=api&id=1697459480882190

**官方API限制**: 该接口一次性返回所有已授权账户，不支持分页

**影响**:
- 前端传递的分页参数被忽略
- 始终返回全量数据

---

### 问题 3: 前端 Drawer 详情展示不完整 ⚠️

**当前实现** (`Advertisers.tsx:257-298`):
```tsx
显示字段:
- id (广告主 ID)
- name (名称)
- company (公司)
- balance (余额) ❌ SDK 不返回
- status (状态) ❌ SDK 不返回
- create_time (创建时间) ❌ SDK 不返回
```

**SDK AdvertiserList 实际返回字段**:
```
✅ advertiser_id
✅ advertiser_name
✅ is_valid
✅ account_role
❌ balance (SDK不提供)
❌ status (SDK不提供)
❌ create_time (SDK不提供)
❌ company (SDK不提供)
```

**获取完整信息的方式**:
需要调用 `AdvertiserInfo` API (Line 287-302) 获取28个完整字段

---

## ⚡ 解决方案

### 方案 1: 后端添加字段映射 (推荐)

**修改文件**: `backend/internal/handler/advertiser.go`

```go
// List 获取广告主列表
func (h *AdvertiserHandler) List(c *gin.Context) {
    userSession, _ := middleware.GetUserSession(c)

    resp, err := h.service.Manager.AdvertiserList(qianchuanSDK.AdvertiserListReq{
        AccessToken: userSession.AccessToken,
        AppId:       h.service.Manager.Credentials.AppId,
        Secret:      h.service.Manager.Credentials.AppSecret,
    })

    if err != nil {
        log.Printf("Get advertiser list failed: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "code":    500,
            "message": "获取广告主列表失败: " + err.Error(),
        })
        return
    }

    // ✅ 转换为前端期望的格式
    list := make([]gin.H, 0, len(resp.Data.List))
    for _, item := range resp.Data.List {
        list = append(list, gin.H{
            "id":          item.AdvertiserId,
            "name":        item.AdvertiserName,
            "company":     "",  // AdvertiserList API 不返回，需调用 AdvertiserInfo
            "role":        item.AccountRole,
            "status":      getStatusFromIsValid(item.IsValid),  // 根据 IsValid 推断
            "balance":     0,   // AdvertiserList API 不返回
            "create_time": "",  // AdvertiserList API 不返回
        })
    }

    c.JSON(http.StatusOK, gin.H{
        "code":    0,
        "message": "success",
        "data": gin.H{
            "list": list,
        },
    })
}

// 辅助函数：根据 IsValid 推断状态
func getStatusFromIsValid(isValid bool) string {
    if isValid {
        return "ENABLE"
    }
    return "DISABLE"
}
```

---

### 方案 2: 增强版 - 调用 AdvertiserInfo 获取完整数据

```go
func (h *AdvertiserHandler) List(c *gin.Context) {
    userSession, _ := middleware.GetUserSession(c)

    // 1. 获取广告主列表
    listResp, err := h.service.Manager.AdvertiserList(...)
    if err != nil { ... }

    // 2. 提取所有 advertiser_id
    ids := make([]int64, 0, len(listResp.Data.List))
    for _, item := range listResp.Data.List {
        ids = append(ids, item.AdvertiserId)
    }

    // 3. 批量获取详细信息（最多10个）
    infoResp, err := h.service.Manager.AdvertiserInfo(qianchuanSDK.AdvertiserInfoReq{
        AccessToken:   userSession.AccessToken,
        AdvertiserIds: ids,
        Fields: []string{
            "id", "name", "company", "role", "status", 
            "first_industry_name", "second_industry_name", "create_time",
        },
    })

    // 4. 组合数据
    list := make([]gin.H, 0, len(infoResp.Data))
    for _, info := range infoResp.Data {
        list = append(list, gin.H{
            "id":          info.ID,
            "name":        info.Name,
            "company":     info.Company,
            "role":        info.Role,
            "status":      info.Status,
            "balance":     0,  // SDK 不提供余额，需调用其他 API
            "create_time": info.CreateTime,
        })
    }

    c.JSON(http.StatusOK, gin.H{
        "code":    0,
        "message": "success",
        "data": gin.H{
            "list": list,
        },
    })
}
```

**优点**:
- ✅ 返回完整的广告主信息
- ✅ 包含 company、status、create_time

**缺点**:
- ⚠️ 性能开销增加（额外1次API调用）
- ⚠️ SDK限制：AdvertiserInfo 一次最多查询10个

---

### 方案 3: 前端适配 SDK 字段 (不推荐)

**修改文件**: `frontend/src/api/types.ts`

```typescript
export interface Advertiser {
  advertiser_id: number      // ⚠️ 改为 SDK 字段
  advertiser_name: string    // ⚠️ 改为 SDK 字段
  account_role: string
  is_valid: boolean
  // 移除 balance, status, create_time
}
```

**缺点**:
- ❌ 需要修改大量前端代码
- ❌ 字段名不符合前端命名规范（snake_case）
- ❌ 缺少关键字段（余额、状态）

---

## 📊 数据流验证

### AdvertiserList API 返回示例
```json
{
  "code": 0,
  "message": "OK",
  "request_id": "20241110...",
  "data": {
    "list": [
      {
        "advertiser_id": 1234567890123456,
        "advertiser_name": "测试店铺",
        "is_valid": true,
        "account_role": "PLATFORM_ROLE_SHOP_ACCOUNT"
      }
    ]
  }
}
```

### 前端期望的数据格式
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1234567890123456,
        "name": "测试店铺",
        "company": "XX公司",
        "role": "PLATFORM_ROLE_SHOP_ACCOUNT",
        "status": "ENABLE",
        "balance": 10000,
        "create_time": "2024-01-01 12:00:00"
      }
    ]
  }
}
```

---

## 🧪 测试场景

### 场景 1: 正常加载列表 ❌
```
步骤:
1. 登录系统
2. 访问 /advertisers
3. 自动调用 API

当前结果: 
- 表格显示 undefined
- 统计卡片显示 0
- 筛选失败

预期结果:
- 显示广告主列表
- 统计卡片正确计算
- 筛选功能可用
```

### 场景 2: 查看详情 ❌
```
步骤:
1. 点击"查看"按钮
2. 打开 Drawer

当前结果:
- 显示 undefined
- 余额为 NaN

预期结果:
- 显示完整信息
- 余额格式化显示
```

### 场景 3: 批量导出 ⚠️
```
步骤:
1. 选择多个广告主
2. 点击"批量导出"

当前实现:
- 仅显示 Toast 消息
- 未实际导出

建议: 实现 CSV 导出
```

---

## ✅ 优点分析

### 1. 前端实现完善
- ✅ 使用 Zustand + React Query 状态管理
- ✅ DataTable 组件支持排序、筛选、分页
- ✅ Drawer 详情面板体验好
- ✅ 统计卡片设计美观

### 2. 后端认证完整
- ✅ 使用 AuthRequired 中间件
- ✅ 自动从 Session 获取 AccessToken
- ✅ 错误处理规范

### 3. SDK 调用正确
- ✅ 使用官方 AdvertiserList API
- ✅ 传递正确的 AccessToken、AppId、Secret

---

## ⚠️ 改进建议

### P0 - 阻塞问题（必须修复）
1. **后端添加字段映射** - 将 SDK 字段转换为前端格式
2. **处理缺失字段** - balance、create_time、company 等

### P1 - 高优先级
3. **实现广告主详情页** - `/advertisers/:id` 路由
4. **调用 AdvertiserInfo 获取完整数据** - 包含 company、status、create_time
5. **前端字段校验** - 添加 null/undefined 检查

### P2 - 中优先级
6. **实现批量导出功能** - 导出为 CSV/Excel
7. **添加余额查询接口** - 如果 SDK 支持
8. **优化加载状态** - Skeleton Loading

### P3 - 低优先级
9. **添加刷新按钮** - 手动刷新数据
10. **缓存优化** - React Query 缓存策略

---

## 🎯 验收清单

| 项目 | 状态 | 备注 |
|------|------|------|
| 前端页面实现完整 | ✅ | Advertisers.tsx 功能齐全 |
| API 端点路径正确 | ✅ | `/api/advertiser/list` |
| 后端路由注册 | ✅ | main.go:109-110 |
| SDK 调用正确 | ✅ | AdvertiserList/AdvertiserInfo |
| 字段映射正确 | ❌ | 前后端字段不匹配 |
| 数据完整性 | ❌ | 缺少 balance/create_time/company |
| 分页功能 | ⚠️ | API 不支持分页，前端参数无效 |
| 详情功能 | ⚠️ | 仅 Drawer，无完整详情页 |
| 错误处理 | ✅ | try-catch + Toast 提示 |
| 加载状态 | ✅ | Loading 组件 |

---

## 📈 总体评分

```
前端实现: ⭐⭐⭐⭐⭐ 5/5
后端实现: ⭐⭐⭐☆☆ 3/5 (缺少字段映射)
SDK 集成: ⭐⭐⭐⭐☆ 4/5
数据完整性: ⭐⭐☆☆☆ 2/5 (缺少关键字段)

总分: 14/20 (70%) - 基本可用，需修复字段映射
```

---

## 🚀 结论

**当前状态**: 基础框架完整，但存在严重的字段不匹配问题

**建议操作**:
1. **立即修复**: 后端添加字段映射（方案1）
2. **短期优化**: 调用 AdvertiserInfo 获取完整数据（方案2）
3. **长期规划**: 实现独立的广告主详情页

**可用性评估**:
- 开发环境: ⚠️ 可测试 API 调用，但前端显示异常
- 生产环境: ❌ 不可用，必须修复字段映射
