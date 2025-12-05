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
	filter := sdk.AdListGetFiltering{
		AdName:         req.AdName,
		Status:         req.Status,
		MarketingGoal:  req.MarketingGoal,
		MarketingScene: req.MarketingScene,
		CampaignId:     req.CampaignId,
	}

	// 调用SDK
	resp, err := h.service.Client.AdListGet(c.Request.Context(), sdk.AdListGetReq{
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
// 注意: 此功能需要SDK支持AdRegionUpdate方法
func (h *AdHandler) UpdateRegion(c *gin.Context) {
	util.NotImplemented(c,
		"地域专项更新功能暂未实现，请使用广告计划更新接口",
		"可使用 POST /api/qianchuan/ad/update 接口更新包含地域定向在内的完整广告计划")
}

// UpdateScheduleDate 更新广告计划投放日期
// 注意: 此功能需要SDK支持
func (h *AdHandler) UpdateScheduleDate(c *gin.Context) {
	util.NotImplemented(c,
		"投放日期专项更新功能暂未实现，请使用广告计划更新接口",
		"可使用 POST /api/qianchuan/ad/update 接口更新包含 schedule_start_date 和 schedule_end_date 的完整广告计划")
}

// UpdateScheduleTime 更新广告计划投放时段
// 注意: 此功能需要SDK支持
func (h *AdHandler) UpdateScheduleTime(c *gin.Context) {
	util.NotImplemented(c,
		"投放时段专项更新功能暂未实现，请使用广告计划更新接口",
		"可使用 POST /api/qianchuan/ad/update 接口更新包含 schedule_time 的完整广告计划")
}

// UpdateScheduleFixedRange 更新广告计划固定投放时长
// 注意: 此功能需要SDK支持
func (h *AdHandler) UpdateScheduleFixedRange(c *gin.Context) {
	util.NotImplemented(c,
		"投放时长专项更新功能暂未实现，请使用广告计划更新接口",
		"可使用 POST /api/qianchuan/ad/update 接口更新包含 schedule_type 和 schedule_fixed_range 的完整广告计划")
}

// GetLowQualityAds 获取低效计划列表
func (h *AdHandler) GetLowQualityAds(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// SDK暂不支持此功能，返回空列表
	// TODO: 等待SDK支持或通过其他API实现
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"ad_ids": []int64{},
		},
	})
}

// SuggestBid 建议出价
func (h *AdHandler) SuggestBid(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// SDK暂不支持千川计划建议出价（仅支持随心推）
	// 返回一个合理的默认值范围
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"suggested_bid": 50.0,
			"bid_range": gin.H{
				"min": 30.0,
				"max": 100.0,
			},
			"is_mock_data": true,
			"note":         "⚠️ 测试数据：建议出价基于行业平均水平，实际出价请根据效果调整",
		},
	})
}

// SuggestBudget 建议预算
func (h *AdHandler) SuggestBudget(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// SDK暂不支持千川计划建议预算
	// 返回一个合理的默认值范围
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"suggested_budget": 500.0,
			"budget_range": gin.H{
				"min": 300.0,
				"max": 5000.0,
			},
			"is_mock_data": true,
			"note":         "⚠️ 测试数据：建议预算基于行业平均水平，实际预算请根据投放目标调整",
		},
	})
}

// SuggestRoiGoal 建议ROI目标
func (h *AdHandler) SuggestRoiGoal(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// SDK暂不支持千川计划建议ROI目标
	// 返回一个合理的默认值范围
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"suggested_roi_goal": 2.0,
			"roi_range": gin.H{
				"min": 1.5,
				"max": 5.0,
			},
			"is_mock_data": true,
			"note":         "⚠️ 测试数据：建议ROI目标基于行业平均水平，实际目标请根据商品毛利调整",
		},
	})
}

// EstimateEffect 预估效果
func (h *AdHandler) EstimateEffect(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	var req struct {
		Budget float64 `json:"budget" binding:"required"`
		Bid    float64 `json:"bid" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// SDK暂不支持千川计划效果预估
	// 返回基于预算和出价的简单估算
	estimatedImpressions := int64(req.Budget / req.Bid * 1000)
	estimatedClicks := int64(float64(estimatedImpressions) * 0.05) // 假设5%点击率
	estimatedConversions := int64(float64(estimatedClicks) * 0.1)  // 假设10%转化率

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"estimated_impressions": estimatedImpressions,
			"estimated_clicks":      estimatedClicks,
			"estimated_conversions": estimatedConversions,
			"estimated_cost":        req.Budget,
			"estimated_ctr":         0.05,
			"estimated_cvr":         0.1,
			"is_mock_data":          true,
			"note":                  "⚠️ 测试数据：预估数据仅供参考，实际效果受多种因素影响",
		},
	})
}
