package handler

import (
	"log"
	"net/http"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuanSDK"
	"github.com/gin-gonic/gin"
)

// ToolsHandler 定向工具处理器
type ToolsHandler struct {
	service *service.QianchuanService
}

// NewToolsHandler 创建定向工具处理器
func NewToolsHandler(service *service.QianchuanService) *ToolsHandler {
	return &ToolsHandler{
		service: service,
	}
}

// GetIndustry 获取行业列表
func (h *ToolsHandler) GetIndustry(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		Level int64  `form:"level"`
		Type  string `form:"type"`
	}

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.service.Manager.ToolsIndustryGet(qianchuanSDK.ToolsIndustryGetReq{
		AccessToken: userSession.AccessToken,
		Level:       req.Level,
		Type:        req.Type,
	})

	if err != nil {
		log.Printf("Get industry list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取行业列表失败: " + err.Error(),
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

// GetInterestCategory 获取兴趣类目
func (h *ToolsHandler) GetInterestCategory(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	resp, err := h.service.Manager.ToolsInterestActionInterestCategory(qianchuanSDK.ToolsInterestActionInterestCategoryReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
	})

	if err != nil {
		log.Printf("Get interest category failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取兴趣类目失败: " + err.Error(),
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

// GetInterestKeyword 获取兴趣关键词
func (h *ToolsHandler) GetInterestKeyword(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		QueryWords string `json:"query_words" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.service.Manager.ToolsInterestActionInterestKeyword(qianchuanSDK.ToolsInterestActionInterestKeywordReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
		QueryWords:   req.QueryWords,
	})

	if err != nil {
		log.Printf("Get interest keyword failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取兴趣关键词失败: " + err.Error(),
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

// GetActionCategory 获取行为类目
func (h *ToolsHandler) GetActionCategory(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		ActionScene []string `json:"action_scene" binding:"required"`
		ActionDays  int64    `json:"action_days" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.service.Manager.ToolsInterestActionActionCategory(qianchuanSDK.ToolsInterestActionActionCategoryReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
		ActionScene:  req.ActionScene,
		ActionDays:   req.ActionDays,
	})

	if err != nil {
		log.Printf("Get action category failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取行为类目失败: " + err.Error(),
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

// GetActionKeyword 获取行为关键词
func (h *ToolsHandler) GetActionKeyword(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		QueryWords  string   `json:"query_words" binding:"required"`
		ActionScene []string `json:"action_scene" binding:"required"`
		ActionDays  int64    `json:"action_days" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.service.Manager.ToolsInterestActionActionKeyword(qianchuanSDK.ToolsInterestActionActionKeywordReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
		QueryWords:   req.QueryWords,
		ActionScene:  req.ActionScene,
		ActionDays:   req.ActionDays,
	})

	if err != nil {
		log.Printf("Get action keyword failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取行为关键词失败: " + err.Error(),
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

// GetAwemeCategory 获取抖音类目列表
func (h *ToolsHandler) GetAwemeCategory(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		Behaviors []string `json:"behaviors"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.service.Manager.ToolsAwemeMultiLevelCategoryGet(qianchuanSDK.ToolsAwemeMultiLevelCategoryGetReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
		Behaviors:    req.Behaviors,
	})

	if err != nil {
		log.Printf("Get aweme category failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取抖音类目失败: " + err.Error(),
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

// GetAwemeAuthorInfo 获取抖音达人信息
func (h *ToolsHandler) GetAwemeAuthorInfo(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		LabelIds  []int64  `json:"label_ids" binding:"required"`
		Behaviors []string `json:"behaviors"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.service.Manager.ToolsAwemeAuthorInfoGet(qianchuanSDK.ToolsAwemeAuthorInfoGetReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
		LabelIds:     req.LabelIds,
		Behaviors:    req.Behaviors,
	})

	if err != nil {
		log.Printf("Get aweme author info failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取抖音达人信息失败: " + err.Error(),
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

// GetCreativeWord 获取动态创意词包
func (h *ToolsHandler) GetCreativeWord(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		CreativeWordIds []string `json:"creative_word_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.service.Manager.ToolsCreativeWordSelect(qianchuanSDK.ToolsCreativeWordSelectReq{
		AccessToken:     userSession.AccessToken,
		AdvertiserId:    userSession.AdvertiserID,
		CreativeWordIds: req.CreativeWordIds,
	})

	if err != nil {
		log.Printf("Get creative word failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取创意词包失败: " + err.Error(),
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

// GetAudienceList 获取人群包列表
func (h *ToolsHandler) GetAudienceList(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		RetargetingTagsType int64 `form:"retargeting_tags_type"`
		Offset              int64 `form:"offset"`
		Limit               int64 `form:"limit"`
	}

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 设置默认值
	if req.Limit == 0 {
		req.Limit = 100
	}

	resp, err := h.service.Manager.DmpAudiencesGet(qianchuanSDK.DmpAudiencesGetReq{
		AccessToken:         userSession.AccessToken,
		AdvertiserId:        userSession.AdvertiserID,
		RetargetingTagsType: req.RetargetingTagsType,
		Offset:              req.Offset,
		Limit:               req.Limit,
	})

	if err != nil {
		log.Printf("Get audience list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取人群包列表失败: " + err.Error(),
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
