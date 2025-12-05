# qianchuanSDK → oceanengine API 映射草案

## ⚠️ 重要声明

**本文档中关于 oceanengine SDK 能力的描述基于推测和官方文档，尚未通过实际代码验证。**

在开始迁移工作前（阶段 0），**必须**完成以下验证：
- 下载并检查 oceanengine SDK 源码（`marketing-api/api/qianchuan/` 目录结构）
- 验证关键接口存在性：账户预算、创意创建/状态、ad/campaign 基础 CRUD、oauth
- 对比至少 10 个核心接口的字段结构差异
- 输出验证报告：`docs/OCEANENGINE_SDK_CAPABILITY_REPORT.md`

---

> 目的：
> - 梳理当前项目实际使用的千川接口；
> - 给出在 oceanengine / 官方 MarketingAPI 中的对应位置或能力；
> - 标记“待验证 / 需适配 / 暂无支持”三类情况，为后续替换提供参考。

本表基于以下信息整理：
- 本仓库 `backend/internal/handler` 中对 `qianchuanSDK.Manager` 的实际调用
- 对应的千川开放平台文档（接口名、路径）
- oceanengine 系列 SDK（如 `bububa/oceanengine` 与官方 `ad_open_sdk_go`）的模块划分

> 注意：本文件不追求 100% 精确的 Go 符号名，而是关注“功能级别”的映射，供架构设计和实施阶段参考。

## 1. 认证 / 用户信息

| 功能 | 当前调用（qianchuanSDK） | 官方 API 路径（语义） | oceanengine 支持情况 | 备注 |
|------|---------------------------|------------------------|----------------------|------|
| 换取 access_token / refresh_token | `Manager.OauthAccessToken` | `/oauth2/access_token/` | 支持，通常位于 `api/oauth` 或 `api/qianchuan/oauth` | 标准 OAuth 流程，字段名可能略有差异 |
| 刷新 token | `Manager.OauthRefreshToken` | `/oauth2/refresh_token/` | 支持 | 同上 |
| 获取用户信息 | `Manager.UserInfo` | `/user/info/` | 支持 | 一般在 `user` 或 `qianchuan/user` 模块 |

迁移要点：
- oceanengine 的请求体字段名、返回字段结构可能与 qianchuanSDK 不完全一致，建议在 `QianchuanClient` 层做统一 DTO 映射。

## 2. 广告主 / 账户管理

| 功能 | 当前调用 | 官方语义 | oceanengine 对应 | 备注 |
|------|----------|----------|------------------|------|
| 获取广告主列表 | `Manager.AdvertiserList` | `/qianchuan/advertiser/list/` | `api/qianchuan/advertiser.List` 一类接口 | 已有成熟封装 |
| 获取广告主详情 | `Manager.AdvertiserInfo` | `/qianchuan/advertiser/info/` | `api/qianchuan/advertiser.Info` | 常规 |
| 获取店铺关联的广告账户 | `Manager.ShopAdvertiserList` | `/qianchuan/shop/advertiser/list/` | 一般在 `qianchuan/shop` 模块中 | 需根据 SDK 实际包名确认 |
| 获取代理商关联的广告账户 | `Manager.AgentAdvertiserList` | `/qianchuan/agent/advertiser/select/` | 通常在 `qianchuan/agent` 模块 | 某些 SDK 可能命名为 `AgentAdvertiserSelect` |
| 账户预算查询/更新 | Handler 中目前 501，占位 | `/qianchuan/advertiser/budget/get` `/update` | 官方 MarketingAPI 文档有对应接口，部分 oceanengine SDK 已封装 | 这里是 oceanengine 的优势点，可用来补齐功能 |

| 账户预算查询 | 当前 Handler 接口（GetBudget） | `/open_api/v1.0/qianchuan/account/budget/get/` | 官方SDK支持；POC 已实现（oceanengine build） | qianchuanSDK 模式返回501 |
| 账户预算更新 | 当前 Handler 接口（UpdateBudget） | `/open_api/v1.0/qianchuan/account/budget/update/` | 官方SDK支持；POC 已实现（oceanengine build） | qianchuanSDK 模式返回501 |


迁移要点：
- 账户预算相关接口目前在 qianchuanSDK 未实现，而 oceanengine/官方 SDK 往往有更完整支持，适合优先迁移以消除 501。

## 3. 广告组（Campaign）

| 功能 | 当前调用 | 官方语义 | oceanengine 支持情况 | 备注 |
|------|----------|----------|----------------------|------|
| 列表 | `Manager.CampaignList` | `/qianchuan/campaign/list` | 通常在 `api/qianchuan/campaign` 模块下有 `List` | 字段相近 |
| 获取详情 | `Manager.CampaignGet` | `/qianchuan/campaign/get` | 同上，`Get` 或 `Info` | |
| 创建 | `Manager.CampaignCreate` | `/qianchuan/campaign/create` | 支持 | 需要对齐所有必填字段 |
| 更新 | `Manager.CampaignUpdate` | `/qianchuan/campaign/update` | 支持 | |
| 状态更新 | `Manager.CampaignStatusUpdate` | `/qianchuan/campaign/status/update` | 支持 | |

迁移要点：
- Campaign 相关字段在各家 SDK 中相对稳定，但枚举值（营销目标、出价类型等）命名可能略有差别，需要在 DTO 层做兼容。

## 4. 广告计划（Ad）

| 功能 | 当前调用 | 官方语义 | oceanengine 支持情况 | 备注 |
|------|----------|----------|----------------------|------|
| 列表 | `Manager.AdList` | `/qianchuan/ad/list` | `api/qianchuan/ad.List` | 基础能力 |
| 获取详情 | `Manager.AdGet` | `/qianchuan/ad/get` | `Get` | |
| 创建 | `Manager.AdCreate` | `/qianchuan/ad/create` | 支持 | oceanengine 多数将“附带创意创建”一并处理 |
| 更新 | `Manager.AdUpdate` | `/qianchuan/ad/update` | 支持 | |
| 状态更新 | `Manager.AdStatusUpdate` | `/qianchuan/ad/status/update` | 支持 | |
| 批量更新预算 | `Manager.AdBudgetUpdate` | `/qianchuan/ad/budget/update` | 支持 | |
| 批量更新出价 | `Manager.AdBidUpdate` | `/qianchuan/ad/bid/update` | 支持 | |
| 地域/时段专项更新 | 当前 Handler 中直接 501，占位 | `/qianchuan/ad/update/region` 等 | 官方文档通常有对应接口，部分 SDK 封装在 `ad` 子模块中 | 可通过 oceanengine 补齐 |
| 智能建议/预估 | 当前为 mock/middleware 逻辑 | `/qianchuan/ad/suggest-*` `/estimate-effect` | 官方接口支持度不一，部分 SDK 仅对随心推提供 | 需要实测 SDK 能力 |

迁移要点：
- 对于专项更新类接口，即使 oceanengine 未直接封装，也可以通过“组合更新 + 字段掩码”的方式在 `QianchuanClient` 层封装。

## 5. 创意（Creative）

| 功能 | 当前调用 | 官方语义 | oceanengine 对应 | 备注 |
|------|----------|----------|------------------|------|
| 列表 | `Manager.CreativeGet`（通过过滤） | `/qianchuan/creative/list` | `api/qianchuan/creative.List` 一类 | 已有 |
| 获取详情 | 同上，取列表第一条 | `/qianchuan/creative/get` | 一般有独立 `Get` 接口 | oceanengine 多数实现了 `Get` |
| 获取拒绝原因 | `Manager.CreativeRejectReason` | `/qianchuan/creative/reject_reason` | 通常有对应接口 | |
| 独立创建创意 | Handler 目前返回 501 | `/qianchuan/creative/create` | 官方 MarketingAPI 提供接口，oceanengine 通常封装 | 可以借机补齐 |
| 状态更新 | Handler 目前返回 501 | `/qianchuan/creative/status/update` | 同上 | |

迁移要点：
- 当前项目对创意的“只读能力”已经足够，迁移到 oceanengine 后可以顺势实现独立创意创建/状态更新，提升管理精度。

## 6. 文件 / 素材（File / Material）

| 功能 | 当前调用 | 官方语义 | oceanengine 对应 | 备注 |
|------|----------|----------|------------------|------|
| 获取图片列表 | `Manager.FileImageGet` | `/qianchuan/file/image/get` | 一般在 `qianchuan/file` 模块 | |
| 获取视频列表 | `Manager.FileVideoGet` | `/qianchuan/file/video/get` | 同上 | |
| AI 推荐标题 | Handler 返回 501 | `/qianchuan/file/material/title/list` | 官方文档有接口，SDK 支持情况待确认 | 可作为后续增强点 |

## 7. 报表（Report）

项目目前已经对接：
- 基础报表：广告主 / 广告组 / 广告 / 创意
- 扩展报表：素材、搜索词、用户流失等部分能力

多数第三方/官方 oceanengine SDK 对报表的支持较为齐全：
- 一般在 `marketing-api/api/qianchuan/report` 或类似模块中，以 `Report*` 函数形式出现。

迁移要点：
- 报表字段较多、版本演进快，建议在 `QianchuanClient` 层定义“内部统一报表 DTO”，SDK 实现专门做字段映射：
  - 例如统一 `date`, `cost`, `show`, `click`, `convert`, `cpc`, `cpm`, `roi` 等常用字段。

## 8. 工具（Tools）

当前项目中使用的工具类接口包括：
- 行业列表：`ToolsIndustryGet`
- 兴趣类目/关键词：`ToolsInterestActionInterestCategory`, `ToolsInterestActionInterestKeyword`
- 行为类目/关键词：`ToolsInterestActionActionCategory`, `ToolsInterestActionActionKeyword`
- 达人分类、相似达人等（在 `tools.go` 中部分已实现）

这些接口在 oceanengine SDK 中通常位于：
- `api/qianchuan/tools` 或拆分为 `interest`, `action`, `aweme` 等子模块

迁移要点：
- 工具接口大多是“读操作”，迁移风险相对较低，可作为第四阶段之后再逐步替换。

## 9. 财务（Finance）

当前已实现：
- 钱包信息：`WalletGet`
- 账户余额：`BalanceGet`
- 财务流水：`DetailGet`
- 转账/退款交易号创建与提交：`FundTransferSeqCreate/Commit`, `RefundTransferSeqCreate/Commit`

这些接口在官方 MarketingAPI 中一般属于“财务/资金管理”模块，oceanengine SDK 通常有对应实现，但包名可能与当前 qianchuanSDK 不同。

迁移要点：
- 财务相关接口对安全、准确性要求高，迁移时需：
  - 仔细对比每一个字段的单位与精度（分/元、浮点/整数）。
  - 在测试环境用真实/沙箱数据做多次对账验证。

## 10. 直播 & 随心推 / 全域推广

### 10.1 直播（Live）

- 房间列表、详情、流量表现、用户画像、商品列表等，在项目中已有较多调用。
- oceanengine 的 MarketingAPI 通常在 `qianchuan/live` 或统一的 `live` 模块提供这些接口。

### 10.2 随心推（Aweme Order）

- 已有创建、终止、预算追加、效果预估、配额查询等接口调用。
- oceanengine 多数会有 `qianchuan/aweme` 模块封装对应能力，特别是在针对随心推产品线的 SDK 中。

### 10.3 全域推广（UniPromotion）

- 本项目目前已在后端注册了大量 UniPromotion 路由，但实现部分仍在开发中。
- oceanengine / 官方 SDK 对“全域推广”支持度较高，且随着产品演进持续更新，是后续扩展能力的重要入口。

迁移要点：
- 直播/随心推/全域推广的接口变化较快，迁移时应优先查阅最新官方文档，避免依赖过时字段。

## 11. 映射结论与优先级建议

综合现状：

1. **完全对应、迁移低风险的模块**
   - Auth / User
   - Advertiser 基础信息
   - Campaign / Ad 基本 CRUD
   - Creative 查询
   - File 素材查询
   - 基础报表（广告主/计划/广告/创意）

2. **需要一定字段映射/适配的模块**
   - 报表扩展（高级报表字段较多）
   - Tools（兴趣/行为等维度枚举复杂）
   - Finance（金额精度与单位需特别注意）

3. **当前 qianchuanSDK 不足，但 oceanengine/官方 SDK 可能更强的模块**
   - 账户预算查询/更新
   - 创意独立创建与状态更新
   - AI 标题推荐
   - 全域推广（UniPromotion）相关高级能力

> 迁移优先级建议：
> 1. 先迁 Auth + Advertiser + Finance（账户级别能力，能消除协议与功能缺口的主要风险）。
> 2. 再迁 Ad/Campaign/Creative/File + 基础报表（日常使用最频繁的接口）。
> 3. 然后是 Tools + 扩展报表 + Live/Aweme。
> 4. 最后针对 UniPromotion 和其他高级功能做“能力扩展”级迁移。

---

实施步骤与具体代码层面的改造方案，详见：
- `QIANCHUAN_CLIENT_INTERFACE_DESIGN.md`
- `QIANCHUAN_SDK_MIGRATION_PLAN_STEP_BY_STEP.md`
