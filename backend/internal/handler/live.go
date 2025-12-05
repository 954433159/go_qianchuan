package handler

import (
	"log"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// LiveHandler 直播数据处理器
type LiveHandler struct {
	service *service.QianchuanService
}

// NewLiveHandler 创建直播数据处理器
func NewLiveHandler(service *service.QianchuanService) *LiveHandler {
	return &LiveHandler{
		service: service,
	}
}

// GetLiveStats 获取今日直播数据统计
// 支持 GET 和 POST 两种方式
// GET: /qianchuan/report/live/get?date=2023-11-12（可选date参数，默认今天）
// POST: /qianchuan/report/live/get body: {"fields": [...]}
func (h *LiveHandler) GetLiveStats(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析请求参数（支持 GET 和 POST）
	var req struct {
		Fields []string `json:"fields"` // 查询指标列表
	}

	// 根据请求方法决定如何解析参数
	if c.Request.Method == "POST" {
		// POST 请求：从 body 读取 fields
		if err := c.ShouldBindJSON(&req); err != nil {
			// 如果 JSON 解析失败，不报错，使用默认 fields
			log.Printf("Parse JSON fields failed (using defaults): %v", err)
		}
	} else {
		// GET 请求：使用默认 fields，date 参数在此处忽略（SDK 仅支持今日数据）
		date := c.Query("date")
		if date != "" {
			log.Printf("GET request with date=%s (SDK only supports today's data)", date)
		}
	}

	// 默认字段（如果没有指定）
	if len(req.Fields) == 0 {
		req.Fields = []string{
			"live_time", "watch_count", "avg_watch_duration", "new_follower_count",
			"total_user_count", "max_user_count", "comment_count", "share_count",
			"gift_income", "gmv_total", "order_count", "pay_order_count",
			"pay_amount", "product_click_count",
		}
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Client.LiveGet(c.Request.Context(), sdk.LiveGetReq{
		AdvertiserId: userSession.AdvertiserID,
		Fields:       req.Fields,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live stats failed: %v", err)
		util.ServerError(c, "获取今日直播数据失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetLiveRooms 获取今日直播间列表
func (h *LiveHandler) GetLiveRooms(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证分页参数
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	page, _ := strconv.ParseInt(pageStr, 10, 64)
	pageSize, _ := strconv.ParseInt(pageSizeStr, 10, 64)

	var err error
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

	// 调用SDK
	resp, err := h.service.Client.LiveRoomGet(c.Request.Context(), sdk.LiveRoomGetReq{
		AdvertiserId: userSession.AdvertiserID,
		Page:         page,
		PageSize:     pageSize,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live rooms failed: %v", err)
		util.ServerError(c, "获取直播间列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	// 直接返回SDK的数据（List是interface{}类型，不做转换）
	util.Success(c, resp.Data)
}

// GetLiveRoomDetail 获取直播间详情
func (h *LiveHandler) GetLiveRoomDetail(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证room_id参数
	roomIdStr := c.Query("room_id")
	if roomIdStr == "" {
		util.BadRequest(c, "缺少参数: room_id")
		return
	}

	roomId, err := strconv.ParseInt(roomIdStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "room_id格式错误")
		return
	}
	if err := util.ValidateID(roomId, "room_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Client.LiveRoomDetailGet(c.Request.Context(), sdk.LiveRoomDetailGetReq{
		AdvertiserId: userSession.AdvertiserID,
		RoomId:       roomId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live room detail failed: %v", err)
		util.ServerError(c, "获取直播间详情失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetLiveRoomFlowPerformance
func (h *LiveHandler) GetLiveRoomFlowPerformance(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证room_id参数
	roomIdStr := c.Query("room_id")
	if roomIdStr == "" {
		util.BadRequest(c, "缺少参数: room_id")
		return
	}

	roomId, err := strconv.ParseInt(roomIdStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "room_id格式错误")
		return
	}
	if err := util.ValidateID(roomId, "room_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Client.LiveRoomFlowPerformanceGet(c.Request.Context(), sdk.LiveRoomFlowPerformanceGetReq{
		AdvertiserId: userSession.AdvertiserID,
		RoomId:       roomId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live room flow performance failed: %v", err)
		util.ServerError(c, "获取直播间流量表现失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetLiveRoomUserInsight
func (h *LiveHandler) GetLiveRoomUserInsight(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证room_id参数
	roomIdStr := c.Query("room_id")
	if roomIdStr == "" {
		util.BadRequest(c, "缺少参数: room_id")
		return
	}

	roomId, err := strconv.ParseInt(roomIdStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "room_id格式错误")
		return
	}
	if err := util.ValidateID(roomId, "room_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Client.LiveRoomUserGet(c.Request.Context(), sdk.LiveRoomUserGetReq{
		AdvertiserId: userSession.AdvertiserID,
		RoomId:       roomId,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live room user insight failed: %v", err)
		util.ServerError(c, "获取直播间用户洞察失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data)
}

// GetLiveRoomProducts
func (h *LiveHandler) GetLiveRoomProducts(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "未登录")
		return
	}

	// 解析并验证room_id参数
	roomIdStr := c.Query("room_id")
	if roomIdStr == "" {
		util.BadRequest(c, "缺少参数: room_id")
		return
	}

	roomId, err := strconv.ParseInt(roomIdStr, 10, 64)
	if err != nil {
		util.BadRequest(c, "room_id格式错误")
		return
	}
	if err := util.ValidateID(roomId, "room_id"); err != nil {
		util.BadRequest(c, err.Error())
		return
	}

	// 解析并验证分页参数
	cursorStr := c.Query("cursor")
	countStr := c.Query("count")

	var cursor, count int64
	if cursorStr != "" {
		if parsed, err := strconv.ParseInt(cursorStr, 10, 64); err == nil {
			cursor = parsed
		}
	}
	if countStr != "" {
		if parsed, err := strconv.ParseInt(countStr, 10, 64); err == nil {
			count = parsed
		}
	}
	if count == 0 {
		count = 20
	}
	var validErr error
	_, count, validErr = util.ValidatePaginationInt64(0, count)
	if validErr != nil {
		util.BadRequest(c, validErr.Error())
		return
	}

	// SDK未初始化时直接返回500，避免测试panic
	if h.service == nil || h.service.Client == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK (Cursor/Count 字段SDK使用Page/PageSize)
	_ = cursor // 转换举page
	resp, err := h.service.Client.LiveRoomProductListGet(c.Request.Context(), sdk.LiveRoomProductListGetReq{
		AdvertiserId: userSession.AdvertiserID,
		RoomId:       roomId,
		Page:         1,
		PageSize:     count,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live room products failed: %v", err)
		util.ServerError(c, "获取直播间商品列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s", resp.Code, resp.Message)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, gin.H{
		"list":      resp.Data.List,
		"page_info": resp.Data.PageInfo,
	})
}
