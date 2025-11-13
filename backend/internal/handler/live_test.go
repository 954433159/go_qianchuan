package handler

import (
	"net/http"
	"strings"
	"testing"

	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// TestLiveHandler_GetLiveRooms_Unauthorized 测试未登录访问
func TestLiveHandler_GetLiveRooms_Unauthorized(t *testing.T) {
	router := SetupTestRouter()

	// 创建handler（使用nil service因为不会调用到SDK）
	handler := NewLiveHandler(nil)
	router.GET("/qianchuan/report/live/room/list", handler.GetLiveRooms)

	// 执行请求（无session）
	resp := DoRequest(router, "GET", "/qianchuan/report/live/room/list", nil)

	// 验证
	assert.Equal(t, http.StatusUnauthorized, resp.Code, "Should return 401 for unauthenticated request")

	response := ParseResponse(resp, t)
	assert.Equal(t, 401, response.Code, "Response code should be 401")
	assert.Contains(t, response.Message, "未登录", "Message should indicate not logged in")
}

// TestLiveHandler_GetLiveRooms_InvalidCount 测试分页参数验证
func TestLiveHandler_GetLiveRooms_InvalidCount(t *testing.T) {
	router := SetupTestRouter()

	// 创建mock service
	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	// 注册路由
	router.GET("/qianchuan/report/live/room/list", func(c *gin.Context) {
		// 手动设置session
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveRooms(c)
	})

	// 测试超过最大值
	resp := DoRequest(router, "GET", "/qianchuan/report/live/room/list?count=200", nil)

	// 验证：应该返回400错误
	response := ParseResponse(resp, t)
	assert.Equal(t, 400, response.Code, "Should return 400 for count > 100")
	assert.Contains(t, response.Message, "最多返回100条", "Message should indicate max page size")
}

// TestLiveHandler_GetLiveRoomDetail_MissingRoomId 测试缺少room_id参数
func TestLiveHandler_GetLiveRoomDetail_MissingRoomId(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	router.GET("/qianchuan/report/live/room/detail", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveRoomDetail(c)
	})

	// 不传room_id参数
	resp := DoRequest(router, "GET", "/qianchuan/report/live/room/detail", nil)

	response := ParseResponse(resp, t)
	assert.Equal(t, 400, response.Code, "Should return 400 for missing room_id")
	assert.Contains(t, response.Message, "缺少参数", "Message should indicate missing parameter")
}

// TestLiveHandler_GetLiveRoomDetail_InvalidRoomId 测试无效的room_id
func TestLiveHandler_GetLiveRoomDetail_InvalidRoomId(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	router.GET("/qianchuan/report/live/room/detail", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveRoomDetail(c)
	})

	testCases := []struct {
		name     string
		roomId   string
		expected string
	}{
		{"invalid_format", "abc", "格式错误"},
		{"zero_id", "0", "无效"},
		{"negative_id", "-1", "无效"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "GET", "/qianchuan/report/live/room/detail?room_id="+tc.roomId, nil)

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for "+tc.name)
			assert.Contains(t, response.Message, tc.expected, "Message should contain: "+tc.expected)
		})
	}
}

// TestLiveHandler_GetLiveRoomProducts_Pagination 测试分页参数规范化
func TestLiveHandler_GetLiveRoomProducts_Pagination(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	router.GET("/qianchuan/report/live/room/product/list", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveRoomProducts(c)
	})

	testCases := []struct {
		name          string
		roomId        string
		count         string
		expectSuccess bool
		expectError   string
	}{
		{"valid_params", "123456", "20", true, ""},
		{"missing_room_id", "", "20", false, "缺少参数"},
		{"invalid_room_id_format", "abc", "20", false, "格式错误"},
		{"zero_room_id", "0", "20", false, "无效"},
		{"exceed_max_count", "123456", "150", false, "最多返回100条"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			path := "/qianchuan/report/live/room/product/list"
			if tc.roomId != "" {
				path += "?room_id=" + tc.roomId
			}
			if tc.count != "" {
				if strings.Contains(path, "?") {
					path += "&count=" + tc.count
				} else {
					path += "?count=" + tc.count
				}
			}

			resp := DoRequest(router, "GET", path, nil)
			response := ParseResponse(resp, t)

			if tc.expectSuccess {
				// 注意：由于没有真实SDK，会返回SDK调用错误（500）
				// 但参数验证应该在此之前通过（如果失败会返回400）
				assert.NotEqual(t, 400, response.Code, "Parameters should be valid")
			} else {
				assert.Equal(t, 400, response.Code, "Should return 400 for invalid params")
				if tc.expectError != "" {
					assert.Contains(t, response.Message, tc.expectError, "Error message should match")
				}
			}
		})
	}
}

// TestLiveHandler_GetLiveStats_Methods 测试GET和POST方法支持
func TestLiveHandler_GetLiveStats_Methods(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	// 注册GET和POST路由
	router.GET("/qianchuan/report/live/get", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveStats(c)
	})
	router.POST("/qianchuan/report/live/get", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveStats(c)
	})

	t.Run("GET_method", func(t *testing.T) {
		resp := DoRequest(router, "GET", "/qianchuan/report/live/get", nil)
		// 应该到达SDK调用（会失败，但不是参数错误）
		response := ParseResponse(resp, t)
		assert.NotEqual(t, 400, response.Code, "GET method should be supported")
	})

	t.Run("POST_method_with_fields", func(t *testing.T) {
		body := strings.NewReader(`{"fields": ["live_time", "watch_count"]}`)
		resp := DoRequest(router, "POST", "/qianchuan/report/live/get", body)

		response := ParseResponse(resp, t)
		assert.NotEqual(t, 400, response.Code, "POST method with fields should be supported")
	})

	t.Run("POST_method_invalid_json", func(t *testing.T) {
		body := strings.NewReader(`{invalid json}`)
		resp := DoRequest(router, "POST", "/qianchuan/report/live/get", body)

		// 无效JSON应该被容错处理，使用默认fields
		response := ParseResponse(resp, t)
		assert.NotEqual(t, 400, response.Code, "Invalid JSON should fallback to defaults")
	})
}

// TestLiveHandler_ValidateID 测试ID验证逻辑
func TestLiveHandler_ValidateID(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	// 只测试一个接口来验证ID验证逻辑
	router.GET("/detail", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveRoomDetail(c)
	})

	invalidIds := []string{"0", "-1", "-999"}

	for _, invalidId := range invalidIds {
		t.Run("invalid_id_"+invalidId, func(t *testing.T) {
			resp := DoRequest(router, "GET", "/detail?room_id="+invalidId, nil)

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should reject invalid ID: "+invalidId)
			assert.Contains(t, response.Message, "无效", "Error message should indicate invalid ID")
		})
	}
}

// TestLiveHandler_ResponseFormat 测试响应格式统一性
func TestLiveHandler_ResponseFormat(t *testing.T) {
	// 这是一个元测试，验证所有响应都符合统一格式
	// {code: int, message: string, data: object}

	router := SetupTestRouter()
	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	router.GET("/test", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveRooms(c)
	})

	resp := DoRequest(router, "GET", "/test", nil)
	response := ParseResponse(resp, t)

	// 验证响应结构
	assert.NotNil(t, response.Code, "Response should have code field")
	assert.NotEmpty(t, response.Message, "Response should have message field")
	// data字段可以为nil（错误响应时）
}

// TestLiveHandler_DefaultPagination 测试默认分页参数
func TestLiveHandler_DefaultPagination(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewLiveHandler(mockService)

	router.GET("/rooms", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetLiveRooms(c)
	})

	// 不传分页参数，应该使用默认值（page=0, count=20）
	resp := DoRequest(router, "GET", "/rooms", nil)

	// 由于没有真实SDK，会返回错误，但不应该是参数验证错误
	response := ParseResponse(resp, t)
	assert.NotEqual(t, 400, response.Code, "Default pagination should be valid")
}
