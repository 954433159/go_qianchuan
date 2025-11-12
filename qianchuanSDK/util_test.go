package qianchuanSDK

import (
	"strings"
	"testing"
)

func TestBase64Encode(t *testing.T) {
	tests := []struct {
		name     string
		input    []byte
		expected string
	}{
		{"基础测试", []byte("test"), "dGVzdA=="},
		{"空字符串", []byte(""), ""},
		{"中文测试", []byte("测试"), "5rWL6K+V"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Base64Encode(tt.input)
			if result != tt.expected {
				t.Errorf("Base64Encode失败: 期望%s, 实际%s", tt.expected, result)
			}
		})
	}
}

func TestBase64Decode(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		expected  string
		shouldErr bool
	}{
		{"基础测试", "dGVzdA==", "test", false},
		{"空字符串", "", "", false},
		{"中文测试", "5rWL6K+V", "测试", false},
		{"无效Base64", "invalid!!!!", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := Base64Decode(tt.input)
			
			if tt.shouldErr {
				if err == nil {
					t.Error("期望返回错误，但没有错误")
				}
				return
			}
			
			if err != nil {
				t.Errorf("Base64Decode失败: %v", err)
			}

			if string(result) != tt.expected {
				t.Errorf("Base64Decode结果错误: 期望%s, 实际%s", tt.expected, string(result))
			}
		})
	}
}

func TestBuildQuery(t *testing.T) {
	type TestStruct struct {
		Name  string `json:"name"`
		Age   int    `json:"age,omitempty"`
		Email string `json:"email,omitempty"`
	}

	tests := []struct {
		name      string
		baseURL   string
		param     TestStruct
		noInclude []string
		wantName  bool
		wantAge   bool
		wantEmail bool
	}{
		{
			name:      "所有字段都有值",
			baseURL:   "https://example.com/api",
			param:     TestStruct{Name: "test", Age: 25, Email: "test@example.com"},
			noInclude: []string{},
			wantName:  true,
			wantAge:   true,
			wantEmail: true,
		},
		{
			name:      "Email为空",
			baseURL:   "https://example.com/api",
			param:     TestStruct{Name: "test", Age: 25},
			noInclude: []string{},
			wantName:  true,
			wantAge:   true,
			wantEmail: false,
		},
		{
			name:      "排除Age",
			baseURL:   "https://example.com/api",
			param:     TestStruct{Name: "test", Age: 25},
			noInclude: []string{"age"},
			wantName:  true,
			wantAge:   false,
			wantEmail: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			url, err := BuildQuery(tt.baseURL, tt.param, tt.noInclude)
			if err != nil {
				t.Errorf("BuildQuery失败: %v", err)
				return
			}

			if url == "" {
				t.Error("BuildQuery返回空URL")
				return
			}

			if !strings.HasPrefix(url, tt.baseURL) {
				t.Errorf("URL应该以%s开头", tt.baseURL)
			}

			if tt.wantName && !strings.Contains(url, "name=") {
				t.Error("URL应该包含name参数")
			}

			if tt.wantAge && !strings.Contains(url, "age=") {
				t.Error("URL应该包含age参数")
			}

			if tt.wantEmail && !strings.Contains(url, "email=") {
				t.Error("URL应该包含email参数")
			}

			if !tt.wantAge && strings.Contains(url, "age=") {
				t.Error("URL不应该包含age参数")
			}
		})
	}
}

func TestPKCS5UnPadding(t *testing.T) {
	// 测试PKCS5填充移除
	tests := []struct {
		name     string
		input    []byte
		expected []byte
	}{
		{"单字节填充", []byte{1, 2, 3, 1}, []byte{1, 2, 3}},
		{"多字节填充", []byte{1, 2, 3, 3, 3, 3}, []byte{1, 2, 3}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := PKCS5UnPadding(tt.input)
			if len(result) != len(tt.expected) {
				t.Errorf("长度不匹配: 期望%d, 实际%d", len(tt.expected), len(result))
			}
		})
	}
}
