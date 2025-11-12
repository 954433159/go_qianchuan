package session

import (
	"time"

	"github.com/CriarBrand/qianchuanSDK"
)

// UserSession 用户会话信息
// 使用int64存储Unix时间戳以解决cookie序列化问题
type UserSession struct {
	AdvertiserID   int64  `json:"advertiser_id"`
	AccessToken    string `json:"access_token"`
	RefreshToken   string `json:"refresh_token"`
	ExpiresAt      int64  `json:"expires_at"`      // Unix timestamp
	RefreshExpires int64  `json:"refresh_expires"` // Unix timestamp
	CreatedAt      int64  `json:"created_at"`      // Unix timestamp
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

// NewSessionFromTokenResponse 从Token响应创建Session
func NewSessionFromTokenResponse(resp *qianchuanSDK.OauthAccessTokenRes, advertiserId int64) *UserSession {
	now := time.Now()
	return &UserSession{
		AdvertiserID:   advertiserId,
		AccessToken:    resp.Data.AccessToken,
		RefreshToken:   resp.Data.RefreshToken,
		ExpiresAt:      now.Add(time.Duration(resp.Data.ExpiresIn) * time.Second).Unix(),
		RefreshExpires: now.Add(time.Duration(resp.Data.RefreshTokenExpiresIn) * time.Second).Unix(),
		CreatedAt:      now.Unix(),
	}
}
