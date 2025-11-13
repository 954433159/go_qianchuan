package handler

import (
	"log"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/CriarBrand/qianchuanSDK"
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
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	resp, err := h.service.Manager.AwemeOrderGet(qianchuanSDK.AwemeOrderGetReq{
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
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetOrderDetail 获取随心推订单详情
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
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	resp, err := h.service.Manager.AwemeOrderDetailGet(qianchuanSDK.AwemeOrderDetailGetReq{
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
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// CreateOrder 创建随心推订单
func (h *AwemeHandler) CreateOrder(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req qianchuanSDK.AwemeOrderCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Manager.AwemeOrderCreate(req)

	if err != nil {
		log.Printf("Create aweme order failed: %v", err)
		util.ServerError(c, "创建随心推订单失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// TerminateOrder 终止随心推订单
func (h *AwemeHandler) TerminateOrder(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req qianchuanSDK.AwemeOrderTerminateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Manager.AwemeOrderTerminate(req)

	if err != nil {
		log.Printf("Terminate aweme order failed: %v", err)
		util.ServerError(c, "终止随心推订单失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.SuccessWithMessage(c, nil, "订单已终止")
}

// GetVideoList 获取随心推视频列表
func (h *AwemeHandler) GetVideoList(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证参数
	advertiserIDStr := c.Query("advertiser_id")
	awemeId := c.Query("aweme_id")
	cursorStr := c.DefaultQuery("cursor", "0")
	countStr := c.DefaultQuery("count", "20")

	advertiserId, err := strconv.ParseInt(advertiserIDStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "advertiser_id格式错误")
		return
	}
	if err := util.ValidateID(advertiserId, "advertiser_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	cursor, err := strconv.ParseInt(cursorStr, 10, 64)
	if err != nil {
		cursor = 0
	}
	count, err := strconv.ParseInt(countStr, 10, 64)
	if err != nil {
		count = 20
	}
	_, count, err = util.ValidatePaginationInt64(0, count)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	resp, err := h.service.Manager.AwemeVideoGet(qianchuanSDK.AwemeVideoGetReq{
		AdvertiserId: advertiserId,
		AwemeId:      awemeId,
		Cursor:       cursor,
		Count:        count,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get aweme video list failed: %v", err)
		util.ServerError(c, "获取随心推视频列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
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

	var req qianchuanSDK.AwemeOrderBudgetAddReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Manager.AwemeOrderBudgetAdd(req)

	if err != nil {
		log.Printf("Add aweme order budget failed: %v", err)
		util.ServerError(c, "追加随心推订单预算失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
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

	var req qianchuanSDK.AwemeSuggestBidReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Manager.AwemeSuggestBid(req)

	if err != nil {
		log.Printf("Get aweme suggest bid failed: %v", err)
		util.ServerError(c, "获取随心推建议出价失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetEstimate 获取随心推预估数据
func (h *AwemeHandler) GetEstimate(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req qianchuanSDK.AwemeEstimateProfitReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	req.AccessToken = userSession.AccessToken

	resp, err := h.service.Manager.AwemeEstimateProfit(req)

	if err != nil {
		log.Printf("Get aweme estimate profit failed: %v", err)
		util.ServerError(c, "获取随心推预估数据失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetQuota 获取随心推配额
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

	resp, err := h.service.Manager.AwemeOrderQuotaGet(qianchuanSDK.AwemeOrderQuotaGetReq{
		AdvertiserId: advertiserId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get aweme order quota failed: %v", err)
		util.ServerError(c, "获取随心推配额失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}
