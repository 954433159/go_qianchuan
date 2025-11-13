package util

import (
	"fmt"
	"strconv"
	"time"
)

// ParseTime 统一时间解析（支持多种格式）
func ParseTime(input string) (time.Time, error) {
	formats := []string{
		"2006-01-02 15:04:05",
		"2006-01-02",
		time.RFC3339,
		"2006/01/02 15:04:05",
		"2006/01/02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, input); err == nil {
			return t, nil
		}
	}

	// 尝试解析Unix时间戳
	if timestamp, err := strconv.ParseInt(input, 10, 64); err == nil {
		return time.Unix(timestamp, 0), nil
	}

	return time.Time{}, fmt.Errorf("无法解析时间: %s（支持格式：2006-01-02、2006-01-02 15:04:05、RFC3339、Unix时间戳）", input)
}

// ValidateTimeRange 验证时间范围
func ValidateTimeRange(start, end time.Time, maxDays int) error {
	if end.Before(start) {
		return fmt.Errorf("结束时间必须大于开始时间")
	}

	duration := end.Sub(start)
	maxDuration := time.Duration(maxDays) * 24 * time.Hour

	if duration > maxDuration {
		return fmt.Errorf("时间范围不能超过%d天", maxDays)
	}

	return nil
}

// FormatDate 格式化日期为 YYYY-MM-DD
func FormatDate(t time.Time) string {
	return t.Format("2006-01-02")
}

// FormatDateTime 格式化日期时间为 YYYY-MM-DD HH:MM:SS
func FormatDateTime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// StartOfDay 获取当天开始时间（00:00:00）
func StartOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

// EndOfDay 获取当天结束时间（23:59:59）
func EndOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999999999, t.Location())
}
