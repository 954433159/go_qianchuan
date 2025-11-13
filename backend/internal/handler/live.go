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
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.LiveGet(qianchuanSDK.LiveGetReq{
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
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data.Stats)
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
		count = 20 // 默认20条
	}
	var err error
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

	// 调用SDK
	resp, err := h.service.Manager.LiveRoomGet(qianchuanSDK.LiveRoomGetReq{
		AdvertiserId: userSession.AdvertiserID,
		Cursor:       cursor,
		Count:        count,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live rooms failed: %v", err)
		util.ServerError(c, "获取直播间列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	// 转换SDK返回的字段以匹配前端期望
	type FrontendLiveRoom struct {
		RoomId          int64  `json:"room_id"`
		RoomTitle       string `json:"room_title"`
		AwemeName       string `json:"aweme_name"`
		AwemeId         string `json:"aweme_id"`
		StartTime       string `json:"start_time"`
		EndTime         string `json:"end_time"`
		Status          string `json:"status"`
		LiveDuration    int64  `json:"live_duration"`
		Gmv             int64  `json:"gmv"`               // 列表中不返回，需要详情接口
		WatchUcnt       int64  `json:"watch_ucnt"`        // 列表中不返回
		OrderCount      int64  `json:"order_count"`       // 列表中不返回
		OnlineUserCount int64  `json:"online_user_count"` // 列表中不返回
	}

	var frontendRooms []FrontendLiveRoom
	for _, room := range resp.Data.List {
		// SDK返回 LIVING/FINISHED, 前端使用 LIVE/END
		status := room.RoomStatus
		if status == "LIVING" {
			status = "LIVE"
		} else if status == "FINISHED" {
			status = "END"
		}

		frontendRooms = append(frontendRooms, FrontendLiveRoom{
			RoomId:          room.RoomId,
			RoomTitle:       room.RoomTitle,
			AwemeName:       room.AwemeName,
			AwemeId:         room.AwemeId,
			StartTime:       room.StartTime,
			EndTime:         room.EndTime,
			Status:          status,
			LiveDuration:    room.LiveDuration,
			Gmv:             0, // 列表中不返回，需要详情接口
			WatchUcnt:       0, // 列表中不返回
			OrderCount:      0, // 列表中不返回
			OnlineUserCount: 0, // 列表中不返回
		})
	}

	util.Success(c, gin.H{
		"list":      frontendRooms,
		"page_info": resp.Data.PageInfo,
	})
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
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.LiveRoomDetailGet(qianchuanSDK.LiveRoomDetailGetReq{
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
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data.Room)
}

// GetLiveRoomFlowPerformance 获取直播间流量表现
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
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.LiveRoomFlowPerformanceGet(qianchuanSDK.LiveRoomFlowPerformanceGetReq{
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
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data.FlowPerformance)
}

// GetLiveRoomUserInsight 获取直播间用户洞察
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
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.LiveRoomUserGet(qianchuanSDK.LiveRoomUserGetReq{
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
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, resp.Data.UserInsight)
}

// GetLiveRoomProducts 获取直播间商品列表
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
	if h.service == nil || h.service.Manager == nil {
		util.ServerError(c, "SDK未初始化")
		return
	}

	// 调用SDK
	resp, err := h.service.Manager.LiveRoomProductListGet(qianchuanSDK.LiveRoomProductListGetReq{
		AdvertiserId: userSession.AdvertiserID,
		RoomId:       roomId,
		Cursor:       cursor,
		Count:        count,
		AccessToken:  userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get live room products failed: %v", err)
		util.ServerError(c, "获取直播间商品列表失败: "+err.Error())
		return
	}

	if resp.Code != 0 {
		log.Printf("SDK returned error: code=%d, message=%s, request_id=%s", resp.Code, resp.Message, resp.RequestId)
		util.ErrorResponse(c, int(resp.Code), resp.Message)
		return
	}

	util.Success(c, gin.H{
		"list":      resp.Data.List,
		"page_info": resp.Data.PageInfo,
	})
}
