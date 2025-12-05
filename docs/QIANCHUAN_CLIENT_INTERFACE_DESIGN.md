# QianchuanClient 抽象接口设计

> 目标：提供一层稳定的内部接口，让业务代码（Handler/Service）只依赖自定义的 `QianchuanClient`，从而屏蔽底层 SDK（qianchuanSDK / oceanengine）的差异。

## 1. 总体设计原则

1. **按功能域分组方法**
   - 保持与现有 Handler 结构一致，降低迁移时的认知成本：
     - Auth：认证与会话
     - Advertiser：广告主与账户
     - Campaign / Ad / Creative
     - File / Material
     - Report
     - Tools
     - Finance
     - Live
     - Aweme（随心推）
     - UniPromotion（全域推广）

2. **面向“业务语义”，而非 SDK 细节**
   - 接口的参数和返回值优先采用“项目内部定义的 DTO”，不要直接暴露第三方 SDK 的类型。
   - 第一阶段可以用 `type XxxReq = qianchuanSDK.XxxReq` 过渡，但长期建议定义自有 struct。

3. **同步保留 SDK 原始错误信息**
   - 返回值尽量携带原始的 code/message，便于在日志和排障时快速映射回官方文档。

4. **与现有 Handler 尽量“一一对应”**
   - 设计时从现有 `h.service.Manager.Xxx(...)` 出发，先保证覆盖当前所有实际用到的方法，再考虑未来扩展。

## 2. 接口定义草案

下面是一个基于当前代码结构的接口草案（仅展示核心方法，实际实现时可以在此基础上增删）。

### 2.1 顶层接口

```go
// QianchuanClient 是所有千川相关 API 的统一抽象入口。
//
// 设计原则：
// 1. 所有方法第一个参数为 context.Context，支持超时控制和链路追踪
// 2. 错误处理统一：返回包装后的 QianchuanError，保留原始 code/message
// 3. 第一阶段可以直接用 qianchuanSDK 的 Req/Res 作为别名，降低迁移成本
// 4. 第二阶段可以逐步将 Req/Res 替换为项目内部定义的 DTO
//
type QianchuanClient interface {
    // ===== Auth & Session =====
    OauthAccessToken(ctx context.Context, req OauthAccessTokenReq) (*OauthAccessTokenRes, error)
    OauthRefreshToken(ctx context.Context, req OauthRefreshTokenReq) (*OauthRefreshTokenRes, error)
    UserInfo(ctx context.Context, req UserInfoReq) (*UserInfoRes, error)

    // ===== Advertiser & Account =====
    AdvertiserList(ctx context.Context, req AdvertiserListReq) (*AdvertiserListRes, error)
    AdvertiserInfo(ctx context.Context, req AdvertiserInfoReq) (*AdvertiserInfoRes, error)
    ShopAdvertiserList(ctx context.Context, req ShopAdvertiserListReq) (*ShopAdvertiserListRes, error)
    AgentAdvertiserList(ctx context.Context, req AgentAdvertiserListReq) (*AgentAdvertiserListRes, error)

    // ===== Campaign =====
    CampaignList(ctx context.Context, req CampaignListReq) (*CampaignListRes, error)
    CampaignGet(ctx context.Context, req CampaignGetReq) (*CampaignGetRes, error)
    CampaignCreate(ctx context.Context, req CampaignCreateReq) (*CampaignCreateRes, error)
    CampaignUpdate(ctx context.Context, req CampaignUpdateReq) (*CampaignUpdateRes, error)
    CampaignStatusUpdate(ctx context.Context, req CampaignStatusUpdateReq) (*CampaignStatusUpdateRes, error)

    // ===== Ad =====
    AdList(ctx context.Context, req AdListReq) (*AdListRes, error)
    AdGet(ctx context.Context, req AdGetReq) (*AdGetRes, error)
    AdCreate(ctx context.Context, req AdCreateReq) (*AdCreateRes, error)
    AdUpdate(ctx context.Context, req AdUpdateReq) (*AdUpdateRes, error)
    AdStatusUpdate(ctx context.Context, req AdStatusUpdateReq) (*AdStatusUpdateRes, error)
    AdBudgetUpdate(ctx context.Context, req AdBudgetUpdateReq) (*AdBudgetUpdateRes, error)
    AdBidUpdate(ctx context.Context, req AdBidUpdateReq) (*AdBidUpdateRes, error)

    // ===== Creative =====
    CreativeList(ctx context.Context, req CreativeListReq) (*CreativeListRes, error)
    CreativeGet(ctx context.Context, req CreativeGetReq) (*CreativeGetRes, error)
    CreativeRejectReason(ctx context.Context, req CreativeRejectReasonReq) (*CreativeRejectReasonRes, error)

    // ===== File / Material =====
    FileImageGet(ctx context.Context, req FileImageGetReq) (*FileImageGetRes, error)
    FileVideoGet(ctx context.Context, req FileVideoGetReq) (*FileVideoGetRes, error)

    // ===== Report =====
    ReportAdvertiserGet(ctx context.Context, req ReportAdvertiserReq) (*ReportAdvertiserRes, error)
    ReportCampaignGet(ctx context.Context, req ReportCampaignReq) (*ReportCampaignRes, error)
    ReportAdGet(ctx context.Context, req ReportAdReq) (*ReportAdRes, error)
    ReportCreativeGet(ctx context.Context, req ReportCreativeReq) (*ReportCreativeRes, error)

    // ===== Tools =====
    ToolsIndustryGet(ctx context.Context, req ToolsIndustryGetReq) (*ToolsIndustryGetRes, error)
    ToolsInterestCategory(ctx context.Context, req ToolsInterestCategoryReq) (*ToolsInterestCategoryRes, error)
    ToolsInterestKeyword(ctx context.Context, req ToolsInterestKeywordReq) (*ToolsInterestKeywordRes, error)
    ToolsActionCategory(ctx context.Context, req ToolsActionCategoryReq) (*ToolsActionCategoryRes, error)
    ToolsActionKeyword(ctx context.Context, req ToolsActionKeywordReq) (*ToolsActionKeywordRes, error)

    // ===== Finance =====
    WalletGet(ctx context.Context, req WalletGetReq) (*WalletGetRes, error)
    BalanceGet(ctx context.Context, req BalanceGetReq) (*BalanceGetRes, error)
    FinanceDetailGet(ctx context.Context, req FinanceDetailGetReq) (*FinanceDetailGetRes, error)
    FundTransferSeqCreate(ctx context.Context, req FundTransferSeqCreateReq) (*FundTransferSeqCreateRes, error)
    FundTransferSeqCommit(ctx context.Context, req FundTransferSeqCommitReq) (*FundTransferSeqCommitRes, error)
    RefundTransferSeqCreate(ctx context.Context, req RefundTransferSeqCreateReq) (*RefundTransferSeqCreateRes, error)
    RefundTransferSeqCommit(ctx context.Context, req RefundTransferSeqCommitReq) (*RefundTransferSeqCommitRes, error)

    // ===== Live =====
    LiveRoomGet(ctx context.Context, req LiveRoomGetReq) (*LiveRoomGetRes, error)
    LiveRoomDetailGet(ctx context.Context, req LiveRoomDetailGetReq) (*LiveRoomDetailGetRes, error)
    LiveReportGet(ctx context.Context, req LiveReportGetReq) (*LiveReportGetRes, error)

    // ===== Aweme (随心推) =====
    AwemeOrderList(ctx context.Context, req AwemeOrderListReq) (*AwemeOrderListRes, error)
    AwemeOrderDetail(ctx context.Context, req AwemeOrderDetailReq) (*AwemeOrderDetailRes, error)
    AwemeOrderCreate(ctx context.Context, req AwemeOrderCreateReq) (*AwemeOrderCreateRes, error)
    AwemeOrderTerminate(ctx context.Context, req AwemeOrderTerminateReq) (*AwemeOrderTerminateRes, error)

    // ===== UniPromotion =====
    UniPromotionList(ctx context.Context, req UniPromotionListReq) (*UniPromotionListRes, error)
    UniPromotionDetail(ctx context.Context, req UniPromotionDetailReq) (*UniPromotionDetailRes, error)
    UniPromotionCreate(ctx context.Context, req UniPromotionCreateReq) (*UniPromotionCreateRes, error)
    UniPromotionUpdate(ctx context.Context, req UniPromotionUpdateReq) (*UniPromotionUpdateRes, error)
    UniPromotionStatusUpdate(ctx context.Context, req UniPromotionStatusUpdateReq) (*UniPromotionStatusUpdateRes, error)
}

// QianchuanError 统一错误类型
// 封装底层 SDK 的错误信息，便于统一处理和日志记录
type QianchuanError struct {
    Code    int64  `json:"code"`     // SDK 返回的错误码
    Message string `json:"message"`  // SDK 返回的错误信息
    Err     error  `json:"-"`        // 原始错误（用于 error 链）
}

func (e *QianchuanError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err)
    }
    return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

func (e *QianchuanError) Unwrap() error {
    return e.Err
}
```

> 实际实现时可以拆成多个小接口（`AuthClient`, `AdvertiserClient` 等）并通过嵌入组合，但对外暴露一个统一的 `QianchuanClient` 即可。

### 2.2 Req/Res 类型策略

第一阶段推荐做法：

```go
// 过渡阶段：直接别名到 qianchuanSDK 类型
// 这样 handler 里改调用点时不需要同时改所有字段名。

type OauthAccessTokenReq = qianchuanSDK.OauthAccessTokenReq
type OauthAccessTokenRes = qianchuanSDK.OauthAccessTokenRes

// ……按需为所有用到的 Req/Res 做别名
```

第二阶段可以逐步替换为“项目自有 DTO”，例如：

```go
// 长期推荐：将对外类型与第三方 SDK 解耦

type OauthAccessTokenReq struct {
    AuthCode string `json:"auth_code"`
}

type OauthAccessTokenRes struct {
    AccessToken  string
    RefreshToken string
    ExpiresIn    int64
}
```

过渡策略可以是：
1. 先使用别名，确保接口足够稳定；
2. oceanengine 版实现上线并稳定后，再在单独的 MR 中逐步将别名替换为自有 struct，并在适配器中做字段映射。

## 3. 基于 qianchuanSDK 的适配实现

### 3.1 适配器结构

在 `backend/internal/service` 或新建 `backend/internal/sdk` 中创建：

```go
// SDKClient 使用当前的 qianchuanSDK.Manager 作为底层实现。

type SDKClient struct {
    manager *qianchuanSDK.Manager
}

func NewSDKClient(manager *qianchuanSDK.Manager) *SDKClient {
    return &SDKClient{manager: manager}
}
```

### 3.2 示例方法实现

以认证和广告主为例：

```go
// ===== Auth 实现 =====

func (c *SDKClient) OauthAccessToken(ctx context.Context, req OauthAccessTokenReq) (*OauthAccessTokenRes, error) {
    // 注意：qianchuanSDK 内部使用 context.Background()，未来可优化为传递 ctx
    return c.manager.OauthAccessToken(qianchuanSDK.OauthAccessTokenReq(req))
}

func (c *SDKClient) OauthRefreshToken(ctx context.Context, req OauthRefreshTokenReq) (*OauthRefreshTokenRes, error) {
    return c.manager.OauthRefreshToken(qianchuanSDK.OauthRefreshTokenReq(req))
}

func (c *SDKClient) UserInfo(ctx context.Context, req UserInfoReq) (*UserInfoRes, error) {
    return c.manager.UserInfo(qianchuanSDK.UserInfoReq(req))
}

// ===== Advertiser 实现 =====

func (c *SDKClient) AdvertiserList(ctx context.Context, req AdvertiserListReq) (*AdvertiserListRes, error) {
    return c.manager.AdvertiserList(qianchuanSDK.AdvertiserListReq(req))
}

func (c *SDKClient) AdvertiserInfo(ctx context.Context, req AdvertiserInfoReq) (*AdvertiserInfoRes, error) {
    return c.manager.AdvertiserInfo(qianchuanSDK.AdvertiserInfoReq(req))
}
```

> 第一阶段可以尽量保持“一行转发”，不做任何业务逻辑，确保行为与现状完全一致。

### 3.3 与 QianchuanService 的集成

现有 `QianchuanService`：

```go
// 当前结构

type QianchuanService struct {
    Manager *qianchuanSDK.Manager
}

func NewQianchuanService(manager *qianchuanSDK.Manager) *QianchuanService {
    return &QianchuanService{Manager: manager}
}
```

迁移后结构：

```go
// 新结构

type QianchuanService struct {
    Client QianchuanClient
}

func NewQianchuanService(client QianchuanClient) *QianchuanService {
    return &QianchuanService{Client: client}
}
```

在 `cmd/server/main.go` 中初始化时：

```go
credentials := qianchuanSDK.NewCredentials(appId, appSecret)
manager := qianchuanSDK.NewManager(credentials, nil)
client := sdk.NewSDKClient(manager)
qianchuanService := service.NewQianchuanService(client)
```

之后：
- 所有 Service 层方法都通过 `s.Client` 调用底层 SDK
- Handler 不再直接访问 `Manager`，而是通过 Service 暴露的方法

## 4. Handler 改造思路

以 `AdvertiserHandler.List` 为例，当前实现：

```go
infoResp, err := h.service.GetAdvertiserListWithDetails(
    userSession.AccessToken,
    h.service.Manager.Credentials.AppId,
    h.service.Manager.Credentials.AppSecret,
    []string{"id", "name", "company", ...},
)
```

改造后推荐：

1. 在 `QianchuanService` 中封装业务逻辑：

```go
func (s *QianchuanService) GetAdvertiserListWithDetails(accessToken string, appId int64, appSecret string, fields []string) (*AdvertiserInfoRes, error) {
    // 1) 调用 s.Client.AdvertiserList
    // 2) 提取 AdvertiserIds
    // 3) 调用 s.Client.AdvertiserInfo
    // 4) 合并结果
}
```

2. Handler 只依赖 `QianchuanService` 暴露的方法：

```go
infoResp, err := h.service.GetAdvertiserListWithDetails(
    userSession.AccessToken,
    h.serviceAppId,   // 可以在 service 初始化时记录
    h.serviceAppSecret,
    fields,
)
```

> 这样将来无论底层是 qianchuanSDK 还是 oceanengine，Handler 都不需要感知。

## 5. 为 oceanengine 版本预留的扩展点

在设计 `QianchuanClient` 与 DTO 时，应为后续 oceanengine 版本实现预留空间：

1. **字段兼容性**
   - 使用语义清晰的字段名，如 `AdvertiserID / CampaignID / AdID` 等，避免直接用 SDK 内部符号。
   - 对可选字段（如高级定向参数）使用指针或 `omitempty`，方便不同 SDK 支持程度不一致的情况。

2. **错误信息透传**
   - 保留 `Code / Message` 等原始信息，便于快速定位到底层 API 出错。

3. **分页与过滤统一**
   - 为所有列表接口统一使用 `Page / PageSize / Filtering` 模式，便于不同 SDK 的分页模型做适配。

4. **扩展方法命名**
   - 对于当前 SDK 不支持、但 oceanengine 支持的高级能力，可以在接口上预留方法名（先返回 `NotImplementedError`），未来直接由 oceanengine 版本实现即可。

---

## 6. 补充：账户预算接口（POC）

为支持后续使用 oceanengine 补齐账户预算能力，已在 QianchuanClient 中预留并实现以下方法：

```go
// Advertiser Budget（账户预算）
AdvertiserBudgetGet(ctx context.Context, req AdvertiserBudgetGetReq) (*AdvertiserBudgetGetRes, error)
AdvertiserBudgetUpdate(ctx context.Context, req AdvertiserBudgetUpdateReq) (*AdvertiserBudgetUpdateRes, error)
```

第一阶段（qianchuanSDK 模式）返回 501；
第二阶段（oceanengine 模式，使用 build tag `-tags oceanengine`）将调用官方 OpenAPI。

构建与运行：
- 默认（qianchuanSDK）：`go build ./cmd/server`
- OceanEngine POC：`go build -tags oceanengine ./cmd/server` 并设置 `QIANCHUAN_SDK_PROVIDER=oceanengine`


后续文档：
- `QIANCHUAN_SDK_TO_OCEANENGINE_MAPPING.md` 将详细列出每个接口在 oceanengine 中的对应关系与差异点。
- `QIANCHUAN_SDK_MIGRATION_PLAN_STEP_BY_STEP.md` 将给出按阶段实施本抽象方案的具体步骤与检查项。
