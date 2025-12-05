package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/gin-gonic/gin"
)

// CreativeHandler 创意处理器
type CreativeHandler struct {
	service *service.QianchuanService
}

// NewCreativeHandler 创建创意处理器
func NewCreativeHandler(service *service.QianchuanService) *CreativeHandler {
	return &CreativeHandler{
		service: service,
	}
}

// List 获取创意列表
func (h *CreativeHandler) List(c *gin.Context) {
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
		Page         int64   `form:"page"`
		PageSize     int64   `form:"page_size"`
		CreativeIds  []int64 `form:"creative_ids"`
		AdIds        []int64 `form:"ad_ids"`
		MaterialMode string  `form:"creative_material_mode"`
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

	// 构建过滤条件
	filter := &sdk.CreativeGetReqFiltering{
		AdIds:                req.AdIds,
		CreativeMaterialMode: req.MaterialMode,
		MarketingGoal:        "LIVE_PROM_GOODS",
	}

	// 调用SDK
	resp, err := h.service.Client.CreativeGet(c.Request.Context(), sdk.CreativeGetReq{
		AdvertiserId: userSession.AdvertiserID,
		Page:         req.Page,
		PageSize:     req.PageSize,
		Filtering:    filter,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get creative list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取创意列表失败: " + err.Error(),
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

// Get 获取创意详情
func (h *CreativeHandler) Get(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 获取创意ID
	creativeIdStr := c.Query("creative_id")
	if creativeIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "缺少创意ID",
		})
		return
	}

	creativeId, err := strconv.ParseInt(creativeIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "创意ID格式错误",
		})
		return
	}

	// 调用SDK（通过列表接口获取单个创意）
	resp, err := h.service.Client.CreativeGet(c.Request.Context(), sdk.CreativeGetReq{
		AdvertiserId: userSession.AdvertiserID,
		Filtering: &sdk.CreativeGetReqFiltering{
			CreativeId:    creativeId,
			MarketingGoal: "LIVE_PROM_GOODS",
		},
		Page:        1,
		PageSize:    1,
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get creative detail failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取创意详情失败: " + err.Error(),
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

	if len(resp.Data.List) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "创意不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data.List[0],
	})
}

// Create 创建创意
// 注意: SDK暂不支持直接创建创意，创意需要在广告创建时一并指定
// 此接口返回501 Not Implemented
func (h *CreativeHandler) Create(c *gin.Context) {
	// 从middleware获取Session
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// SDK暂不支持独立创建创意
	// 创意需要通过广告创建接口 (AdCreate) 创建
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "创意创建功能暂未实现，请通过广告创建接口关联创意",
		"data":    nil,
	})
}

// RejectReason 获取创意审核拒绝原因
func (h *CreativeHandler) RejectReason(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 获取创意ID列表
	var req struct {
		CreativeIds []int64 `json:"creative_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 调用SDK
	resp, err := h.service.Client.CreativeRejectReason(c.Request.Context(), sdk.CreativeRejectReasonReq{
		AdvertiserId: userSession.AdvertiserID,
		CreativeIds:  req.CreativeIds,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get creative reject reason failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取审核拒绝原因失败: " + err.Error(),
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

// UpdateStatus 更新创意状态
// 注意: 此功能需要SDK支持CreativeStatusUpdate方法
func (h *CreativeHandler) UpdateStatus(c *gin.Context) {
	_, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// SDK暂不支持创意状态更新
	// 需要等待SDK更新
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "创意状态更新功能暂未实现，SDK待支持",
		"hint":    "可以先创建新创意或者等待SDK更新",
	})
}
