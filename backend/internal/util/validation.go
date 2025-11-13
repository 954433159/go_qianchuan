package util

import (
	"fmt"
	"unicode/utf8"
)

// ValidateStringLength 验证字符串长度（按字符数，非字节数）
func ValidateStringLength(s string, min, max int, fieldName string) error {
	length := utf8.RuneCountInString(s)

	if min > 0 && length < min {
		return fmt.Errorf("%s长度不能少于%d个字符", fieldName, min)
	}

	if max > 0 && length > max {
		return fmt.Errorf("%s长度不能超过%d个字符", fieldName, max)
	}

	return nil
}

// ValidateRequired 验证必填字段
func ValidateRequired(value string, fieldName string) error {
	if value == "" {
		return fmt.Errorf("%s不能为空", fieldName)
	}
	return nil
}

// ValidateArrayLength 验证数组长度
func ValidateArrayLength(length, min, max int, fieldName string) error {
	if min > 0 && length < min {
		return fmt.Errorf("%s数量不能少于%d个", fieldName, min)
	}

	if max > 0 && length > max {
		return fmt.Errorf("%s数量不能超过%d个", fieldName, max)
	}

	return nil
}

// ValidateIntRange 验证整数范围
func ValidateIntRange(value, min, max int64, fieldName string) error {
	if value < min {
		return fmt.Errorf("%s不能小于%d", fieldName, min)
	}

	if max > 0 && value > max {
		return fmt.Errorf("%s不能大于%d", fieldName, max)
	}

	return nil
}

// ValidateFloatRange 验证浮点数范围
func ValidateFloatRange(value, min, max float64, fieldName string) error {
	if value < min {
		return fmt.Errorf("%s不能小于%.2f", fieldName, min)
	}

	if max > 0 && value > max {
		return fmt.Errorf("%s不能大于%.2f", fieldName, max)
	}

	return nil
}

// ValidateInArray 验证值是否在允许的列表中
func ValidateInArray(value string, allowedValues []string, fieldName string) error {
	for _, allowed := range allowedValues {
		if value == allowed {
			return nil
		}
	}

	return fmt.Errorf("%s值无效，允许的值为: %v", fieldName, allowedValues)
}

// ValidateBudget 验证预算（单位：分，最低100元 = 10000分）
func ValidateBudget(budget int64, fieldName string) error {
	const minBudget = 10000 // 100元

	if budget > 0 && budget < minBudget {
		return fmt.Errorf("%s不能低于100元", fieldName)
	}

	return nil
}

// ValidateBudgetRelation 验证总预算与日预算的关系
func ValidateBudgetRelation(totalBudget, dailyBudget int64) error {
	if totalBudget > 0 && dailyBudget > 0 && totalBudget < dailyBudget {
		return fmt.Errorf("总预算不能小于日预算")
	}

	return nil
}

// ValidateBid 验证出价（单位：分，范围0.1-9999元）
func ValidateBid(bid float64, fieldName string) error {
	const minBid = 0.1
	const maxBid = 9999.0

	if bid < minBid || bid > maxBid {
		return fmt.Errorf("%s必须在%.1f-%.1f元之间", fieldName, minBid, maxBid)
	}

	return nil
}

// ValidateID 验证ID是否有效（大于0）
func ValidateID(id int64, fieldName string) error {
	if id <= 0 {
		return fmt.Errorf("%s无效", fieldName)
	}

	return nil
}

// ValidateIDArray 验证ID数组（所有ID必须大于0）
func ValidateIDArray(ids []int64, fieldName string) error {
	if len(ids) == 0 {
		return fmt.Errorf("%s不能为空", fieldName)
	}

	for i, id := range ids {
		if id <= 0 {
			return fmt.Errorf("%s[%d]无效", fieldName, i)
		}
	}

	return nil
}
