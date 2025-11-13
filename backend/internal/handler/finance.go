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

// FinanceHandler 财务管理处理器
type FinanceHandler struct {
	service *service.QianchuanService
}

// NewFinanceHandler 创建财务管理处理器
func NewFinanceHandler(service *service.QianchuanService) *FinanceHandler {
	return &FinanceHandler{
		service: service,
	}
}

// GetWallet 获取账户钱包信息
// GET /qianchuan/finance/wallet/get
func (h *FinanceHandler) GetWallet(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	advertiserIdStr := c.Query("advertiser_id")
	advertiserId, err := strconv.ParseInt(advertiserIdStr, 10, 64)
	if err != nil || advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	log.Printf("[%s] Get wallet info: advertiser_id=%d", c.GetString("request_id"), advertiserId)

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.WalletGet(qianchuanSDK.WalletGetReq{
		AdvertiserId: advertiserId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("[%s] Get wallet failed: %v", c.GetString("request_id"), err)
		util.ServerError(c, "获取钱包信息失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data.Wallet)
}

// GetBalance 获取账户余额
// GET /qianchuan/advertiser/balance/get
func (h *FinanceHandler) GetBalance(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	advertiserIdStr := c.Query("advertiser_id")
	advertiserId, err := strconv.ParseInt(advertiserIdStr, 10, 64)
	if err != nil || advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	log.Printf("[%s] Get balance: advertiser_id=%d", c.GetString("request_id"), advertiserId)

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.BalanceGet(qianchuanSDK.BalanceGetReq{
		AdvertiserIds: []int64{advertiserId},
		AccessToken:   userSession.AccessToken,
	})

	if err != nil {
		log.Printf("[%s] Get balance failed: %v", c.GetString("request_id"), err)
		util.ServerError(c, "获取余额失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	// 返回第一个结果
	var data interface{}
	if len(resp.Data.List) > 0 {
		data = resp.Data.List[0]
	} else {
		data = gin.H{"advertiser_id": advertiserId, "balance": 0, "cash": 0, "grant": 0}
	}

	util.Success(c, data)
}

// GetFinanceDetail 获取财务流水
// GET /qianchuan/finance/detail/get
func (h *FinanceHandler) GetFinanceDetail(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	advertiserIdStr := c.Query("advertiser_id")
	advertiserId, err := strconv.ParseInt(advertiserIdStr, 10, 64)
	if err != nil || advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	startTime := c.Query("start_time")
	endTime := c.Query("end_time")
	tradeType := c.Query("trade_type")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	page, _ := strconv.ParseInt(pageStr, 10, 64)
	pageSize, _ := strconv.ParseInt(pageSizeStr, 10, 64)

	// 验证分页参数
	page64, pageSize64, err := util.ValidatePaginationInt64(page, pageSize)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// 验证时间范围（如果提供了时间参数）
	if startTime != "" && endTime != "" {
		startDate, err := util.ParseTime(startTime)
		if err != nil {
			util.BadRequest(c, "开始时间格式错误: "+err.Error())
			return
		}
		endDate, err := util.ParseTime(endTime)
		if err != nil {
			util.BadRequest(c, "结束时间格式错误: "+err.Error())
			return
		}
		// 财务数据最多查询90天
		if err := util.ValidateTimeRange(startDate, endDate, 90); err != nil {
			util.BadRequest(c, err.Error())
			return
		}
	}

	log.Printf("[%s] Get finance detail: advertiser_id=%d, start_time=%s, end_time=%s, page=%d, page_size=%d",
		c.GetString("request_id"), advertiserId, startTime, endTime, page64, pageSize64)

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.DetailGet(qianchuanSDK.DetailGetReq{
		AdvertiserId: advertiserId,
		StartDate:    startTime,
		EndDate:      endTime,
		TradeType:    tradeType,
		Page:         page64,
		PageSize:     pageSize64,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("[%s] Get finance detail failed: %v", c.GetString("request_id"), err)
		util.ServerError(c, "获取财务流水失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// CreateTransferSeq 创建转账交易号（方舟）
// POST /qianchuan/agent/fund/transfer-seq/create
func (h *FinanceHandler) CreateTransferSeq(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req struct {
		AgentId      int64   `json:"agent_id" binding:"required"`
		AdvertiserId int64   `json:"advertiser_id" binding:"required"`
		Amount       float64 `json:"amount" binding:"required"`
		Remark       string  `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	// 参数验证
	if req.Amount <= 0 {
		util.BadRequest(c, "转账金额必须大于0")
		return
	}

	log.Printf("[%s] Create transfer seq: agent_id=%d, advertiser_id=%d, amount=%.2f",
		c.GetString("request_id"), req.AgentId, req.AdvertiserId, req.Amount)

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.FundTransferSeqCreate(qianchuanSDK.FundTransferSeqCreateReq{
		AgentId:        req.AgentId,
		AdvertiserId:   req.AdvertiserId,
		TransferAmount: req.Amount,
		AccessToken:    userSession.AccessToken,
	})

	if err != nil {
		log.Printf("[%s] Create transfer seq failed: %v", c.GetString("request_id"), err)
		util.ServerError(c, "创建转账交易号失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// CommitTransferSeq 提交转账交易号
// POST /qianchuan/agent/fund/transfer-seq/commit
func (h *FinanceHandler) CommitTransferSeq(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req struct {
		AgentId     int64  `json:"agent_id" binding:"required"`
		TransferSeq string `json:"transfer_seq" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	log.Printf("[%s] Commit transfer seq: agent_id=%d, transfer_seq=%s",
		c.GetString("request_id"), req.AgentId, req.TransferSeq)

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.FundTransferSeqCommit(qianchuanSDK.FundTransferSeqCommitReq{
		AgentId:     req.AgentId,
		TransferSeq: req.TransferSeq,
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("[%s] Commit transfer seq failed: %v", c.GetString("request_id"), err)
		util.ServerError(c, "提交转账交易号失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.SuccessWithMessage(c, nil, "转账提交成功")
}

// CreateRefundSeq 创建退款交易号（方舟）
// POST /qianchuan/agent/refund/transfer-seq/create
func (h *FinanceHandler) CreateRefundSeq(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req struct {
		AgentId      int64   `json:"agent_id" binding:"required"`
		AdvertiserId int64   `json:"advertiser_id" binding:"required"`
		Amount       float64 `json:"amount" binding:"required"`
		Remark       string  `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	// 参数验证
	if req.Amount <= 0 {
		util.BadRequest(c, "退款金额必须大于0")
		return
	}

	log.Printf("[%s] Create refund seq: agent_id=%d, advertiser_id=%d, amount=%.2f",
		c.GetString("request_id"), req.AgentId, req.AdvertiserId, req.Amount)

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.RefundTransferSeqCreate(qianchuanSDK.RefundTransferSeqCreateReq{
		AgentId:      req.AgentId,
		AdvertiserId: req.AdvertiserId,
		RefundAmount: req.Amount,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("[%s] Create refund seq failed: %v", c.GetString("request_id"), err)
		util.ServerError(c, "创建退款交易号失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// CommitRefundSeq 提交退款交易号
// POST /qianchuan/agent/refund/transfer-seq/commit
func (h *FinanceHandler) CommitRefundSeq(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	var req struct {
		AgentId   int64  `json:"agent_id" binding:"required"`
		RefundSeq string `json:"refund_seq" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	log.Printf("[%s] Commit refund seq: agent_id=%d, refund_seq=%s",
		c.GetString("request_id"), req.AgentId, req.RefundSeq)

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.RefundTransferSeqCommit(qianchuanSDK.RefundTransferSeqCommitReq{
		AgentId:     req.AgentId,
		RefundSeq:   req.RefundSeq,
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("[%s] Commit refund seq failed: %v", c.GetString("request_id"), err)
		util.ServerError(c, "提交退款交易号失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.SuccessWithMessage(c, nil, "退款提交成功")
}
