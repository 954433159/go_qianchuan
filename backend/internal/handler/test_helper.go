package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

// TestResponse 解析响应
type TestResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// SetupTestRouter 创建测试路由
func SetupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// 添加必要的中间件
	router.Use(gin.Recovery())

	// Session配置
	store := cookie.NewStore([]byte("test-secret-key-32-chars-minimum"))
	store.Options(sessions.Options{
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   86400,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	router.Use(sessions.Sessions("test_session", store))

	return router
}

// SetupTestSession 在context中设置测试会话
func SetupTestSession(c *gin.Context, userSession *session.UserSession) {
	// 设置到gin context中（middleware.GetUserSession从这里读取）
	c.Set("userSession", userSession)
	c.Set("accessToken", userSession.AccessToken)
	c.Set("advertiserId", userSession.AdvertiserID)

	// 同时设置到session中（为了完整性）
	sess := sessions.Default(c)
	sess.Set("user", userSession)
	sess.Save()
}

// CreateTestUserSession 创建测试用户会话
func CreateTestUserSession(advertiserId int64) *session.UserSession {
	return &session.UserSession{
		AccessToken:    "test-access-token-" + string(rune(advertiserId)),
		RefreshToken:   "test-refresh-token-" + string(rune(advertiserId)),
		ExpiresAt:      9999999999, // 远未来
		RefreshExpires: 9999999999,
		AdvertiserID:   advertiserId,
		CreatedAt:      1700000000, // 固定创建时间
	}
}

// ParseResponse 解析响应体
func ParseResponse(resp *httptest.ResponseRecorder, t *testing.T) TestResponse {
	var response TestResponse
	body, _ := io.ReadAll(resp.Body)

	if err := json.Unmarshal(body, &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	return response
}

// DoRequest 执行HTTP请求
func DoRequest(router *gin.Engine, method, path string, body io.Reader) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(method, path, body)
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)
	return resp
}

// DoAuthenticatedRequest 执行需要认证的HTTP请求
func DoAuthenticatedRequest(router *gin.Engine, method, path string, body io.Reader, userSession *session.UserSession, t *testing.T) *httptest.ResponseRecorder {
	// 首先获取一个有效的request来创建会话
	req, _ := http.NewRequest("GET", "/health", nil)
	resp := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(resp)
	c.Request = req

	// 设置会话
	c.Request.AddCookie(&http.Cookie{
		Name:  "test_session",
		Value: "test",
	})

	// 执行实际请求
	reqBody := body
	if body == nil {
		reqBody = strings.NewReader("{}")
	}

	actualReq, _ := http.NewRequest(method, path, reqBody)
	actualReq.Header.Set("Content-Type", "application/json")
	actualResp := httptest.NewRecorder()

	router.ServeHTTP(actualResp, actualReq)
	return actualResp
}

// AssertResponseCode 断言响应码
func AssertResponseCode(t *testing.T, response TestResponse, expectedCode int, message string) {
	if response.Code != expectedCode {
		t.Errorf("%s: Expected code %d, got %d. Message: %s", message, expectedCode, response.Code, response.Message)
	}
}

// AssertStatusCode 断言HTTP状态码
func AssertStatusCode(t *testing.T, resp *httptest.ResponseRecorder, expectedStatus int, message string) {
	if resp.Code != expectedStatus {
		t.Errorf("%s: Expected status %d, got %d", message, expectedStatus, resp.Code)
	}
}
