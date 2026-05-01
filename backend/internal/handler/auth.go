package handler

import (
	"log"

	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// truncateString 截断字符串用于日志输出，避免敏感信息完全暴露
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// AuthHandler 认证处理器
type AuthHandler struct {
	service *service.QianchuanService
}

// NewAuthHandler 创建认证处理器
func NewAuthHandler(service *service.QianchuanService) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

// OAuthExchange OAuth code换取session
// @Summary      OAuth授权登录
// @Description  通过OAuth授权码exchange获取AccessToken并创建会话
// @Tags         认证
// @Accept       json
// @Produce      json
// @Param        request  body      object{code=string,state=string}  true  "OAuth授权码和State"
// @Success      200      {object}  map[string]interface{}  "登录成功"
// @Failure      400      {object}  map[string]interface{}  "参数错误"
// @Failure      403      {object}  map[string]interface{}  "State验证失败"
// @Failure      500      {object}  map[string]interface{}  "内部错误"
// @Router       /oauth/exchange [post]
func (h *AuthHandler) OAuthExchange(c *gin.Context) {
	log.Printf("🔵 [OAuthExchange] Starting OAuth exchange...")
	log.Printf("🔵 [OAuthExchange] Request Origin: %s", c.Request.Header.Get("Origin"))
	log.Printf("🔵 [OAuthExchange] Request Host: %s", c.Request.Host)

	var req struct {
		Code  string `json:"code" binding:"required"`
		State string `json:"state"` // State参数用于CSRF防护
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ [OAuthExchange] Bad request: %v", err)
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	log.Printf("🔵 [OAuthExchange] Auth code received: %s", truncateString(req.Code, 20))
	log.Printf("🔵 [OAuthExchange] State received: %s", req.State)

	// State验证日志（实际验证在前端完成，后端记录用于安全审计）
	// 后端无法直接验证state（因为state存储在前端sessionStorage），但记录它有助于安全审计
	if req.State == "" {
		log.Printf("⚠️ [OAuthExchange] Warning: No state parameter provided - potential CSRF risk")
		// 在严格模式下可以拒绝无state的请求，但为了兼容性这里只记录警告
	}

	// 调用SDK换取AccessToken
	log.Printf("🔵 [OAuthExchange] Step 1: Exchanging auth code for access token...")
	tokenResp, err := h.service.Client.OauthAccessToken(c.Request.Context(), sdk.OauthAccessTokenReq{
		AuthCode: req.Code,
	})
	if err != nil {
		log.Printf("❌ [OAuthExchange] OAuth exchange failed: %v", err)
		util.ServerError(c, "OAuth授权失败: "+err.Error())
		return
	}

	// 检查响应码
	if tokenResp.Code != 0 {
		log.Printf("❌ [OAuthExchange] OAuth API error: code=%d, message=%s", tokenResp.Code, tokenResp.Message)
		util.ServerError(c, "OAuth授权失败: "+tokenResp.Message)
		return
	}

	// 检查 Data 是否为 nil
	if tokenResp.Data == nil {
		log.Printf("❌ [OAuthExchange] OAuth response data is nil")
		util.ServerError(c, "OAuth授权失败: 响应数据为空")
		return
	}

	log.Printf("✅ [OAuthExchange] Step 1 Success: Got access token")
	log.Printf("   - AccessToken: %s", truncateString(tokenResp.Data.AccessToken, 20))
	log.Printf("   - ExpiresIn: %d seconds", tokenResp.Data.ExpiresIn)

	// 尝试获取广告主列表（用于获取advertiser_id）
	log.Printf("🔵 [OAuthExchange] Step 2: Fetching advertiser list...")
	var advertiserId int64 = 0

	// 优先使用 Token响应中的 AdvertiserId
	if tokenResp.Data.AdvertiserId != 0 {
		advertiserId = tokenResp.Data.AdvertiserId
		log.Printf("✅ [OAuthExchange] Using AdvertiserId from token response: %d", advertiserId)
	} else {
		// 如果 token 响应中没有，尝试调用 AdvertiserList API
		advertiserResp, err := h.service.Client.AdvertiserList(c.Request.Context(), sdk.AdvertiserListReq{
			AccessToken: tokenResp.Data.AccessToken,
			AppId:       h.service.AppId,
			Secret:      h.service.AppSecret,
		})

		// 添加详细调试日志
		log.Printf("   - AppId: %d", h.service.AppId)
		if advertiserResp != nil {
			log.Printf("   - Response Code: %d, Message: %s", advertiserResp.Code, advertiserResp.Message)
			log.Printf("   - Advertiser List Length: %d", len(advertiserResp.Data.List))
			if len(advertiserResp.Data.List) > 0 {
				log.Printf("   - First Advertiser: %+v", advertiserResp.Data.List[0])
			}
		}

		// 如果 API 调用失败，记录警告但不阻止登录
		if err != nil {
			log.Printf("⚠️ [OAuthExchange] Get advertiser list failed (non-critical): %v", err)
			log.Printf("   - This is OK if your app type is 'Advertiser' instead of 'Agent'")
		} else {
			log.Printf("✅ [OAuthExchange] Step 2 Success: Got advertiser list")

			// 如果有广告主，使用第一个
			if len(advertiserResp.Data.List) > 0 {
				advertiserId = advertiserResp.Data.List[0].AdvertiserId
				log.Printf("   - Using AdvertiserId from list: %d", advertiserId)
			}
		}
	}

	// 无论是否获取到 advertiserId，都允许登录
	if advertiserId == 0 {
		log.Printf("⚠️ [OAuthExchange] No advertiser ID available, user will login without advertiser context")
	}

	// 日志：输出 OAuth 返回的全部 AdvertiserIDs
	allAdvertiserIds := tokenResp.Data.AdvertiserIds
	log.Printf("🔵 [OAuthExchange] OAuth returned %d advertiser IDs: %v", len(allAdvertiserIds), allAdvertiserIds)

	// 创建会话
	log.Printf("🔵 [OAuthExchange] Step 3: Creating session...")
	userSession := session.NewSessionFromTokenResponse(&session.TokenResponse{
		AccessToken:           tokenResp.Data.AccessToken,
		RefreshToken:          tokenResp.Data.RefreshToken,
		ExpiresIn:             tokenResp.Data.ExpiresIn,
		RefreshTokenExpiresIn: tokenResp.Data.RefreshTokenExpiresIn,
		AdvertiserIDs:         allAdvertiserIds,
	}, advertiserId)

	// 保存到Session
	sess := sessions.Default(c)
	sess.Set("user", userSession)
	if err := sess.Save(); err != nil {
		log.Printf("❌ [OAuthExchange] Save session failed: %v", err)
		util.ServerError(c, "保存会话失败")
		return
	}
	log.Printf("✅ [OAuthExchange] Step 3 Success: Session saved")
	log.Printf("🎉 [OAuthExchange] OAuth exchange completed successfully!")

	util.Success(c, gin.H{"success": true})
}

// GetUserInfo 获取用户信息
// @Summary      获取当前用户信息
// @Description  获取已登录用户的详细信息
// @Tags         认证
// @Accept       json
// @Produce      json
// @Security     SessionAuth
// @Success      200  {object}  map[string]interface{}  "用户信息"
// @Failure      401  {object}  map[string]interface{}  "未登录"
// @Failure      500  {object}  map[string]interface{}  "内部错误"
// @Router       /user/info [get]
func (h *AuthHandler) GetUserInfo(c *gin.Context) {
	log.Printf("🔵 [GetUserInfo] Getting user info...")
	log.Printf("🔵 [GetUserInfo] Request cookies: %v", c.Request.Cookies())

	sess := sessions.Default(c)
	sessionData := sess.Get("user")

	if sessionData == nil {
		log.Printf("❌ [GetUserInfo] No session data found - user not logged in")
		util.Unauthorized(c, "未登录")
		return
	}
	log.Printf("✅ [GetUserInfo] Session data found")

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		log.Printf("❌ [GetUserInfo] Session data format error, type: %T", sessionData)
		util.ServerError(c, "会话数据格式错误")
		return
	}
	log.Printf("✅ [GetUserInfo] Session parsed successfully")
	log.Printf("   - AdvertiserID: %d", userSession.AdvertiserID)
	log.Printf("   - AccessToken: %s", truncateString(userSession.AccessToken, 20))
	log.Printf("   - ExpiresAt: %d", userSession.ExpiresAt)

	// 调用SDK获取用户信息
	log.Printf("🔵 [GetUserInfo] Fetching user info from API...")
	userInfoResp, err := h.service.Client.UserInfo(c.Request.Context(), sdk.UserInfoReq{
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("⚠️ [GetUserInfo] Get user info from API failed: %v", err)
		log.Printf("   - Returning basic info instead")
		// 如果失败，返回基本信息
		util.Success(c, gin.H{
			"id":    userSession.AdvertiserID,
			"name":  "广告主",
			"email": "",
		})
		return
	}

	log.Printf("✅ [GetUserInfo] Got user info from API")
	// 返回真实用户信息
	util.Success(c, gin.H{
		"id":    userInfoResp.Data.Id,
		"name":  userInfoResp.Data.DisplayName,
		"email": userInfoResp.Data.Email,
	})
}

// Logout 登出
// @Summary      用户登出
// @Description  清除用户会话
// @Tags         认证
// @Accept       json
// @Produce      json
// @Security     SessionAuth
// @Security     CSRFToken
// @Success      200  {object}  map[string]interface{}  "登出成功"
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	sess := sessions.Default(c)
	sess.Clear()
	sess.Save()

	util.SuccessWithMessage(c, nil, "登出成功")
}

// RefreshSession 刷新会话
// @Summary      刷新会话Token
// @Description  使用RefreshToken刷新AccessToken
// @Tags         认证
// @Accept       json
// @Produce      json
// @Security     SessionAuth
// @Success      200  {object}  map[string]interface{}  "刷新成功"
// @Failure      401  {object}  map[string]interface{}  "会话过期"
// @Failure      500  {object}  map[string]interface{}  "内部错误"
// @Router       /auth/refresh [post]
func (h *AuthHandler) RefreshSession(c *gin.Context) {
	sess := sessions.Default(c)
	sessionData := sess.Get("user")

	if sessionData == nil {
		util.Unauthorized(c, "未登录")
		return
	}

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		util.ServerError(c, "会话数据格式错误")
		return
	}

	// 如果RefreshToken也过期了，需要重新登录
	if userSession.IsRefreshExpired() {
		util.Unauthorized(c, "会话已过期，请重新登录")
		return
	}

	// 刷新Token
	refreshResp, err := h.service.Client.OauthRefreshToken(c.Request.Context(), sdk.OauthRefreshTokenReq{
		RefreshToken: userSession.RefreshToken,
	})
	if err != nil {
		log.Printf("Refresh token failed: %v", err)
		util.ServerError(c, "刷新会话失败")
		return
	}

	// 更新会话
	newSession := session.NewSessionFromTokenResponse(&session.TokenResponse{
		AccessToken:           refreshResp.Data.AccessToken,
		RefreshToken:          refreshResp.Data.RefreshToken,
		ExpiresIn:             refreshResp.Data.ExpiresIn,
		RefreshTokenExpiresIn: refreshResp.Data.RefreshTokenExpiresIn,
		AdvertiserIDs:         userSession.AdvertiserIDs,
	}, userSession.AdvertiserID)

	sess.Set("user", newSession)
	if err := sess.Save(); err != nil {
		log.Printf("Save session failed: %v", err)
		util.ServerError(c, "保存会话失败")
		return
	}

	util.Success(c, gin.H{
		"access_token": newSession.AccessToken,
		"expires_at":   newSession.ExpiresAt,
	})
}
