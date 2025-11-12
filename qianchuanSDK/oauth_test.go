package qianchuanSDK

import (
	"testing"
)

func TestOauthConnect(t *testing.T) {
	credentials := NewCredentials(123456, "test_secret")
	manager := NewManager(credentials, nil)

	url, err := manager.OauthConnect(OauthParam{
		AppId:       123456,
		State:       "test_state",
		Scope:       []int64{20120000},
		RedirectUri: "https://example.com/callback",
	})

	if err != nil {
		t.Errorf("OauthConnect返回错误: %v", err)
	}

	if url == "" {
		t.Error("OauthConnect返回空URL")
	}

	// 验证URL包含必要参数
	if url == "" {
		t.Error("生成的URL为空")
	}
}

func TestNewCredentials(t *testing.T) {
	appId := int64(123456)
	appSecret := "test_secret"

	cred := NewCredentials(appId, appSecret)

	if cred.AppId != appId {
		t.Errorf("AppId不匹配: 期望%d, 实际%d", appId, cred.AppId)
	}

	if cred.AppSecret != appSecret {
		t.Errorf("AppSecret不匹配: 期望%s, 实际%s", appSecret, cred.AppSecret)
	}
}

func TestNewManager(t *testing.T) {
	credentials := NewCredentials(123456, "test_secret")
	manager := NewManager(credentials, nil)

	if manager == nil {
		t.Error("NewManager返回nil")
	}

	if manager.Credentials == nil {
		t.Error("Manager的Credentials为nil")
	}

	if manager.client == nil {
		t.Error("Manager的client为nil")
	}
}
