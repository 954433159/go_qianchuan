package middleware

import (
	"net/http"

	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// AuthRequired 认证中间件
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := sessions.Default(c)

		// 获取会话数据
		sessionData := sess.Get("user")
		if sessionData == nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "未登录或会话已过期",
			})
			c.Abort()
			return
		}

		// 解析会话数据
		userSession, ok := sessionData.(*session.UserSession)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "会话数据格式错误",
			})
			c.Abort()
			return
		}

		// 检查是否过期
		if userSession.IsExpired() {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "会话已过期，请重新登录",
			})
			c.Abort()
			return
		}

		// 将会话信息存入上下文
		c.Set("userSession", userSession)
		c.Set("accessToken", userSession.AccessToken)
		c.Set("advertiserId", userSession.AdvertiserID)

		c.Next()
	}
}

// GetUserSession 从上下文获取用户会话
func GetUserSession(c *gin.Context) (*session.UserSession, bool) {
	value, exists := c.Get("userSession")
	if !exists {
		return nil, false
	}
	userSession, ok := value.(*session.UserSession)
	return userSession, ok
}
