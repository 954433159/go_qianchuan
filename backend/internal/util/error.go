package util

import (
	"fmt"
	"net/http"
)

// ErrorCode 错误码类型
type ErrorCode string

const (
	// 客户端错误 4xx
	ErrBadRequest     ErrorCode = "BAD_REQUEST"      // 400 参数错误
	ErrUnauthorized   ErrorCode = "UNAUTHORIZED"     // 401 未授权
	ErrForbidden      ErrorCode = "FORBIDDEN"        // 403 禁止访问
	ErrNotFound       ErrorCode = "NOT_FOUND"        // 404 资源不存在
	ErrMethodNotAllowed ErrorCode = "METHOD_NOT_ALLOWED" // 405 方法不允许
	ErrConflict       ErrorCode = "CONFLICT"         // 409 资源冲突
	ErrTooManyRequests ErrorCode = "TOO_MANY_REQUESTS" // 429 请求过多
	
	// 服务器错误 5xx
	ErrInternalError  ErrorCode = "INTERNAL_ERROR"   // 500 服务器内部错误
	ErrBadGateway     ErrorCode = "BAD_GATEWAY"      // 502 网关错误
	ErrServiceUnavailable ErrorCode = "SERVICE_UNAVAILABLE" // 503 服务不可用
	ErrGatewayTimeout ErrorCode = "GATEWAY_TIMEOUT"  // 504 网关超时
	ErrNotImplemented ErrorCode = "NOT_IMPLEMENTED"  // 501 功能未实现
	
	// 业务错误
	ErrInvalidParams  ErrorCode = "INVALID_PARAMS"   // 参数验证失败
	ErrTokenExpired   ErrorCode = "TOKEN_EXPIRED"    // Token已过期
	ErrTokenInvalid   ErrorCode = "TOKEN_INVALID"    // Token无效
	ErrSessionExpired ErrorCode = "SESSION_EXPIRED"  // 会话已过期
	ErrPermissionDenied ErrorCode = "PERMISSION_DENIED" // 权限不足
	ErrResourceExists ErrorCode = "RESOURCE_EXISTS"  // 资源已存在
	ErrResourceNotFound ErrorCode = "RESOURCE_NOT_FOUND" // 资源不存在
	ErrOperationFailed ErrorCode = "OPERATION_FAILED" // 操作失败
	ErrSDKError       ErrorCode = "SDK_ERROR"        // SDK调用错误
	ErrDatabaseError  ErrorCode = "DATABASE_ERROR"   // 数据库错误
)

// AppError 应用错误
type AppError struct {
	Code     ErrorCode              `json:"code"`              // 错误码
	Message  string                 `json:"message"`           // 错误信息
	Details  string                 `json:"details,omitempty"` // 详细信息（可选）
	Internal error                  `json:"-"`                 // 内部错误（不返回给客户端）
	Metadata map[string]interface{} `json:"metadata,omitempty"` // 额外元数据
}

// Error 实现error接口
func (e *AppError) Error() string {
	if e.Internal != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Internal)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Unwrap 实现errors.Unwrap接口
func (e *AppError) Unwrap() error {
	return e.Internal
}

// WithDetails 添加详细信息
func (e *AppError) WithDetails(details string) *AppError {
	e.Details = details
	return e
}

// WithInternal 添加内部错误
func (e *AppError) WithInternal(err error) *AppError {
	e.Internal = err
	return e
}

// WithMetadata 添加元数据
func (e *AppError) WithMetadata(key string, value interface{}) *AppError {
	if e.Metadata == nil {
		e.Metadata = make(map[string]interface{})
	}
	e.Metadata[key] = value
	return e
}

// GetHTTPStatus 获取HTTP状态码
func (e *AppError) GetHTTPStatus() int {
	return GetHTTPStatus(e.Code)
}

// NewError 创建新错误
func NewError(code ErrorCode, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

// NewBadRequestError 创建参数错误
func NewBadRequestError(message string) *AppError {
	return &AppError{
		Code:    ErrBadRequest,
		Message: message,
	}
}

// NewUnauthorizedError 创建未授权错误
func NewUnauthorizedError(message string) *AppError {
	return &AppError{
		Code:    ErrUnauthorized,
		Message: message,
	}
}

// NewForbiddenError 创建禁止访问错误
func NewForbiddenError(message string) *AppError {
	return &AppError{
		Code:    ErrForbidden,
		Message: message,
	}
}

// NewNotFoundError 创建资源不存在错误
func NewNotFoundError(message string) *AppError {
	return &AppError{
		Code:    ErrNotFound,
		Message: message,
	}
}

// NewInternalError 创建服务器内部错误
func NewInternalError(message string) *AppError {
	return &AppError{
		Code:    ErrInternalError,
		Message: message,
	}
}

// NewNotImplementedError 创建功能未实现错误
func NewNotImplementedError(message string) *AppError {
	return &AppError{
		Code:    ErrNotImplemented,
		Message: message,
	}
}

// NewSDKError 创建SDK调用错误
func NewSDKError(message string, err error) *AppError {
	return &AppError{
		Code:     ErrSDKError,
		Message:  message,
		Internal: err,
	}
}

// NewInvalidParamsError 创建参数验证失败错误
func NewInvalidParamsError(message string) *AppError {
	return &AppError{
		Code:    ErrInvalidParams,
		Message: message,
	}
}

// NewTokenExpiredError 创建Token过期错误
func NewTokenExpiredError() *AppError {
	return &AppError{
		Code:    ErrTokenExpired,
		Message: "访问令牌已过期，请刷新后重试",
	}
}

// NewSessionExpiredError 创建会话过期错误
func NewSessionExpiredError() *AppError {
	return &AppError{
		Code:    ErrSessionExpired,
		Message: "会话已过期，请重新登录",
	}
}

// NewResourceNotFoundError 创建资源不存在错误
func NewResourceNotFoundError(resource string) *AppError {
	return &AppError{
		Code:    ErrResourceNotFound,
		Message: fmt.Sprintf("%s不存在", resource),
	}
}

// NewResourceExistsError 创建资源已存在错误
func NewResourceExistsError(resource string) *AppError {
	return &AppError{
		Code:    ErrResourceExists,
		Message: fmt.Sprintf("%s已存在", resource),
	}
}

// GetHTTPStatus 根据错误码获取HTTP状态码
func GetHTTPStatus(code ErrorCode) int {
	statusMap := map[ErrorCode]int{
		// 4xx 客户端错误
		ErrBadRequest:       http.StatusBadRequest,       // 400
		ErrUnauthorized:     http.StatusUnauthorized,     // 401
		ErrForbidden:        http.StatusForbidden,        // 403
		ErrNotFound:         http.StatusNotFound,         // 404
		ErrMethodNotAllowed: http.StatusMethodNotAllowed, // 405
		ErrConflict:         http.StatusConflict,         // 409
		ErrTooManyRequests:  http.StatusTooManyRequests,  // 429
		
		// 5xx 服务器错误
		ErrInternalError:      http.StatusInternalServerError, // 500
		ErrNotImplemented:     http.StatusNotImplemented,      // 501
		ErrBadGateway:         http.StatusBadGateway,          // 502
		ErrServiceUnavailable: http.StatusServiceUnavailable,  // 503
		ErrGatewayTimeout:     http.StatusGatewayTimeout,      // 504
		
		// 业务错误（映射到HTTP状态码）
		ErrInvalidParams:      http.StatusBadRequest,    // 400
		ErrTokenExpired:       http.StatusUnauthorized,  // 401
		ErrTokenInvalid:       http.StatusUnauthorized,  // 401
		ErrSessionExpired:     http.StatusUnauthorized,  // 401
		ErrPermissionDenied:   http.StatusForbidden,     // 403
		ErrResourceExists:     http.StatusConflict,      // 409
		ErrResourceNotFound:   http.StatusNotFound,      // 404
		ErrOperationFailed:    http.StatusInternalServerError, // 500
		ErrSDKError:           http.StatusBadGateway,    // 502
		ErrDatabaseError:      http.StatusInternalServerError, // 500
	}
	
	if status, ok := statusMap[code]; ok {
		return status
	}
	
	return http.StatusInternalServerError // 默认500
}

// IsClientError 判断是否是客户端错误（4xx）
func IsClientError(code ErrorCode) bool {
	status := GetHTTPStatus(code)
	return status >= 400 && status < 500
}

// IsServerError 判断是否是服务器错误（5xx）
func IsServerError(code ErrorCode) bool {
	status := GetHTTPStatus(code)
	return status >= 500 && status < 600
}
