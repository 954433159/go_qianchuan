package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// AdHandler 广告计划处理器
type AdHandler struct {
	service *service.QianchuanService
}

// NewAdHandler 创建广告计划处理器
func NewAdHandler(service *service.QianchuanService) *AdHandler {
	return &AdHandler{
		service: service,
	}
}

// List 获取广告计划列表
func (h *AdHandler) List(c *gin.Context) {
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
		Page             int64  `form:"page"`
		PageSize         int64  `form:"page_size"`
		AdvertiserId     int64  `form:"advertiser_id"`
		RequestAwemeInfo int64  `form:"request_aweme_info"`
		AdName           string `form:"ad_name"`
		Status           string `form:"status"`
		MarketingGoal    string `form:"marketing_goal"`
		MarketingScene   string `form:"marketing_scene"`
		CampaignId       int64  `form:"campaign_id"`
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
	if req.MarketingScene == "" {
		req.MarketingScene = "FEED"
	}
	if req.AdvertiserId == 0 {
		req.AdvertiserId = userSession.AdvertiserID
	}

	// 构建过滤条件
	filter := sdk.AdListGetFiltering{
		AdName:         req.AdName,
		Status:         req.Status,
		MarketingGoal:  req.MarketingGoal,
		MarketingScene: req.MarketingScene,
		CampaignId:     req.CampaignId,
	}

	// 调用SDK
	resp, err := h.service.Client.AdListGet(c.Request.Context(), sdk.AdListGetReq{
		AdvertiserId:     req.AdvertiserId,
		RequestAwemeInfo: req.RequestAwemeInfo,
		Page:             req.Page,
		PageSize:         req.PageSize,
		Filtering:        filter,
		AccessToken:      userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get ad list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告计划列表失败: " + err.Error(),
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

// Get 获取广告计划详情
func (h *AdHandler) Get(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 获取广告计划ID
	adIdStr := c.Query("ad_id")
	if adIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "缺少广告计划ID",
		})
		return
	}

	adId, err := strconv.ParseInt(adIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "广告计划ID格式错误",
		})
		return
	}

	// 调用SDK
	resp, err := h.service.Client.AdDetailGet(c.Request.Context(), sdk.AdDetailGetReq{
		AdvertiserId: userSession.AdvertiserID,
		AccessToken:  userSession.AccessToken,
		AdId:         adId,
	})

	if err != nil {
		log.Printf("Get ad detail failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告计划详情失败: " + err.Error(),
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

// Create 创建广告计划
func (h *AdHandler) Create(c *gin.Context) {
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
	var reqBody sdk.AdCreateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 设置广告主ID
	reqBody.AdvertiserId = userSession.AdvertiserID

	// 调用SDK
	resp, err := h.service.Client.AdCreate(c.Request.Context(), sdk.AdCreateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Create ad failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建广告计划失败: " + err.Error(),
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

// Update 更新广告计划
func (h *AdHandler) Update(c *gin.Context) {
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
	var reqBody sdk.AdUpdateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 设置广告主ID
	reqBody.AdvertiserId = userSession.AdvertiserID

	// 调用SDK
	resp, err := h.service.Client.AdUpdate(c.Request.Context(), sdk.AdUpdateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Update ad failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新广告计划失败: " + err.Error(),
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
// UpdateStatus 更新广告计划状态
func (h *AdHandler) UpdateStatus(c *gin.Context) {
	// 从 middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求Body
	var reqBody sdk.AdStatusUpdateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 参数验证
	if len(reqBody.AdIds) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "广告计划ID不能为空",
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
	resp, err := h.service.Client.AdStatusUpdate(c.Request.Context(), sdk.AdStatusUpdateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Update ad status failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新广告计划状态失败: " + err.Error(),
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

// UpdateBudget 更新广告计划预算
func (h *AdHandler) UpdateBudget(c *gin.Context) {
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
	var reqBody sdk.AdBudgetUpdateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 参数验证
	if len(reqBody.Data) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "预算更新数据不能为空",
		})
		return
	}

	// 验证预算值
	for _, item := range reqBody.Data {
		if item.Budget <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "预算必须大于0",
			})
			return
		}
		if item.Budget < 300 {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "预算不能低于300元",
			})
			return
		}
	}

	// 设置广告主ID
	reqBody.AdvertiserId = userSession.AdvertiserID

	// 调用SDK
	resp, err := h.service.Client.AdBudgetUpdate(c.Request.Context(), sdk.AdBudgetUpdateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Update ad budget failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新预算失败: " + err.Error(),
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
		"message": "更新预算成功",
		"data":    resp.Data,
	})
}

// UpdateBid 更新广告计划出价
func (h *AdHandler) UpdateBid(c *gin.Context) {
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
	var reqBody sdk.AdBidUpdateBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 参数验证
	if len(reqBody.Data) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "出价更新数据不能为空",
		})
		return
	}

	// 验证出价值
	for _, item := range reqBody.Data {
		if item.Bid <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "出价必须大于0",
			})
			return
		}
	}

	// 设置广告主ID
	reqBody.AdvertiserId = userSession.AdvertiserID

	// 调用SDK
	resp, err := h.service.Client.AdBidUpdate(c.Request.Context(), sdk.AdBidUpdateReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Update ad bid failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新出价失败: " + err.Error(),
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
		"message": "更新出价成功",
		"data":    resp.Data,
	})
}

// UpdateRegion 更新广告计划地域定向
func (h *AdHandler) UpdateRegion(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdRegionUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdRegionUpdate(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "更新地域定向")
		return
	}
	util.Success(c, resp.Data)
}

// UpdateScheduleDate 更新广告计划投放日期
func (h *AdHandler) UpdateScheduleDate(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdScheduleDateUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdScheduleDateUpdate(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "更新投放日期")
		return
	}
	util.Success(c, resp.Data)
}

// UpdateScheduleTime 更新广告计划投放时段
func (h *AdHandler) UpdateScheduleTime(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdScheduleTimeUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdScheduleTimeUpdate(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "更新投放时段")
		return
	}
	util.Success(c, resp.Data)
}

// UpdateScheduleFixedRange 更新广告计划固定投放时长
func (h *AdHandler) UpdateScheduleFixedRange(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdScheduleFixedRangeUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdScheduleFixedRangeUpdate(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "更新投放时长")
		return
	}
	util.Success(c, resp.Data)
}

// GetLowQualityAds 获取低效计划列表
func (h *AdHandler) GetLowQualityAds(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	resp, err := h.service.Client.AdLqAdGet(c.Request.Context(), sdk.AdLqAdGetReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
	})
	if err != nil {
		util.RespondWithSDKError(c, err, "获取低效计划")
		return
	}
	util.Success(c, resp.Data)
}

// SuggestBid 建议出价
func (h *AdHandler) SuggestBid(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	marketingGoal := c.DefaultQuery("marketing_goal", "LIVE_PROM_GOODS")
	awemeId, _ := strconv.ParseInt(c.Query("aweme_id"), 10, 64)

	resp, err := h.service.Client.AdSuggestBid(c.Request.Context(), sdk.AdSuggestBidReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserId:  userSession.AdvertiserID,
		MarketingGoal: marketingGoal,
		AwemeId:       awemeId,
	})
	if err != nil {
		util.RespondWithSDKError(c, err, "获取建议出价")
		return
	}
	util.Success(c, resp.Data)
}

// SuggestBudget 建议预算
func (h *AdHandler) SuggestBudget(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	awemeId, _ := strconv.ParseInt(c.Query("aweme_id"), 10, 64)

	resp, err := h.service.Client.AdSuggestBudget(c.Request.Context(), sdk.AdSuggestBudgetReq{
		AccessToken:      userSession.AccessToken,
		AdvertiserId:     userSession.AdvertiserID,
		AwemeId:          awemeId,
		LiveScheduleType: "SCHEDULE_FROM_NOW",
	})
	if err != nil {
		util.RespondWithSDKError(c, err, "获取建议预算")
		return
	}
	util.Success(c, resp.Data)
}

// SuggestRoiGoal 建议ROI目标
func (h *AdHandler) SuggestRoiGoal(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	marketingGoal := c.DefaultQuery("marketing_goal", "LIVE_PROM_GOODS")
	awemeId, _ := strconv.ParseInt(c.Query("aweme_id"), 10, 64)

	resp, err := h.service.Client.AdSuggestRoiGoal(c.Request.Context(), sdk.AdSuggestRoiGoalReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserId:  userSession.AdvertiserID,
		MarketingGoal: marketingGoal,
		AwemeId:       awemeId,
	})
	if err != nil {
		util.RespondWithSDKError(c, err, "获取建议ROI目标")
		return
	}
	util.Success(c, resp.Data)
}

// EstimateEffect 预估效果
func (h *AdHandler) EstimateEffect(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdEstimateEffectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdEstimateEffect(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "预估效果")
		return
	}
	util.Success(c, resp.Data)
}

// RejectReason 获取计划审核建议
func (h *AdHandler) RejectReason(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdRejectReasonReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdRejectReason(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "获取审核建议")
		return
	}
	util.Success(c, resp.Data)
}

// GetCompensateStatus 获取计划成本保障状态
func (h *AdHandler) GetCompensateStatus(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdCompensateStatusGetReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdCompensateStatusGet(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "获取成本保障状态")
		return
	}
	util.Success(c, resp.Data)
}

// GetLearningStatus 获取计划学习期状态
func (h *AdHandler) GetLearningStatus(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdLearningStatusGetReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdLearningStatusGet(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "获取学习期状态")
		return
	}
	util.Success(c, resp.Data)
}

// RoiGoalUpdate 更新计划支付ROI目标
func (h *AdHandler) RoiGoalUpdate(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.AdRoiGoalUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AdRoiGoalUpdate(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "更新ROI目标")
		return
	}
	util.Success(c, resp.Data)
}
