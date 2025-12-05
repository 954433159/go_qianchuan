# 千川 SDK 迁移方案总览

## 1. 背景与问题

当前项目后端依赖本地模块 `github.com/CriarBrand/qianchuanSDK`，通过 `Manager` 统一封装千川 API：
- 在 `backend/go.mod` 中通过 `replace github.com/CriarBrand/qianchuanSDK => ../qianchuanSDK` 指向本地 SDK
- 在 `backend/cmd/server/main.go` 中：
  - 使用 `qianchuanSDK.NewCredentials(appId, appSecret)` 创建凭证
  - 使用 `qianchuanSDK.NewManager(credentials, nil)` 创建 `*Manager`
  - 将 `Manager` 注入 `QianchuanService`，再传给各个 Handler
- 在几乎所有 Handler 中直接调用 `h.service.Manager.SomeAPIMethod(...)`，并使用 `qianchuanSDK.*Req / *Res` 作为请求/响应类型

这套方案已经支撑了：认证、广告主、计划/广告、创意、报表、素材、工具、财务、随心推等核心功能，但存在几个结构性问题：

1. **协议风险**：
   - 当前 SDK 采用 GPL-3.0 协议，不适合闭源或商用交付场景。
2. **功能覆盖不足**：
   - 项目中有 20+ 个接口返回 501，原因多为 SDK 未实现或能力缺口（账户预算、部分报表、权限管理等）。
3. **耦合度过高**：
   - Handler 直接强依赖 `qianchuanSDK.Manager` 及其具体类型。
   - 一旦替换 SDK（例如使用 `bububa/oceanengine` 或官方 `ad_open_sdk_go`），几乎所有 Handler 都要改，改动面巨大。
4. **演进空间有限**：
   - 难以做到“同时支持多套 SDK / 多产品线”（例如后续若要支持星图、本地推等）。

## 2. 迁移目标

1. **降低 SDK 耦合**
   - 让业务层（Handler + Service）只面向自定义的 `QianchuanClient` 接口，而不是具体 SDK。
2. **支持替换为 oceanengine 系列 SDK**
   - 在不改变 HTTP API 契约（前端无需改动）的前提下，可以将底层 SDK 替换为：
     - `github.com/bububa/oceanengine`（第三方 MarketingAPI SDK），或
     - 官方 `github.com/oceanengine/ad_open_sdk_go`。
3. **为补齐功能缺口铺路**
   - 利用 oceanengine 更完整的 MarketingAPI 封装，逐步补齐目前 501 的能力（账户预算、更多报表、授权管理等）。
4. **保持可回滚与渐进式演进**
   - 迁移过程中随时可以：
     - 回退到老的 qianchuanSDK 实现，
     - 或者在部分模块先行试点 oceanengine，实现“混合模式”。

## 3. 两种迁移思路对比

### 3.1 方案 A：直接全量替换 SDK（不抽象接口）

**做法**：
- `go.mod` 中直接去掉 `qianchuanSDK`，引入 `oceanengine` 或 `ad_open_sdk_go`
- 改 `main.go` 初始化逻辑为 oceanengine 的 client
- 在所有 Handler/Service 中：
  - 把 `qianchuanSDK.*Req / *Res` 全部替换为 oceanengine 的 model 类型
  - 把 `Manager.SomeAPIMethod(...)` 换成 oceanengine 对应的包级函数调用

**优点**：
- 最终代码只有一套 SDK，不再留有历史包袱。

**缺点**：
- 改动范围巨大：所有依赖 `Manager.*` 和 `qianchuanSDK.*` 的代码都要修改。
- 容易引入隐性回归：字段名、枚举、嵌套结构稍有不一致，就可能导致线上错误。
- 无法平滑迁移：要么全成，要么全回滚。

**在本项目中的评估**：
- 技术上可行，但风险和工作量都偏大，更适合作为“第二阶段”的重构，而不是第一步。

### 3.2 方案 B：抽象 `QianchuanClient` 接口 + 渐进式替换（推荐）

**核心思路**：
1. 在 `backend/internal/service`（或新建 `sdk` 包）定义一个内部使用的 `QianchuanClient` 接口，按功能域拆分方法：
   - 认证 & 会话：`OauthAccessToken`, `OauthRefreshToken`, `UserInfo` 等
   - 广告主 & 账户：`AdvertiserList`, `AdvertiserInfo`, `ShopAdvertiserList`, `AgentAdvertiserList` 等
   - Campaign / Ad / Creative / File / Report / Tools / Finance / Live / Aweme / UniPromotion ……
2. 定义一层“自有的请求/响应类型”（可以先用 `type XxxReq = qianchuanSDK.XxxReq` 形式别名，降低第一步成本）。
3. 提供一个基于当前 `qianchuanSDK.Manager` 的实现：`QianchuanSDKClient`，内部几乎 1:1 转发到原来的 Manager。
4. 修改 `QianchuanService` 结构体，从持有 `*qianchuanSDK.Manager` 改为持有 `QianchuanClient` 接口实例。
5. 修改所有 Handler：
   - 不再直接调用 `h.service.Manager.Xxx(...)`，改为调用 `h.service.Client.Xxx(...)` 或 `service` 层的包装方法。
6. 等所有代码都只依赖 `QianchuanClient` 接口后，再实现一个 `OceanengineClient`：
   - 内部使用 oceanengine 的 client
   - 做好请求/响应字段的映射
   - 可以按模块逐个切换实现

**优点**：
- 迁移拆成两大阶段：
  - 阶段 1：**解耦自己的代码与具体 SDK**（风险极低，主要是机械性重构）。
  - 阶段 2：**在接口不变的前提下替换底层实现**（可按模块逐步推进）。
- 行为更容易保持一致：
  - 阶段 1 完成后，跑一遍现有测试 + 手动回归即可确认无行为变化。
  - 阶段 2 中每替换一个模块，都可以针对性回归。
- 为未来扩展留好空间：
  - 可以并存多种实现（例如根据环境变量选择使用 qianchuanSDK 还是 oceanengine）。

**缺点**：
- 短期代码会多出一层“适配器”，行数略有膨胀。
- 设计接口需要一定前期梳理工作（需要整理出当前实际使用的所有 Manager 方法）。

**在本项目中的评估**：
- 更符合当前工程状态（已有完整 API/文档/Swagger，适合做渐进式重构）。
- 风险可控，易于回滚，适合由 1～2 个开发者在 3～5 周内完成。
- **工作量估算**：19～36 人天（包含验证、开发、测试、文档），建议预留 50% 的风险缓冲时间。

## 4. 本仓库推荐路线图

本仓库后续推荐按以下顺序推进迁移：

1. **阶段 0：信息梳理与对齐**
   - 列出当前所有使用的 `qianchuanSDK.Manager` 方法及其请求/响应类型。
   - 对照千川官方接口文档和 oceanengine SDK，确认哪些接口一一对应，哪些存在差异或缺口。

2. **阶段 1：抽象 `QianchuanClient` 接口**
   - 在 `backend/internal/service` 或 `backend/internal/sdk` 中定义统一接口与自有 DTO。
   - 为当前 `qianchuanSDK` 提供一个零行为变化的 `QianchuanSDKClient` 实现。
   - 修改 `QianchuanService` 与所有 Handler，使其只依赖 `QianchuanClient`。

3. **阶段 2：实现 oceanengine 版本客户端（POC）**
   - 先选择一到两个关键模块（建议：`Auth + Advertiser` 或 `Ad + Campaign`）做 PoC：
     - 实现 `OceanengineClient` 对这些方法的支持。
     - 在配置中加入开关（例如 `QIANCHUAN_SDK_PROVIDER=oceanengine`）。
     - 在测试环境中切换到 oceanengine，跑通核心链路。

4. **阶段 3：按模块迁移与功能补齐**
   - 按优先级依次迁移：Auth → Advertiser → Ad/Campaign → Creative/File → Report → Tools → Finance → Live/Aweme/UniPromotion。
   - 同步检查之前返回 501 的接口，评估 oceanengine 是否已支持，对应地补齐实现。

5. **阶段 4：清理与收尾**
   - 确认所有模块在 oceanengine 模式下跑稳后：
     - 清理老的 qianchuanSDK 依赖与适配实现（如果不再需要）。
     - 更新文档（README / API_CONTRACTS / PROJECT_STATUS 等），记录新的 SDK 依赖与覆盖范围。

## 5. 相关设计文档

## 6. 近期进展（2025-11-21）

- 已完成阶段 1：QianchuanClient 抽象 + 全量 Handler 改造，行为保持一致
- 已接入运行时开关：QIANCHUAN_SDK_PROVIDER（默认 qianchuanSDK）
- 已实现 OceanEngine POC（带 build tag -tags oceanengine）：
  - 账户预算查询/更新（AdvertiserBudgetGet/Update）
  - 其他接口仍由 qianchuanSDK 适配层提供
- 构建方式：
  - 默认：`go build ./cmd/server`
  - POC：`go build -tags oceanengine ./cmd/server` 并设置 `QIANCHUAN_SDK_PROVIDER=oceanengine`


本总览文档只给出高层策略。具体技术方案拆分在以下几个文档中：

- `QIANCHUAN_CLIENT_INTERFACE_DESIGN.md`
  - 详细定义 `QianchuanClient` 接口
  - 说明各功能域的方法签名和请求/响应 DTO
  - 描述基于当前 `qianchuanSDK` 的适配实现结构
- `QIANCHUAN_SDK_TO_OCEANENGINE_MAPPING.md`
  - 按模块列出“当前调用 → 对应官方 API / oceanengine 模块”的映射
  - 标注完全对应 / 需要适配 / SDK 不支持三类情况
- `QIANCHUAN_SDK_MIGRATION_PLAN_STEP_BY_STEP.md`
  - 给出可执行的逐步迁移计划与检查清单
  - 用于开发日常对照执行与记录进度
