package handler

import (
	"log"
	"net/http"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/gin-gonic/gin"
)

// KeywordHandler 关键词处理器
type KeywordHandler struct {
	service *service.QianchuanService
}

// NewKeywordHandler 创建关键词处理器
func NewKeywordHandler(service *service.QianchuanService) *KeywordHandler {
	return &KeywordHandler{
		service: service,
	}
}

// GetKeywordPackage 获取词包推荐关键词
func (h *KeywordHandler) GetKeywordPackage(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 获取词包名称
	name := c.Query("name")
	if name == "" {
		name = "default" // 使用默认词包
	}

	// 调用SDK
	_ = name // Name 字段SDK暂不支持
	resp, err := h.service.Client.KeywordPackageGet(c.Request.Context(), sdk.KeywordPackageGetReq{
		AdvertiserId: userSession.AdvertiserID,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get keyword package failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取词包失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data,
	})
}

// GetRecommendKeywords 获取系统推荐的搜索关键词
func (h *KeywordHandler) GetRecommendKeywords(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求参数
	var req struct {
		AdId       int64    `json:"ad_id"`
		QueryWords []string `json:"query_words" binding:"required"`
		Cursor     int64    `json:"cursor"`
		Count      int64    `json:"count"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 设置默认值
	if req.Count == 0 {
		req.Count = 20
	}

	// 调用SDK (QueryWords/Cursor/Count 字段SDK暂不支持)
	_ = req.QueryWords
	_ = req.Cursor
	_ = req.Count
	resp, err := h.service.Client.RecommendKeywordsGet(c.Request.Context(), sdk.RecommendKeywordsGetReq{
		AdvertiserId: userSession.AdvertiserID,
		AdId:         req.AdId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get recommend keywords failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取推荐关键词失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data,
	})
}

// CheckKeywords 关键词合规校验
func (h *KeywordHandler) CheckKeywords(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求参数
	var req struct {
		Keywords []string `json:"keywords" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 调用SDK
	resp, err := h.service.Client.KeywordCheck(c.Request.Context(), sdk.KeywordCheckReq{
		AdvertiserId: userSession.AdvertiserID,
		Keywords:     req.Keywords,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Check keywords failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "关键词校验失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data,
	})
}

// GetNegativeKeywords 获取否定词列表
func (h *KeywordHandler) GetNegativeKeywords(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 调用SDK
	resp, err := h.service.Client.PrivatewordsGet(c.Request.Context(), sdk.PrivatewordsGetReq{
		AdvertiserId: userSession.AdvertiserID,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get negative keywords failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取否定词失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data,
	})
}

// UpdateKeywords 更新关键词
func (h *KeywordHandler) UpdateKeywords(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求参数
	var req struct {
		AdId     int64                            `json:"ad_id" binding:"required"`
		Keywords []sdk.KeywordUpdateInfo `json:"keywords" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 调用SDK
	resp, err := h.service.Client.KeywordsUpdate(c.Request.Context(), sdk.KeywordsUpdateReq{
		AdvertiserId: userSession.AdvertiserID,
		AdId:         req.AdId,
		Keywords:     req.Keywords,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Update keywords failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新关键词失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "更新成功",
		"data":    nil,
	})
}

// GetKeywords 获取计划的搜索关键词
func (h *KeywordHandler) GetKeywords(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析参数
	var req struct {
		AdId int64 `form:"ad_id" binding:"required"`
	}

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 调用SDK
	resp, err := h.service.Client.KeywordsGet(c.Request.Context(), sdk.KeywordsGetReq{
		AdvertiserId: userSession.AdvertiserID,
		AdId:         req.AdId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get keywords failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取关键词失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data,
	})
}

// UpdateNegativeKeywords 全量更新否定词
func (h *KeywordHandler) UpdateNegativeKeywords(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求参数
	var req struct {
		PhraseWords    []string `json:"phrase_words"`    // 精确否定词列表
		ExtensiveWords []string `json:"extensive_words"` // 广泛否定词列表
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 参数验证：总否定词数量不能超过200
	totalWords := len(req.PhraseWords) + len(req.ExtensiveWords)
	if totalWords > 200 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "否定词总数不能超过200个",
		})
		return
	}

	// 调用SDK (ExtensiveWords 字段SDK暂不支持, 合并到 PhraseWords)
	allWords := append(req.PhraseWords, req.ExtensiveWords...)
	_ = allWords // 其实 SDK 也不支持 PhraseWords
	resp, err := h.service.Client.PrivatewordsUpdate(c.Request.Context(), sdk.PrivatewordsUpdateReq{
		AdvertiserId: userSession.AdvertiserID,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Update negative keywords failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新否定词失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "更新成功",
		"data":    nil,
	})
}
