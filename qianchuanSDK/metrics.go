package qianchuanSDK

import (
	"fmt"
	"sync"
	"time"
)

// Metrics SDK监控指标
type Metrics struct {
	// 请求统计
	TotalRequests     int64         // 总请求数
	SuccessRequests   int64         // 成功请求数
	FailedRequests    int64         // 失败请求数
	
	// 错误统计
	ErrorsByCode      map[int]int64 // 按错误码统计
	
	// 延迟统计
	TotalLatency      time.Duration // 总延迟
	MinLatency        time.Duration // 最小延迟
	MaxLatency        time.Duration // 最大延迟
	AvgLatency        time.Duration // 平均延迟
	
	// Token统计
	TokenRefreshCount int64         // Token刷新次数
	TokenExpiredCount int64         // Token过期次数
	
	// 限流统计
	RateLimitHits     int64         // 被限流次数
	RateLimitWaitTime time.Duration // 限流等待总时间
	
	// 重试统计
	TotalRetries      int64         // 总重试次数
	RetriesByAttempt  map[int]int64 // 按重试次数统计
	
	mu                sync.RWMutex  // 读写锁
	startTime         time.Time     // 启动时间
}

// NewMetrics 创建监控指标
func NewMetrics() *Metrics {
	return &Metrics{
		ErrorsByCode:     make(map[int]int64),
		RetriesByAttempt: make(map[int]int64),
		MinLatency:       time.Duration(0),
		MaxLatency:       time.Duration(0),
		startTime:        time.Now(),
	}
}

// RecordRequest 记录请求
func (m *Metrics) RecordRequest(success bool, latency time.Duration, errorCode int) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.TotalRequests++
	m.TotalLatency += latency
	
	if success {
		m.SuccessRequests++
	} else {
		m.FailedRequests++
		if errorCode != 0 {
			m.ErrorsByCode[errorCode]++
		}
	}
	
	// 更新延迟统计
	if m.MinLatency == 0 || latency < m.MinLatency {
		m.MinLatency = latency
	}
	if latency > m.MaxLatency {
		m.MaxLatency = latency
	}
	if m.TotalRequests > 0 {
		m.AvgLatency = m.TotalLatency / time.Duration(m.TotalRequests)
	}
}

// RecordTokenRefresh 记录Token刷新
func (m *Metrics) RecordTokenRefresh() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.TokenRefreshCount++
}

// RecordTokenExpired 记录Token过期
func (m *Metrics) RecordTokenExpired() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.TokenExpiredCount++
}

// RecordRateLimitHit 记录限流
func (m *Metrics) RecordRateLimitHit(waitTime time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.RateLimitHits++
	m.RateLimitWaitTime += waitTime
}

// RecordRetry 记录重试
func (m *Metrics) RecordRetry(attemptNumber int) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.TotalRetries++
	m.RetriesByAttempt[attemptNumber]++
}

// GetSnapshot 获取指标快照
func (m *Metrics) GetSnapshot() MetricsSnapshot {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	// 复制map
	errorsByCode := make(map[int]int64)
	for k, v := range m.ErrorsByCode {
		errorsByCode[k] = v
	}
	
	retriesByAttempt := make(map[int]int64)
	for k, v := range m.RetriesByAttempt {
		retriesByAttempt[k] = v
	}
	
	return MetricsSnapshot{
		TotalRequests:     m.TotalRequests,
		SuccessRequests:   m.SuccessRequests,
		FailedRequests:    m.FailedRequests,
		ErrorsByCode:      errorsByCode,
		MinLatency:        m.MinLatency,
		MaxLatency:        m.MaxLatency,
		AvgLatency:        m.AvgLatency,
		TokenRefreshCount: m.TokenRefreshCount,
		TokenExpiredCount: m.TokenExpiredCount,
		RateLimitHits:     m.RateLimitHits,
		RateLimitWaitTime: m.RateLimitWaitTime,
		TotalRetries:      m.TotalRetries,
		RetriesByAttempt:  retriesByAttempt,
		Uptime:            time.Since(m.startTime),
	}
}

// Reset 重置指标
func (m *Metrics) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.TotalRequests = 0
	m.SuccessRequests = 0
	m.FailedRequests = 0
	m.ErrorsByCode = make(map[int]int64)
	m.TotalLatency = 0
	m.MinLatency = 0
	m.MaxLatency = 0
	m.AvgLatency = 0
	m.TokenRefreshCount = 0
	m.TokenExpiredCount = 0
	m.RateLimitHits = 0
	m.RateLimitWaitTime = 0
	m.TotalRetries = 0
	m.RetriesByAttempt = make(map[int]int64)
	m.startTime = time.Now()
}

// MetricsSnapshot 指标快照（只读）
type MetricsSnapshot struct {
	TotalRequests     int64
	SuccessRequests   int64
	FailedRequests    int64
	ErrorsByCode      map[int]int64
	MinLatency        time.Duration
	MaxLatency        time.Duration
	AvgLatency        time.Duration
	TokenRefreshCount int64
	TokenExpiredCount int64
	RateLimitHits     int64
	RateLimitWaitTime time.Duration
	TotalRetries      int64
	RetriesByAttempt  map[int]int64
	Uptime            time.Duration
}

// GetSuccessRate 获取成功率
func (s MetricsSnapshot) GetSuccessRate() float64 {
	if s.TotalRequests == 0 {
		return 0
	}
	return float64(s.SuccessRequests) / float64(s.TotalRequests) * 100
}

// GetErrorRate 获取错误率
func (s MetricsSnapshot) GetErrorRate() float64 {
	if s.TotalRequests == 0 {
		return 0
	}
	return float64(s.FailedRequests) / float64(s.TotalRequests) * 100
}

// GetRetryRate 获取重试率
func (s MetricsSnapshot) GetRetryRate() float64 {
	if s.TotalRequests == 0 {
		return 0
	}
	return float64(s.TotalRetries) / float64(s.TotalRequests)
}

// GetAvgRateLimitWaitTime 获取平均限流等待时间
func (s MetricsSnapshot) GetAvgRateLimitWaitTime() time.Duration {
	if s.RateLimitHits == 0 {
		return 0
	}
	return s.RateLimitWaitTime / time.Duration(s.RateLimitHits)
}

// PrometheusMetrics Prometheus格式的指标
type PrometheusMetrics struct {
	metrics *Metrics
}

// NewPrometheusMetrics 创建Prometheus指标收集器
func NewPrometheusMetrics(m *Metrics) *PrometheusMetrics {
	return &PrometheusMetrics{metrics: m}
}

// Export 导出Prometheus格式的指标
func (pm *PrometheusMetrics) Export() string {
	snapshot := pm.metrics.GetSnapshot()
	
	output := "# HELP qianchuan_requests_total Total number of requests\n"
	output += "# TYPE qianchuan_requests_total counter\n"
	output += formatMetric("qianchuan_requests_total", snapshot.TotalRequests)
	
	output += "# HELP qianchuan_requests_success Total number of successful requests\n"
	output += "# TYPE qianchuan_requests_success counter\n"
	output += formatMetric("qianchuan_requests_success", snapshot.SuccessRequests)
	
	output += "# HELP qianchuan_requests_failed Total number of failed requests\n"
	output += "# TYPE qianchuan_requests_failed counter\n"
	output += formatMetric("qianchuan_requests_failed", snapshot.FailedRequests)
	
	output += "# HELP qianchuan_request_latency_seconds Request latency statistics\n"
	output += "# TYPE qianchuan_request_latency_seconds gauge\n"
	output += formatMetric("qianchuan_request_latency_seconds{quantile=\"min\"}", float64(snapshot.MinLatency.Milliseconds())/1000.0)
	output += formatMetric("qianchuan_request_latency_seconds{quantile=\"max\"}", float64(snapshot.MaxLatency.Milliseconds())/1000.0)
	output += formatMetric("qianchuan_request_latency_seconds{quantile=\"avg\"}", float64(snapshot.AvgLatency.Milliseconds())/1000.0)
	
	output += "# HELP qianchuan_token_refresh_total Total number of token refreshes\n"
	output += "# TYPE qianchuan_token_refresh_total counter\n"
	output += formatMetric("qianchuan_token_refresh_total", snapshot.TokenRefreshCount)
	
	output += "# HELP qianchuan_token_expired_total Total number of token expirations\n"
	output += "# TYPE qianchuan_token_expired_total counter\n"
	output += formatMetric("qianchuan_token_expired_total", snapshot.TokenExpiredCount)
	
	output += "# HELP qianchuan_ratelimit_hits_total Total number of rate limit hits\n"
	output += "# TYPE qianchuan_ratelimit_hits_total counter\n"
	output += formatMetric("qianchuan_ratelimit_hits_total", snapshot.RateLimitHits)
	
	output += "# HELP qianchuan_retries_total Total number of retries\n"
	output += "# TYPE qianchuan_retries_total counter\n"
	output += formatMetric("qianchuan_retries_total", snapshot.TotalRetries)
	
	output += "# HELP qianchuan_uptime_seconds Uptime in seconds\n"
	output += "# TYPE qianchuan_uptime_seconds gauge\n"
	output += formatMetric("qianchuan_uptime_seconds", float64(snapshot.Uptime.Seconds()))
	
	return output
}

// formatMetric 格式化指标
func formatMetric(name string, value interface{}) string {
	switch v := value.(type) {
	case int64:
		return fmt.Sprintf("%s %d\n", name, v)
	case float64:
		return fmt.Sprintf("%s %.2f\n", name, v)
	default:
		return ""
	}
}

// ManagerWithMetrics 带监控的Manager
type ManagerWithMetrics struct {
	*Manager
	Metrics *Metrics
}

// NewManagerWithMetrics 创建带监控的Manager
func NewManagerWithMetrics(manager *Manager) *ManagerWithMetrics {
	return &ManagerWithMetrics{
		Manager: manager,
		Metrics: NewMetrics(),
	}
}

// GetMetrics 获取指标
func (m *ManagerWithMetrics) GetMetrics() *Metrics {
	return m.Metrics
}

// GetMetricsSnapshot 获取指标快照
func (m *ManagerWithMetrics) GetMetricsSnapshot() MetricsSnapshot {
	return m.Metrics.GetSnapshot()
}

// ResetMetrics 重置指标
func (m *ManagerWithMetrics) ResetMetrics() {
	m.Metrics.Reset()
}
