package middleware

import (
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS 跨域中间件
// 支持单个域或多个域（逗号分隔）
// 例: CORS_ORIGIN="http://localhost:3000,https://app.example.com,https://admin.example.com"
func CORS() gin.HandlerFunc {
	originStr := os.Getenv("CORS_ORIGIN")
	if originStr == "" {
		originStr = "http://localhost:3000"
	}

	// 支持逗号分隔的多个域名
	var allowOrigins []string
	if originStr == "*" {
		// 如果配置为 *，则使用 AllowAllOrigins（注意：不能与 AllowCredentials 同时为 true）
		config := cors.Config{
			AllowAllOrigins:  true,
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "X-CSRF-Token"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: false, // AllowAllOrigins 与 AllowCredentials 不兼容
			MaxAge:           12 * time.Hour,
		}
		return cors.New(config)
	}

	// 解析逗号分隔的多个域名
	origins := strings.Split(originStr, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSpace(origin)
	}
	allowOrigins = origins

	config := cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "X-CSRF-Token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	return cors.New(config)
}
