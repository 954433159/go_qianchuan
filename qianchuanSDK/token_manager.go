package qianchuanSDK

import (
	"fmt"
	"sync"
	"time"
)

// TokenManager Token管理器，负责Token的自动刷新和并发安全管理
type TokenManager struct {
	accessToken  string
	refreshToken string
	expiresAt    time.Time
	mu           sync.RWMutex
	manager      *Manager
	
	// 配置项
	autoRefresh      bool          // 是否自动刷新
	refreshThreshold time.Duration // 提前多久刷新（默认5分钟）
}

// TokenManagerConfig Token管理器配置
type TokenManagerConfig struct {
	AutoRefresh      bool          // 是否启用自动刷新
	RefreshThreshold time.Duration // 提前刷新阈值
}

// DefaultTokenManagerConfig 默认配置
var DefaultTokenManagerConfig = TokenManagerConfig{
	AutoRefresh:      true,
	RefreshThreshold: 5 * time.Minute,
}

// NewTokenManager 创建Token管理器
func NewTokenManager(manager *Manager, config *TokenManagerConfig) *TokenManager {
	if config == nil {
		config = &DefaultTokenManagerConfig
	}
	
	return &TokenManager{
		manager:          manager,
		autoRefresh:      config.AutoRefresh,
		refreshThreshold: config.RefreshThreshold,
	}
}

// SetTokens 设置Token（首次获取Token后调用）
func (tm *TokenManager) SetTokens(accessToken, refreshToken string, expiresIn uint64) {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	
	tm.accessToken = accessToken
	tm.refreshToken = refreshToken
	tm.expiresAt = time.Now().Add(time.Duration(expiresIn) * time.Second)
}

// GetAccessToken 获取AccessToken，自动处理过期刷新
func (tm *TokenManager) GetAccessToken() (string, error) {
	tm.mu.RLock()
	
	// 检查是否需要刷新
	needsRefresh := tm.autoRefresh && time.Now().Add(tm.refreshThreshold).After(tm.expiresAt)
	
	if !needsRefresh && time.Now().Before(tm.expiresAt) {
		// Token有效且不需要刷新
		token := tm.accessToken
		tm.mu.RUnlock()
		return token, nil
	}
	
	// 需要刷新Token
	tm.mu.RUnlock()
	return tm.refreshAccessToken()
}

// refreshAccessToken 刷新AccessToken（内部方法）
func (tm *TokenManager) refreshAccessToken() (string, error) {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	
	// 双重检查，避免并发刷新
	if time.Now().Add(tm.refreshThreshold).Before(tm.expiresAt) {
		return tm.accessToken, nil
	}
	
	// 检查是否有refreshToken
	if tm.refreshToken == "" {
		return "", fmt.Errorf("refreshToken为空，无法刷新")
	}
	
	// 调用刷新接口
	res, err := tm.manager.OauthRefreshToken(OauthRefreshTokenReq{
		RefreshToken: tm.refreshToken,
	})
	
	if err != nil {
		return "", fmt.Errorf("刷新Token失败: %w", err)
	}
	
	if res.Code != 0 {
		return "", fmt.Errorf("刷新Token失败: [%d] %s", res.Code, res.Message)
	}
	
	// 更新Token
	tm.accessToken = res.Data.AccessToken
	tm.refreshToken = res.Data.RefreshToken
	tm.expiresAt = time.Now().Add(time.Duration(res.Data.ExpiresIn) * time.Second)
	
	return tm.accessToken, nil
}

// IsExpired 检查Token是否已过期
func (tm *TokenManager) IsExpired() bool {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	
	return time.Now().After(tm.expiresAt)
}

// GetExpiresAt 获取过期时间
func (tm *TokenManager) GetExpiresAt() time.Time {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	
	return tm.expiresAt
}

// GetRemainingTime 获取剩余有效时间
func (tm *TokenManager) GetRemainingTime() time.Duration {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	
	remaining := time.Until(tm.expiresAt)
	if remaining < 0 {
		return 0
	}
	return remaining
}

// Clear 清空Token（登出时调用）
func (tm *TokenManager) Clear() {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	
	tm.accessToken = ""
	tm.refreshToken = ""
	tm.expiresAt = time.Time{}
}

// ForceRefresh 强制刷新Token
func (tm *TokenManager) ForceRefresh() (string, error) {
	tm.mu.Lock()
	// 临时设置过期时间为过去，触发刷新
	tm.expiresAt = time.Now().Add(-1 * time.Hour)
	tm.mu.Unlock()
	
	return tm.refreshAccessToken()
}
