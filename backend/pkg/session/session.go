package session

import (
	"time"
)

// UserSession 用户会话信息
// 使用int64存储Unix时间戳以解决cookie序列化问题
type UserSession struct {
	AdvertiserID   int64   `json:"advertiser_id"`
	AdvertiserIDs  []int64 `json:"advertiser_ids"`  // 全部授权广告主ID列表
	AccessToken    string  `json:"access_token"`
	RefreshToken   string  `json:"refresh_token"`
	ExpiresAt      int64   `json:"expires_at"`      // Unix timestamp
	RefreshExpires int64   `json:"refresh_expires"` // Unix timestamp
	CreatedAt      int64   `json:"created_at"`      // Unix timestamp
}

// IsExpired 检查AccessToken是否过期
func (s *UserSession) IsExpired() bool {
	return time.Now().Unix() > s.ExpiresAt
}

// NeedsRefresh 检查是否需要刷新Token（提前5分钟）
func (s *UserSession) NeedsRefresh() bool {
	return time.Now().Add(5*time.Minute).Unix() > s.ExpiresAt
}

// IsRefreshExpired 检查RefreshToken是否过期
func (s *UserSession) IsRefreshExpired() bool {
	return time.Now().Unix() > s.RefreshExpires
}

// NewSessionFromRefreshResponse 从刷新Token响应创建Session
func NewSessionFromRefreshResponse(accessToken, refreshToken string, expiresIn, refreshTokenExpiresIn int64, advertiserId int64, advertiserIds []int64) *UserSession {
	now := time.Now()
	return &UserSession{
		AdvertiserID:   advertiserId,
		AdvertiserIDs:  advertiserIds,
		AccessToken:    accessToken,
		RefreshToken:   refreshToken,
		ExpiresAt:      now.Add(time.Duration(expiresIn) * time.Second).Unix(),
		RefreshExpires: now.Add(time.Duration(refreshTokenExpiresIn) * time.Second).Unix(),
		CreatedAt:      now.Unix(),
	}
}

// TokenResponse 简化的Token响应结构体
type TokenResponse struct {
	AccessToken           string
	RefreshToken          string
	ExpiresIn             int64
	RefreshTokenExpiresIn int64
	AdvertiserIDs         []int64
}

// NewSessionFromTokenResponse 从Token响应创建Session
func NewSessionFromTokenResponse(tokenData *TokenResponse, advertiserId int64) *UserSession {
	now := time.Now()
	return &UserSession{
		AdvertiserID:   advertiserId,
		AdvertiserIDs:  tokenData.AdvertiserIDs,
		AccessToken:    tokenData.AccessToken,
		RefreshToken:   tokenData.RefreshToken,
		ExpiresAt:      now.Add(time.Duration(tokenData.ExpiresIn) * time.Second).Unix(),
		RefreshExpires: now.Add(time.Duration(tokenData.RefreshTokenExpiresIn) * time.Second).Unix(),
		CreatedAt:      now.Unix(),
	}
}
