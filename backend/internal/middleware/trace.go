package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Trace 请求追踪中间件
func Trace() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 生成请求ID
		requestId := uuid.New().String()
		c.Set("request_id", requestId)
		c.Header("X-Request-Id", requestId)

		// 记录请求开始时间
		start := time.Now()

		// 记录请求开始
		log.Printf("[%s] --> %s %s from %s",
			requestId,
			c.Request.Method,
			c.Request.URL.Path,
			c.ClientIP())

		// 执行请求处理
		c.Next()

		// 计算请求耗时
		duration := time.Since(start)
		status := c.Writer.Status()

		// 记录请求结束
		log.Printf("[%s] <-- %s %s - %d (%v)",
			requestId,
			c.Request.Method,
			c.Request.URL.Path,
			status,
			duration)

		// 慢查询告警 (超过1秒)
		if duration > time.Second {
			log.Printf("[%s] SLOW REQUEST: %s %s took %v",
				requestId,
				c.Request.Method,
				c.Request.URL.Path,
				duration)
		}
	}
}
