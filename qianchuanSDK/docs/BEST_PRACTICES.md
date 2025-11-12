# 千川SDK最佳实践指南

## 1. 初始化和配置

### 1.1 推荐的初始化方式

```go
package main

import (
    "log"
    
    "github.com/CriarBrand/qianchuanSDK"
    "github.com/CriarBrand/qianchuanSDK/auth"
)

func main() {
    // 1. 从环境变量加载配置
    config := qianchuanSDK.LoadConfig()
    
    // 2. 创建凭证
    credentials := auth.New(YOUR_APP_ID, "YOUR_APP_SECRET")
    
    // 3. 创建Manager
    manager, err := qianchuanSDK.NewManagerWithConfig(credentials, config)
    if err != nil {
        log.Fatal("创建Manager失败:", err)
    }
    
    // 4. 创建Token管理器
    tokenManager := qianchuanSDK.NewTokenManager(manager, nil)
    
    // 5. 创建限流器（可选）
    rateLimiter := qianchuanSDK.NewRateLimiter(10, 20) // 每秒10个请求
}
```

### 1.2 环境变量配置

**生产环境 (.env.production)**:
```bash
QIANCHUAN_ENV=production
QIANCHUAN_API_HOST=ad.oceanengine.com
QIANCHUAN_TIMEOUT=30
QIANCHUAN_MAX_RETRIES=3
QIANCHUAN_RATE_LIMIT_RPS=10
QIANCHUAN_DEBUG=false
QIANCHUAN_LOG_LEVEL=INFO
QIANCHUAN_AUTO_REFRESH_TOKEN=true
```

**开发环境 (.env.development)**:
```bash
QIANCHUAN_ENV=development
QIANCHUAN_API_HOST=dev-ad.oceanengine.com
QIANCHUAN_TIMEOUT=60
QIANCHUAN_MAX_RETRIES=5
QIANCHUAN_RATE_LIMIT_RPS=50
QIANCHUAN_DEBUG=true
QIANCHUAN_LOG_LEVEL=DEBUG
QIANCHUAN_AUTO_REFRESH_TOKEN=true
```

## 2. Token管理

### 2.1 自动Token刷新

```go
// ✅ 推荐：使用TokenManager自动管理
tokenManager := qianchuanSDK.NewTokenManager(manager, &qianchuanSDK.TokenManagerConfig{
    AutoRefresh:      true,              // 启用自动刷新
    RefreshThreshold: 5 * time.Minute,   // 提前5分钟刷新
})

// 首次获取Token
tokenRes, err := manager.OauthAccessToken(qianchuanSDK.OauthAccessTokenReq{
    AuthCode: authCode,
})
if err != nil {
    log.Fatal(err)
}

// 设置Token
tokenManager.SetTokens(
    tokenRes.Data.AccessToken,
    tokenRes.Data.RefreshToken,
    tokenRes.Data.ExpiresIn,
)

// 使用Token（自动刷新）
accessToken, err := tokenManager.GetAccessToken()
```

### 2.2 Token过期监控

```go
// 检查剩余时间
remaining := tokenManager.GetRemainingTime()
if remaining < 10*time.Minute {
    log.Warn("Token即将过期，剩余时间:", remaining)
}

// 检查是否过期
if tokenManager.IsExpired() {
    log.Error("Token已过期")
}
```

### 2.3 Token清理

```go
// 用户登出时清空Token
func Logout() {
    tokenManager.Clear()
    log.Info("Token已清空")
}
```

## 3. 错误处理

### 3.1 分类处理错误

```go
res, err := manager.AdListGet(req)
if err != nil {
    // 网络错误
    if errors.Is(err, context.DeadlineExceeded) {
        log.Error("请求超时")
        return
    }
    
    // 其他错误
    log.Error("请求失败:", err)
    return
}

// 业务错误
if res.Code != 0 {
    switch res.Code {
    case 40001:
        log.Error("Token无效，需要重新授权")
    case 40002:
        log.Error("Token已过期")
    case 40100:
        log.Error("参数错误:", res.Message)
    default:
        log.Error("业务错误:", res.Code, res.Message)
    }
    return
}

// 成功
log.Info("请求成功")
```

### 3.2 重试机制

```go
// ✅ 推荐：使用内置重试
import "github.com/CriarBrand/qianchuanSDK/client"

retryConfig := client.RetryConfig{
    MaxRetries: 3,
    MinBackoff: 100 * time.Millisecond,
    MaxBackoff: 2 * time.Second,
}

err := client.CallWithJsonRetry(ctx, &res, "POST", url, headers, data, retryConfig)

// ❌ 不推荐：手动实现重试
for i := 0; i < 3; i++ {
    err := manager.AdListGet(req)
    if err == nil {
        break
    }
    time.Sleep(time.Duration(i) * time.Second)
}
```

## 4. 限流保护

### 4.1 使用限流器

```go
// 创建限流器
limiter := qianchuanSDK.NewRateLimiter(10, 20) // 每秒10个请求，容量20

// 方式1：阻塞等待（推荐）
ctx := context.Background()
if err := limiter.Wait(ctx); err != nil {
    log.Error("限流等待失败:", err)
    return
}
// 执行请求
res, err := manager.AdListGet(req)

// 方式2：非阻塞检查
if limiter.Allow() {
    // 执行请求
    res, err := manager.AdListGet(req)
} else {
    log.Warn("请求被限流，跳过")
}
```

### 4.2 动态调整速率

```go
// 根据API配额动态调整
quota := getAPIQuota() // 获取API配额
limiter.SetRate(float64(quota) * 0.8) // 使用80%配额
```

## 5. 监控和日志

### 5.1 启用监控

```go
// 创建带监控的Manager
manager := qianchuanSDK.NewManager(credentials, nil)
metricsManager := qianchuanSDK.NewManagerWithMetrics(manager)

// 记录请求
start := time.Now()
res, err := metricsManager.AdListGet(req)
latency := time.Since(start)

metricsManager.Metrics.RecordRequest(
    err == nil && res.Code == 0, // success
    latency,                      // latency
    res.Code,                     // errorCode
)

// 获取指标快照
snapshot := metricsManager.GetMetricsSnapshot()
log.Infof("成功率: %.2f%%", snapshot.GetSuccessRate())
log.Infof("平均延迟: %v", snapshot.AvgLatency)
```

### 5.2 Prometheus集成

```go
import (
    "net/http"
    
    "github.com/CriarBrand/qianchuanSDK"
)

func main() {
    manager := qianchuanSDK.NewManagerWithMetrics(...)
    
    // 暴露Prometheus指标
    http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
        pm := qianchuanSDK.NewPrometheusMetrics(manager.Metrics)
        w.Header().Set("Content-Type", "text/plain")
        w.Write([]byte(pm.Export()))
    })
    
    http.ListenAndServe(":9090", nil)
}
```

### 5.3 日志配置

```go
import "github.com/CriarBrand/qianchuanSDK/internal/log"

// 设置日志级别
log.SetLevel(log.DEBUG)

// 结构化日志
log.InfoJSON("API调用", map[string]interface{}{
    "method": "AdListGet",
    "page": 1,
    "page_size": 20,
    "latency_ms": 150,
})
```

## 6. 并发编程

### 6.1 并发调用API

```go
// ✅ 推荐：使用WaitGroup
var wg sync.WaitGroup
results := make(chan *qianchuanSDK.AdListGetRes, 10)
errors := make(chan error, 10)

for page := 1; page <= 10; page++ {
    wg.Add(1)
    go func(p int) {
        defer wg.Done()
        
        // 限流
        if err := limiter.Wait(ctx); err != nil {
            errors <- err
            return
        }
        
        // 获取Token
        token, err := tokenManager.GetAccessToken()
        if err != nil {
            errors <- err
            return
        }
        
        // 调用API
        res, err := manager.AdListGet(qianchuanSDK.AdListGetReq{
            AdvertiserId: advertiserID,
            AccessToken:  token,
            Page:         p,
            PageSize:     100,
        })
        
        if err != nil {
            errors <- err
            return
        }
        
        results <- res
    }(page)
}

wg.Wait()
close(results)
close(errors)

// 处理结果
for res := range results {
    // 处理数据
}

// 处理错误
for err := range errors {
    log.Error("并发请求失败:", err)
}
```

### 6.2 并发安全

```go
// ✅ TokenManager是并发安全的
for i := 0; i < 100; i++ {
    go func() {
        token, err := tokenManager.GetAccessToken()
        // 安全使用token
    }()
}

// ✅ RateLimiter是并发安全的
for i := 0; i < 100; i++ {
    go func() {
        limiter.Wait(ctx)
        // 执行请求
    }()
}
```

## 7. 性能优化

### 7.1 连接池复用

```go
// ✅ 推荐：复用Manager实例
var managerOnce sync.Once
var globalManager *qianchuanSDK.Manager

func GetManager() *qianchuanSDK.Manager {
    managerOnce.Do(func() {
        globalManager = qianchuanSDK.NewManager(credentials, nil)
    })
    return globalManager
}

// ❌ 不推荐：每次创建新Manager
func BadExample() {
    manager := qianchuanSDK.NewManager(credentials, nil) // 浪费资源
}
```

### 7.2 批量操作

```go
// ✅ 推荐：批量请求
ids := []int64{1, 2, 3, 4, 5, ..., 100}
batchSize := 20

for i := 0; i < len(ids); i += batchSize {
    end := i + batchSize
    if end > len(ids) {
        end = len(ids)
    }
    
    batch := ids[i:end]
    // 批量处理
    processBatch(batch)
}

// ❌ 不推荐：逐个请求
for _, id := range ids {
    // 100次请求，效率低
    processOne(id)
}
```

### 7.3 缓存策略

```go
import "github.com/patrickmn/go-cache"

// 创建缓存
c := cache.New(5*time.Minute, 10*time.Minute)

// 缓存广告列表
func GetAdList(advertiserID int64) (*qianchuanSDK.AdListGetRes, error) {
    cacheKey := fmt.Sprintf("ad_list:%d", advertiserID)
    
    // 检查缓存
    if cached, found := c.Get(cacheKey); found {
        return cached.(*qianchuanSDK.AdListGetRes), nil
    }
    
    // 调用API
    res, err := manager.AdListGet(...)
    if err != nil {
        return nil, err
    }
    
    // 存入缓存
    c.Set(cacheKey, res, cache.DefaultExpiration)
    return res, nil
}
```

## 8. 测试

### 8.1 单元测试

```go
func TestAdListGet(t *testing.T) {
    // 创建测试Manager
    credentials := auth.New(123456, "test_secret")
    manager := qianchuanSDK.NewManager(credentials, nil)
    
    // 准备测试数据
    req := qianchuanSDK.AdListGetReq{
        AdvertiserId: 123456,
        AccessToken:  "test_token",
        Page:         1,
        PageSize:     10,
    }
    
    // 调用API（需要mock或真实环境）
    res, err := manager.AdListGet(req)
    
    // 断言
    assert.NoError(t, err)
    assert.Equal(t, 0, res.Code)
}
```

### 8.2 集成测试

```go
func TestIntegration(t *testing.T) {
    // 跳过集成测试（需要真实凭证）
    if testing.Short() {
        t.Skip("Skipping integration test")
    }
    
    // 使用真实凭证
    credentials := auth.New(
        getEnvInt("APP_ID"),
        os.Getenv("APP_SECRET"),
    )
    
    manager := qianchuanSDK.NewManager(credentials, nil)
    
    // 测试完整流程
    // ...
}
```

## 9. 安全最佳实践

### 9.1 凭证管理

```go
// ✅ 推荐：从环境变量读取
appID := getEnvInt("QIANCHUAN_APP_ID")
appSecret := os.Getenv("QIANCHUAN_APP_SECRET")

// ❌ 不推荐：硬编码
appID := 123456
appSecret := "hardcoded_secret"
```

### 9.2 Token存储

```go
// ✅ 推荐：使用加密存储
type SecureTokenStorage struct {
    encryptedToken string
}

func (s *SecureTokenStorage) SaveToken(token string) {
    s.encryptedToken = encrypt(token)
}

func (s *SecureTokenStorage) LoadToken() string {
    return decrypt(s.encryptedToken)
}

// ❌ 不推荐：明文存储
tokenFile := "token.txt"
ioutil.WriteFile(tokenFile, []byte(token), 0644)
```

## 10. 故障处理

### 10.1 超时控制

```go
// 为每个请求设置超时
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

// 在API调用中使用context
res, err := manager.AdListGetWithContext(ctx, req)
if err == context.DeadlineExceeded {
    log.Error("请求超时")
}
```

### 10.2 熔断器模式

```go
import "github.com/sony/gobreaker"

var cb *gobreaker.CircuitBreaker

func init() {
    cb = gobreaker.NewCircuitBreaker(gobreaker.Settings{
        Name:        "qianchuan_api",
        MaxRequests: 3,
        Interval:    time.Minute,
        Timeout:     time.Minute,
    })
}

func CallAPIWithCircuitBreaker(req interface{}) (interface{}, error) {
    return cb.Execute(func() (interface{}, error) {
        return manager.AdListGet(req.(*qianchuanSDK.AdListGetReq))
    })
}
```

## 11. 生产环境检查清单

- [ ] 使用环境变量配置
- [ ] 启用Token自动刷新
- [ ] 配置合适的限流速率
- [ ] 启用重试机制
- [ ] 添加监控指标
- [ ] 配置日志级别为INFO
- [ ] 实现错误告警
- [ ] 添加健康检查接口
- [ ] 定期备份Token
- [ ] 设置请求超时
- [ ] 实现优雅关闭
- [ ] 添加性能测试

## 12. 常见错误

### 错误1：Token过期未处理
```go
// ❌ 错误
res, _ := manager.AdListGet(req)

// ✅ 正确
tokenManager := qianchuanSDK.NewTokenManager(manager, nil)
token, err := tokenManager.GetAccessToken()
```

### 错误2：未限流导致被封
```go
// ❌ 错误
for i := 0; i < 10000; i++ {
    manager.AdListGet(req)
}

// ✅ 正确
limiter := qianchuanSDK.NewRateLimiter(10, 20)
for i := 0; i < 10000; i++ {
    limiter.Wait(ctx)
    manager.AdListGet(req)
}
```

### 错误3：并发不安全
```go
// ❌ 错误
var token string
for i := 0; i < 100; i++ {
    go func() {
        token = getNewToken() // 竞态条件
    }()
}

// ✅ 正确
tokenManager := qianchuanSDK.NewTokenManager(manager, nil)
for i := 0; i < 100; i++ {
    go func() {
        token, _ := tokenManager.GetAccessToken() // 并发安全
    }()
}
```

## 参考资料

- [千川开放平台文档](https://open.oceanengine.com/doc/index.html?key=qianchuan)
- [Go并发编程最佳实践](https://go.dev/blog/pipelines)
- [Effective Go](https://go.dev/doc/effective_go)
