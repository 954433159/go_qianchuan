package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuanSDK"
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

	// 构建过滤条件
	filter := qianchuanSDK.AdListGetFiltering{
		AdName:         req.AdName,
		Status:         req.Status,
		MarketingGoal:  req.MarketingGoal,
		MarketingScene: req.MarketingScene,
		CampaignId:     req.CampaignId,
	}

	// 调用SDK
	resp, err := h.service.Manager.AdListGet(qianchuanSDK.AdListGetReq{
		AdvertiserId:     userSession.AdvertiserID,
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
	resp, err := h.service.Manager.AdDetailGet(qianchuanSDK.AdDetailGetReq{
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
	var reqBody qianchuanSDK.AdCreateBody
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
	resp, err := h.service.Manager.AdCreate(qianchuanSDK.AdCreateReq{
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
	var reqBody qianchuanSDK.AdUpdateBody
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
	resp, err := h.service.Manager.AdUpdate(qianchuanSDK.AdUpdateReq{
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
	var reqBody qianchuanSDK.AdStatusUpdateBody
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
	resp, err := h.service.Manager.AdStatusUpdate(qianchuanSDK.AdStatusUpdateReq{
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
	var reqBody qianchuanSDK.AdBudgetUpdateBody
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
	resp, err := h.service.Manager.AdBudgetUpdate(qianchuanSDK.AdBudgetUpdateReq{
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
	var reqBody qianchuanSDK.AdBidUpdateBody
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
	resp, err := h.service.Manager.AdBidUpdate(qianchuanSDK.AdBidUpdateReq{
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
// 注意: 此功能需要SDK支持AdRegionUpdate方法
func (h *AdHandler) UpdateRegion(c *gin.Context) {
	// 从middleware获取Session
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// SDK暂不支持地域专项更新
	// 需要使用AdUpdate更新完整广告计划或等待SDK更新
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "地域专项更新功能暂未实现，请使用广告计划更新接口",
		"hint":    "可使用 /qianchuan/ad/update 接口更新包含地域定向在内的完整广告计划",
	})
}

// UpdateScheduleDate 更新广告计划投放日期
// 注意: 此功能需要SDK支持
func (h *AdHandler) UpdateScheduleDate(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "投放日期专项更新功能暂未实现，请使用广告计划更新接口",
		"hint":    "可使用 /qianchuan/ad/update 接口更新完整广告计划",
	})
}

// UpdateScheduleTime 更新广告计划投放时段  
// 注意: 此功能需要SDK支持
func (h *AdHandler) UpdateScheduleTime(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "投放时段专项更新功能暂未实现，请使用广告计划更新接口",
		"hint":    "可使用 /qianchuan/ad/update 接口更新完整广告计划",
	})
}

// UpdateScheduleFixedRange 更新广告计划固定投放时长
// 注意: 此功能需要SDK支持
func (h *AdHandler) UpdateScheduleFixedRange(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "投放时长专项更新功能暂未实现，请使用广告计划更新接口",
		"hint":    "可使用 /qianchuan/ad/update 接口更新完整广告计划",
	})
}
