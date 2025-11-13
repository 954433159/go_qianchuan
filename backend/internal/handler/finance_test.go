package handler

import (
	"net/http"
	"strings"
	"testing"

	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// TestFinanceHandler_GetWallet_Unauthorized 测试未登录访问
func TestFinanceHandler_GetWallet_Unauthorized(t *testing.T) {
	router := SetupTestRouter()

	handler := NewFinanceHandler(nil)
	router.GET("/qianchuan/finance/wallet/get", handler.GetWallet)

	resp := DoRequest(router, "GET", "/qianchuan/finance/wallet/get", nil)

	assert.Equal(t, http.StatusUnauthorized, resp.Code, "Should return 401 for unauthenticated request")

	response := ParseResponse(resp, t)
	assert.Equal(t, 401, response.Code, "Response code should be 401")
	assert.Contains(t, response.Message, "未登录", "Message should indicate not logged in")
}

// TestFinanceHandler_GetBalance_Unauthorized 测试未登录访问
func TestFinanceHandler_GetBalance_Unauthorized(t *testing.T) {
	router := SetupTestRouter()

	handler := NewFinanceHandler(nil)
	router.GET("/qianchuan/advertiser/balance/get", handler.GetBalance)

	resp := DoRequest(router, "GET", "/qianchuan/advertiser/balance/get", nil)

	assert.Equal(t, http.StatusUnauthorized, resp.Code, "Should return 401 for unauthenticated request")
}

// TestFinanceHandler_GetFinanceDetail_Pagination 测试分页参数验证
func TestFinanceHandler_GetFinanceDetail_Pagination(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.GET("/qianchuan/finance/detail/get", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetFinanceDetail(c)
	})

	testCases := []struct {
		name          string
		queryParams   string
		expectSuccess bool
		expectError   string
	}{
		{"valid_pagination", "?page=1&page_size=20", true, ""},
		{"invalid_page_size_exceed", "?page=1&page_size=200", false, "单页最多返回100条记录"},
		// 注意：负数和0会被自动规范化，不会报错
		{"auto_normalize_page_zero", "?page=0&page_size=20", true, ""},
		{"auto_normalize_page_size_negative", "?page=1&page_size=-10", true, ""},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "GET", "/qianchuan/finance/detail/get"+tc.queryParams, nil)
			response := ParseResponse(resp, t)

			if tc.expectSuccess {
				// 参数验证通过，但SDK调用会失败（500）
				assert.NotEqual(t, 400, response.Code, "Parameters should be valid")
			} else {
				assert.Equal(t, 400, response.Code, "Should return 400 for invalid pagination")
				assert.Contains(t, response.Message, tc.expectError, "Error message should match")
			}
		})
	}
}

// TestFinanceHandler_GetFinanceDetail_TimeRange 测试时间范围验证
func TestFinanceHandler_GetFinanceDetail_TimeRange(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.GET("/qianchuan/finance/detail/get", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetFinanceDetail(c)
	})

	testCases := []struct {
		name        string
		queryParams string
		expectError string
	}{
		{
			"invalid_start_time_format",
			"?start_time=invalid&end_time=2024-01-10",
			"开始时间格式错误",
		},
		{
			"invalid_end_time_format",
			"?start_time=2024-01-01&end_time=invalid",
			"结束时间格式错误",
		},
		{
			"exceed_90_days",
			"?start_time=2024-01-01&end_time=2024-05-01",
			"时间范围不能超过90天",
		},
		{
			"end_before_start",
			"?start_time=2024-02-01&end_time=2024-01-01",
			"结束时间必须大于开始时间",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "GET", "/qianchuan/finance/detail/get"+tc.queryParams, nil)
			response := ParseResponse(resp, t)

			assert.Equal(t, 400, response.Code, "Should return 400 for invalid time range")
			assert.Contains(t, response.Message, tc.expectError, "Error message should match")
		})
	}
}

// TestFinanceHandler_CreateTransferSeq_InvalidJSON 测试无效JSON
func TestFinanceHandler_CreateTransferSeq_InvalidJSON(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.POST("/qianchuan/agent/fund/transfer-seq/create", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.CreateTransferSeq(c)
	})

	testCases := []struct {
		name string
		body string
	}{
		{"invalid_json", `{invalid json}`},
		{"empty_body", ``},
		{"malformed_json", `{\"agent_id\": }`},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "POST", "/qianchuan/agent/fund/transfer-seq/create", strings.NewReader(tc.body))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for invalid JSON")
			assert.Contains(t, response.Message, "请求参数错误", "Error message should indicate bad parameters")
		})
	}
}

// TestFinanceHandler_CreateTransferSeq_MissingFields 测试缺少必填字段
func TestFinanceHandler_CreateTransferSeq_MissingFields(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.POST("/qianchuan/agent/fund/transfer-seq/create", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.CreateTransferSeq(c)
	})

	testCases := []struct {
		name string
		body string
	}{
		{"missing_agent_id", `{"advertiser_id": 123, "amount": 100.0}`},
		{"missing_advertiser_id", `{"agent_id": 456, "amount": 100.0}`},
		{"missing_amount", `{"agent_id": 456, "advertiser_id": 123}`},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "POST", "/qianchuan/agent/fund/transfer-seq/create", strings.NewReader(tc.body))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for missing fields")
			assert.Contains(t, response.Message, "请求参数错误", "Error message should indicate parameter error")
		})
	}
}

// TestFinanceHandler_CreateTransferSeq_InvalidAmount 测试无效金额
func TestFinanceHandler_CreateTransferSeq_InvalidAmount(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.POST("/qianchuan/agent/fund/transfer-seq/create", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.CreateTransferSeq(c)
	})

	testCases := []struct {
		name   string
		amount float64
	}{
		{"zero_amount", 0},
		{"negative_amount", -100.0},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			body := `{"agent_id": 456, "advertiser_id": 123, "amount": ` +
				strings.Replace(strings.Replace(`{{amount}}`, "{{amount}}", "0", 1), "0",
					func() string {
						if tc.amount == 0 {
							return "0"
						}
						return "-100.0"
					}(), 1) + `}`

			resp := DoRequest(router, "POST", "/qianchuan/agent/fund/transfer-seq/create", strings.NewReader(body))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for invalid amount")
			assert.Contains(t, response.Message, "转账金额必须大于0", "Error message should indicate invalid amount")
		})
	}
}

// TestFinanceHandler_CommitTransferSeq_MissingFields 测试缺少必填字段
func TestFinanceHandler_CommitTransferSeq_MissingFields(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.POST("/qianchuan/agent/fund/transfer-seq/commit", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.CommitTransferSeq(c)
	})

	testCases := []struct {
		name string
		body string
	}{
		{"missing_agent_id", `{"transfer_seq": "seq12345"}`},
		{"missing_transfer_seq", `{"agent_id": 456}`},
		{"empty_transfer_seq", `{"agent_id": 456, "transfer_seq": ""}`},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "POST", "/qianchuan/agent/fund/transfer-seq/commit", strings.NewReader(tc.body))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for missing fields")
			assert.Contains(t, response.Message, "请求参数错误", "Error message should indicate parameter error")
		})
	}
}

// TestFinanceHandler_CreateRefundSeq_InvalidAmount 测试退款无效金额
func TestFinanceHandler_CreateRefundSeq_InvalidAmount(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.POST("/qianchuan/agent/refund/transfer-seq/create", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.CreateRefundSeq(c)
	})

	testCases := []struct {
		name   string
		body   string
		errMsg string
	}{
		{
			"zero_amount",
			`{"agent_id": 456, "advertiser_id": 123, "amount": 0}`,
			"退款金额必须大于0",
		},
		{
			"negative_amount",
			`{"agent_id": 456, "advertiser_id": 123, "amount": -50.0}`,
			"退款金额必须大于0",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "POST", "/qianchuan/agent/refund/transfer-seq/create", strings.NewReader(tc.body))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for invalid amount")
			assert.Contains(t, response.Message, tc.errMsg, "Error message should match")
		})
	}
}

// TestFinanceHandler_CommitRefundSeq_MissingFields 测试退款提交缺少字段
func TestFinanceHandler_CommitRefundSeq_MissingFields(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.POST("/qianchuan/agent/refund/transfer-seq/commit", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.CommitRefundSeq(c)
	})

	testCases := []struct {
		name string
		body string
	}{
		{"missing_agent_id", `{"refund_seq": "refund12345"}`},
		{"missing_refund_seq", `{"agent_id": 456}`},
		{"empty_refund_seq", `{"agent_id": 456, "refund_seq": ""}`},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "POST", "/qianchuan/agent/refund/transfer-seq/commit", strings.NewReader(tc.body))

			response := ParseResponse(resp, t)
			assert.Equal(t, 400, response.Code, "Should return 400 for missing fields")
			assert.Contains(t, response.Message, "请求参数错误", "Error message should indicate parameter error")
		})
	}
}

// TestFinanceHandler_ResponseFormat 测试响应格式统一性
func TestFinanceHandler_ResponseFormat(t *testing.T) {
	router := SetupTestRouter()

	// mockManager removed
	mockService := &service.QianchuanService{}
	handler := NewFinanceHandler(mockService)

	router.GET("/test/wallet", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetWallet(c)
	})

	router.GET("/test/balance", func(c *gin.Context) {
		userSession := CreateTestUserSession(123456789)
		SetupTestSession(c, userSession)
		handler.GetBalance(c)
	})

	testCases := []struct {
		name string
		path string
	}{
		{"GetWallet", "/test/wallet"},
		{"GetBalance", "/test/balance"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp := DoRequest(router, "GET", tc.path, nil)
			response := ParseResponse(resp, t)

			// 验证响应包含必要字段
			assert.NotNil(t, response.Code, "Response should have code field")
			assert.NotNil(t, response.Message, "Response should have message field")

			// 由于没有真实SDK，会返回500，但格式应该正确
			assert.True(t, response.Code == 500 || response.Code == 0, "Response code should be valid")
		})
	}
}

// TestFinanceHandler_AllEndpoints_Auth 测试所有端点都需要认证
func TestFinanceHandler_AllEndpoints_Auth(t *testing.T) {
	router := SetupTestRouter()

	handler := NewFinanceHandler(nil)

	// 注册所有路由（不设置session）
	router.GET("/wallet", handler.GetWallet)
	router.GET("/balance", handler.GetBalance)
	router.GET("/detail", handler.GetFinanceDetail)
	router.POST("/transfer/create", handler.CreateTransferSeq)
	router.POST("/transfer/commit", handler.CommitTransferSeq)
	router.POST("/refund/create", handler.CreateRefundSeq)
	router.POST("/refund/commit", handler.CommitRefundSeq)

	testCases := []struct {
		name   string
		method string
		path   string
		body   string
	}{
		{"GetWallet", "GET", "/wallet", ""},
		{"GetBalance", "GET", "/balance", ""},
		{"GetFinanceDetail", "GET", "/detail", ""},
		{"CreateTransferSeq", "POST", "/transfer/create", `{"agent_id":1,"advertiser_id":2,"amount":100}`},
		{"CommitTransferSeq", "POST", "/transfer/commit", `{"agent_id":1,"transfer_seq":"seq123"}`},
		{"CreateRefundSeq", "POST", "/refund/create", `{"agent_id":1,"advertiser_id":2,"amount":100}`},
		{"CommitRefundSeq", "POST", "/refund/commit", `{"agent_id":1,"refund_seq":"ref123"}`},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			var resp *http.Response
			if tc.body == "" {
				// GET请求使用DoRequest的返回值
				recorder := DoRequest(router, tc.method, tc.path, nil)
				assert.Equal(t, http.StatusUnauthorized, recorder.Code, tc.name+" should require authentication")
			} else {
				// POST请求
				recorder := DoRequest(router, tc.method, tc.path, strings.NewReader(tc.body))
				assert.Equal(t, http.StatusUnauthorized, recorder.Code, tc.name+" should require authentication")
			}
			_ = resp // 避免未使用变量错误
		})
	}
}
