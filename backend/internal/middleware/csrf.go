package middleware

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

const (
	// CSRF Token相关常量
	csrfTokenLength = 32
	csrfSessionKey  = "csrf_token"
	csrfHeaderName  = "X-CSRF-Token"
	csrfFormField   = "csrf_token"
)

// CSRFProtection CSRF防护中间件
// 
// 使用方法：
// 1. GET请求时自动生成CSRF Token并存入Session
// 2. POST/PUT/DELETE等修改类请求必须携带有效的CSRF Token
// 3. Token可以通过HTTP Header或表单字段提交
func CSRFProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 跳过GET、HEAD、OPTIONS请求（只读操作）
		if c.Request.Method == "GET" ||
			c.Request.Method == "HEAD" ||
			c.Request.Method == "OPTIONS" {
			
			// 为GET请求生成新的CSRF Token（如果不存在）
			sess := sessions.Default(c)
			if sess.Get(csrfSessionKey) == nil {
				token, err := generateCSRFToken()
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    500,
						"message": "生成CSRF Token失败",
					})
					c.Abort()
					return
				}
				sess.Set(csrfSessionKey, token)
				if err := sess.Save(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    500,
						"message": "保存CSRF Token失败",
					})
					c.Abort()
					return
				}
				// 将Token通过响应头返回给前端
				c.Header(csrfHeaderName, token)
			} else {
				// 返回现有Token
				token := sess.Get(csrfSessionKey).(string)
				c.Header(csrfHeaderName, token)
			}
			
			c.Next()
			return
		}

		// 对于修改类请求（POST/PUT/DELETE/PATCH），验证CSRF Token
		sess := sessions.Default(c)
		sessionToken := sess.Get(csrfSessionKey)
		if sessionToken == nil {
			c.JSON(http.StatusForbidden, gin.H{
				"code":    403,
				"message": "CSRF Token缺失，请刷新页面后重试",
			})
			c.Abort()
			return
		}

		// 从请求中获取CSRF Token
		var requestToken string
		
		// 优先从HTTP Header获取
		requestToken = c.GetHeader(csrfHeaderName)
		
		// 如果Header中没有，尝试从表单字段获取
		if requestToken == "" {
			requestToken = c.PostForm(csrfFormField)
		}
		
		// 如果都没有，返回错误
		if requestToken == "" {
			c.JSON(http.StatusForbidden, gin.H{
				"code":    403,
				"message": "CSRF Token缺失",
				"hint":    "请在请求头中添加 X-CSRF-Token 或在表单中添加 csrf_token 字段",
			})
			c.Abort()
			return
		}

		// 验证Token
		expectedToken := sessionToken.(string)
		if !secureCompare(requestToken, expectedToken) {
			c.JSON(http.StatusForbidden, gin.H{
				"code":    403,
				"message": "CSRF Token无效",
				"hint":    "Token可能已过期，请刷新页面后重试",
			})
			c.Abort()
			return
		}

		// 验证通过，继续处理请求
		c.Next()
	}
}

// GetCSRFToken 获取当前请求的CSRF Token
// 可在Handler中调用，用于在响应中返回Token给前端
func GetCSRFToken(c *gin.Context) string {
	sess := sessions.Default(c)
	token := sess.Get(csrfSessionKey)
	if token == nil {
		return ""
	}
	return token.(string)
}

// generateCSRFToken 生成随机CSRF Token
func generateCSRFToken() (string, error) {
	b := make([]byte, csrfTokenLength)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// secureCompare 安全的字符串比较（防止时序攻击）
func secureCompare(a, b string) bool {
	// 防止时序攻击：确保比较时间恒定
	if len(a) != len(b) {
		return false
	}
	
	// 转换为byte数组进行比较
	aBytes := []byte(a)
	bBytes := []byte(b)
	
	result := 0
	for i := 0; i < len(aBytes); i++ {
		result |= int(aBytes[i] ^ bBytes[i])
	}
	
	return result == 0
}

// CSRFExclude 排除某些路径的CSRF检查
// 
// 使用方法：
//   router.POST("/webhook", CSRFExclude(), handler)
func CSRFExclude() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("csrf_excluded", true)
		c.Next()
	}
}

// isCSRFExcluded 检查是否排除CSRF检查
func isCSRFExcluded(c *gin.Context) bool {
	excluded, exists := c.Get("csrf_excluded")
	return exists && excluded.(bool)
}

// RefreshCSRFToken 刷新CSRF Token
// 建议在用户登录后调用，生成新的Token
func RefreshCSRFToken(c *gin.Context) error {
	token, err := generateCSRFToken()
	if err != nil {
		return err
	}
	
	sess := sessions.Default(c)
	sess.Set(csrfSessionKey, token)
	if err := sess.Save(); err != nil {
		return err
	}
	
	// 将新Token通过响应头返回
	c.Header(csrfHeaderName, token)
	return nil
}

// getCorsOrigin 获取CORS源（用于SameSite=None时的验证）
func getCorsOrigin(c *gin.Context) string {
	origin := c.GetHeader("Origin")
	referer := c.GetHeader("Referer")
	
	if origin != "" {
		return origin
	}
	
	if referer != "" {
		// 从Referer中提取origin
		if idx := strings.Index(referer, "//"); idx != -1 {
			referer = referer[idx+2:]
			if idx := strings.Index(referer, "/"); idx != -1 {
				referer = referer[:idx]
			}
		}
		return referer
	}
	
	return ""
}
