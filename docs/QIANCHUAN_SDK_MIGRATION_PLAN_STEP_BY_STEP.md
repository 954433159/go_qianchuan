# 千川 SDK 迁移分步实施计划

> 本文档给出一个可实际执行的从 `qianchuanSDK` 迁移到 `oceanengine` 系列 SDK 的分阶段计划，涵盖：任务拆分、风险控制、检查项、回滚策略。

## 阶段 0：准备与对齐（2～3 人天）

### 0.1 梳理当前依赖

- [ ] 使用 `grep "qianchuanSDK" backend/internal -n` 确认所有直接依赖点：
  - Handler：`auth.go`, `advertiser.go`, `campaign.go`, `ad.go`, `creative.go`, `file.go`, `report.go`, `tools.go`, `finance.go`, `live.go`, `aweme.go`, `uni_promotion.go` 等
  - Middleware：`middleware/auto_refresh.go`
  - Service：`internal/service/qianchuan.go`
- [ ] 统计每个模块调用的 `Manager` 方法列表（可整理到一个表中，放入 `docs/` 便于后续参考）。
- [ ] 统计实际调用次数：`grep -r "h\.service\.Manager\." backend/internal/handler/*.go | wc -l`（预计 75+ 处）

### 0.2 确认 oceanengine 版本与依赖方式

- [ ] 选择具体 SDK：
  - 方案 1：`github.com/bububa/oceanengine`（推荐，社区活跃）
  - 方案 2：官方 `github.com/oceanengine/ad_open_sdk_go`
- [ ] 在单独分支上引入依赖，验证与 Go 版本、现有依赖是否有冲突：
  ```bash
  go get -d github.com/bububa/oceanengine@latest  # 或指定版本
  go mod graph | grep oceanengine  # 检查依赖树
  go mod tidy
  go build ./...  # 验证编译通过
  ```
- [ ] 根据选择的 SDK，查阅其文档/README，确认：
  - 千川相关 API 所在的包路径（如 `marketing-api/api/qianchuan/...`）
  - 初始化 client 的方式（需要哪些配置：appId、secret、authToken 等）。

### 0.3 ⚠️ 关键能力验证（新增，迁移前必做）

- [ ] **验证 oceanengine SDK 对关键接口的支持情况**：
  - [ ] 账户预算查询/更新（`advertiser/budget/get`, `advertiser/budget/update`）
  - [ ] 创意独立创建（`creative/create`）
  - [ ] 创意状态更新（`creative/status/update`）
  - [ ] AI 标题推荐（`file/material/title/list`）
  - [ ] 地域/时段专项更新接口
- [ ] **字段映射可行性验证**（至少 10 个核心接口）：
  - [ ] 对比 qianchuanSDK 与 oceanengine 的请求/响应结构
  - [ ] 记录字段名差异、枚举值差异、嵌套结构差异
  - [ ] 评估映射复杂度：简单转换 vs 需要自定义逻辑
- [ ] **SDK 健康度评估**：
  - [ ] 检查 GitHub 仓库活跃度（最近提交时间、Issue/PR 响应速度）
  - [ ] 查看 Release 历史（是否有频繁的 breaking changes）
  - [ ] 评估社区支持（Stars、Forks、Contributors 数量）
- [ ] **输出决策文档**：
  - [ ] 创建 `docs/OCEANENGINE_SDK_CAPABILITY_REPORT.md`
  - [ ] 包含：支持的接口清单、不支持的接口清单、映射复杂度评估
  - [ ] **Go/No-Go 决策**：如果核心接口不支持 ≥3 个，建议暂停迁移

### 输出物

- `docs/QIANCHUAN_SDK_TO_OCEANENGINE_MAPPING.md` 补充完善（若有缺失）。

---

## 阶段 1：引入 QianchuanClient 抽象（3～5 人天）

> 目标：确保业务代码只依赖 `QianchuanClient` 接口，而不直接依赖 `qianchuanSDK.Manager`。
>
> ⚠️ 注意：工作量包含 75+ 处调用点改造、类型定义、测试验证。

### 1.1 定义接口与 DTO

- [ ] 在 `backend/internal/service` 或新建 `backend/internal/sdk`：
  - 定义 `QianchuanClient` 接口（参考 `QIANCHUAN_CLIENT_INTERFACE_DESIGN.md`）。
  - 第一阶段使用 `type XxxReq = qianchuanSDK.XxxReq` / `type XxxRes = qianchuanSDK.XxxRes` 做别名，降低改动成本。

### 1.2 实现基于 qianchuanSDK 的适配器

- [ ] 实现 `SDKClient`：
  - 结构体中持有 `*qianchuanSDK.Manager`
  - 对每个接口方法，简单转发：
    - `return c.manager.AdvertiserList(qianchuanSDK.AdvertiserListReq(req))`
- [ ] 在 `cmd/server/main.go` 中：
  - 创建 `credentials` 和 `manager` 的逻辑保持不变。
  - 新增：`client := sdk.NewSDKClient(manager)`。
  - 将 `NewQianchuanService(manager)` 改为 `NewQianchuanService(client)`。

### 1.3 改造 QianchuanService

- [ ] 修改结构体：
  - 从 `Manager *qianchuanSDK.Manager` 改为 `Client QianchuanClient`。
- [ ] 修改内部方法：
  - 将对 `s.Manager.Xxx` 的调用，替换为 `s.Client.Xxx`。
  - 业务逻辑保持不变。

### 1.4 改造 Handler（逐文件）

- [ ] 在每个 Handler 中，禁止再访问 `h.service.Manager`：
  - 如需 AppId/Secret 等配置，可在 `QianchuanService` 初始化时作为字段持有（例如 `AppId int64`, `AppSecret string`）。
  - 优先通过 service 暴露的方法完成业务逻辑，而不是在 handler 里直接 new SDK 的 Req struct。

### 1.5 验证与回归

- [ ] 编译通过（`make build-backend`）。
- [ ] 跑现有后端测试（`make test-backend`），修复因接口调整导致的编译和逻辑问题。
- [ ] 手工回归关键流程：
  - 登录 / OAuth 回调
  - 广告主列表 / 详情
  - Campaign & Ad 列表 / 创建 / 更新 / 状态更新
  - 创意查询 / 审核拒绝原因
  - 报表核心接口
  - 财务核心接口

### 阶段 1 完成标准

- 代码中不再出现任何对 `qianchuanSDK.Manager` 的直接访问（仅存在于 `SDKClient` 适配实现中）。
- 所有 Handler 只通过 `QianchuanService` 与 `QianchuanClient` 交互。
- 功能行为与迁移前保持一致。

---

## 阶段 2：oceanengine POC（2～5 人天）

> 目标：在有限模块上实现 `OceanengineClient`，验证整体可行性与主要差异点。
>
> ⚠️ 注意：POC 阶段需充分测试字段映射、错误处理、性能对比。

### 2.1 选择 POC 模块

推荐选择：
- A 选项：`Auth + Advertiser`（覆盖登录、广告主信息）
- B 选项：`Ad + Campaign`（覆盖核心投放链路）

假设选择 A：

### 2.2 引入 oceanengine client

- [ ] 在 `backend/go.mod` 中增加 oceanengine 依赖。
- [ ] 在 `internal/sdk` 新增 `OceanengineClient` 结构体，持有 oceanengine 的 client：
  - 例如：`type OceanengineClient struct { client *ocean.Client }`
  - 初始化方式根据 SDK 文档设置 appId/secret/baseURL 等。

### 2.3 实现部分接口方法

- [ ] 为 POC 范围内的方法在 `OceanengineClient` 上实现：
  - `OauthAccessToken`
  - `OauthRefreshToken`
  - `UserInfo`
  - `AdvertiserList`
  - `AdvertiserInfo`
- [ ] 在实现内部：
  - 将 `QianchuanClient` 定义的 Req DTO 映射为 oceanengine 的请求模型；
  - 调用对应的 `api/qianchuan/...` 函数；
  - 将返回的 SDK 模型映射为统一的 Res DTO。

### 2.4 加入运行时开关

- [ ] 在配置中加入环境变量，例如：`QIANCHUAN_SDK_PROVIDER=qianchuanSDK|oceanengine`。
- [ ] 在 `cmd/server/main.go` 中根据环境变量选择：
  - 若为 `qianchuanSDK`：构造 `SDKClient`；
  - 若为 `oceanengine`：构造 `OceanengineClient`。

### 2.5 测试与对比

- [ ] 在测试环境分别以两种模式跑一遍关键流程：
  - 对比登录流程是否正常（access_token 能获取，广告主列表正常返回）。
  - 对比接口响应结构是否满足前端期望（HTTP 层 JSON 不变）。
- [ ] 记录与修复 —— 尤其是：
  - 字段名/枚举值不一致问题；
  - 错误码差异问题。

### 阶段 2 完成标准

- `QianchuanClient` 的 oceanengine 实现已在至少一个模块上跑通。
- 可以通过环境变量在 qianchuanSDK 与 oceanengine 两种模式之间切换，前端无需修改。

---

## 阶段 3：按模块逐步迁移（10～20 人天，视接口数量而定）

> 目标：将各业务模块从 `SDKClient` 逐步迁移到 `OceanengineClient` 实现，并逐步补齐当前 501 的能力。
>
> ⚠️ 注意：字段映射、异常处理、测试覆盖是主要工作量来源。建议每个模块预留 2-3 人天。

### 3.1 迁移顺序建议

1. Auth + Advertiser（若未在 POC 中完全迁完）
2. Finance（钱包、余额、流水、转账）
3. Ad & Campaign（核心投放能力）
4. Creative & File（创意与素材）
5. Report 基础报表（广告主、计划、广告、创意）
6. Tools（兴趣/行为/地域等工具）
7. 报表扩展 & Live & Aweme
8. UniPromotion（全域推广）

### 3.2 每个模块的迁移步骤模板

以“Ad & Campaign”模块为例：

1. **实现 oceanengine 版本的方法**：
   - 在 `OceanengineClient` 中实现：
     - `CampaignList/Get/Create/Update/StatusUpdate`
     - `AdList/Get/Create/Update/StatusUpdate/BudgetUpdate/BidUpdate`
   - 在实现内部完成 oceanengine ↔ DTO 的字段映射。

2. **特性补齐（可选）**：
   - 对于当前 Handler 中返回 501 的专项更新接口（地域/时间等），检查 oceanengine 是否有对应接口：
     - 若有：在 `QianchuanClient` 中新增方法，在 `OceanengineClient` 中实现，并修改 Handler。
     - 若无：仍保持 501 占位，但可以在 hint 中写明“SDK 不支持，需使用完整 ad.update 接口替代”。

3. **在测试环境启用 oceanengine 模式**：
   - 设置 `QIANCHUAN_SDK_PROVIDER=oceanengine`。
   - 运行完整的模块回归（包括自动化测试 + 手工 UI 测试）。

4. **记录差异与回滚点**：
   - 为每个模块记录一次“变更点说明”（字段差异、错误码差异等）放入 `docs/`。
   - 在问题无法快速解决时，可以临时切回 qianchuanSDK 模式。

### 3.3 阶段性完成标准

- 针对每个模块：
  - [ ] 所有使用的接口在 `OceanengineClient` 上都有实现；
  - [ ] 测试环境在 oceanengine 模式下运行稳定；
  - [ ] 无需回退到 qianchuanSDK 模式即可满足当前业务需求。

---

## 阶段 4：清理与统一（2～3 人天）

> 目标：完成迁移后的收尾工作，清理遗留依赖与文档更新。
>
> ⚠️ 注意：文档更新、代码审查、技术债务整理的工作量常被低估。

### 4.1 依赖清理

- [ ] 如果决定完全停止使用 qianchuanSDK：
  - 从 `backend/go.mod` 中移除 `github.com/CriarBrand/qianchuanSDK` 及 `replace`。
  - 移除本地 `qianchuanSDK/` 目录或将其单独迁出为独立仓库（如仍需维护）。
  - 删除 `SDKClient` 实现或仅保留为“备用实现”。

### 4.2 配置简化

- [ ] 若已经全面切到 oceanengine 模式，可以：
  - 将 `QIANCHUAN_SDK_PROVIDER` 默认为 `oceanengine`。
  - 考虑移除 qianchuanSDK 模式相关配置。

### 4.3 文档更新

- [ ] 更新根 `README.md` 与 `docs/PROJECT_STATUS.md`：
  - SDK 依赖从 `qianchuanSDK` 改为 `oceanengine` 或官方 SDK。
  - 更新“未实现功能（501）”列表，标注已补齐项。
- [ ] 在 `docs/API_CONTRACTS.md` 中补充说明：
  - HTTP 层 API 未改动，仅内部 SDK 实现发生变化。

---

## 阶段 5：后续优化与扩展（可选）

> 目标：在完成迁移的基础上，进一步利用 oceanengine 的完整能力提升产品力。

### 可选方向

1. **补齐高级报表与分析能力**
   - 对接更多维度的报表接口（如多维组合、用户画像等）。
   - 在前端增加可视化与导出功能。

2. **完善账户预算与风险控制**
   - 利用账户预算 API 实现更精细的预算管控与预警机制。

3. **扩展 UniPromotion 与跨产品线能力**
   - 利用 oceanengine 对全域推广、星图、本地推等产品的统一封装，扩展平台支持范围。

4. **测试与监控体系加强**
   - 为关键模块补充更多单元测试/集成测试。
   - 接入监控与告警（如 Prometheus + Alertmanager），追踪 API 错误率与性能指标。

---

## 回滚策略总览

在任何阶段出现严重问题时，可按以下顺序回滚：

1. **阶段 1 内部回滚**
   - 若仅是 Handler 改造导致问题，可退回到旧分支（未使用 `QianchuanClient` 的版本）。

2. **阶段 2/3 SDK 切换回滚**
   - 保持 `SDKClient` 实现与 `QianchuanClient` 接口不变。
   - 将配置 `QIANCHUAN_SDK_PROVIDER` 从 `oceanengine` 切回 `qianchuanSDK`，无需重新部署前端。

3. **极端情况**
   - 若 oceanengine 版本存在结构性问题，可整体回滚至“仅引入 QianchuanClient 抽象，但底层仍是 qianchuanSDK”的版本。

通过严格分阶段和保留双实现（qianchuanSDK + oceanengine），可以在整个迁移过程中做到：
- 出现问题时有清晰的回退路径；
- 不影响前端 API 契约与用户体验；
- 任意时刻都能在测试环境中验证新旧实现的一致性。
