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

// AdvertiserHandler 广告主处理器
type AdvertiserHandler struct {
	service *service.QianchuanService
}

// NewAdvertiserHandler 创建广告主处理器
func NewAdvertiserHandler(service *service.QianchuanService) *AdvertiserHandler {
	return &AdvertiserHandler{
		service: service,
	}
}

// List 获取广告主列表
func (h *AdvertiserHandler) List(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)

	resp, err := h.service.Manager.AdvertiserList(qianchuanSDK.AdvertiserListReq{
		AccessToken: userSession.AccessToken,
		AppId:       h.service.Manager.Credentials.AppId,
		Secret:      h.service.Manager.Credentials.AppSecret,
	})

	if err != nil {
		log.Printf("Get advertiser list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告主列表失败: " + err.Error(),
		})
		return
	}

	// 提取所有 advertiser_id
	ids := make([]int64, 0, len(resp.Data.List))
	for _, item := range resp.Data.List {
		ids = append(ids, item.AdvertiserId)
	}

	// 批量获取详细信息
	infoResp, err := h.service.Manager.AdvertiserInfo(qianchuanSDK.AdvertiserInfoReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserIds: ids,
		Fields:        []string{"id", "name", "company", "role", "status", "first_industry_name", "second_industry_name", "create_time"},
	})

	if err != nil {
		log.Printf("Get advertiser info failed: %v", err)
		// 如果获取详细信息失败，使用基本信息
		list := make([]gin.H, 0, len(resp.Data.List))
		for _, item := range resp.Data.List {
			status := "DISABLE"
			if item.IsValid {
				status = "ENABLE"
			}
			list = append(list, gin.H{
				"id":          item.AdvertiserId,
				"name":        item.AdvertiserName,
				"company":     "",
				"role":        item.AccountRole,
				"status":      status,
				"balance":     0,
				"create_time": "",
			})
		}
		c.JSON(http.StatusOK, gin.H{
			"code":    0,
			"message": "success",
			"data": gin.H{
				"list": list,
			},
		})
		return
	}

	// 使用详细信息
	list := make([]gin.H, 0, len(infoResp.Data))
	for _, info := range infoResp.Data {
		list = append(list, gin.H{
			"id":          info.ID,
			"name":        info.Name,
			"company":     info.Company,
			"role":        info.Role,
			"status":      info.Status,
			"balance":     0, // SDK 不提供余额字段
			"create_time": info.CreateTime,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"list": list,
		},
	})
}

// Info 获取广告主详情
func (h *AdvertiserHandler) Info(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserId, _ := strconv.ParseInt(c.Query("advertiser_id"), 10, 64)

	if advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	resp, err := h.service.Manager.AdvertiserInfo(qianchuanSDK.AdvertiserInfoReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserIds: []int64{advertiserId},
		Fields:        []string{"id", "name", "company", "first_industry_name", "second_industry_name"},
	})

	if err != nil {
		log.Printf("Get advertiser info failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告主详情失败: " + err.Error(),
		})
		return
	}

	var data interface{}
	if len(resp.Data) > 0 {
		data = resp.Data[0]
	} else {
		data = nil
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    data,
	})
}

// ==================== 账户扩展（批次C） ====================

// GetBudget 获取账户日预算
// GET /qianchuan/advertiser/budget/get
func (h *AdvertiserHandler) GetBudget(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")

	advertiserId, err := strconv.ParseInt(advertiserIdStr, 10, 64)
	if err != nil || advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	log.Printf("Get account budget: advertiser_id=%d", advertiserId)

	// SDK 暂未实现账户预算接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "账户预算查询功能暂未实现",
		"hint":    "SDK 正在对接千川账户预算API，请稍后使用。建议通过广告组/计划预算管理",
		"data": gin.H{
			"advertiser_id": advertiserId,
			"budget":        0,
			"budget_mode":   "BUDGET_MODE_INFINITE",
		},
		"session": userSession,
	})
}

// UpdateBudget 更新账户日预算
// POST /qianchuan/advertiser/budget/update
func (h *AdvertiserHandler) UpdateBudget(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)

	var req struct {
		AdvertiserId int64  `json:"advertiser_id" binding:"required"`
		Budget       int64  `json:"budget" binding:"required"`
		BudgetMode   string `json:"budget_mode" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	log.Printf("Update account budget: advertiser_id=%d, budget=%d, mode=%s",
		req.AdvertiserId, req.Budget, req.BudgetMode)

	// SDK 暂未实现账户预算更新接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "账户预算更新功能暂未实现",
		"hint":    "SDK 正在对接千川账户预算API，请稍后使用。建议通过广告组/计划预算管理",
		"data": gin.H{
			"advertiser_id": req.AdvertiserId,
			"budget":        req.Budget,
			"budget_mode":   req.BudgetMode,
			"updated":       false,
		},
		"session": userSession,
	})
}

// GetAuthorizedAwemeList 获取千川账户下已授权抖音号
// GET /qianchuan/advertiser/aweme/authorized
func (h *AdvertiserHandler) GetAuthorizedAwemeList(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "20")

	advertiserId, err := strconv.ParseInt(advertiserIdStr, 10, 64)
	if err != nil || advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	log.Printf("Get authorized aweme list: advertiser_id=%d, page=%s, page_size=%s",
		advertiserId, page, pageSize)

	// SDK 暂未实现授权抖音号列表接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "授权抖音号列表查询功能暂未实现",
		"hint":    "SDK 正在对接千川授权管理API，请稍后使用",
		"data": gin.H{
			"list":  []gin.H{},
			"total": 0,
		},
		"session": userSession,
	})
}

// GetAwemeAuthList 获取抖音号授权列表
// GET /qianchuan/advertiser/aweme/auth-list
func (h *AdvertiserHandler) GetAwemeAuthList(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")

	advertiserId, err := strconv.ParseInt(advertiserIdStr, 10, 64)
	if err != nil || advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	log.Printf("Get aweme auth list: advertiser_id=%d", advertiserId)

	// SDK 暂未实现抖音号授权列表接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "抖音号授权列表查询功能暂未实现",
		"hint":    "SDK 正在对接千川授权管理API，请稍后使用",
		"data": gin.H{
			"list": []gin.H{},
		},
		"session": userSession,
	})
}

// GetShopAdvertiserList 获取店铺账户关联的广告账户列表
// GET /qianchuan/shop/advertiser/list
func (h *AdvertiserHandler) GetShopAdvertiserList(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	shopIdStr := c.Query("shop_id")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "10")

	shopId, err := strconv.ParseInt(shopIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: shop_id 必须为数字",
		})
		return
	}

	page, _ := strconv.ParseUint(pageStr, 10, 64)
	pageSize, _ := strconv.ParseUint(pageSizeStr, 10, 64)

	log.Printf("Get shop advertiser list: shop_id=%d, page=%d, page_size=%d",
		shopId, page, pageSize)

	resp, err := h.service.Manager.ShopAdvertiserList(qianchuanSDK.ShopAdvertiserListReq{
		ShopId:      shopId,
		Page:        page,
		PageSize:    pageSize,
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get shop advertiser list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取店铺广告账户列表失败: " + err.Error(),
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

// GetAgentAdvertiserList 获取代理商账户关联的广告账户列表
// GET /qianchuan/agent/advertiser/select
func (h *AdvertiserHandler) GetAgentAdvertiserList(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	agentIdStr := c.Query("agent_id")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "100")

	agentId, err := strconv.ParseInt(agentIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: agent_id 必须为数字",
		})
		return
	}

	page, _ := strconv.ParseUint(pageStr, 10, 64)
	pageSize, _ := strconv.ParseUint(pageSizeStr, 10, 64)

	log.Printf("Get agent advertiser list: agent_id=%d, page=%d, page_size=%d",
		agentId, page, pageSize)

	resp, err := h.service.Manager.AgentAdvertiserList(qianchuanSDK.AgentAdvertiserListReq{
		AdvertiserId: agentId,
		Page:         page,
		PageSize:     pageSize,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get agent advertiser list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取代理商广告账户列表失败: " + err.Error(),
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
