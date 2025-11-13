package handler

import (
	"log"
	"net/http"

	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/CriarBrand/qianchuanSDK"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

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
func (h *AuthHandler) OAuthExchange(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 调用SDK换取AccessToken
	tokenResp, err := h.service.Manager.OauthAccessToken(qianchuanSDK.OauthAccessTokenReq{
		AuthCode: req.Code,
	})
	if err != nil {
		log.Printf("OAuth exchange failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "OAuth授权失败: " + err.Error(),
		})
		return
	}

	// 获取广告主列表（用于获取advertiser_id）
	// 注意：这里简化处理，实际可能需要让用户选择
	advertiserResp, err := h.service.Manager.AdvertiserList(qianchuanSDK.AdvertiserListReq{
		AccessToken: tokenResp.Data.AccessToken,
		AppId:       h.service.Manager.Credentials.AppId,
		Secret:      h.service.Manager.Credentials.AppSecret,
	})
	if err != nil || len(advertiserResp.Data.List) == 0 {
		log.Printf("Get advertiser failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告主信息失败",
		})
		return
	}

	advertiserId := advertiserResp.Data.List[0].AdvertiserId

	// 创建会话
	userSession := session.NewSessionFromTokenResponse(tokenResp, advertiserId)

	// 保存到Session
	sess := sessions.Default(c)
	sess.Set("user", userSession)
	if err := sess.Save(); err != nil {
		log.Printf("Save session failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "保存会话失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "登录成功",
		"data": gin.H{
			"success": true,
		},
	})
}

// GetUserInfo 获取用户信息
func (h *AuthHandler) GetUserInfo(c *gin.Context) {
	sess := sessions.Default(c)
	sessionData := sess.Get("user")

	if sessionData == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "会话数据格式错误",
		})
		return
	}

	// 调用SDK获取用户信息
	userInfoResp, err := h.service.Manager.UserInfo(qianchuanSDK.UserInfoReq{
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get user info failed: %v", err)
		// 如果失败，返回基本信息
		c.JSON(http.StatusOK, gin.H{
			"code":    0,
			"message": "success",
			"data": gin.H{
				"id":    userSession.AdvertiserID,
				"name":  "广告主",
				"email": "",
			},
		})
		return
	}

	// 返回真实用户信息
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"id":    userInfoResp.Data.ID,
			"name":  userInfoResp.Data.DisplayName,
			"email": userInfoResp.Data.Email,
		},
	})
}

// Logout 登出
func (h *AuthHandler) Logout(c *gin.Context) {
	sess := sessions.Default(c)
	sess.Clear()
	sess.Save()

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "登出成功",
	})
}

// RefreshSession 刷新会话
func (h *AuthHandler) RefreshSession(c *gin.Context) {
	sess := sessions.Default(c)
	sessionData := sess.Get("user")

	if sessionData == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "会话数据格式错误",
		})
		return
	}

	// 如果RefreshToken也过期了，需要重新登录
	if userSession.IsRefreshExpired() {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "会话已过期，请重新登录",
		})
		return
	}

	// 刷新Token
	refreshResp, err := h.service.Manager.OauthRefreshToken(qianchuanSDK.OauthRefreshTokenReq{
		RefreshToken: userSession.RefreshToken,
	})
	if err != nil {
		log.Printf("Refresh token failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "刷新会话失败",
		})
		return
	}

	// 更新会话
	newSession := session.NewSessionFromTokenResponse(&qianchuanSDK.OauthAccessTokenRes{
		Data: qianchuanSDK.OauthAccessTokenResData{
			AccessToken:           refreshResp.Data.AccessToken,
			RefreshToken:          refreshResp.Data.RefreshToken,
			ExpiresIn:             refreshResp.Data.ExpiresIn,
			RefreshTokenExpiresIn: refreshResp.Data.RefreshTokenExpiresIn,
		},
	}, userSession.AdvertiserID)

	sess.Set("user", newSession)
	if err := sess.Save(); err != nil {
		log.Printf("Save session failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "保存会话失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "刷新成功",
		"data": gin.H{
			"access_token": newSession.AccessToken,
			"expires_at":   newSession.ExpiresAt,
		},
	})
}
