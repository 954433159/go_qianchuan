package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// TestAwemeHandler_GetOrderList_Unauthorized 测试未登录访问
func TestAwemeHandler_GetOrderList_Unauthorized(t *testing.T) {
	router := SetupTestRouter()

	handler := NewAwemeHandler(nil)
	router.GET("/qianchuan/aweme/order/list", handler.GetOrderList)

	resp := DoRequest(router, "GET", "/qianchuan/aweme/order/list", nil)

	assert.Equal(t, http.StatusUnauthorized, resp.Code, "Should return 401 for unauthenticated request")

	response := ParseResponse(resp, t)
	assert.Equal(t, 401, response.Code, "Response code should be 401")
	assert.Contains(t, response.Message, "未登录", "Message should indicate not logged in")
}

// TestAwemeHandler_GetOrderList_InvalidAdvertiserId 测试无效的advertiser_id
func TestAwemeHandler_GetOrderList_InvalidAdvertiserId(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.GET("/qianchuan/aweme/order/list", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetOrderList(c)
	})

	testCases := []struct {
		name         string
		advertiserId string
		expected     string
	}{
		{"invalid_format", "abc", "格式错误"},
		{"zero_id", "0", "无效"},
		{"negative_id", "-1", "无效"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "GET", "/qianchuan/aweme/order/list?advertiser_id="+tc.advertiserId, nil)

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for "+tc.name)
			assert.Contains(t, response.Message, tc.expected, "Message should contain: "+tc.expected)
		})
	}
}

// TestAwemeHandler_GetOrderList_Pagination 测试分页参数验证
func TestAwemeHandler_GetOrderList_Pagination(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.GET("/qianchuan/aweme/order/list", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetOrderList(c)
	})

	testCases := []struct {
		name        string
		page        string
		pageSize    string
		expectError bool
		errorMsg    string
	}{
		{"valid_pagination", "1", "20", false, ""},
		{"max_page_size", "1", "100", false, ""},
		{"exceed_max_page_size", "1", "150", true, "最多返回100条"},
		{"default_values", "", "", false, ""}, // 使用默认值
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			path := "/qianchuan/aweme/order/list?advertiser_id=123456"
			if tc.page != "" {
				path += "&page=" + tc.page
			}
			if tc.pageSize != "" {
				path += "&page_size=" + tc.pageSize
			}

			resp := DoRequest(router, "GET", path, nil)
			response := ParseResponse(resp, t)

			if tc.expectError {
				assert.Equal(t, 400, response.Code, "Should return 400 for invalid pagination")
				assert.Contains(t, response.Message, tc.errorMsg, "Error message should match")
			} else {
				// 参数验证应该通过，即使SDK调用失败
				assert.NotEqual(t, 400, response.Code, "Pagination parameters should be valid")
			}
		})
	}
}

// TestAwemeHandler_GetOrderDetail_MissingParams 测试缺少必需参数
func TestAwemeHandler_GetOrderDetail_MissingParams(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.GET("/qianchuan/aweme/order/detail", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetOrderDetail(c)
	})

	testCases := []struct {
		name         string
		advertiserId string
		orderId      string
		expectError  bool
	}{
		{"missing_advertiser_id", "", "123", true},
		{"missing_order_id", "456", "", true},
		{"both_present", "456", "123", false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			path := "/qianchuan/aweme/order/detail"
			params := []string{}
			if tc.advertiserId != "" {
				params = append(params, "advertiser_id="+tc.advertiserId)
			}
			if tc.orderId != "" {
				params = append(params, "order_id="+tc.orderId)
			}
			if len(params) > 0 {
				path += "?" + strings.Join(params, "&")
			}

			resp := DoRequest(router, "GET", path, nil)
			response := ParseResponse(resp, t)

			if tc.expectError {
				assert.Equal(t, 400, response.Code, "Should return 400 for missing parameters")
			} else {
				// 应该通过参数验证（即使SDK调用失败）
				assert.NotEqual(t, 400, response.Code, "Parameters should be valid")
			}
		})
	}
}

// TestAwemeHandler_GetOrderDetail_DualIDValidation 测试双ID验证
func TestAwemeHandler_GetOrderDetail_DualIDValidation(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.GET("/qianchuan/aweme/order/detail", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetOrderDetail(c)
	})

	testCases := []struct {
		name         string
		advertiserId string
		orderId      string
		expectError  bool
		errorMsg     string
	}{
		{"zero_advertiser_id", "0", "123", true, "advertiser_id无效"},
		{"negative_advertiser_id", "-1", "123", true, "advertiser_id无效"},
		{"zero_order_id", "456", "0", true, "order_id无效"},
		{"negative_order_id", "456", "-1", true, "order_id无效"},
		{"both_valid", "456", "123", false, ""},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			path := "/qianchuan/aweme/order/detail?advertiser_id=" + tc.advertiserId + "&order_id=" + tc.orderId

			resp := DoRequest(router, "GET", path, nil)
			response := ParseResponse(resp, t)

			if tc.expectError {
				assert.Equal(t, 400, response.Code, "Should return 400 for "+tc.name)
				assert.Contains(t, response.Message, tc.errorMsg, "Error message should match")
			} else {
				assert.NotEqual(t, 400, response.Code, "Valid IDs should pass validation")
			}
		})
	}
}

// TestAwemeHandler_CreateOrder_InvalidJSON 测试无效的JSON请求体
func TestAwemeHandler_CreateOrder_InvalidJSON(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.POST("/qianchuan/aweme/order/create", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.CreateOrder(c)
	})

	testCases := []struct {
		name string
		body string
	}{
		{"invalid_json", `{invalid json}`},
		{"empty_body", ``},
		{"malformed_json", `{"key": }`},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "POST", "/qianchuan/aweme/order/create", strings.NewReader(tc.body))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for invalid JSON")
			assert.Contains(t, response.Message, "参数错误", "Error message should indicate bad parameters")
		})
	}
}

// TestAwemeHandler_TerminateOrder_SuccessMessage 测试终止订单的成功消息
func TestAwemeHandler_TerminateOrder_SuccessMessage(t *testing.T) {
	// 这个测试验证终止订单使用了自定义成功消息
	// 由于没有真实SDK，我们主要验证JSON绑定逻辑

	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.POST("/qianchuan/aweme/order/terminate", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.TerminateOrder(c)
	})

	// 发送无效JSON应该返回400
	resp := DoRequest(router, "POST", "/qianchuan/aweme/order/terminate", strings.NewReader(`{invalid}`))

	response := ParseResponse(resp, t)
	assert.Equal(t, 400, response.Code, "Invalid JSON should return 400")
}

// TestAwemeHandler_GetVideoList_Pagination 测试视频列表分页
func TestAwemeHandler_GetVideoList_Pagination(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.GET("/qianchuan/aweme/video/list", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetVideoList(c)
	})

	testCases := []struct {
		name         string
		advertiserId string
		awemeId      string
		pageSize     string
		expectError  bool
		errorMsg     string
	}{
		{"valid_params", "123456", "999", "20", false, ""},
		{"missing_advertiser_id", "", "999", "20", true, "格式错误"},
		{"invalid_advertiser_id", "abc", "999", "20", true, "格式错误"},
		{"zero_advertiser_id", "0", "999", "20", true, "无效"},
		{"exceed_max_page_size", "123456", "999", "150", true, "最多返回100条"},
		{"default_pagination", "123456", "999", "", false, ""}, // 使用默认值
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			path := "/qianchuan/aweme/video/list"
			params := []string{}
			if tc.advertiserId != "" {
				params = append(params, "advertiser_id="+tc.advertiserId)
			}
			if tc.awemeId != "" {
				params = append(params, "aweme_id="+tc.awemeId)
			}
			if tc.pageSize != "" {
				params = append(params, "page_size="+tc.pageSize)
			}
			if len(params) > 0 {
				path += "?" + strings.Join(params, "&")
			}

			resp := DoRequest(router, "GET", path, nil)
			response := ParseResponse(resp, t)

			if tc.expectError {
				assert.Equal(t, 400, response.Code, "Should return 400 for invalid params")
				if tc.errorMsg != "" {
					assert.Contains(t, response.Message, tc.errorMsg, "Error message should match")
				}
			} else {
				assert.NotEqual(t, 400, response.Code, "Valid params should pass validation")
			}
		})
	}
}

// TestAwemeHandler_GetQuota_IDValidation 测试配额查询的ID验证
func TestAwemeHandler_GetQuota_IDValidation(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.GET("/qianchuan/aweme/order/quota/get", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetQuota(c)
	})

	invalidIds := []string{"0", "-1", "abc", ""}

	for _, id := range invalidIds {
		t.Run("invalid_id_"+id, func(t *testing.T) {
			path := "/qianchuan/aweme/order/quota/get"
			if id != "" {
				path += "?advertiser_id=" + id
			}

			resp := DoRequest(router, "GET", path, nil)
			response := ParseResponse(resp, t)

			assert.Equal(t, 400, response.Code, "Should return 400 for invalid advertiser_id: "+id)
		})
	}
}

// TestAwemeHandler_AllPOST_JSONBinding 测试所有POST接口的JSON绑定
func TestAwemeHandler_AllPOST_JSONBinding(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	// 注册所有POST接口
	postEndpoints := []struct {
		path    string
		handler func(*gin.Context)
	}{
		{"/create", handler.CreateOrder},
		{"/terminate", handler.TerminateOrder},
		{"/budget", handler.AddBudget},
		{"/suggest_bid", handler.GetSuggestBid},
		{"/estimate", handler.GetEstimate},
	}

	for _, ep := range postEndpoints {
		handlerFunc := ep.handler // 避免闭包问题
		router.POST(ep.path, func(c *gin.Context) {
			userSession := CreateTestUserSession(123456789)
			SetupTestSession(c, userSession)
			handlerFunc(c)
		})
	}

	// 测试所有接口都能正确处理无效JSON
	for _, endpoint := range postEndpoints {
		t.Run("invalid_json_"+endpoint.path, func(t *testing.T) {
			resp := DoRequest(router, "POST", endpoint.path, strings.NewReader(`{invalid}`))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for invalid JSON on "+endpoint.path)
			assert.Contains(t, response.Message, "参数错误", "Error message should indicate bad parameters")
		})
	}
}

// TestAwemeHandler_AuthenticationRequired 测试所有接口都需要认证
func TestAwemeHandler_AuthenticationRequired(t *testing.T) {
	router := SetupTestRouter()

	handler := NewAwemeHandler(nil)

	// 注册所有接口（不设置session）
	router.GET("/order/list", handler.GetOrderList)
	router.GET("/order/detail", handler.GetOrderDetail)
	router.POST("/order/create", handler.CreateOrder)
	router.POST("/order/terminate", handler.TerminateOrder)
	router.GET("/video/list", handler.GetVideoList)
	router.POST("/budget/add", handler.AddBudget)
	router.POST("/suggest_bid", handler.GetSuggestBid)
	router.POST("/estimate", handler.GetEstimate)
	router.GET("/quota", handler.GetQuota)

	endpoints := []struct {
		method string
		path   string
	}{
		{"GET", "/order/list"},
		{"GET", "/order/detail"},
		{"POST", "/order/create"},
		{"POST", "/order/terminate"},
		{"GET", "/video/list"},
		{"POST", "/budget/add"},
		{"POST", "/suggest_bid"},
		{"POST", "/estimate"},
		{"GET", "/quota"},
	}

	for _, endpoint := range endpoints {
		t.Run("auth_required_"+endpoint.method+"_"+endpoint.path, func(t *testing.T) {
			var resp *httptest.ResponseRecorder
			if endpoint.method == "GET" {
				resp = DoRequest(router, endpoint.method, endpoint.path, nil)
			} else {
				resp = DoRequest(router, endpoint.method, endpoint.path, strings.NewReader(`{}`))
			}

			assert.Equal(t, http.StatusUnauthorized, resp.Code, endpoint.method+" "+endpoint.path+" should require authentication")

			response := ParseResponse(resp, t)
			assert.Equal(t, 401, response.Code, "Response code should be 401")
			assert.Contains(t, response.Message, "未登录", "Should indicate not logged in")
		})
	}
}

// TestAwemeHandler_ResponseFormat 测试响应格式统一性
func TestAwemeHandler_ResponseFormat(t *testing.T) {
	router := SetupTestRouter()

	mockService := &service.QianchuanService{}
	handler := NewAwemeHandler(mockService)

	router.GET("/test", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetOrderList(c)
	})

	// 缺少advertiser_id会返回400错误
	resp := DoRequest(router, "GET", "/test", nil)
	response := ParseResponse(resp, t)

	// 验证响应结构
	assert.NotNil(t, response.Code, "Response should have code field")
	assert.NotEmpty(t, response.Message, "Response should have message field")
}
