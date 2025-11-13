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
