package util

import "fmt"

const (
	// DefaultPage 默认页码
	DefaultPage = 1
	// DefaultPageSize 默认每页数量
	DefaultPageSize = 20
	// MaxPageSize 最大每页数量
	MaxPageSize = 100
	// MinPageSize 最小每页数量
	MinPageSize = 1
)

// ValidatePagination 验证并规范化分页参数
// 返回值：规范化后的page、pageSize、错误信息
func ValidatePagination(page, pageSize int) (int, int, error) {
	// 规范化page
	if page < 1 {
		page = DefaultPage
	}

	// 规范化pageSize
	if pageSize < 1 {
		pageSize = DefaultPageSize
	}

	// 验证pageSize上限
	if pageSize > MaxPageSize {
		return 0, 0, fmt.Errorf("单页最多返回%d条记录", MaxPageSize)
	}

	return page, pageSize, nil
}

// ValidatePaginationInt64 验证并规范化分页参数（int64版本）
func ValidatePaginationInt64(page, pageSize int64) (int64, int64, error) {
	// 规范化page
	if page < 1 {
		page = DefaultPage
	}

	// 规范化pageSize
	if pageSize < 1 {
		pageSize = DefaultPageSize
	}

	// 验证pageSize上限
	if pageSize > MaxPageSize {
		return 0, 0, fmt.Errorf("单页最多返回%d条记录", MaxPageSize)
	}

	return page, pageSize, nil
}

// CalculateOffset 计算偏移量（用于数据库查询）
func CalculateOffset(page, pageSize int) int {
	if page < 1 {
		page = 1
	}
	return (page - 1) * pageSize
}

// CalculateOffsetInt64 计算偏移量（int64版本）
func CalculateOffsetInt64(page, pageSize int64) int64 {
	if page < 1 {
		page = 1
	}
	return (page - 1) * pageSize
}
