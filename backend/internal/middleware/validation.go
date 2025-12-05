package middleware

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// ValidateAdvertiserID 验证广告主ID
func ValidateAdvertiserID() gin.HandlerFunc {
	return func(c *gin.Context) {
		advertiserID := c.Query("advertiser_id")
		if advertiserID == "" {
			advertiserID = c.PostForm("advertiser_id")
		}
		
		if advertiserID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "advertiser_id参数不能为空",
			})
			c.Abort()
			return
		}
		
		// 验证是否为数字
		if !isNumeric(advertiserID) {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "advertiser_id必须为数字",
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// ValidatePagination 验证分页参数
func ValidatePagination() gin.HandlerFunc {
	return func(c *gin.Context) {
		page := c.DefaultQuery("page", "1")
		pageSize := c.DefaultQuery("page_size", "10")
		
		// 验证page
		if !isNumeric(page) {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "page参数必须为正整数",
			})
			c.Abort()
			return
		}
		
		// 验证page_size
		if !isNumeric(pageSize) {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "page_size参数必须为正整数",
			})
			c.Abort()
			return
		}
		
		// 限制page_size最大值
		if parseInt(pageSize) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "page_size不能超过100",
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// ValidateRequiredQuery 验证必需的查询参数
func ValidateRequiredQuery(params ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		missingParams := []string{}
		
		for _, param := range params {
			if c.Query(param) == "" {
				missingParams = append(missingParams, param)
			}
		}
		
		if len(missingParams) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": fmt.Sprintf("缺少必需参数: %s", strings.Join(missingParams, ", ")),
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// ValidateJSON 验证请求体是否为有效JSON
func ValidateJSON() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
			contentType := c.GetHeader("Content-Type")
			if !strings.Contains(contentType, "application/json") {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": "Content-Type必须为application/json",
				})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}

// ValidateDateRange 验证日期范围
func ValidateDateRange() gin.HandlerFunc {
	return func(c *gin.Context) {
		startDate := c.Query("start_date")
		endDate := c.Query("end_date")
		
		if startDate != "" && !isValidDate(startDate) {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "start_date格式错误，应为YYYY-MM-DD",
			})
			c.Abort()
			return
		}
		
		if endDate != "" && !isValidDate(endDate) {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "end_date格式错误，应为YYYY-MM-DD",
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// SanitizeInput 清理输入，防止XSS和SQL注入
func SanitizeInput() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 清理查询参数
		for key, values := range c.Request.URL.Query() {
			for i, value := range values {
				c.Request.URL.Query()[key][i] = sanitizeString(value)
			}
		}
		
		c.Next()
	}
}

// ValidateIDParam 验证路径参数中的ID
func ValidateIDParam(paramName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param(paramName)
		
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": fmt.Sprintf("%s参数不能为空", paramName),
			})
			c.Abort()
			return
		}
		
		if !isNumeric(id) {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": fmt.Sprintf("%s必须为数字", paramName),
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// ValidateEnum 验证枚举值
func ValidateEnum(paramName string, allowedValues []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		value := c.Query(paramName)
		if value == "" {
			value = c.PostForm(paramName)
		}
		
		if value != "" {
			isValid := false
			for _, allowed := range allowedValues {
				if value == allowed {
					isValid = true
					break
				}
			}
			
			if !isValid {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": fmt.Sprintf("%s参数值无效，允许的值: %s", paramName, strings.Join(allowedValues, ", ")),
				})
				c.Abort()
				return
			}
		}
		
		c.Next()
	}
}

// ============ 辅助函数 ============

// isNumeric 检查字符串是否为数字
func isNumeric(s string) bool {
	matched, _ := regexp.MatchString(`^\d+$`, s)
	return matched
}

// isValidDate 检查日期格式是否为YYYY-MM-DD
func isValidDate(s string) bool {
	matched, _ := regexp.MatchString(`^\d{4}-\d{2}-\d{2}$`, s)
	return matched
}

// parseInt 转换字符串为整数
func parseInt(s string) int {
	var result int
	fmt.Sscanf(s, "%d", &result)
	return result
}

// sanitizeString 清理字符串，防止XSS和SQL注入
func sanitizeString(s string) string {
	// 移除潜在的危险字符
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	s = strings.ReplaceAll(s, "'", "&#39;")
	s = strings.ReplaceAll(s, "&", "&amp;")
	
	// 移除SQL注入关键字（基础防护）
	dangerousPatterns := []string{
		"DROP", "DELETE", "INSERT", "UPDATE", "SELECT",
		"UNION", "EXEC", "EXECUTE", "--", "/*", "*/",
		"XP_", "SP_",
	}
	
	upperS := strings.ToUpper(s)
	for _, pattern := range dangerousPatterns {
		if strings.Contains(upperS, pattern) {
			// 如果包含危险关键字，返回空字符串或记录日志
			return ""
		}
	}
	
	return s
}

// ValidateFileUpload 验证文件上传
func ValidateFileUpload(maxSize int64, allowedTypes []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		file, header, err := c.Request.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "未找到上传文件",
			})
			c.Abort()
			return
		}
		defer file.Close()
		
		// 验证文件大小
		if header.Size > maxSize {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": fmt.Sprintf("文件大小超过限制（最大%dMB）", maxSize/(1024*1024)),
			})
			c.Abort()
			return
		}
		
		// 验证文件类型
		if len(allowedTypes) > 0 {
			contentType := header.Header.Get("Content-Type")
			isValid := false
			for _, allowed := range allowedTypes {
				if strings.Contains(contentType, allowed) {
					isValid = true
					break
				}
			}
			
			if !isValid {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": fmt.Sprintf("不支持的文件类型，允许的类型: %s", strings.Join(allowedTypes, ", ")),
				})
				c.Abort()
				return
			}
		}
		
		c.Next()
	}
}

// ValidateBudget 验证预算参数
func ValidateBudget() gin.HandlerFunc {
	return func(c *gin.Context) {
		var json map[string]interface{}
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "请求体格式错误",
			})
			c.Abort()
			return
		}
		
		// 验证预算值
		if budget, ok := json["budget"]; ok {
			if budgetFloat, ok := budget.(float64); ok {
				if budgetFloat <= 0 {
					c.JSON(http.StatusBadRequest, gin.H{
						"code":    400,
						"message": "预算必须大于0",
					})
					c.Abort()
					return
				}
				
				// 预算不能超过1000万
				if budgetFloat > 10000000 {
					c.JSON(http.StatusBadRequest, gin.H{
						"code":    400,
						"message": "预算不能超过1000万",
					})
					c.Abort()
					return
				}
			}
		}
		
		// 将JSON重新设置回context，供后续使用
		c.Set("validated_json", json)
		c.Next()
	}
}
