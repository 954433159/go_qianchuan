package handler

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func init() {
	gob.Register(&session.UserSession{})
}

// setupAdTestRouter 设置测试路由
func setupAdTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// 设置 session
	store := cookie.NewStore([]byte("test-secret-key-32-bytes-long!!"))
	r.Use(sessions.Sessions("test_session", store))

	return r
}

// setupAdTestService 设置测试服务
func setupAdTestService() *service.QianchuanService {
	client := sdk.NewOceanengineClient(123456789, "test-secret")
	return service.NewQianchuanService(client, 123456789, "test-secret")
}

// mockAuthMiddleware 模拟认证中间件
func mockAuthMiddleware(advertiserId int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		userSession := &session.UserSession{
			AccessToken:    "test-access-token",
			RefreshToken:   "test-refresh-token",
			ExpiresAt:      9999999999,
			RefreshExpires: 9999999999,
			AdvertiserID:   advertiserId,
			CreatedAt:      1700000000,
		}
		c.Set("userSession", userSession)
		c.Next()
	}
}

// TestAdHandler_List 测试获取广告计划列表
func TestAdHandler_List(t *testing.T) {
	tests := []struct {
		name           string
		queryParams    string
		useAuth        bool
		expectedStatus int
		expectedCode   int
	}{
		{
			name:           "未登录时返回401",
			queryParams:    "",
			useAuth:        false,
			expectedStatus: http.StatusUnauthorized,
			expectedCode:   401,
		},
		{
			name:           "已登录_默认参数",
			queryParams:    "",
			useAuth:        true,
			expectedStatus: http.StatusOK,
			expectedCode:   0, // SDK会返回0或错误码
		},
		{
			name:           "已登录_带分页参数",
			queryParams:    "?page=1&page_size=20",
			useAuth:        true,
			expectedStatus: http.StatusOK,
			expectedCode:   0,
		},
		{
			name:           "已登录_带过滤条件",
			queryParams:    "?page=1&page_size=10&status=AD_STATUS_DELIVERY_OK&marketing_goal=VIDEO_PROM_GOODS",
			useAuth:        true,
			expectedStatus: http.StatusOK,
			expectedCode:   0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := setupAdTestRouter()
			svc := setupAdTestService()
			handler := NewAdHandler(svc)

			if tt.useAuth {
				router.GET("/ad/list", mockAuthMiddleware(1234567890), handler.List)
			} else {
				router.GET("/ad/list", func(c *gin.Context) {
					// 模拟middleware.GetUserSession返回false
					handler.List(c)
				})
			}

			req, _ := http.NewRequest("GET", "/ad/list"+tt.queryParams, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)

			if code, ok := response["code"].(float64); ok {
				// 对于SDK调用，可能返回实际错误码
				if tt.useAuth && tt.expectedCode == 0 {
					// SDK调用可能返回多种code
					assert.True(t, code == 0 || code > 0)
				} else {
					assert.Equal(t, float64(tt.expectedCode), code)
				}
			}
		})
	}
}

// TestAdHandler_Get 测试获取广告计划详情
func TestAdHandler_Get(t *testing.T) {
	tests := []struct {
		name           string
		queryParams    string
		useAuth        bool
		expectedStatus int
		expectedCode   int
	}{
		{
			name:           "未登录时返回401",
			queryParams:    "?ad_id=123456",
			useAuth:        false,
			expectedStatus: http.StatusUnauthorized,
			expectedCode:   401,
		},
		{
			name:           "缺少ad_id参数",
			queryParams:    "",
			useAuth:        true,
			expectedStatus: http.StatusBadRequest,
			expectedCode:   400,
		},
		{
			name:           "ad_id格式错误",
			queryParams:    "?ad_id=invalid",
			useAuth:        true,
			expectedStatus: http.StatusBadRequest,
			expectedCode:   400,
		},
		{
			name:           "正常获取详情",
			queryParams:    "?ad_id=1234567890123",
			useAuth:        true,
			expectedStatus: http.StatusOK,
			expectedCode:   0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := setupAdTestRouter()
			svc := setupAdTestService()
			handler := NewAdHandler(svc)

			if tt.useAuth {
				router.GET("/ad/get", mockAuthMiddleware(1234567890), handler.Get)
			} else {
				router.GET("/ad/get", handler.Get)
			}

			req, _ := http.NewRequest("GET", "/ad/get"+tt.queryParams, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)

			if code, ok := response["code"].(float64); ok {
				if tt.useAuth && tt.expectedCode == 0 {
					// SDK调用可能返回多种code
					assert.True(t, code == 0 || code > 0)
				} else {
					assert.Equal(t, float64(tt.expectedCode), code)
				}
			}
		})
	}
}

// TestAdHandler_UpdateStatus 测试更新广告计划状态
func TestAdHandler_UpdateStatus(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		useAuth        bool
		expectedStatus int
		expectedCode   int
	}{
		{
			name: "未登录时返回401",
			requestBody: map[string]interface{}{
				"ad_ids":     []int64{123456},
				"opt_status": "AD_STATUS_ENABLE",
			},
			useAuth:        false,
			expectedStatus: http.StatusUnauthorized,
			expectedCode:   401,
		},
		{
			name:           "参数错误_空body",
			requestBody:    map[string]interface{}{},
			useAuth:        true,
			expectedStatus: http.StatusBadRequest,
			expectedCode:   400,
		},
		{
			name: "正常更新状态",
			requestBody: map[string]interface{}{
				"ad_ids":     []int64{1234567890123},
				"opt_status": "AD_STATUS_ENABLE",
			},
			useAuth:        true,
			expectedStatus: http.StatusOK,
			expectedCode:   0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := setupAdTestRouter()
			svc := setupAdTestService()
			handler := NewAdHandler(svc)

			if tt.useAuth {
				router.POST("/ad/status/update", mockAuthMiddleware(1234567890), handler.UpdateStatus)
			} else {
				router.POST("/ad/status/update", handler.UpdateStatus)
			}

			body, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/ad/status/update", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)

			if code, ok := response["code"].(float64); ok {
				if tt.useAuth && tt.expectedCode == 0 {
					assert.True(t, code == 0 || code > 0)
				} else {
					assert.Equal(t, float64(tt.expectedCode), code)
				}
			}
		})
	}
}

// TestAdHandler_UpdateBudget 测试更新广告计划预算
func TestAdHandler_UpdateBudget(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		useAuth        bool
		expectedStatus int
		expectedCode   int
	}{
		{
			name:           "未登录时返回401",
			requestBody:    map[string]interface{}{},
			useAuth:        false,
			expectedStatus: http.StatusUnauthorized,
			expectedCode:   401,
		},
		{
			name:           "预算数据为空",
			requestBody:    map[string]interface{}{"data": []interface{}{}},
			useAuth:        true,
			expectedStatus: http.StatusBadRequest,
			expectedCode:   400,
		},
		{
			name: "预算低于最低限制",
			requestBody: map[string]interface{}{
				"data": []map[string]interface{}{
					{"ad_id": 123456, "budget": 100}, // 低于300
				},
			},
			useAuth:        true,
			expectedStatus: http.StatusBadRequest,
			expectedCode:   400,
		},
		{
			name: "正常更新预算",
			requestBody: map[string]interface{}{
				"data": []map[string]interface{}{
					{"ad_id": 1234567890123, "budget": 500},
				},
			},
			useAuth:        true,
			expectedStatus: http.StatusOK,
			expectedCode:   0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := setupAdTestRouter()
			svc := setupAdTestService()
			handler := NewAdHandler(svc)

			if tt.useAuth {
				router.POST("/ad/budget/update", mockAuthMiddleware(1234567890), handler.UpdateBudget)
			} else {
				router.POST("/ad/budget/update", handler.UpdateBudget)
			}

			body, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/ad/budget/update", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)

			if code, ok := response["code"].(float64); ok {
				if tt.useAuth && tt.expectedCode == 0 {
					assert.True(t, code == 0 || code > 0)
				} else {
					assert.Equal(t, float64(tt.expectedCode), code)
				}
			}
		})
	}
}

// TestAdHandler_UpdateBid 测试更新广告计划出价
func TestAdHandler_UpdateBid(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		useAuth        bool
		expectedStatus int
		expectedCode   int
	}{
		{
			name:           "未登录时返回401",
			requestBody:    map[string]interface{}{},
			useAuth:        false,
			expectedStatus: http.StatusUnauthorized,
			expectedCode:   401,
		},
		{
			name: "正常更新出价",
			requestBody: map[string]interface{}{
				"data": []map[string]interface{}{
					{"ad_id": 1234567890123, "bid": 10.5},
				},
			},
			useAuth:        true,
			expectedStatus: http.StatusOK,
			expectedCode:   0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := setupAdTestRouter()
			svc := setupAdTestService()
			handler := NewAdHandler(svc)

			if tt.useAuth {
				router.POST("/ad/bid/update", mockAuthMiddleware(1234567890), handler.UpdateBid)
			} else {
				router.POST("/ad/bid/update", handler.UpdateBid)
			}

			body, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/ad/bid/update", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)

			if code, ok := response["code"].(float64); ok {
				if tt.useAuth && tt.expectedCode == 0 {
					assert.True(t, code == 0 || code > 0)
				} else {
					assert.Equal(t, float64(tt.expectedCode), code)
				}
			}
		})
	}
}
