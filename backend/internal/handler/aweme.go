package handler

import (
	"log"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// AwemeHandler 随心推Handler
type AwemeHandler struct {
	service *service.QianchuanService
}

// NewAwemeHandler 创建随心推Handler
func NewAwemeHandler(service *service.QianchuanService) *AwemeHandler {
	return &AwemeHandler{service: service}
}

// GetOrderList 获取随心推订单列表
func (h *AwemeHandler) GetOrderList(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证参数
	advertiserIDStr := c.Query("advertiser_id")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	advertiserId, err := strconv.ParseInt(advertiserIDStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "advertiser_id格式错误")
		return
	}
	if err := util.ValidateID(advertiserId, "advertiser_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	page, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil {
		page = 1
	}
	pageSize, err := strconv.ParseInt(pageSizeStr, 10, 64)
	if err != nil {
		pageSize = 20
	}
	page, pageSize, err = util.ValidatePaginationInt64(page, pageSize)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	resp, err := h.service.Client.AwemeOrderGet(c.Request.Context(), sdk.AwemeOrderGetReq{
		AdvertiserId: advertiserId,
		Page:         page,
		PageSize:     pageSize,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get aweme order list failed: %v", err)
		util.ServerError(c, "获取随心推订单列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetOrderDetail
func (h *AwemeHandler) GetOrderDetail(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证参数
	advertiserIDStr := c.Query("advertiser_id")
	orderIDStr := c.Query("order_id")

	advertiserId, err := strconv.ParseInt(advertiserIDStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "advertiser_id格式错误")
		return
	}
	if err := util.ValidateID(advertiserId, "advertiser_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	orderId, err := strconv.ParseInt(orderIDStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "order_id格式错误")
		return
	}
	if err := util.ValidateID(orderId, "order_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	resp, err := h.service.Client.AwemeOrderDetailGet(c.Request.Context(), sdk.AwemeOrderDetailGetReq{
		AdvertiserId: advertiserId,
		OrderId:      orderId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get aweme order detail failed: %v", err)
		util.ServerError(c, "获取随心推订单详情失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// CreateOrder
func (h *AwemeHandler) CreateOrder(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req sdk.AwemeOrderCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AwemeOrderCreate(c.Request.Context(), req)

	if err != nil {
		log.Printf("Create aweme order failed: %v", err)
		util.ServerError(c, "创建随心推订单失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// TerminateOrder
func (h *AwemeHandler) TerminateOrder(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req sdk.AwemeOrderTerminateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AwemeOrderTerminate(c.Request.Context(), req)

	if err != nil {
		log.Printf("Terminate aweme order failed: %v", err)
		util.ServerError(c, "终止随心推订单失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.SuccessWithMessage(c, nil, "订单已终止")
}

// GetVideoList
func (h *AwemeHandler) GetVideoList(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证参数
	advertiserIDStr := c.Query("advertiser_id")
	awemeIdStr := c.Query("aweme_id")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	advertiserId, err := strconv.ParseInt(advertiserIDStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "advertiser_id格式错误")
		return
	}
	if err := util.ValidateID(advertiserId, "advertiser_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	awemeId, err := strconv.ParseInt(awemeIdStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "aweme_id格式错误")
		return
	}

	page, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil {
		page = 1
	}
	pageSize, err := strconv.ParseInt(pageSizeStr, 10, 64)
	if err != nil {
		pageSize = 20
	}
	page, pageSize, err = util.ValidatePaginationInt64(page, pageSize)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	resp, err := h.service.Client.AwemeVideoGet(c.Request.Context(), sdk.AwemeVideoGetReq{
		AdvertiserId: advertiserId,
		AwemeId:      awemeId,
		Page:         page,
		PageSize:     pageSize,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get aweme video list failed: %v", err)
		util.ServerError(c, "获取随心推视频列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// AddBudget 追加随心推订单预算
func (h *AwemeHandler) AddBudget(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req sdk.AwemeOrderBudgetAddReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AwemeOrderBudgetAdd(c.Request.Context(), req)

	if err != nil {
		log.Printf("Add aweme order budget failed: %v", err)
		util.ServerError(c, "追加随心推订单预算失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.SuccessWithMessage(c, nil, "预算追加成功")
}

// GetSuggestBid 获取随心推建议出价
func (h *AwemeHandler) GetSuggestBid(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req sdk.AwemeSuggestBidReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AwemeSuggestBid(c.Request.Context(), req)

	if err != nil {
		log.Printf("Get aweme suggest bid failed: %v", err)
		util.ServerError(c, "获取随心推建议出价失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetEstimate
func (h *AwemeHandler) GetEstimate(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req sdk.AwemeEstimateProfitReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Client.AwemeEstimateProfit(c.Request.Context(), req)

	if err != nil {
		log.Printf("Get aweme estimate profit failed: %v", err)
		util.ServerError(c, "获取随心推预估数据失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetQuota
func (h *AwemeHandler) GetQuota(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证参数
	advertiserIDStr := c.Query("advertiser_id")

	advertiserId, err := strconv.ParseInt(advertiserIDStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "advertiser_id格式错误")
		return
	}
	if err := util.ValidateID(advertiserId, "advertiser_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	resp, err := h.service.Client.AwemeOrderQuotaGet(c.Request.Context(), sdk.AwemeOrderQuotaGetReq{
		AdvertiserId: advertiserId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get aweme order quota failed: %v", err)
		util.ServerError(c, "获取随心推配额失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}
