package middleware

import (
	"log"
	"sync"
	"time"

	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/sync/singleflight"
)

var (
	// 全局刷新锁，防止并发刷新同一个token
	refreshGroup singleflight.Group
	// 刷新失败记录，用于指数退避
	refreshFailures sync.Map
)

// refreshFailureRecord 刷新失败记录
type refreshFailureRecord struct {
	Count      int
	LastFailed time.Time
}

// AutoRefreshToken 自动刷新Token中间件
// 在token即将过期时（提前5分钟）自动刷新
func AutoRefreshToken(qianchuanService *service.QianchuanService) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := sessions.Default(c)
		sessionData := sess.Get("user")

		if sessionData == nil {
			// 未登录，跳过刷新
			c.Next()
			return
		}

		userSession, ok := sessionData.(*session.UserSession)
		if !ok {
			c.Next()
			return
		}

		// 检查是否需要刷新（提前5分钟）
		if !userSession.NeedsRefresh() {
			c.Next()
			return
		}

		// 检查RefreshToken是否已过期
		if userSession.IsRefreshExpired() {
			log.Printf("[AutoRefresh] RefreshToken已过期，需要重新登录 advertiser_id=%d", userSession.AdvertiserID)
			c.Next()
			return
		}

		// 检查是否在退避期内
		if shouldBackoff(userSession.AdvertiserID) {
			log.Printf("[AutoRefresh] 刷新失败过多，进入退避期 advertiser_id=%d", userSession.AdvertiserID)
			c.Next()
			return
		}

		// 使用singleflight防止并发刷新同一个token
		key := userSession.RefreshToken
		_, err, _ := refreshGroup.Do(key, func() (interface{}, error) {
			log.Printf("[AutoRefresh] 开始刷新Token advertiser_id=%d", userSession.AdvertiserID)

			// 调用SDK刷新Token
			refreshResp, err := qianchuanService.RefreshAccessToken(userSession.RefreshToken)

			if err != nil {
				log.Printf("[AutoRefresh] 刷新Token失败: %v advertiser_id=%d", err, userSession.AdvertiserID)
				recordRefreshFailure(userSession.AdvertiserID)
				return nil, err
			}

		// 创建新会话
			newSession := session.NewSessionFromRefreshResponse(
				refreshResp.Data.AccessToken,
				refreshResp.Data.RefreshToken,
				refreshResp.Data.ExpiresIn,
				refreshResp.Data.RefreshTokenExpiresIn,
				userSession.AdvertiserID,
			)

			// 保存新会话
			sess.Set("user", newSession)
			if err := sess.Save(); err != nil {
				log.Printf("[AutoRefresh] 保存会话失败: %v advertiser_id=%d", err, userSession.AdvertiserID)
				recordRefreshFailure(userSession.AdvertiserID)
				return nil, err
			}

			// 更新上下文中的token
			c.Set("userSession", newSession)
			c.Set("accessToken", newSession.AccessToken)

			log.Printf("[AutoRefresh] Token刷新成功 advertiser_id=%d", userSession.AdvertiserID)
			clearRefreshFailure(userSession.AdvertiserID)

			return nil, nil
		})

		if err != nil {
			// 刷新失败，但不中断请求，继续使用旧token
			log.Printf("[AutoRefresh] Token刷新失败，继续使用旧token: %v", err)
		}

		c.Next()
	}
}

// shouldBackoff 检查是否应该进入退避期
// 指数退避策略：第1次失败等待1分钟，第2次2分钟，第3次4分钟，最多8分钟
func shouldBackoff(advertiserId int64) bool {
	value, ok := refreshFailures.Load(advertiserId)
	if !ok {
		return false
	}

	record := value.(*refreshFailureRecord)
	if record.Count == 0 {
		return false
	}

	// 计算退避时间
	backoffMinutes := 1 << (record.Count - 1) // 2^(n-1)
	if backoffMinutes > 8 {
		backoffMinutes = 8
	}
	backoffDuration := time.Duration(backoffMinutes) * time.Minute

	// 检查是否还在退避期内
	return time.Since(record.LastFailed) < backoffDuration
}

// recordRefreshFailure 记录刷新失败
func recordRefreshFailure(advertiserId int64) {
	value, _ := refreshFailures.LoadOrStore(advertiserId, &refreshFailureRecord{})
	record := value.(*refreshFailureRecord)
	record.Count++
	record.LastFailed = time.Now()
}

// clearRefreshFailure 清除刷新失败记录
func clearRefreshFailure(advertiserId int64) {
	refreshFailures.Delete(advertiserId)
}
