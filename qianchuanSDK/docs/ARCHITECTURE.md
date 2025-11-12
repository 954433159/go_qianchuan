# 千川SDK架构设计文档

## 概述

千川SDK（qianchuanSDK）是字节跳动巨量引擎千川广告平台的Go语言SDK，提供完整的API封装和企业级功能支持。

## 核心架构

### 1. 分层架构

```
┌─────────────────────────────────────────────────┐
│              应用层 (Application)               │
│  - 广告管理  - 数据报表  - 素材管理              │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│              服务层 (Service)                   │
│  - Manager  - TokenManager  - RateLimiter       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│           基础设施层 (Infrastructure)            │
│  - Client  - Auth  - Config  - Logger           │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│              网络层 (Network)                   │
│        HTTP Client + JSON Serialization         │
└─────────────────────────────────────────────────┘
```

### 2. 核心组件

#### 2.1 Manager（管理器）
- **职责**: 统一的API调用入口
- **功能**: 
  - 封装所有API方法
  - 管理HTTP客户端
  - 处理请求签名
- **位置**: `manager.go`

#### 2.2 TokenManager（Token管理器）
- **职责**: 自动化Token生命周期管理
- **功能**:
  - 自动检测Token过期
  - 提前刷新Token（默认提前5分钟）
  - 并发安全访问
  - 强制刷新支持
- **位置**: `token_manager.go`
- **关键特性**:
  - 双重检查锁定避免并发刷新
  - 读写锁优化性能
  - 可配置刷新阈值

#### 2.3 RateLimiter（限流器）
- **职责**: API速率限制
- **算法**: 令牌桶算法
- **功能**:
  - 阻塞式等待（Wait）
  - 非阻塞式检查（Allow）
  - 动态速率调整
  - 上下文取消支持
- **位置**: `ratelimit.go`

#### 2.4 Config（配置管理）
- **职责**: 统一配置管理
- **功能**:
  - 多环境支持（production/test/development/sandbox）
  - 环境变量加载
  - 配置验证
  - 默认值管理
- **位置**: `config.go`

#### 2.5 Metrics（监控指标）
- **职责**: SDK运行状态监控
- **功能**:
  - 请求统计（成功/失败/延迟）
  - Token统计（刷新/过期）
  - 限流统计
  - 重试统计
  - Prometheus格式导出
- **位置**: `metrics.go`

#### 2.6 Logger（日志系统）
- **职责**: 统一日志输出
- **功能**:
  - 5个日志级别（DEBUG/INFO/WARN/ERROR/FATAL）
  - 结构化JSON日志
  - 文件行号追踪
  - 可配置日志级别
- **位置**: `internal/log/logger.go`

#### 2.7 Client（HTTP客户端）
- **职责**: HTTP请求处理
- **功能**:
  - 重试机制（指数退避）
  - 请求/响应序列化
  - 错误处理
  - 上下文支持
- **位置**: `client/client.go`

#### 2.8 Auth（认证模块）
- **职责**: 请求签名和认证
- **功能**:
  - 签名生成
  - 凭证管理
  - 上下文注入
- **位置**: `auth/`

## 数据流

### 典型请求流程

```
用户代码
   ↓
Manager.AdListGet()
   ↓
[RateLimiter.Wait()] → 限流检查
   ↓
[TokenManager.GetAccessToken()] → 获取有效Token
   ↓
Client.CallWithJson()
   ↓
[Retry Logic] → 失败重试
   ↓
[Auth.Sign()] → 请求签名
   ↓
HTTP Request
   ↓
API Response
   ↓
[Metrics.Record()] → 记录指标
   ↓
返回结果
```

### Token刷新流程

```
GetAccessToken()
   ↓
检查Token有效性
   ↓
是否需要刷新? ─No→ 返回Token
   ↓ Yes
获取写锁
   ↓
双重检查（避免并发）
   ↓
调用RefreshToken API
   ↓
更新Token信息
   ↓
返回新Token
```

## 设计模式

### 1. 单例模式
- **应用**: Manager实例管理
- **好处**: 避免重复创建HTTP客户端

### 2. 工厂模式
- **应用**: 
  - `NewManager()` - 创建管理器
  - `NewTokenManager()` - 创建Token管理器
  - `NewRateLimiter()` - 创建限流器
- **好处**: 统一对象创建逻辑

### 3. 装饰器模式
- **应用**: 
  - `ManagerWithRateLimit` - 添加限流功能
  - `ManagerWithMetrics` - 添加监控功能
- **好处**: 功能组合灵活

### 4. 策略模式
- **应用**: 重试策略配置
- **好处**: 可自定义重试行为

## 并发安全

### 1. TokenManager
- **机制**: `sync.RWMutex`
- **策略**: 
  - 读操作使用RLock（高并发）
  - 写操作使用Lock（独占）
  - 双重检查锁定避免重复刷新

### 2. RateLimiter
- **机制**: `sync.Mutex`
- **策略**: 每次操作持锁，确保令牌计算正确

### 3. Metrics
- **机制**: `sync.RWMutex`
- **策略**: 读多写少场景优化

## 错误处理

### 1. 错误类型

```go
// 业务错误
type QCError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}

// 网络错误
- context.DeadlineExceeded
- context.Canceled
- net.Error

// SDK错误
- Token过期
- 配置无效
- 参数错误
```

### 2. 错误传播
- 使用`fmt.Errorf("%w", err)`包装错误
- 保留错误链，便于调试
- 不使用panic，所有错误通过返回值传递

## 性能优化

### 1. 连接复用
- HTTP客户端复用
- Keep-Alive连接

### 2. 锁优化
- 读写锁分离
- 最小锁粒度
- 双重检查锁定

### 3. 内存优化
- 对象池（待实现）
- 零拷贝（待实现）

## 可扩展性

### 1. 接口设计
```go
type Manager interface {
    // API方法
}

type TokenRefresher interface {
    OauthRefreshToken(req OauthRefreshTokenReq) (*OauthRefreshTokenRes, error)
}
```

### 2. 插件机制
- 自定义HTTP Transport
- 自定义Logger
- 自定义Metrics收集器

## 配置层次

```
代码硬编码配置
   ↓
DefaultConfig
   ↓
环境变量配置
   ↓
LoadConfig()
   ↓
运行时配置
   ↓
NewManagerWithConfig()
```

## 测试策略

### 1. 单元测试
- 每个模块独立测试
- Mock外部依赖
- 覆盖率目标: 70%+

### 2. 集成测试
- 真实API测试（可选）
- 端到端流程测试

### 3. 性能测试
- Benchmark测试
- 并发测试
- 压力测试

## 监控与可观测性

### 1. 指标（Metrics）
- 请求量、成功率、延迟
- Token刷新次数
- 限流次数
- 重试次数

### 2. 日志（Logging）
- 结构化日志
- 可配置级别
- 上下文追踪

### 3. 追踪（Tracing）
- RequestID传递
- 调用链追踪（待实现）

## 版本演进

### v0.1.0 (初始版本)
- 基础API封装
- 简单HTTP客户端

### v0.2.0-beta (当前)
- ✅ Token自动管理
- ✅ 重试机制
- ✅ 限流保护
- ✅ 配置管理
- ✅ 监控指标
- ⚠️ 测试覆盖率33.2%

### v1.0.0 (目标)
- 测试覆盖率70%+
- 完整文档
- 性能优化
- 生产级稳定性

## 未来规划

### 短期（1-2个月）
- 提升测试覆盖率到70%
- 完善文档
- 性能优化

### 中期（3-6个月）
- 分布式追踪支持
- gRPC支持（如果API提供）
- SDK代码生成工具

### 长期（6-12个月）
- 多语言SDK统一
- 服务网格集成
- 云原生支持

## 参考资料

- [千川开放平台文档](https://open.oceanengine.com/doc/index.html?key=qianchuan)
- [Go并发模式](https://go.dev/blog/pipelines)
- [Prometheus最佳实践](https://prometheus.io/docs/practices/)
