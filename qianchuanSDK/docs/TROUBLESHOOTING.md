# 千川SDK故障排查指南

## 常见问题索引

- [Token相关问题](#token相关问题)
- [网络和连接问题](#网络和连接问题)
- [限流和配额问题](#限流和配额问题)
- [性能问题](#性能问题)
- [并发问题](#并发问题)
- [配置问题](#配置问题)
- [API错误码](#api错误码)

---

## Token相关问题

### 问题1: Token过期错误 (40002)

**现象**:
```
API调用返回: code=40002, message="access_token已过期"
```

**原因**:
- Token已超过有效期
- 未启用自动刷新
- 系统时间不同步

**解决方案**:

```go
// 方案1: 使用TokenManager自动管理
tokenManager := qianchuanSDK.NewTokenManager(manager, &qianchuanSDK.TokenManagerConfig{
    AutoRefresh:      true,
    RefreshThreshold: 5 * time.Minute, // 提前5分钟刷新
})

// 方案2: 手动检查并刷新
if tokenManager.IsExpired() {
    token, err := tokenManager.ForceRefresh()
    if err != nil {
        log.Error("刷新Token失败:", err)
    }
}

// 方案3: 检查系统时间
// 确保服务器时间准确
date  # 查看系统时间
ntpdate -u pool.ntp.org  # 同步时间
```

### 问题2: RefreshToken无效 (40003)

**现象**:
```
刷新Token时返回: code=40003, message="refresh_token无效"
```

**原因**:
- RefreshToken已过期（通常30天）
- RefreshToken被撤销
- 使用了错误的RefreshToken

**解决方案**:
```go
// 需要重新授权
func ReauthorizeFlow() {
    // 1. 清空现有Token
    tokenManager.Clear()
    
    // 2. 引导用户重新授权
    authURL := manager.OauthConnect(qianchuanSDK.OauthParam{
        AppId:       appID,
        RedirectUri: redirectURI,
        Scope:       []int64{20120000, 22000000},
        // ...其他参数
    })
    
    log.Info("请访问授权链接:", authURL)
    
    // 3. 用户授权后获取AuthCode
    // 4. 使用AuthCode获取新Token
    tokenRes, err := manager.OauthAccessToken(qianchuanSDK.OauthAccessTokenReq{
        AuthCode: newAuthCode,
    })
    
    if err == nil {
        tokenManager.SetTokens(
            tokenRes.Data.AccessToken,
            tokenRes.Data.RefreshToken,
            tokenRes.Data.ExpiresIn,
        )
    }
}
```

### 问题3: Token并发刷新冲突

**现象**:
- 多个goroutine同时检测到Token过期
- 触发多次刷新请求
- 部分请求失败

**诊断**:
```go
// 启用调试日志
log.SetLevel(log.DEBUG)

// 监控刷新次数
metrics := qianchuanSDK.NewMetrics()
// 检查TokenRefreshCount是否异常高
```

**解决方案**:
```go
// TokenManager已内置双重检查锁定
// 确保使用TokenManager而不是自己实现

// ✅ 正确
tm := NewTokenManager(manager, nil)
for i := 0; i < 100; i++ {
    go func() {
        token, _ := tm.GetAccessToken() // 并发安全
    }()
}

// ❌ 错误
var token string
var mu sync.Mutex
for i := 0; i < 100; i++ {
    go func() {
        mu.Lock()
        if isExpired(token) {
            token = refresh() // 可能重复刷新
        }
        mu.Unlock()
    }()
}
```

---

## 网络和连接问题

### 问题4: 请求超时

**现象**:
```
error: context deadline exceeded
或
error: i/o timeout
```

**原因**:
- 网络延迟过高
- API服务响应慢
- 超时设置过短

**诊断**:
```go
// 启用请求监控
start := time.Now()
res, err := manager.AdListGet(req)
latency := time.Since(start)
log.Infof("请求耗时: %v", latency)

// 检查网络连接
ping ad.oceanengine.com
curl -v https://ad.oceanengine.com
```

**解决方案**:
```go
// 方案1: 增加超时时间
config := qianchuanSDK.LoadConfig()
config.Timeout = 60 * time.Second
manager, _ := qianchuanSDK.NewManagerWithConfig(credentials, config)

// 方案2: 使用context控制超时
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

// 方案3: 启用重试
retryConfig := client.RetryConfig{
    MaxRetries: 3,
    MinBackoff: 100 * time.Millisecond,
    MaxBackoff: 2 * time.Second,
}
```

### 问题5: DNS解析失败

**现象**:
```
error: no such host
error: dial tcp: lookup ad.oceanengine.com: no such host
```

**诊断**:
```bash
# 检查DNS
nslookup ad.oceanengine.com
dig ad.oceanengine.com

# 检查/etc/resolv.conf
cat /etc/resolv.conf
```

**解决方案**:
```bash
# 方案1: 配置DNS服务器
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
echo "nameserver 1.1.1.1" >> /etc/resolv.conf

# 方案2: 添加hosts记录
echo "IP_ADDRESS ad.oceanengine.com" >> /etc/hosts

# 方案3: 使用自定义Resolver
```

```go
// Go代码中自定义DNS
import "net"

dialer := &net.Dialer{
    Resolver: &net.Resolver{
        PreferGo: true,
        Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
            d := net.Dialer{}
            return d.DialContext(ctx, "udp", "8.8.8.8:53")
        },
    },
}
```

### 问题6: 连接被拒绝

**现象**:
```
error: connection refused
error: dial tcp: connect: connection refused
```

**原因**:
- 防火墙阻止
- 代理配置错误
- API服务不可用

**解决方案**:
```bash
# 检查防火墙
iptables -L
firewall-cmd --list-all

# 检查代理设置
echo $HTTP_PROXY
echo $HTTPS_PROXY

# 测试连接
telnet ad.oceanengine.com 443
nc -zv ad.oceanengine.com 443
```

---

## 限流和配额问题

### 问题7: 触发API限流 (429)

**现象**:
```
code=429, message="请求过于频繁"
或
HTTP 429 Too Many Requests
```

**诊断**:
```go
// 启用限流监控
metrics := qianchuanSDK.NewMetrics()
snapshot := metrics.GetSnapshot()
log.Infof("限流次数: %d", snapshot.RateLimitHits)
log.Infof("平均等待时间: %v", snapshot.GetAvgRateLimitWaitTime())
```

**解决方案**:
```go
// 方案1: 使用RateLimiter
limiter := qianchuanSDK.NewRateLimiter(10, 20) // 每秒10个请求

for _, req := range requests {
    if err := limiter.Wait(ctx); err != nil {
        log.Error("限流等待失败:", err)
        continue
    }
    res, err := manager.AdListGet(req)
    // 处理响应...
}

// 方案2: 动态调整速率
currentQPS := getCurrentQPS()
if currentQPS > 100 {
    limiter.SetRate(8.0) // 降低速率
} else {
    limiter.SetRate(12.0) // 提高速率
}

// 方案3: 指数退避
backoff := 100 * time.Millisecond
for retries := 0; retries < 5; retries++ {
    res, err := manager.AdListGet(req)
    if err == nil && res.Code != 429 {
        break
    }
    time.Sleep(backoff)
    backoff *= 2 // 指数增长
}
```

### 问题8: 超出每日配额

**现象**:
```
code=40011, message="超出每日请求配额"
```

**监控**:
```go
// 实时监控请求数
type DailyQuotaMonitor struct {
    count    int64
    lastDate time.Time
    mu       sync.Mutex
}

func (m *DailyQuotaMonitor) RecordRequest() {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    today := time.Now().Truncate(24 * time.Hour)
    if !m.lastDate.Equal(today) {
        m.count = 0
        m.lastDate = today
    }
    m.count++
    
    if m.count > DAILY_QUOTA*0.9 {
        log.Warn("即将超出每日配额:", m.count)
    }
}
```

**解决方案**:
1. 优化请求策略：批量操作、缓存结果
2. 申请提升配额
3. 分散到多个账号

---

## 性能问题

### 问题9: 响应延迟高

**诊断**:
```go
// 记录各阶段耗时
type LatencyBreakdown struct {
    DNSLookup    time.Duration
    TCPConnect   time.Duration
    TLSHandshake time.Duration
    ServerProcessing time.Duration
}

// 使用Metrics监控
metrics := qianchuanSDK.NewMetrics()
snapshot := metrics.GetSnapshot()
log.Infof("平均延迟: %v", snapshot.AvgLatency)
log.Infof("最大延迟: %v", snapshot.MaxLatency)
log.Infof("最小延迟: %v", snapshot.MinLatency)
```

**优化方案**:
```go
// 1. 连接池复用
var managerOnce sync.Once
var globalManager *qianchuanSDK.Manager

func GetManager() *qianchuanSDK.Manager {
    managerOnce.Do(func() {
        globalManager = qianchuanSDK.NewManager(credentials, nil)
    })
    return globalManager
}

// 2. 并发请求
var wg sync.WaitGroup
results := make(chan Result, 100)

for _, req := range requests {
    wg.Add(1)
    go func(r Request) {
        defer wg.Done()
        res, _ := manager.Process(r)
        results <- res
    }(req)
}

// 3. 缓存热点数据
cache := cache.New(5*time.Minute, 10*time.Minute)
```

### 问题10: 内存占用过高

**诊断**:
```go
import "runtime"

// 监控内存
var m runtime.MemStats
runtime.ReadMemStats(&m)
log.Infof("Alloc = %v MB", m.Alloc/1024/1024)
log.Infof("TotalAlloc = %v MB", m.TotalAlloc/1024/1024)
log.Infof("Sys = %v MB", m.Sys/1024/1024)
log.Infof("NumGC = %v", m.NumGC)

// 性能分析
import _ "net/http/pprof"
http.ListenAndServe(":6060", nil)
// go tool pprof http://localhost:6060/debug/pprof/heap
```

**解决方案**:
```go
// 1. 及时释放资源
defer res.Body.Close()

// 2. 限制并发数
semaphore := make(chan struct{}, 10) // 最多10个并发

// 3. 分批处理
batchSize := 100
for i := 0; i < len(data); i += batchSize {
    batch := data[i:min(i+batchSize, len(data))]
    processBatch(batch)
    runtime.GC() // 必要时手动GC
}
```

---

## 并发问题

### 问题11: 数据竞态

**诊断**:
```bash
# 使用race detector运行
go test -race ./...
go run -race main.go
```

**常见问题**:
```go
// ❌ 错误：无锁访问共享变量
var counter int
for i := 0; i < 100; i++ {
    go func() {
        counter++ // 数据竞态
    }()
}

// ✅ 正确：使用互斥锁
var counter int
var mu sync.Mutex
for i := 0; i < 100; i++ {
    go func() {
        mu.Lock()
        counter++
        mu.Unlock()
    }()
}

// ✅ 更好：使用atomic
var counter int64
for i := 0; i < 100; i++ {
    go func() {
        atomic.AddInt64(&counter, 1)
    }()
}
```

### 问题12: Goroutine泄漏

**诊断**:
```go
import "runtime"

// 监控goroutine数量
numGoroutines := runtime.NumGoroutine()
log.Infof("当前goroutine数: %d", numGoroutines)

// 如果持续增长，可能存在泄漏
```

**常见原因和解决**:
```go
// 原因1: Channel未关闭
ch := make(chan int)
go func() {
    for v := range ch { // 永远等待
        process(v)
    }
}()
// 解决：记得关闭channel
close(ch)

// 原因2: Context未取消
ctx := context.Background()
go doSomething(ctx) // 永远运行
// 解决：使用可取消的context
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// 原因3: WaitGroup不匹配
var wg sync.WaitGroup
wg.Add(2)
go func() { defer wg.Done(); task1() }()
// 缺少一个Done()
wg.Wait() // 永远等待
// 解决：确保Add和Done匹配
```

---

## 配置问题

### 问题13: 配置未生效

**检查步骤**:
```bash
# 1. 检查环境变量是否设置
env | grep QIANCHUAN

# 2. 检查配置文件
cat .env

# 3. 检查配置加载顺序
```

```go
// 调试配置加载
config := qianchuanSDK.LoadConfig()
log.Debugf("Environment: %s", config.Environment)
log.Debugf("APIHost: %s", config.APIHost)
log.Debugf("Timeout: %v", config.Timeout)
log.Debugf("MaxRetries: %d", config.MaxRetries)
log.Debugf("RateLimitRPS: %f", config.RateLimitRPS)
log.Debugf("Debug: %v", config.Debug)

// 验证配置
if err := config.Validate(); err != nil {
    log.Fatal("配置无效:", err)
}
```

### 问题14: 环境切换问题

**场景**: 从开发环境切换到生产环境时API调用失败

**检查清单**:
```bash
# 1. 环境变量是否正确
echo $QIANCHUAN_ENV  # 应该是production

# 2. API Host是否正确
echo $QIANCHUAN_API_HOST  # 应该是ad.oceanengine.com

# 3. 凭证是否正确
echo $QIANCHUAN_APP_ID
echo $QIANCHUAN_APP_SECRET  # 不要在生产日志中打印

# 4. Token是否需要重新授权
# 开发环境和生产环境的Token不通用
```

---

## API错误码

### 常见错误码速查

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 0 | 成功 | - |
| 40001 | Token无效 | 重新授权 |
| 40002 | Token过期 | 刷新Token |
| 40003 | RefreshToken无效 | 重新授权 |
| 40100 | 参数错误 | 检查请求参数 |
| 40104 | 签名错误 | 检查AppSecret |
| 40108 | 应用未审核通过 | 联系平台审核 |
| 429 | 请求过于频繁 | 降低请求频率 |
| 50000 | 服务器内部错误 | 重试或联系平台 |

### 错误处理示例

```go
func HandleAPIError(code int, message string) error {
    switch code {
    case 0:
        return nil
    case 40001, 40002, 40003:
        // Token相关错误
        return fmt.Errorf("Token错误: %s, 需要重新授权", message)
    case 40100:
        // 参数错误
        return fmt.Errorf("参数错误: %s", message)
    case 429:
        // 限流
        return fmt.Errorf("请求过于频繁，建议降低请求频率")
    case 50000:
        // 服务器错误
        return fmt.Errorf("服务器错误: %s, 可以重试", message)
    default:
        return fmt.Errorf("未知错误 [%d]: %s", code, message)
    }
}
```

---

## 调试技巧

### 启用详细日志

```go
import "github.com/CriarBrand/qianchuanSDK/internal/log"

// 设置为DEBUG级别
log.SetLevel(log.DEBUG)

// 使用结构化日志
log.DebugJSON("API请求", map[string]interface{}{
    "method": "POST",
    "url": url,
    "headers": headers,
    "body": body,
})

log.DebugJSON("API响应", map[string]interface{}{
    "status_code": statusCode,
    "body": responseBody,
    "latency_ms": latency.Milliseconds(),
})
```

### 使用RequestID追踪

```go
import "github.com/CriarBrand/qianchuanSDK/reqid"

// 为每个请求生成唯一ID
requestID := reqid.Gen()
ctx := reqid.NewContext(context.Background(), requestID)

log.Infof("[%s] 开始请求", requestID)
res, err := manager.AdListGetWithContext(ctx, req)
log.Infof("[%s] 请求完成, 耗时: %v", requestID, latency)
```

### 网络抓包

```bash
# 使用tcpdump
sudo tcpdump -i any -s 0 -w qianchuan.pcap host ad.oceanengine.com

# 使用Wireshark分析
wireshark qianchuan.pcap

# 使用charles/mitmproxy等代理工具
```

---

## 获取帮助

### 日志收集

出现问题时，请收集以下信息：

```bash
# 1. SDK版本
go list -m github.com/CriarBrand/qianchuanSDK

# 2. Go版本
go version

# 3. 系统信息
uname -a

# 4. 配置信息（敏感信息脱敏）
env | grep QIANCHUAN | sed 's/SECRET=.*/SECRET=***/'

# 5. 错误日志
tail -n 100 app.log

# 6. 监控指标
curl http://localhost:9090/metrics
```

### 问题报告模板

```markdown
**问题描述**
简要描述遇到的问题

**环境信息**
- SDK版本: v0.2.0
- Go版本: 1.21
- 操作系统: Ubuntu 20.04
- 部署环境: Kubernetes

**重现步骤**
1. 步骤1
2. 步骤2
3. ...

**预期行为**
描述期望的正确行为

**实际行为**
描述实际发生的情况

**错误日志**
```
粘贴相关错误日志
```

**代码示例**
```go
// 相关代码
```

**尝试过的解决方案**
列出已尝试但未解决的方法
```

### 联系方式

- GitHub Issues: https://github.com/CriarBrand/qianchuanSDK/issues
- 官方文档: https://open.oceanengine.com/doc/index.html?key=qianchuan
- 邮件支持: support@example.com

---

## 预防措施

### 监控告警

```go
// 设置监控指标阈值
func MonitorMetrics(metrics *qianchuanSDK.Metrics) {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()
    
    for range ticker.C {
        snapshot := metrics.GetSnapshot()
        
        // 检查成功率
        if snapshot.GetSuccessRate() < 95.0 {
            alert("成功率过低: %.2f%%", snapshot.GetSuccessRate())
        }
        
        // 检查延迟
        if snapshot.AvgLatency > 5*time.Second {
            alert("平均延迟过高: %v", snapshot.AvgLatency)
        }
        
        // 检查限流
        if snapshot.RateLimitHits > 100 {
            alert("限流次数过多: %d", snapshot.RateLimitHits)
        }
        
        // 检查Token刷新
        if snapshot.TokenRefreshCount > 1000 {
            alert("Token刷新异常频繁: %d", snapshot.TokenRefreshCount)
        }
    }
}
```

### 健康检查

```go
func HealthCheck() error {
    // 检查Manager
    if manager == nil {
        return errors.New("Manager未初始化")
    }
    
    // 检查Token
    if tokenManager.IsExpired() {
        return errors.New("Token已过期")
    }
    
    // 检查网络连接
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    _, err := net.DialContext(ctx, "tcp", "ad.oceanengine.com:443")
    if err != nil {
        return fmt.Errorf("无法连接API服务: %w", err)
    }
    
    return nil
}
```

### 定期维护

```bash
# 1. 定期更新SDK
go get -u github.com/CriarBrand/qianchuanSDK

# 2. 定期检查Token有效期
# 3. 定期审查监控指标
# 4. 定期测试故障恢复流程
# 5. 定期备份配置和Token
```

---

最后更新: 2025-11-06
