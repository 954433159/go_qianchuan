# SDK 对比分析：CriarBrand/qianchuanSDK vs bububa/oceanengine

**分析时间**: 2025-11-27

---

## 一、项目概览

| 维度 | CriarBrand/qianchuanSDK | bububa/oceanengine |
|------|-------------------------|---------------------|
| **GitHub 地址** | github.com/CriarBrand/qianchuanSDK | github.com/bububa/oceanengine |
| **Star 数** | 3 ⭐ | 111 ⭐ |
| **Fork 数** | 3 | 48 |
| **最后更新** | 2023-03-28 (约20个月未更新) | 2025-11-12 (持续维护) |
| **语言** | Go | Go |
| **描述** | 千川SDK | 巨量引擎 marketing-api golang sdk |

---

## 二、功能覆盖范围

### 2.1 CriarBrand/qianchuanSDK

**专注千川平台**，覆盖以下模块：

| 模块 | 实现文件 | API数量 | 备注 |
|------|----------|---------|------|
| OAuth认证 | `oauth.go` | 4 | 基础完整 |
| 广告计划 | `ad.go` | ~15 | 核心功能 |
| 广告组 | `ad_campaign.go` | 4 | 基础完整 |
| 创意管理 | `ad_creative.go` | 3 | 查询为主 |
| 关键词 | `ad_keyword.go` | 7 | 较完整 |
| 数据报表 | `ad_report.go` | 3 | 基础报表 |
| 文件管理 | `file.go` | 5 | 图片/视频 |
| 财务管理 | `finance.go` | 7 | 较完整 |
| 直播数据 | `live.go` | 6 | 较完整 |
| 随心推 | `aweme_order.go` | 10 | 较完整 |
| DMP人群 | `dmp.go` | 8 | 较完整 |
| 工具接口 | `tools.go` | 10 | 定向工具 |
| **全域推广** | ❌ | 0 | **完全缺失** |

**总计**: ~30个Go文件，约82个API方法

### 2.2 bububa/oceanengine

**全产品线覆盖**，包含多个子SDK：

| 子平台 | 文档 | 说明 |
|--------|------|------|
| 巨量引擎开放平台 | OCEANENGINE.md | 广告投放核心 |
| **巨量千川开放平台** | QIANCHUAN.md | 电商广告 |
| 巨量星图开放平台 | STAR.md | 达人营销 |
| 巨量本地推开放平台 | LOCAL.md | 本地生活 |
| 企业号开放平台 | ENTERPRISE.md | 企业号管理 |
| 巨量应用市场 | SERVE_MARKET.md | 应用市场 |

**千川模块覆盖** (从 QIANCHUAN.md 文档)：

| 模块 | API数量 | 实现状态 |
|------|---------|----------|
| OAuth授权 | 3 | ✅ |
| 账户关系获取 | 7 | ✅ |
| 账户信息获取 | 6 | ✅ |
| 资金管理 | 8 | ✅ |
| 广告账户预算 | 2 | ✅ |
| 广告组管理 | 4 | ✅ |
| 广告计划管理 | 18 | ✅ |
| 广告创意管理 | 3 | ✅ |
| 广告素材管理 | 5 | ✅ |
| 商品/直播间管理 | 5 | ✅ |
| 关键词管理 | 5 | ✅ |
| 否定词管理 | 2 | ✅ |
| **全域推广** | **12** | ✅ |
| 数据报表(广告) | 13 | ✅ |
| 数据报表(直播) | 6 | ✅ |
| 商品竞争分析 | 3 | ✅ |
| 随心推投放 | 13 | ✅ |
| 素材管理 | 12 | ✅ |
| 工具 | 20+ | ✅ |

**总计**: 约140+ API方法 (仅千川模块)

---

## 三、架构设计对比

### 3.1 CriarBrand/qianchuanSDK

```
qianchuanSDK/
├── auth/              # 认证模块
│   ├── context.go
│   ├── credentials.go
│   └── signer.go
├── client/            # HTTP客户端
│   └── client.go
├── conf/              # 配置
│   └── conf.go
├── internal/log/      # 内部日志
├── reqid/             # 请求ID
├── manager.go         # 核心管理器 ★
├── ad.go              # 广告API
├── oauth.go           # OAuth API
└── ... (约30个文件)
```

**设计特点**:
- 单一 `Manager` 结构体承载所有API方法
- 扁平结构，所有API在根目录
- 自带限流器 (`ratelimit.go`)
- 自带Token管理器 (`token_manager.go`)
- 简单直接，入门成本低

### 3.2 bububa/oceanengine

```
oceanengine/
└── marketing-api/
    ├── api/           # API实现
    │   ├── oauth/
    │   ├── advertiser/
    │   ├── agent/
    │   ├── ad/
    │   ├── creative/
    │   ├── file/
    │   ├── report/
    │   ├── tools/
    │   └── qianchuan/  # 千川专用API ★
    │       ├── ad/
    │       ├── advertiser/
    │       ├── aweme/
    │       ├── creative/
    │       ├── file/
    │       ├── finance/
    │       ├── live/
    │       ├── report/
    │       ├── shop/
    │       └── uni_promotion/  # 全域推广 ★
    ├── core/          # 核心组件
    ├── model/         # 数据模型
    │   └── qianchuan/ # 千川模型
    ├── enum/          # 枚举定义
    └── util/          # 工具函数
```

**设计特点**:
- 模块化设计，按业务域分包
- 请求/响应模型独立定义 (`model/`)
- 枚举类型统一管理 (`enum/`)
- 支持多平台 (巨量引擎/千川/星图/本地推/企业号)
- 专业级架构，适合大型项目

---

## 四、代码质量对比

### 4.1 代码风格

| 维度 | CriarBrand/qianchuanSDK | bububa/oceanengine |
|------|-------------------------|---------------------|
| 文档注释 | 基础中文注释 | 完整GoDoc |
| 错误处理 | 简单error返回 | 结构化错误类型 |
| 类型安全 | 基础 | 强类型+枚举 |
| Context支持 | 部分支持 | 全面支持 |
| CI/CD | 无 | GitHub Actions |
| Go Report | 未知 | A级评分 |

### 4.2 示例：OAuth实现对比

**CriarBrand/qianchuanSDK**:
```go
func (m *Manager) OauthAccessToken(req OauthAccessTokenReq) (res *OauthAccessTokenRes, err error) {
    err = m.client.CallWithJson(context.Background(), &res, "POST", 
        m.url("%s", conf.API_OAUTH_ACCESS_TOKEN), nil, OauthAccessTokenBody{
            AppId:     m.Credentials.AppId,
            Secret:    m.Credentials.AppSecret,
            GrantType: "auth_code",
            AuthCode:  req.AuthCode,
        })
    return res, err
}
```

**bububa/oceanengine**:
```go
func AccessToken(ctx context.Context, clt *core.SDKClient, authCode string) (*AccessTokenResponseData, error) {
    var resp AccessTokenResponse
    if err := clt.Post(ctx, "oauth2/access_token/", 
        AccessTokenRequest{
            AppId:     clt.AppId(),
            Secret:    clt.Secret(),
            GrantType: "auth_code",
            AuthCode:  authCode,
        }, &resp); err != nil {
        return nil, err
    }
    return resp.Data, resp.Error()
}
```

**差异**:
- oceanengine 函数式设计，更灵活
- oceanengine 内置错误处理链
- oceanengine 支持 context 传递

---

## 五、全域推广能力对比

这是两个SDK最关键的差异点。

### 5.1 CriarBrand/qianchuanSDK

**全域推广: ❌ 完全不支持**

当前项目 `handler/uni_promotion.go` 所有12个端点均返回501：
- 列表查询、详情查询
- 创建、更新、状态更新
- 素材更新、授权更新
- 预算更新、ROI目标更新
- 投放时间更新
- 预算排期查询/更新

### 5.2 bububa/oceanengine

**全域推广: ✅ 完整支持** (api/qianchuan/uni_promotion/)

| API | 方法签名 |
|-----|----------|
| 授权初始化 | `AuthInit(ctx, clt, accessToken, req)` |
| 创建计划 | `Create(ctx, clt, accessToken, req)` |
| 编辑计划 | `Update(ctx, clt, accessToken, req)` |
| 更改状态 | `StatusUpdate(ctx, clt, accessToken, req)` |
| 获取列表 | `List(ctx, clt, accessToken, req)` |
| 获取详情 | `Detail(ctx, clt, accessToken, req)` |
| 获取素材 | `MaterialGet(ctx, clt, accessToken, req)` |
| 删除素材 | `MaterialDelete(ctx, clt, accessToken, req)` |
| 抖音号列表 | `AuthorizedGet(ctx, clt, accessToken, req)` |
| 更新名称 | `AdNameUpdate(ctx, clt, accessToken, req)` |
| 更新预算 | `AdBudgetUpdate(ctx, clt, accessToken, req)` |
| 更新ROI | `AdRoi2GoalUpdate(ctx, clt, accessToken, req)` |
| 更新时间 | `AdScheduleDateUpdate(ctx, clt, accessToken, req)` |

---

## 六、迁移评估

### 6.1 迁移收益

| 收益 | 说明 |
|------|------|
| ✅ 全域推广支持 | 立即打通12个501端点 |
| ✅ 持续维护 | 2025年仍在活跃更新 |
| ✅ 更多API | 千川模块API数量翻倍 |
| ✅ 多平台扩展 | 未来可接入星图、本地推等 |
| ✅ 社区支持 | Star数高，问题反馈渠道畅通 |

### 6.2 迁移成本

| 成本 | 说明 |
|------|------|
| ⚠️ API签名变更 | 函数式 vs 方法式，需重构调用层 |
| ⚠️ 类型重新映射 | Request/Response结构不同 |
| ⚠️ 错误处理调整 | 错误类型和处理逻辑变化 |
| ⚠️ 测试重写 | 现有SDK测试用例需适配 |

### 6.3 迁移方案

**推荐策略**: 渐进式迁移 + 抽象层隔离

当前项目已有 `internal/sdk/interface.go` 定义了 `QianchuanClient` 接口，可以：

1. **保留现有接口不变**
2. **新增 `provider_oceanengine.go`** 实现（已存在雏形）
3. **通过环境变量切换** `QIANCHUAN_SDK_PROVIDER`
4. **逐模块迁移验证**

```go
// 现有架构已支持
client := sdk.NewClientForProvider(provider, manager, appId, appSecret)
// provider = "oceanengine" → 使用 bububa/oceanengine
// provider = ""           → 使用 CriarBrand/qianchuanSDK
```

---

## 七、建议

### 7.1 短期 (1-2周)

**优先实现全域推广**:
1. 在 `internal/sdk/provider_oceanengine.go` 中添加全域推广方法
2. 直接调用 `bububa/oceanengine` 的 `api/qianchuan/uni_promotion`
3. 验证后切换生产环境

### 7.2 中期 (1-2月)

**完整迁移到 oceanengine**:
1. 梳理所有API映射关系
2. 更新 `QianchuanClient` 接口以支持新API
3. 逐模块替换实现
4. 保留qianchuanSDK作为fallback

### 7.3 长期

**移除qianchuanSDK依赖**:
1. 完成所有API迁移验证
2. 删除 `qianchuanSDK/` 目录
3. 清理 `go.mod` 中的 replace 指令
4. 统一使用 oceanengine SDK

---

## 八、总结

| 维度 | CriarBrand/qianchuanSDK | bububa/oceanengine | 推荐 |
|------|-------------------------|---------------------|------|
| 功能完整度 | 60% | 95% | oceanengine |
| 全域推广 | ❌ | ✅ | oceanengine |
| 维护活跃度 | 低 | 高 | oceanengine |
| 架构设计 | 简单 | 专业 | oceanengine |
| 迁移成本 | - | 中等 | - |
| 学习曲线 | 低 | 中等 | qianchuanSDK |

**结论**: 建议逐步迁移到 `bububa/oceanengine`，优先解决全域推广功能缺失问题。当前项目的抽象层设计为这种迁移提供了良好的基础。
