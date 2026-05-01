package handler

import (
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
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
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	// 第一步：获取 OAuth 授权的账户列表
	oauthList, _ := h.service.Client.AdvertiserList(c.Request.Context(), sdk.AdvertiserListReq{
		AccessToken: userSession.AccessToken,
		AppId:       h.service.AppId,
		Secret:      h.service.AppSecret,
	})

	seen := make(map[int64]bool)
	list := make([]gin.H, 0, 20)

	// 先添加 OAuth 账户（管理层）
	if oauthList != nil && oauthList.Code == 0 {
		for _, item := range oauthList.Data.List {
			if item.AdvertiserId == 0 || seen[item.AdvertiserId] {
				continue
			}
			seen[item.AdvertiserId] = true
			list = append(list, gin.H{
				"id":           item.AdvertiserId,
				"name":         item.AdvertiserName,
				"is_valid":     item.IsValid,
				"account_role": item.AccountRole,
			})
		}
	}

	// 第二步：批量查询代理商标下的投放账户详情
	if len(getManagedAdvertiserIDs()) > 0 {
		infoResp, err := h.service.Client.AdvertiserInfo(c.Request.Context(), sdk.AdvertiserInfoReq{
			AccessToken:   userSession.AccessToken,
			AdvertiserIds: getManagedAdvertiserIDs(),
		})
		if err == nil && infoResp != nil && infoResp.Code == 0 {
			for _, info := range infoResp.Data {
				if info.AdvertiserId == 0 || seen[info.AdvertiserId] {
					continue
				}
				seen[info.AdvertiserId] = true
				list = append(list, gin.H{
					"id":                  info.AdvertiserId,
					"name":                info.AdvertiserName,
					"company":             info.Company,
					"first_industry_name":  info.FirstIndustryName,
					"second_industry_name": info.SecondIndustryName,
					"is_valid":            true,
					"account_role":        "ADVERTISER",
				})
			}
		}
	}

	// 补充 OAuth 账户的公司信息
	if oauthList != nil && oauthList.Code == 0 {
		oauthIDs := make([]int64, 0)
		for _, item := range oauthList.Data.List {
			if item.AdvertiserId > 0 {
				oauthIDs = append(oauthIDs, item.AdvertiserId)
			}
		}
		if len(oauthIDs) > 0 {
			infoResp, _ := h.service.Client.AdvertiserInfo(c.Request.Context(), sdk.AdvertiserInfoReq{
				AccessToken:   userSession.AccessToken,
				AdvertiserIds: oauthIDs,
			})
			if infoResp != nil && infoResp.Code == 0 {
				detailMap := make(map[int64]sdk.AdvertiserInfoResData)
				for _, info := range infoResp.Data {
					detailMap[info.AdvertiserId] = info
				}
				for _, item := range list {
					if detail, ok := detailMap[item["id"].(int64)]; ok {
						if item["company"] == nil || item["company"] == "" {
							item["company"] = detail.Company
						}
					}
				}
			}
		}
	}

	util.Success(c, gin.H{"list": list})
}

// Info 获取广告主详情
func (h *AdvertiserHandler) Info(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserId, _ := strconv.ParseInt(c.Query("advertiser_id"), 10, 64)

	if advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	resp, err := h.service.Client.AdvertiserInfo(c.Request.Context(), sdk.AdvertiserInfoReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserIds: []int64{advertiserId},
		Fields:        []string{"id", "name", "company", "first_industry_name", "second_industry_name"},
	})

	if err != nil {
		log.Printf("Get advertiser info failed: %v", err)
		util.ServerError(c, "获取广告主详情失败: "+err.Error())
		return
	}

	var data interface{}
	if len(resp.Data) > 0 {
		data = resp.Data[0]
	} else {
		data = nil
	}

	util.Success(c, data)
}

// Update 更新广告主信息（当前为占位实现）
//
// 注意：
// - 千川 OpenAPI 当前不提供直接更新广告主基础信息/状态的接口
// - 为保持 API 契约一致性，本端点返回 501，并给出替代建议
// - 前端应根据 501 和 hint 字段展示 "功能暂未实现" 提示
func (h *AdvertiserHandler) Update(c *gin.Context) {
	var req struct {
		AdvertiserId int64   `json:"advertiser_id" binding:"required"`
		Status       *string `json:"status"`        // 期望状态: ENABLE/DISABLE（目前仅用于语义提示）
		Name         *string `json:"name"`          // 预留字段：广告主名称
		Company      *string `json:"company"`       // 预留字段：公司名称
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	log.Printf("Update advertiser placeholder: advertiser_id=%d, status=%v, name=%v, company=%v",
		req.AdvertiserId, req.Status, req.Name, req.Company)

	// 目前千川/巨量开放平台不支持通过开放API直接更新广告主基础信息或启停状态，
	// 因此这里统一返回 501，并在 hint 中给出替代方案说明。
	util.NotImplemented(
		c,
		"广告主更新功能暂未实现",
		"当前千川开放平台暂不支持通过API更新广告主信息或启停状态，请在千川后台修改账户，或通过调整账户/计划预算控制投放。",
	)
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

	// 调用 Service（底层若不支持会返回501）
	resp, err := h.service.GetAdvertiserBudget(c.Request.Context(), userSession.AccessToken, advertiserId)
	if err != nil {
		util.ServerError(c, "获取账户预算失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, "账户预算查询功能暂未实现", "SDK 正在对接千川账户预算API，请稍后使用。建议通过广告组/计划预算管理")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("获取账户预算失败[%d]: %s", resp.Code, resp.Message))
		return
	}
	// 返回数据给前端（字段名保持一致）
	util.Success(c, gin.H{
		"advertiser_id": advertiserId,
		"budget":        resp.Data.Budget,
		"budget_mode":   resp.Data.BudgetMode,
	})
}

// UpdateBudget 更新账户日预算
// POST /qianchuan/advertiser/budget/update
func (h *AdvertiserHandler) UpdateBudget(c *gin.Context) {
	var req struct {
		AdvertiserId int64  `json:"advertiser_id" binding:"required"`
		Budget       int64  `json:"budget" binding:"required"`
		BudgetMode   string `json:"budget_mode" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	log.Printf("Update account budget: advertiser_id=%d, budget=%d, mode=%s",
		req.AdvertiserId, req.Budget, req.BudgetMode)

	// 调用 Service（底层若不支持会返回501）
	userSession, _ := middleware.GetUserSession(c)
	resp, err := h.service.UpdateAdvertiserBudget(c.Request.Context(), userSession.AccessToken, req.AdvertiserId, req.Budget)
	if err != nil {
		util.ServerError(c, "更新账户预算失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, "账户预算更新功能暂未实现", "SDK 正在对接千川账户预算API，请稍后使用。建议通过广告组/计划预算管理")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("更新账户预算失败[%d]: %s", resp.Code, resp.Message))
		return
	}
	util.Success(c, gin.H{"message":"更新成功"})
}

// GetAuthorizedAwemeList 获取千川账户下已授权抖音号
// GET /qianchuan/advertiser/aweme/authorized
func (h *AdvertiserHandler) GetAuthorizedAwemeList(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	advertiserId, err := strconv.ParseInt(advertiserIdStr, 10, 64)
	if err != nil || advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	page, _ := strconv.ParseInt(pageStr, 10, 64)
	pageSize, _ := strconv.ParseInt(pageSizeStr, 10, 64)

	log.Printf("Get authorized aweme list: advertiser_id=%d, page=%d, page_size=%d",
		advertiserId, page, pageSize)

	// 调用 SDK AwemeAuthorizedGet
	resp, err := h.service.Client.AwemeAuthorizedGet(c.Request.Context(), sdk.AwemeAuthorizedGetReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: advertiserId,
		Page:         page,
		PageSize:     pageSize,
	})

	if err != nil {
		log.Printf("Get authorized aweme list failed: %v", err)
		util.ServerError(c, "获取授权抖音号列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
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
	util.NotImplemented(c, "抖音号授权列表查询功能暂未实现", "SDK 正在对接千川授权管理API，请稍后使用")
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
		util.BadRequest(c, "shop_id 必须为数字")
		return
	}

	page, _ := strconv.ParseUint(pageStr, 10, 64)
	pageSize, _ := strconv.ParseUint(pageSizeStr, 10, 64)

	log.Printf("Get shop advertiser list: shop_id=%d, page=%d, page_size=%d",
		shopId, page, pageSize)

	resp, err := h.service.Client.ShopAdvertiserList(c.Request.Context(), sdk.ShopAdvertiserListReq{
		ShopId:      shopId,
		Page:        int64(page),
		PageSize:    int64(pageSize),
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get shop advertiser list failed: %v", err)
		util.ServerError(c, "获取店铺广告账户列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
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
		util.BadRequest(c, "agent_id 必须为数字")
		return
	}

	page, _ := strconv.ParseUint(pageStr, 10, 64)
	pageSize, _ := strconv.ParseUint(pageSizeStr, 10, 64)

	log.Printf("Get agent advertiser list: agent_id=%d, page=%d, page_size=%d",
		agentId, page, pageSize)

	resp, err := h.service.Client.AgentAdvertiserList(c.Request.Context(), sdk.AgentAdvertiserListReq{
		AdvertiserId: agentId,
		Page:         int64(page),
		PageSize:     int64(pageSize),
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get agent advertiser list failed: %v", err)
		util.ServerError(c, "获取代理商广告账户列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// LookupBatch 批量查询广告主信息
func (h *AdvertiserHandler) LookupBatch(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}
	idsStr := c.Query("ids")
	if idsStr == "" {
		util.BadRequest(c, "请提供ID列表，格式: ids=1,2,3")
		return
	}
	parts := strings.Split(idsStr, ",")
	ids := make([]int64, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if id, err := strconv.ParseInt(p, 10, 64); err == nil && id > 0 {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		util.BadRequest(c, "未找到有效的广告主ID")
		return
	}
	resp, err := h.service.Client.AdvertiserInfo(c.Request.Context(), sdk.AdvertiserInfoReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserIds: ids,
	})
	if err != nil {
		util.ServerError(c, "批量查询失败: "+err.Error())
		return
	}
	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}
	util.Success(c, resp.Data)
}
