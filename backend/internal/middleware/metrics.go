package middleware

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// MetricsData 性能指标数据
type MetricsData struct {
	TotalRequests   int64
	SuccessRequests int64
	ErrorRequests   int64
	TotalDuration   time.Duration
	RequestByPath   map[string]int64
	ErrorsByCode    map[int]int64
}

var metrics = &MetricsData{
	RequestByPath: make(map[string]int64),
	ErrorsByCode:  make(map[int]int64),
}

// Metrics 性能监控中间件
// 收集请求指标用于性能分析
func Metrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		// 处理请求
		c.Next()

		// 记录指标
		duration := time.Since(start)
		statusCode := c.Writer.Status()

		// 更新总请求数
		metrics.TotalRequests++
		metrics.TotalDuration += duration

		// 按路径统计
		metrics.RequestByPath[path]++

		// 按状态码统计
		if statusCode >= 200 && statusCode < 400 {
			metrics.SuccessRequests++
		} else {
			metrics.ErrorRequests++
			metrics.ErrorsByCode[statusCode]++
		}

		// 设置性能头（帮助调试）
		c.Header("X-Response-Time", duration.String())
	}
}

// GetMetrics 获取当前指标（用于监控端点）
func GetMetrics() *MetricsData {
	return metrics
}

// ResetMetrics 重置指标（用于测试或定期重置）
func ResetMetrics() {
	metrics = &MetricsData{
		RequestByPath: make(map[string]int64),
		ErrorsByCode:  make(map[int]int64),
	}
}

// PerformanceMonitor 性能监控中间件（增强版）
// 监控慢查询并记录详细信息
func PerformanceMonitor(slowThreshold time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.FullPath()
		method := c.Request.Method

		c.Next()

		duration := time.Since(start)

		// 慢查询告警
		if duration > slowThreshold {
			c.Set("slow_query", true)
			c.Set("slow_query_duration", duration)
			
			// 记录慢查询详情
			logSlowQuery(c, method, path, duration)
		}

		// 记录到context供后续使用
		c.Set("request_duration", duration)
	}
}

// logSlowQuery 记录慢查询日志
func logSlowQuery(c *gin.Context, method, path string, duration time.Duration) {
	// 这里可以集成到日志系统或APM
	requestID := c.GetString("request_id")
	statusCode := c.Writer.Status()
	
	// 简单日志记录（实际项目中可以发送到监控系统）
	_ = requestID // 用于日志关联
	_ = statusCode
	_ = method
	_ = path
	// log.Printf("[SLOW] [%s] %s %s took %v (status: %d)", requestID, method, path, duration, statusCode)
}

// RequestCounter 请求计数器中间件
// 为每个路由维护独立的计数器
type RequestCounter struct {
	counts map[string]int64
}

var requestCounter = &RequestCounter{
	counts: make(map[string]int64),
}

// Counter 简单计数器中间件
func Counter() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		requestCounter.counts[path]++
		c.Next()
	}
}

// GetRequestCounts 获取请求计数
func GetRequestCounts() map[string]int64 {
	return requestCounter.counts
}

// HTTPMetrics HTTP指标结构
type HTTPMetrics struct {
	Method       string
	Path         string
	StatusCode   int
	Duration     time.Duration
	RequestSize  int64
	ResponseSize int
}

// CollectHTTPMetrics 收集HTTP请求指标
func CollectHTTPMetrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// 记录请求大小
		requestSize := c.Request.ContentLength

		c.Next()

		// 计算响应时间
		duration := time.Since(start)

		// 构造指标
		metric := HTTPMetrics{
			Method:       c.Request.Method,
			Path:         c.FullPath(),
			StatusCode:   c.Writer.Status(),
			Duration:     duration,
			RequestSize:  requestSize,
			ResponseSize: c.Writer.Size(),
		}

		// 将指标存储到context（可被其他handler或日志系统使用）
		c.Set("http_metrics", metric)

		// 这里可以发送到Prometheus/Grafana/等监控系统
		// prometheus.RecordHTTPMetric(metric)
	}
}

// StatusCodeDistribution 状态码分布统计
type StatusCodeDistribution struct {
	Status2xx int64 // 成功
	Status3xx int64 // 重定向
	Status4xx int64 // 客户端错误
	Status5xx int64 // 服务器错误
}

var statusDist = &StatusCodeDistribution{}

// StatusDistribution 状态码分布中间件
func StatusDistribution() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		status := c.Writer.Status()
		switch {
		case status >= 200 && status < 300:
			statusDist.Status2xx++
		case status >= 300 && status < 400:
			statusDist.Status3xx++
		case status >= 400 && status < 500:
			statusDist.Status4xx++
		case status >= 500:
			statusDist.Status5xx++
		}
	}
}

// GetStatusDistribution 获取状态码分布
func GetStatusDistribution() *StatusCodeDistribution {
	return statusDist
}

// ResponseTimeHistogram 响应时间直方图
type ResponseTimeHistogram struct {
	Under100ms   int64 // <100ms
	Under500ms   int64 // 100-500ms
	Under1s      int64 // 500ms-1s
	Under5s      int64 // 1s-5s
	Over5s       int64 // >5s
	TotalCount   int64
	TotalTime    time.Duration
	AverageTime  time.Duration
}

var responseTimeHist = &ResponseTimeHistogram{}

// ResponseTimeTracker 响应时间追踪中间件
func ResponseTimeTracker() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)

		// 更新直方图
		responseTimeHist.TotalCount++
		responseTimeHist.TotalTime += duration

		switch {
		case duration < 100*time.Millisecond:
			responseTimeHist.Under100ms++
		case duration < 500*time.Millisecond:
			responseTimeHist.Under500ms++
		case duration < 1*time.Second:
			responseTimeHist.Under1s++
		case duration < 5*time.Second:
			responseTimeHist.Under5s++
		default:
			responseTimeHist.Over5s++
		}

		// 计算平均时间
		if responseTimeHist.TotalCount > 0 {
			responseTimeHist.AverageTime = responseTimeHist.TotalTime / time.Duration(responseTimeHist.TotalCount)
		}
	}
}

// GetResponseTimeHistogram 获取响应时间直方图
func GetResponseTimeHistogram() *ResponseTimeHistogram {
	return responseTimeHist
}

// RateLimiter 简单的速率限制器（基于令牌桶）
type RateLimiter struct {
	tokens    int
	maxTokens int
	refillAt  time.Time
}

var rateLimiter = &RateLimiter{
	tokens:    100,
	maxTokens: 100,
	refillAt:  time.Now(),
}

// RateLimit 速率限制中间件（简单实现）
func RateLimit(requestsPerSecond int) gin.HandlerFunc {
	return func(c *gin.Context) {
		now := time.Now()

		// 每秒重新填充令牌
		if now.After(rateLimiter.refillAt) {
			rateLimiter.tokens = rateLimiter.maxTokens
			rateLimiter.refillAt = now.Add(time.Second)
		}

		// 检查是否有可用令牌
		if rateLimiter.tokens <= 0 {
			c.JSON(429, gin.H{
				"code":    429,
				"message": "请求过多，请稍后重试",
			})
			c.Abort()
			return
		}

		// 消耗一个令牌
		rateLimiter.tokens--
		c.Next()
	}
}

// ExportMetricsHandler 导出指标的HTTP handler
// 用法：router.GET("/metrics", ExportMetricsHandler)
func ExportMetricsHandler(c *gin.Context) {
	data := gin.H{
		"metrics": GetMetrics(),
		"status_distribution": GetStatusDistribution(),
		"response_time_histogram": GetResponseTimeHistogram(),
		"request_counts": GetRequestCounts(),
		"timestamp": time.Now().Unix(),
	}

	c.JSON(200, data)
}

// HealthCheck 健康检查指标
type HealthCheck struct {
	Status    string                 `json:"status"`
	Timestamp int64                  `json:"timestamp"`
	Uptime    time.Duration          `json:"uptime"`
	Metrics   map[string]interface{} `json:"metrics,omitempty"`
}

var startTime = time.Now()

// HealthCheckHandler 健康检查端点
func HealthCheckHandler(c *gin.Context) {
	health := HealthCheck{
		Status:    "healthy",
		Timestamp: time.Now().Unix(),
		Uptime:    time.Since(startTime),
		Metrics: map[string]interface{}{
			"total_requests": metrics.TotalRequests,
			"success_rate":   calculateSuccessRate(),
			"avg_response_time": responseTimeHist.AverageTime.String(),
		},
	}

	c.JSON(200, health)
}

// calculateSuccessRate 计算成功率
func calculateSuccessRate() string {
	if metrics.TotalRequests == 0 {
		return "0%"
	}
	rate := float64(metrics.SuccessRequests) / float64(metrics.TotalRequests) * 100
	return strconv.FormatFloat(rate, 'f', 2, 64) + "%"
}
