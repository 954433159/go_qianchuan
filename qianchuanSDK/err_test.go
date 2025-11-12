package qianchuanSDK

import (
	"strings"
	"testing"
)

func TestQCError_Error(t *testing.T) {
	tests := []struct {
		name    string
		err     QCError
		wantMsg string
	}{
		{
			name: "基础错误",
			err: QCError{
				Code:    40001,
				Message: "参数错误",
			},
			wantMsg: "40001: 参数错误",
		},
		{
			name: "带RequestId的错误",
			err: QCError{
				Code:      40002,
				Message:   "权限不足",
				RequestId: "req-123456",
			},
			wantMsg: "40002: 权限不足",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errMsg := tt.err.Error()
			if !strings.Contains(errMsg, tt.wantMsg) {
				t.Errorf("错误信息不匹配: 期望包含'%s', 实际'%s'", tt.wantMsg, errMsg)
			}
		})
	}
}

func TestNewError(t *testing.T) {
	code := int64(40001)
	desc := "测试错误"

	err := NewError(code, desc)

	if err == nil {
		t.Fatal("NewError返回nil")
	}

	if err.Code != code {
		t.Errorf("错误码不匹配: 期望%d, 实际%d", code, err.Code)
	}

	if err.Message != desc {
		t.Errorf("错误描述不匹配: 期望%s, 实际%s", desc, err.Message)
	}
}
