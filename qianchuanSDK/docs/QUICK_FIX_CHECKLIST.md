# 千川SDK快速修复清单

## 🔴 P0 - 立即修复（1-2周内）

### 1. 修复panic错误处理
**文件**: `advertiser.go`, `ad_creative.go`, `ad_other.go`, `ad_campaign.go`

```bash
# 搜索所有panic
grep -rn "panic(err)" *.go
```

**需要修改的位置**:
- [ ] `advertiser.go`:162 - ShopAccountInfo函数
- [ ] `advertiser.go`:202 - AgentInfo函数  
- [ ] `advertiser.go`:206 - AgentInfo函数
- [ ] `ad_creative.go`:131 - CreativeGet函数
- [ ] `ad_creative.go`:135 - CreativeGet函数
- [ ] `ad_creative.go`:177 - CreativeRejectReason函数
- [ ] `ad_creative.go`:181 - CreativeRejectReason函数
- [ ] `ad_campaign.go`:166 - CampaignListGet函数
- [ ] `ad_other.go`:51 - ProductAvailableGet函数
- [ ] `ad_other.go`:91 - AwemeAuthorizedGet函数

**修复示例**:
```go
// ❌ 错误的做法
shopIds, err := json.Marshal(req.ShopIds)
if err != nil {
    panic(err)
}

// ✅ 正确的做法
shopIds, err := json.Marshal(req.ShopIds)
if err != nil {
    return nil, fmt.Errorf("序列化ShopIds失败: %w", err)
}
```

### 2. 修复README.md示例错误

**问题1**: 包名错误
```markdown
❌ 错误:
oauthUrl := manager.OauthConnect(douyinGo.OauthParam{

✅ 正确:
oauthUrl := manager.OauthConnect(qianchuanSDK.OauthParam{
```

**问题2**: Scope类型错误
```markdown
❌ 错误:
Scope: "user_info,mobile_alert,video.list...",

✅ 正确:
Scope: []int64{20120000, 22000000},  // 实际的权限ID数组
```

**问题3**: 所有示例包名统一
- [ ] 第18行: `douyinGo.OauthParam` → `qianchuanSDK.OauthParam`
- [ ] 第26行: `douyinGo.OauthAccessTokenReq` → `qianchuanSDK.OauthAccessTokenReq`
- [ ] 第33行: `douyinGo.OauthRenewRefreshTokenReq` → `qianchuanSDK.OauthRenewRefreshTokenReq`
- [ ] 第40行: `douyinGo.OauthRenewRefreshTokenReq` → `qianchuanSDK.OauthRenewRefreshTokenReq`
- [ ] 第52行: `douyinGo.OauthUserinfoReq` → `qianchuanSDK.OauthUserinfoReq`

### 3. 修复file.go的URL问题

**file.go:78**
```go
// ❌ 错误 - 缺少完整URL
request, err := http.NewRequest("POST", conf.API_FILE_IMAGE_AD, body)

// ✅ 修复方案1: 使用m.url()
request, err := http.NewRequest("POST", m.url("%s", conf.API_FILE_IMAGE_AD), body)

// ✅ 修复方案2: 手动拼接
request, err := http.NewRequest("POST", 
    conf.API_HTTP_SCHEME + conf.API_HOST + conf.API_FILE_IMAGE_AD, body)
```

**file.go:149** - 同样的问题
```go
request, err := http.NewRequest("POST", conf.API_FILE_VIDEO_AD, body)
// 需要同样修复
```

### 4. 添加基础测试

创建以下测试文件:

#### `oauth_test.go`
```go
package qianchuanSDK

import (
    "testing"
)

func TestOauthConnect(t *testing.T) {
    credentials := NewCredentials(123456, "test_secret")
    manager := NewManager(credentials, nil)
    
    url := manager.OauthConnect(OauthParam{
        AppId:       123456,
        State:       "test_state",
        Scope:       []int64{20120000},
        RedirectUri: "https://example.com/callback",
    })
    
    if url == "" {
        t.Error("OauthConnect返回空URL")
    }
}

func TestNewCredentials(t *testing.T) {
    appId := int64(123456)
    appSecret := "test_secret"
    
    cred := NewCredentials(appId, appSecret)
    
    if cred.AppId != appId {
        t.Errorf("AppId不匹配: 期望%d, 实际%d", appId, cred.AppId)
    }
    
    if cred.AppSecret != appSecret {
        t.Errorf("AppSecret不匹配: 期望%s, 实际%s", appSecret, cred.AppSecret)
    }
}
```

#### `util_test.go`
```go
package qianchuanSDK

import (
    "testing"
)

func TestBase64Encode(t *testing.T) {
    input := []byte("test")
    expected := "dGVzdA=="
    
    result := Base64Encode(input)
    
    if result != expected {
        t.Errorf("Base64Encode失败: 期望%s, 实际%s", expected, result)
    }
}

func TestBase64Decode(t *testing.T) {
    input := "dGVzdA=="
    expected := "test"
    
    result, err := Base64Decode(input)
    if err != nil {
        t.Errorf("Base64Decode失败: %v", err)
    }
    
    if string(result) != expected {
        t.Errorf("Base64Decode结果错误: 期望%s, 实际%s", expected, string(result))
    }
}

func TestBuildQuery(t *testing.T) {
    type TestStruct struct {
        Name  string `json:"name"`
        Age   int    `json:"age,omitempty"`
        Email string `json:"email,omitempty"`
    }
    
    param := TestStruct{
        Name: "test",
        Age:  25,
    }
    
    url, err := BuildQuery("https://example.com/api", param, []string{})
    if err != nil {
        t.Errorf("BuildQuery失败: %v", err)
    }
    
    // 应该包含name和age，不包含email
    if url == "" {
        t.Error("BuildQuery返回空URL")
    }
}
```

#### `page_test.go`
```go
package qianchuanSDK

import "testing"

func TestPageInfo(t *testing.T) {
    page := PageInfo{
        Page:        1,
        PageSize:    20,
        TotalNumber: 100,
        TotalPage:   5,
    }
    
    if page.Page != 1 {
        t.Error("Page字段错误")
    }
}
```

**运行测试**:
```bash
go test -v ./...
go test -cover ./...
```

---

## 🟡 P1 - 重要修复（1-2月内）

### 5. 添加Token自动管理

创建 `token_manager.go`:
```go
package qianchuanSDK

import (
    "sync"
    "time"
)

type TokenManager struct {
    accessToken  string
    refreshToken string
    expiresAt    time.Time
    mu           sync.RWMutex
    manager      *Manager
}

func NewTokenManager(manager *Manager) *TokenManager {
    return &TokenManager{
        manager: manager,
    }
}

func (tm *TokenManager) GetAccessToken() (string, error) {
    tm.mu.RLock()
    
    // 如果token还有5分钟过期，就刷新
    if time.Now().Add(5 * time.Minute).After(tm.expiresAt) {
        tm.mu.RUnlock()
        return tm.refreshAccessToken()
    }
    
    token := tm.accessToken
    tm.mu.RUnlock()
    
    return token, nil
}

func (tm *TokenManager) refreshAccessToken() (string, error) {
    tm.mu.Lock()
    defer tm.mu.Unlock()
    
    // 双重检查
    if time.Now().Add(5 * time.Minute).Before(tm.expiresAt) {
        return tm.accessToken, nil
    }
    
    // 刷新token
    res, err := tm.manager.OauthRefreshToken(OauthRefreshTokenReq{
        RefreshToken: tm.refreshToken,
    })
    
    if err != nil {
        return "", err
    }
    
    tm.accessToken = res.Data.AccessToken
    tm.refreshToken = res.Data.RefreshToken
    tm.expiresAt = time.Now().Add(time.Duration(res.Data.ExpiresIn) * time.Second)
    
    return tm.accessToken, nil
}

func (tm *TokenManager) SetTokens(accessToken, refreshToken string, expiresIn uint64) {
    tm.mu.Lock()
    defer tm.mu.Unlock()
    
    tm.accessToken = accessToken
    tm.refreshToken = refreshToken
    tm.expiresAt = time.Now().Add(time.Duration(expiresIn) * time.Second)
}
```

### 6. 添加重试机制

修改 `client/client.go`:
```go
import (
    "time"
    "math"
)

type RetryConfig struct {
    MaxRetries int
    MinBackoff time.Duration
    MaxBackoff time.Duration
}

var DefaultRetryConfig = RetryConfig{
    MaxRetries: 3,
    MinBackoff: 100 * time.Millisecond,
    MaxBackoff: 2 * time.Second,
}

func (r Client) CallWithRetry(ctx context.Context, ret interface{}, method, reqUrl string, 
    headers http.Header, param interface{}, config RetryConfig) error {
    
    var lastErr error
    
    for attempt := 0; attempt <= config.MaxRetries; attempt++ {
        if attempt > 0 {
            // 指数退避
            backoff := time.Duration(math.Pow(2, float64(attempt-1))) * config.MinBackoff
            if backoff > config.MaxBackoff {
                backoff = config.MaxBackoff
            }
            
            select {
            case <-time.After(backoff):
            case <-ctx.Done():
                return ctx.Err()
            }
        }
        
        err := r.CallWithJson(ctx, ret, method, reqUrl, headers, param)
        if err == nil {
            return nil
        }
        
        // 检查是否是可重试的错误
        if !isRetryableError(err) {
            return err
        }
        
        lastErr = err
    }
    
    return lastErr
}

func isRetryableError(err error) bool {
    // TODO: 实现重试策略判断
    // 网络超时、5xx错误等应该重试
    // 4xx客户端错误不应该重试
    return true
}
```

### 7. 添加限流保护

创建 `ratelimit.go`:
```go
package qianchuanSDK

import (
    "context"
    "golang.org/x/time/rate"
)

type RateLimiter struct {
    limiter *rate.Limiter
}

func NewRateLimiter(requestsPerSecond int) *RateLimiter {
    return &RateLimiter{
        limiter: rate.NewLimiter(rate.Limit(requestsPerSecond), requestsPerSecond),
    }
}

func (rl *RateLimiter) Wait(ctx context.Context) error {
    return rl.limiter.Wait(ctx)
}

// 在Manager中使用
type Manager struct {
    client      *client.Client
    Credentials *auth.Credentials
    rateLimiter *RateLimiter
}

func NewManagerWithRateLimit(credentials *auth.Credentials, tr http.RoundTripper, rps int) *Manager {
    client := client.DefaultClient
    client.Transport = newTransport(credentials, nil)
    return &Manager{
        client:      &client,
        Credentials: credentials,
        rateLimiter: NewRateLimiter(rps),
    }
}
```

### 8. 改进日志系统

修改 `internal/log/logger.go`:
```go
package log

import (
    "log"
    "os"
)

type Level int

const (
    DEBUG Level = iota
    INFO
    WARN
    ERROR
)

var (
    currentLevel = INFO
    logger       = log.New(os.Stdout, "", log.LstdFlags)
)

func SetLevel(level Level) {
    currentLevel = level
}

func Debug(msg string) {
    if currentLevel <= DEBUG {
        logger.Printf("[DEBUG] %s", msg)
    }
}

func Info(msg string) {
    if currentLevel <= INFO {
        logger.Printf("[INFO] %s", msg)
    }
}

func Warn(msg string) {
    if currentLevel <= WARN {
        logger.Printf("[WARN] %s", msg)
    }
}

func Error(msg string) {
    if currentLevel <= ERROR {
        logger.Printf("[ERROR] %s", msg)
    }
}
```

---

## 🟢 P2 - 优化改进（3-6月内）

### 9. 升级Go版本
```bash
# 修改 go.mod
- go 1.16
+ go 1.21

# 运行
go mod tidy
```

### 10. 添加配置管理

创建 `config.go`:
```go
package qianchuanSDK

import (
    "os"
    "time"
)

type Environment string

const (
    EnvProduction Environment = "production"
    EnvTest       Environment = "test"
    EnvDev        Environment = "development"
)

type Config struct {
    Environment  Environment
    APIHost      string
    Timeout      time.Duration
    MaxRetries   int
    RateLimitRPS int
    Debug        bool
}

func LoadConfig() *Config {
    env := Environment(getEnvOrDefault("QIANCHUAN_ENV", "production"))
    
    config := &Config{
        Environment:  env,
        Timeout:      30 * time.Second,
        MaxRetries:   3,
        RateLimitRPS: 10,
        Debug:        false,
    }
    
    switch env {
    case EnvProduction:
        config.APIHost = "ad.oceanengine.com"
    case EnvTest:
        config.APIHost = "test-ad.oceanengine.com"
    case EnvDev:
        config.APIHost = "dev-ad.oceanengine.com"
    }
    
    return config
}

func getEnvOrDefault(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

### 11. 添加监控指标

创建 `metrics.go`:
```go
package qianchuanSDK

import (
    "github.com/prometheus/client_golang/prometheus"
    "time"
)

type Metrics struct {
    RequestTotal    *prometheus.CounterVec
    RequestDuration *prometheus.HistogramVec
    ErrorTotal      *prometheus.CounterVec
}

func NewMetrics() *Metrics {
    m := &Metrics{
        RequestTotal: prometheus.NewCounterVec(
            prometheus.CounterOpts{
                Name: "qianchuan_requests_total",
                Help: "Total number of requests",
            },
            []string{"method", "endpoint"},
        ),
        RequestDuration: prometheus.NewHistogramVec(
            prometheus.HistogramOpts{
                Name:    "qianchuan_request_duration_seconds",
                Help:    "Request duration in seconds",
                Buckets: prometheus.DefBuckets,
            },
            []string{"method", "endpoint"},
        ),
        ErrorTotal: prometheus.NewCounterVec(
            prometheus.CounterOpts{
                Name: "qianchuan_errors_total",
                Help: "Total number of errors",
            },
            []string{"method", "endpoint", "error_code"},
        ),
    }
    
    prometheus.MustRegister(m.RequestTotal)
    prometheus.MustRegister(m.RequestDuration)
    prometheus.MustRegister(m.ErrorTotal)
    
    return m
}

func (m *Metrics) RecordRequest(method, endpoint string, duration time.Duration, err error) {
    m.RequestTotal.WithLabelValues(method, endpoint).Inc()
    m.RequestDuration.WithLabelValues(method, endpoint).Observe(duration.Seconds())
    
    if err != nil {
        // 提取错误码
        errorCode := "unknown"
        if qcErr, ok := err.(*QCError); ok {
            errorCode = fmt.Sprintf("%d", qcErr.Code)
        }
        m.ErrorTotal.WithLabelValues(method, endpoint, errorCode).Inc()
    }
}
```

### 12. 完善文档

创建以下文档:

- [ ] `docs/ARCHITECTURE.md` - 架构设计
- [ ] `docs/BEST_PRACTICES.md` - 最佳实践
- [ ] `docs/TROUBLESHOOTING.md` - 故障排查
- [ ] `docs/PERFORMANCE.md` - 性能调优
- [ ] `docs/MIGRATION.md` - 升级指南

---

## 📋 执行顺序建议

### Week 1-2
- [ ] 修复所有panic → return error (Day 1-2)
- [ ] 修复README示例错误 (Day 1)
- [ ] 修复file.go URL问题 (Day 1)
- [ ] 添加基础单元测试 (Day 3-5)
- [ ] 运行测试并修复发现的bug (Day 6-10)

### Week 3-4
- [ ] 实现TokenManager (Day 1-3)
- [ ] 添加重试机制 (Day 4-5)
- [ ] 集成TokenManager到Manager (Day 6-7)
- [ ] 测试TokenManager和重试机制 (Day 8-10)

### Month 2
- [ ] 添加限流保护 (Week 1)
- [ ] 改进日志系统 (Week 1)
- [ ] 并发安全测试和修复 (Week 2)
- [ ] 压力测试 (Week 3)
- [ ] 性能优化 (Week 4)

### Month 3+
- [ ] 添加监控指标
- [ ] 配置管理
- [ ] 文档完善
- [ ] 发布v1.0.0

---

## ✅ 验收标准

### P0完成标准
- [ ] 无panic调用
- [ ] README示例可运行
- [ ] 文件上传功能正常
- [ ] 测试覆盖率 > 50%
- [ ] 所有测试通过

### P1完成标准
- [ ] Token自动刷新功能完善
- [ ] 网络错误自动重试
- [ ] 限流机制生效
- [ ] 日志系统完善
- [ ] 测试覆盖率 > 70%

### P2完成标准
- [ ] 性能基准测试通过
- [ ] 文档完善
- [ ] CI/CD配置
- [ ] 发布v1.0.0版本

---

## 🚀 快速开始修复

```bash
# 1. 克隆或进入项目
cd /Users/wushaobing911/Desktop/qianchuanSDK

# 2. 创建特性分支
git checkout -b fix/critical-issues

# 3. 开始修复
# 先修复panic问题（最关键）

# 4. 提交
git add .
git commit -m "fix: 修复所有panic错误处理"

# 5. 运行测试
go test -v ./...

# 6. 推送
git push origin fix/critical-issues
```

---

**更新日期**: 2025-11-06  
**优先级**: P0 > P1 > P2  
**预计总工时**: 144小时（18个工作日）
