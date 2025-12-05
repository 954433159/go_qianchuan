# OceanEngine SDK 安全集成指南

> **实现状态**: ✅ 已完成 (2025-11-27)

本指南说明如何将 `bububa/oceanengine` 的千川部分安全集成到项目中，不影响现有功能。

**已实现的全域推广功能** (12个接口):
- `UniPromotionList` - 获取全域推广列表
- `UniPromotionDetail` - 获取全域推广详情
- `UniPromotionCreate` - 创建全域推广
- `UniPromotionUpdate` - 更新全域推广
- `UniPromotionStatusUpdate` - 更新全域推广状态
- `UniPromotionBudgetUpdate` - 更新全域推广预算
- `UniPromotionRoiGoalUpdate` - 更新全域推广ROI目标
- `UniPromotionScheduleUpdate` - 更新全域推广投放时间
- `UniPromotionMaterialGet` - 获取全域推广素材
- `UniPromotionMaterialDelete` - 删除全域推广素材
- `UniPromotionAuthorizedGet` - 获取可投全域推广抖音号列表
- `UniPromotionAuthInit` - 全域授权初始化

---

## 一、集成原理

项目已有完善的抽象层设计：

```
QianchuanClient (interface.go)  ← 统一接口
       ↓
┌──────────────────┐      ┌────────────────────────┐
│  SDKClient       │      │  OceanengineClient     │
│ (provider_default)│      │ (provider_oceanengine) │
│  使用 qianchuanSDK│      │  混合: qianchuanSDK +  │
│                  │      │  oceanengine 补充      │
└──────────────────┘      └────────────────────────┘
```

**关键**: 通过 Go build tag 隔离，默认构建不引入 oceanengine 依赖。

---

## 二、安装步骤

### 2.1 添加依赖 (仅千川部分)

```bash
cd /Users/wushaobing911/Desktop/douyin/backend

# 添加 oceanengine SDK (只会下载需要的部分)
go get github.com/bububa/oceanengine/marketing-api@latest
```

### 2.2 更新 go.mod

编辑 `backend/go.mod`，在 `require` 块中添加：

```go
require (
    // ... 现有依赖 ...
    github.com/bububa/oceanengine/marketing-api v1.2.6  // 使用最新稳定版
)
```

### 2.3 整理依赖

```bash
cd /Users/wushaobing911/Desktop/douyin/backend
go mod tidy
```

---

## 三、安全隔离方案

### 3.1 默认构建 (不受影响)

```bash
# 默认构建 - 不引入 oceanengine 代码
go build -o bin/server ./cmd/server
```

此时使用 `provider_default.go`，完全基于现有 qianchuanSDK。

### 3.2 启用 oceanengine 构建

```bash
# 启用 oceanengine 扩展
go build -tags oceanengine -o bin/server-oe ./cmd/server
```

此时使用 `provider_oceanengine.go`，可调用 oceanengine 的额外API。

### 3.3 运行时切换

通过环境变量控制：

```bash
# .env
QIANCHUAN_SDK_PROVIDER=oceanengine  # 启用 oceanengine 模式
# QIANCHUAN_SDK_PROVIDER=           # 默认使用 qianchuanSDK
```

---

## 四、渐进式实现全域推广

### 4.1 在 interface.go 中添加全域推广接口

编辑 `internal/sdk/interface.go`：

```go
type QianchuanClient interface {
    // ... 现有接口 ...

    // ===== Uni Promotion (全域推广) =====
    UniPromotionList(ctx context.Context, req UniPromotionListReq) (*UniPromotionListRes, error)
    UniPromotionDetail(ctx context.Context, req UniPromotionDetailReq) (*UniPromotionDetailRes, error)
    UniPromotionCreate(ctx context.Context, req UniPromotionCreateReq) (*UniPromotionCreateRes, error)
    UniPromotionUpdate(ctx context.Context, req UniPromotionUpdateReq) (*UniPromotionUpdateRes, error)
    UniPromotionStatusUpdate(ctx context.Context, req UniPromotionStatusUpdateReq) (*UniPromotionStatusUpdateRes, error)
    // ... 更多全域推广接口 ...
}
```

### 4.2 在 types.go 中添加类型定义

```go
// ===== Uni Promotion Types =====

type UniPromotionListReq struct {
    AdvertiserId uint64 `json:"advertiser_id"`
    AccessToken  string `json:"-"`
    Page         int    `json:"page"`
    PageSize     int    `json:"page_size"`
    // ... 按需添加过滤条件
}

type UniPromotionListRes struct {
    Code    int64  `json:"code"`
    Message string `json:"message"`
    Data    struct {
        List     []UniPromotion `json:"list"`
        PageInfo PageInfo       `json:"page_info"`
    } `json:"data"`
}

// ... 其他类型定义
```

### 4.3 在 sdk_client.go 中添加默认实现 (返回501)

```go
// ===== Uni Promotion (默认不支持) =====

func (c *SDKClient) UniPromotionList(ctx context.Context, req UniPromotionListReq) (*UniPromotionListRes, error) {
    return &UniPromotionListRes{
        Code:    501,
        Message: "UniPromotionList not supported by qianchuanSDK client",
    }, nil
}

// ... 其他默认实现
```

### 4.4 在 provider_oceanengine.go 中实现真实调用

```go
//go:build oceanengine

package sdk

import (
    "context"
    
    "github.com/bububa/oceanengine/marketing-api/api/qianchuan/uni_promotion"
    uniModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/uni_promotion"
    "github.com/bububa/oceanengine/marketing-api/core"
)

// OceanengineClient 扩展，添加千川核心客户端
type OceanengineClient struct {
    *SDKClient
    httpClient *http.Client
    oeClient   *core.SDKClient  // oceanengine SDK 客户端
}

func NewClientForProvider(provider string, manager *qianchuanSDK.Manager, appId int64, appSecret string) QianchuanClient {
    base := NewSDKClient(manager)
    if provider != "oceanengine" {
        return base
    }
    
    // 初始化 oceanengine 客户端 (仅用于千川扩展API)
    oeClient := core.NewSDKClient(appId, appSecret)
    
    return &OceanengineClient{
        SDKClient:  base,
        httpClient: &http.Client{Timeout: 10 * time.Second},
        oeClient:   oeClient,
    }
}

// ===== Uni Promotion 使用 oceanengine SDK =====

func (c *OceanengineClient) UniPromotionList(ctx context.Context, req UniPromotionListReq) (*UniPromotionListRes, error) {
    oeReq := &uniModel.ListRequest{
        AdvertiserId: req.AdvertiserId,
        Page:         req.Page,
        PageSize:     req.PageSize,
    }
    
    result, err := uni_promotion.List(ctx, c.oeClient, req.AccessToken, oeReq)
    if err != nil {
        return &UniPromotionListRes{Code: 500, Message: err.Error()}, nil
    }
    
    // 转换响应格式
    return &UniPromotionListRes{
        Code:    0,
        Message: "success",
        Data: struct {
            List     []UniPromotion `json:"list"`
            PageInfo PageInfo       `json:"page_info"`
        }{
            List:     convertUniPromotions(result.List),
            PageInfo: PageInfo{Page: result.PageInfo.Page, PageSize: result.PageInfo.PageSize, TotalNumber: result.PageInfo.TotalNumber},
        },
    }, nil
}

// ... 其他全域推广接口实现
```

---

## 五、验证步骤

### 5.1 验证默认构建 (无变化)

```bash
cd /Users/wushaobing911/Desktop/douyin/backend

# 1. 清理旧构建
rm -f bin/server

# 2. 默认构建
go build -o bin/server ./cmd/server

# 3. 运行测试
go test ./...

# 4. 启动服务验证现有功能
./bin/server
```

### 5.2 验证 oceanengine 构建

```bash
# 1. 启用 oceanengine 构建
go build -tags oceanengine -o bin/server-oe ./cmd/server

# 2. 设置环境变量
export QIANCHUAN_SDK_PROVIDER=oceanengine

# 3. 启动服务
./bin/server-oe

# 4. 测试全域推广接口
curl http://localhost:8080/api/qianchuan/uni-promotion/list
```

---

## 六、关键注意事项

### 6.1 不会影响现有功能的原因

1. **Build Tag 隔离**: `//go:build oceanengine` 确保默认构建不编译 oceanengine 代码
2. **接口抽象**: 所有调用通过 `QianchuanClient` 接口，实现可替换
3. **渐进式添加**: 新接口先返回501，再逐步实现
4. **运行时切换**: 通过环境变量选择实现，无需重新编译

### 6.2 oceanengine SDK 只导入千川部分

```go
// 只导入需要的千川包
import (
    "github.com/bububa/oceanengine/marketing-api/api/qianchuan/uni_promotion"
    "github.com/bububa/oceanengine/marketing-api/model/qianchuan/uni_promotion"
    "github.com/bububa/oceanengine/marketing-api/core"
)

// 不要导入其他平台的包
// ❌ import "github.com/bububa/oceanengine/marketing-api/api/star"
// ❌ import "github.com/bububa/oceanengine/marketing-api/api/local"
```

### 6.3 回滚方案

如果集成出现问题：

```bash
# 方法1: 使用默认构建
go build -o bin/server ./cmd/server

# 方法2: 移除依赖
# 编辑 go.mod，删除 oceanengine 行
# 运行 go mod tidy
```

---

## 七、实施状态

| 阶段 | 操作 | 状态 |
|------|------|------|
| 1 | 添加 oceanengine 依赖 (v1.33.4) | ✅ 已完成 |
| 2 | 在 interface.go 添加全域推广接口定义 (12个方法) | ✅ 已完成 |
| 3 | 在 types.go 添加全域推广类型定义 | ✅ 已完成 |
| 4 | 在 sdk_client.go 添加默认501实现 | ✅ 已完成 |
| 5 | 在 provider_oceanengine.go 实现真实调用 | ✅ 已完成 |
| 6 | 更新 handler/uni_promotion.go 调用新接口 | ✅ 已完成 |
| 7 | 测试默认构建和 oceanengine 构建 | ✅ 已完成 |
| 8 | 生产环境切换 | ⏳ 待部署 |

---

## 八、快速开始命令

```bash
# 一键添加依赖
cd /Users/wushaobing911/Desktop/douyin/backend
go get github.com/bububa/oceanengine/marketing-api@latest
go mod tidy

# 验证默认构建仍然正常
go build -o bin/server ./cmd/server && echo "✅ Default build OK"

# 验证 oceanengine 构建
go build -tags oceanengine -o bin/server-oe ./cmd/server && echo "✅ Oceanengine build OK"
```

这样你就可以安全地使用 oceanengine SDK 的千川部分，同时保持现有功能完全不受影响。
