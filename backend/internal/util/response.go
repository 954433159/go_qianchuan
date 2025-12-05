package util

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response codes
const (
	CodeSuccess            = 0   // 成功
	CodeBadRequest         = 400 // 请求参数错误
	CodeUnauthorized       = 401 // 未认证
	CodeForbidden          = 403 // 禁止访问
	CodeNotFound           = 404 // 资源不存在
	CodeConflict           = 409 // 冲突
	CodeServerError        = 500 // 服务器错误
	CodeNotImplemented     = 501 // 功能未实现
	CodeServiceUnavailable = 503 // 服务不可用
)

// ApiResponse 统一API响应格式
type ApiResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Hint    string      `json:"hint,omitempty"` // 提示信息，用于501等状态
}

// PaginatedData 分页数据响应
type PaginatedData struct {
	List     interface{} `json:"list"`
	Page     int64       `json:"page"`
	PageSize int64       `json:"page_size"`
	Total    int64       `json:"total"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, ApiResponse{
		Code:    CodeSuccess,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMessage 成功响应（自定义消息）
func SuccessWithMessage(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, ApiResponse{
		Code:    CodeSuccess,
		Message: message,
		Data:    data,
	})
}

// SuccessList 成功响应 - 列表
func SuccessList(c *gin.Context, list interface{}, page, pageSize, total int64) {
	c.JSON(http.StatusOK, ApiResponse{
		Code:    CodeSuccess,
		Message: "success",
		Data: PaginatedData{
			List:     list,
			Page:     page,
			PageSize: pageSize,
			Total:    total,
		},
	})
}

// BadRequest 请求参数错误
func BadRequest(c *gin.Context, message string) {
	if message == "" {
		message = "请求参数错误"
	}
	c.JSON(http.StatusBadRequest, ApiResponse{
		Code:    CodeBadRequest,
		Message: message,
	})
}

// Unauthorized 未认证
func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "未登录或会话已过期"
	}
	c.JSON(http.StatusUnauthorized, ApiResponse{
		Code:    CodeUnauthorized,
		Message: message,
	})
}

// Forbidden 禁止访问
func Forbidden(c *gin.Context, message string) {
	if message == "" {
		message = "禁止访问"
	}
	c.JSON(http.StatusForbidden, ApiResponse{
		Code:    CodeForbidden,
		Message: message,
	})
}

// NotFound 资源不存在
func NotFound(c *gin.Context, message string) {
	if message == "" {
		message = "请求的资源不存在"
	}
	c.JSON(http.StatusNotFound, ApiResponse{
		Code:    CodeNotFound,
		Message: message,
	})
}

// Conflict 冲突
func Conflict(c *gin.Context, message string) {
	if message == "" {
		message = "资源冲突"
	}
	c.JSON(http.StatusConflict, ApiResponse{
		Code:    CodeConflict,
		Message: message,
	})
}

// ServerError 服务器错误
func ServerError(c *gin.Context, message string) {
	if message == "" {
		message = "服务器处理错误"
	}
	c.JSON(http.StatusInternalServerError, ApiResponse{
		Code:    CodeServerError,
		Message: message,
	})
}

// NotImplemented 功能未实现
func NotImplemented(c *gin.Context, message, hint string) {
	if message == "" {
		message = "功能暂未实现"
	}
	c.JSON(http.StatusNotImplemented, ApiResponse{
		Code:    CodeNotImplemented,
		Message: message,
		Hint:    hint,
	})
}

// ServiceUnavailable 服务不可用
func ServiceUnavailable(c *gin.Context, message string) {
	if message == "" {
		message = "服务暂时不可用"
	}
	c.JSON(http.StatusServiceUnavailable, ApiResponse{
		Code:    CodeServiceUnavailable,
		Message: message,
	})
}

// ErrorResponse 自定义错误响应（用于SDK返回的非0错误码）
func ErrorResponse(c *gin.Context, code int, message string) {
	if message == "" {
		message = "操作失败"
	}
	c.JSON(http.StatusOK, ApiResponse{
		Code:    code,
		Message: message,
	})
}

// Error 统一错误响应处理
// 支持AppError和普通error
func Error(c *gin.Context, err error) {
	// 如果是AppError，使用其定义的状态码和信息
	if appErr, ok := err.(*AppError); ok {
		httpStatus := appErr.GetHTTPStatus()
		
		response := ApiResponse{
			Code:    httpStatus,
			Message: appErr.Message,
		}
		
		// 开发环境返回详细信息
		if gin.Mode() == gin.DebugMode && appErr.Details != "" {
			response.Data = gin.H{
				"details": appErr.Details,
			}
		}
		
		c.JSON(httpStatus, response)
		return
	}
	
	// 普通错误，默认返回500
	c.JSON(http.StatusInternalServerError, ApiResponse{
		Code:    CodeServerError,
		Message: "服务器内部错误",
	})
}

// AbortWithError 中止请求并返回错误
// 用于中间件中
func AbortWithError(c *gin.Context, err error) {
	Error(c, err)
	c.Abort()
}

// AbortWithAppError 中止请求并返回AppError
func AbortWithAppError(c *gin.Context, appErr *AppError) {
	Error(c, appErr)
	c.Abort()
}

// BindJSON 绑定JSON并验证
func BindJSON(c *gin.Context, obj interface{}) error {
	if err := c.ShouldBindJSON(obj); err != nil {
		return NewBadRequestError("参数格式错误: " + err.Error())
	}
	return nil
}

// BindQuery 绑定查询参数并验证
func BindQuery(c *gin.Context, obj interface{}) error {
	if err := c.ShouldBindQuery(obj); err != nil {
		return NewBadRequestError("查询参数格式错误: " + err.Error())
	}
	return nil
}

// RespondWithSDKError 响应SDK错误
// 自动转换SDK错误为友好的错误消息
func RespondWithSDKError(c *gin.Context, err error, context string) {
	appErr := NewSDKError(context+"失败", err)
	Error(c, appErr)
}
