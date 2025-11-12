package qianchuanSDK

import (
	"testing"
	"time"

	"github.com/CriarBrand/qianchuanSDK/auth"
)

// TestNewTokenManager 测试创建TokenManager
func TestNewTokenManager(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)

	// 测试默认配置
	tm := NewTokenManager(manager, nil)
	if tm == nil {
		t.Fatal("NewTokenManager returned nil")
	}
	if !tm.autoRefresh {
		t.Error("Expected AutoRefresh to be true by default")
	}
	if tm.refreshThreshold != 5*time.Minute {
		t.Errorf("Expected RefreshThreshold to be 5m, got %v", tm.refreshThreshold)
	}

	// 测试自定义配置
	customConfig := &TokenManagerConfig{
		AutoRefresh:      false,
		RefreshThreshold: 10 * time.Minute,
	}
	tm2 := NewTokenManager(manager, customConfig)
	if tm2.autoRefresh {
		t.Error("Expected AutoRefresh to be false")
	}
	if tm2.refreshThreshold != 10*time.Minute {
		t.Errorf("Expected RefreshThreshold to be 10m, got %v", tm2.refreshThreshold)
	}
}

// TestSetTokens 测试设置Token
func TestSetTokens(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)
	tm := NewTokenManager(manager, nil)

	accessToken := "test_access_token"
	refreshToken := "test_refresh_token"
	expiresIn := uint64(3600)

	tm.SetTokens(accessToken, refreshToken, expiresIn)

	if tm.accessToken != accessToken {
		t.Errorf("Expected accessToken %s, got %s", accessToken, tm.accessToken)
	}
	if tm.refreshToken != refreshToken {
		t.Errorf("Expected refreshToken %s, got %s", refreshToken, tm.refreshToken)
	}
	if tm.expiresAt.IsZero() {
		t.Error("Expected expiresAt to be set")
	}
}

// TestGetAccessToken 测试获取AccessToken
func TestGetAccessToken(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)
	tm := NewTokenManager(manager, nil)

	// 测试未设置Token
	_, err := tm.GetAccessToken()
	if err == nil {
		t.Error("Expected error when no token is set")
	}

	// 设置有效Token
	tm.SetTokens("valid_token", "refresh_token", 3600)
	token, err := tm.GetAccessToken()
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if token != "valid_token" {
		t.Errorf("Expected token 'valid_token', got '%s'", token)
	}

	// 测试自动刷新功能被禁用
	tm.autoRefresh = false
	tm.SetTokens("token", "refresh", 0) // 立即过期
	_, err = tm.GetAccessToken()
	if err == nil {
		t.Error("Expected error for expired token when AutoRefresh is disabled")
	}
}

// TestIsExpired 测试过期检测
func TestIsExpired(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)
	tm := NewTokenManager(manager, nil)

	// 未设置Token
	if !tm.IsExpired() {
		t.Error("Expected IsExpired to return true when no token is set")
	}

	// 设置有效Token
	tm.SetTokens("token", "refresh", 3600)
	if tm.IsExpired() {
		t.Error("Expected IsExpired to return false for valid token")
	}

	// 设置过期Token
	tm.SetTokens("token", "refresh", 0) // 0表示立即过期
	time.Sleep(100 * time.Millisecond)   // 等待一下确保时间流逝
	if !tm.IsExpired() {
		t.Error("Expected IsExpired to return true for expired token")
	}
}

// TestGetRemainingTime 测试获取剩余时间
func TestGetRemainingTime(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)
	tm := NewTokenManager(manager, nil)

	// 未设置Token
	remaining := tm.GetRemainingTime()
	if remaining != 0 {
		t.Errorf("Expected 0 remaining time, got %v", remaining)
	}

	// 设置Token
	tm.SetTokens("token", "refresh", 3600)
	remaining = tm.GetRemainingTime()
	if remaining < 3590*time.Second || remaining > 3600*time.Second {
		t.Errorf("Expected ~3600s remaining, got %v", remaining)
	}
}

// TestClear 测试清空Token
func TestClear(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)
	tm := NewTokenManager(manager, nil)

	// 设置Token
	tm.SetTokens("token", "refresh", 3600)

	// 清空
	tm.Clear()

	// 验证已清空
	if tm.accessToken != "" {
		t.Error("Expected accessToken to be empty after Clear()")
	}
	if tm.refreshToken != "" {
		t.Error("Expected refreshToken to be empty after Clear()")
	}
	if !tm.expiresAt.IsZero() {
		t.Error("Expected expiresAt to be zero after Clear()")
	}
}

// TestTokenManagerWithRealManager 测试与真实Manager集成
func TestTokenManagerWithRealManager(t *testing.T) {
	// 创建真实的credentials
	credentials := auth.New(123456, "test_secret")

	// 创建真实的Manager
	manager := NewManager(credentials, nil)

	// 创建TokenManager
	tm := NewTokenManager(manager, nil)
	if tm == nil {
		t.Fatal("Failed to create TokenManager with real Manager")
	}

	// 设置Token
	tm.SetTokens("test_token", "test_refresh", 3600)

	// 验证可以获取Token
	token, err := tm.GetAccessToken()
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if token != "test_token" {
		t.Errorf("Expected 'test_token', got '%s'", token)
	}
}

// BenchmarkGetAccessToken 性能测试：获取Token
func BenchmarkGetAccessToken(b *testing.B) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)

	tm := NewTokenManager(manager, &TokenManagerConfig{
		AutoRefresh: false, // 禁用自动刷新以测试纯读性能
	})
	tm.SetTokens("token", "refresh", 3600)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = tm.GetAccessToken()
	}
}

// BenchmarkConcurrentGetAccessToken 性能测试：并发获取Token
func BenchmarkConcurrentGetAccessToken(b *testing.B) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManager(credentials, nil)

	tm := NewTokenManager(manager, &TokenManagerConfig{
		AutoRefresh: false,
	})
	tm.SetTokens("token", "refresh", 3600)

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			_, _ = tm.GetAccessToken()
		}
	})
}
