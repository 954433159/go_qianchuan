package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/gin-gonic/gin"
)

// CampaignHandler 广告组处理器
type CampaignHandler struct {
	service *service.QianchuanService
}

// NewCampaignHandler 创建广告组处理器
func NewCampaignHandler(service *service.QianchuanService) *CampaignHandler {
	return &CampaignHandler{
		service: service,
	}
}

// List 获取广告组列表
func (h *CampaignHandler) List(c *gin.Context) {
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
		Page          int64  `form:"page"`
		PageSize      int64  `form:"page_size"`
		AdvertiserId  int64  `form:"advertiser_id"`
		Name          string `form:"name"`
		MarketingGoal string `form:"marketing_goal"`
		Status        string `form:"status"`
	}

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 设置默认值
	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 10
	}
	if req.AdvertiserId == 0 {
		req.AdvertiserId = userSession.AdvertiserID
	}

	// 构建过滤条件
	filter := sdk.CampaignListGetFilter{
		Name:          req.Name,
		MarketingGoal: req.MarketingGoal,
		Status:        req.Status,
	}

	// 调用SDK
	resp, err := h.service.Client.CampaignListGet(c.Request.Context(), sdk.CampaignListGetReq{
		AdvertiserId: req.AdvertiserId,
		Page:         req.Page,
		PageSize:     req.PageSize,
		Filter:       filter,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get campaign list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告组列表失败: " + err.Error(),
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

// Get 获取广告组详情（优化版：支持分页循环查询）
func (h *CampaignHandler) Get(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 获取campaign_id参数
	campaignIdStr := c.Query("campaign_id")
	if campaignIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "缺少广告组ID",
		})
		return
	}

	// 解析campaign_id
	campaignId, err := strconv.ParseInt(campaignIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "广告组ID格式错误",
		})
		return
	}

	// 使用SDK的filter功能通过ID精确查询
	filter := sdk.CampaignListGetFilter{
		Ids: []int64{campaignId},
	}

	// 调用SDK
	resp, err := h.service.Client.CampaignListGet(c.Request.Context(), sdk.CampaignListGetReq{
		AdvertiserId: userSession.AdvertiserID,
		Page:         1,
		PageSize:     1, // 只需要一条
		Filter:       filter,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get campaign failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告组失败: " + err.Error(),
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

	// 检查是否找到
	if len(resp.Data.List) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "广告组不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data.List[0],
	})
}

// Create 创建广告组
func (h *CampaignHandler) Create(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求Body
	var reqBody sdk.CampaignCreateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 参数验证
	if reqBody.CampaignName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "广告组名称不能为空",
		})
		return
	}
	if reqBody.MarketingGoal == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "营销目标不能为空",
		})
		return
	}

	// 设置广告主ID
	reqBody.AdvertiserId = userSession.AdvertiserID

	// 调用SDK
	resp, err := h.service.Client.CampaignCreate(c.Request.Context(), sdk.CampaignCreateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Create campaign failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建广告组失败: " + err.Error(),
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
		"message": "创建成功",
		"data":    resp.Data,
	})
}

// Update 更新广告组
func (h *CampaignHandler) Update(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求Body
	var reqBody sdk.CampaignUpdateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 参数验证
	if reqBody.CampaignId == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "广告组ID不能为空",
		})
		return
	}

	// 设置广告主ID
	reqBody.AdvertiserId = userSession.AdvertiserID

	// 调用SDK
	resp, err := h.service.Client.CampaignUpdate(c.Request.Context(), sdk.CampaignUpdateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Update campaign failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新广告组失败: " + err.Error(),
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
		"data":    resp.Data,
	})
}

// UpdateStatus 更新广告组状态
func (h *CampaignHandler) UpdateStatus(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求Body
	var reqBody sdk.BatchCampaignStatusUpdateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 参数验证
	if len(reqBody.CampaignIds) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "广告组ID不能为空",
		})
		return
	}
	if reqBody.OptStatus == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "状态不能为空",
		})
		return
	}

	// 设置广告主ID
	reqBody.AdvertiserId = userSession.AdvertiserID

	// 调用SDK
	resp, err := h.service.Client.BatchCampaignStatusUpdate(c.Request.Context(), sdk.BatchCampaignStatusUpdateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Update campaign status failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新广告组状态失败: " + err.Error(),
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
		"message": "更新状态成功",
		"data":    resp.Data,
	})
}
