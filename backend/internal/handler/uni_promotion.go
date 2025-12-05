package handler

import (
	"fmt"
	"log"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// UniPromotionHandler 全域推广Handler
type UniPromotionHandler struct {
	service *service.QianchuanService
}

// NewUniPromotionHandler 创建全域推广Handler
func NewUniPromotionHandler(service *service.QianchuanService) *UniPromotionHandler {
	return &UniPromotionHandler{service: service}
}

// List 获取全域推广列表
// GET /qianchuan/uni_promotion/list
func (h *UniPromotionHandler) List(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	advertiserId, _ := strconv.ParseUint(advertiserIdStr, 10, 64)
	if advertiserId == 0 {
		advertiserId = uint64(userSession.AdvertiserID)
	}

	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)

	log.Printf("UniPromotion List: advertiser_id=%d, page=%d, page_size=%d", advertiserId, page, pageSize)

	resp, err := h.service.Client.UniPromotionList(c.Request.Context(), sdk.UniPromotionListReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: advertiserId,
		Page:         page,
		PageSize:     pageSize,
	})
	if err != nil {
		util.ServerError(c, "获取全域推广列表失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("获取全域推广列表失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{
		"list":      resp.Data.List,
		"page_info": resp.Data.PageInfo,
	})
}

// GetDetail 获取全域推广详情
// GET /qianchuan/uni_promotion/detail
func (h *UniPromotionHandler) GetDetail(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")
	adIdStr := c.Query("ad_id")

	advertiserId, _ := strconv.ParseUint(advertiserIdStr, 10, 64)
	if advertiserId == 0 {
		advertiserId = uint64(userSession.AdvertiserID)
	}
	adId, err := strconv.ParseUint(adIdStr, 10, 64)
	if err != nil || adId == 0 {
		util.BadRequest(c, "ad_id 参数必填")
		return
	}

	log.Printf("UniPromotion Detail: advertiser_id=%d, ad_id=%d", advertiserId, adId)

	resp, err := h.service.Client.UniPromotionDetail(c.Request.Context(), sdk.UniPromotionDetailReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: advertiserId,
		AdId:         adId,
	})
	if err != nil {
		util.ServerError(c, "获取全域推广详情失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("获取全域推广详情失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, resp.Data)
}

// Create 创建全域推广
// POST /qianchuan/uni_promotion/create
func (h *UniPromotionHandler) Create(c *gin.Context) {
	var req struct {
		AdvertiserId uint64  `json:"advertiser_id"`
		AwemeId      uint64  `json:"aweme_id" binding:"required"`
		Budget       float64 `json:"budget" binding:"required"`
		Roi2Goal     float64 `json:"roi2_goal"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion Create: advertiser_id=%d, aweme_id=%d, budget=%f",
		req.AdvertiserId, req.AwemeId, req.Budget)

	resp, err := h.service.Client.UniPromotionCreate(c.Request.Context(), sdk.UniPromotionCreateReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		AwemeId:      req.AwemeId,
		Budget:       req.Budget,
		Roi2Goal:     req.Roi2Goal,
	})
	if err != nil {
		util.ServerError(c, "创建全域推广失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("创建全域推广失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{"ad_id": resp.Data.AdId})
}

// Update 更新全域推广
// POST /qianchuan/uni_promotion/update
func (h *UniPromotionHandler) Update(c *gin.Context) {
	var req struct {
		AdvertiserId uint64  `json:"advertiser_id"`
		AdId         uint64  `json:"ad_id" binding:"required"`
		Budget       float64 `json:"budget"`
		Roi2Goal     float64 `json:"roi2_goal"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion Update: advertiser_id=%d, ad_id=%d", req.AdvertiserId, req.AdId)

	resp, err := h.service.Client.UniPromotionUpdate(c.Request.Context(), sdk.UniPromotionUpdateReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		AdId:         req.AdId,
		Budget:       req.Budget,
		Roi2Goal:     req.Roi2Goal,
	})
	if err != nil {
		util.ServerError(c, "更新全域推广失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("更新全域推广失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{"ad_id": resp.Data.AdId})
}

// UpdateStatus 更新全域推广状态
// POST /qianchuan/uni_promotion/status/update
func (h *UniPromotionHandler) UpdateStatus(c *gin.Context) {
	var req struct {
		AdvertiserId uint64   `json:"advertiser_id"`
		AdIds        []uint64 `json:"ad_ids" binding:"required"`
		OptStatus    string   `json:"opt_status" binding:"required"` // ENABLE / DISABLE
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion StatusUpdate: advertiser_id=%d, ad_ids=%v, opt_status=%s",
		req.AdvertiserId, req.AdIds, req.OptStatus)

	resp, err := h.service.Client.UniPromotionStatusUpdate(c.Request.Context(), sdk.UniPromotionStatusUpdateReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		AdIds:        req.AdIds,
		OptStatus:    req.OptStatus,
	})
	if err != nil {
		util.ServerError(c, "更新全域推广状态失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("更新全域推广状态失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{
		"ad_ids": resp.Data.AdIds,
		"errors": resp.Data.Errors,
	})
}

// UpdateMaterial 获取/删除全域推广素材
// 此方法处理素材相关操作（获取或删除）
func (h *UniPromotionHandler) UpdateMaterial(c *gin.Context) {
	// 删除操作 - POST
	var req struct {
		AdvertiserId uint64   `json:"advertiser_id"`
		AdId         uint64   `json:"ad_id" binding:"required"`
		VideoIds     []string `json:"video_ids"`
		ImageIds     []string `json:"image_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion MaterialDelete: advertiser_id=%d, ad_id=%d", req.AdvertiserId, req.AdId)

	resp, err := h.service.Client.UniPromotionMaterialDelete(c.Request.Context(), sdk.UniPromotionMaterialDeleteReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		AdId:         req.AdId,
		Titles:       req.VideoIds, // Using VideoIds as titles placeholder
	})
	if err != nil {
		util.ServerError(c, "删除全域推广素材失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("删除全域推广素材失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{"message": "删除成功"})
}

// UpdateAuth 全域授权初始化
// POST /qianchuan/uni_promotion/auth/init
func (h *UniPromotionHandler) UpdateAuth(c *gin.Context) {
	var req struct {
		AdvertiserId uint64 `json:"advertiser_id"`
		AwemeId      uint64 `json:"aweme_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion AuthInit: advertiser_id=%d", req.AdvertiserId)

	resp, err := h.service.Client.UniPromotionAuthInit(c.Request.Context(), sdk.UniPromotionAuthInitReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		AwemeId:      req.AwemeId,
	})
	if err != nil {
		util.ServerError(c, "全域授权初始化失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("全域授权初始化失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{"message": "初始化成功"})
}

// UpdateBudget 更新全域推广预算
// POST /qianchuan/uni_promotion/budget/update
func (h *UniPromotionHandler) UpdateBudget(c *gin.Context) {
	var req struct {
		AdvertiserId uint64 `json:"advertiser_id"`
		Data         []struct {
			AdId   uint64  `json:"ad_id"`
			Budget float64 `json:"budget"`
		} `json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion BudgetUpdate: advertiser_id=%d, data_count=%d", req.AdvertiserId, len(req.Data))

	var updateItems []sdk.UniPromotionBudgetUpdateItem
	for _, item := range req.Data {
		updateItems = append(updateItems, sdk.UniPromotionBudgetUpdateItem{
			AdId:   item.AdId,
			Budget: item.Budget,
		})
	}

	resp, err := h.service.Client.UniPromotionBudgetUpdate(c.Request.Context(), sdk.UniPromotionBudgetUpdateReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		Data:         updateItems,
	})
	if err != nil {
		util.ServerError(c, "更新全域推广预算失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("更新全域推广预算失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{"results": resp.Data.Results})
}

// UpdateROIGoal 更新全域推广ROI目标
// POST /qianchuan/uni_promotion/roi_goal/update
func (h *UniPromotionHandler) UpdateROIGoal(c *gin.Context) {
	var req struct {
		AdvertiserId uint64 `json:"advertiser_id"`
		Data         []struct {
			AdId     uint64  `json:"ad_id"`
			Roi2Goal float64 `json:"roi2_goal"`
		} `json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion RoiGoalUpdate: advertiser_id=%d, data_count=%d", req.AdvertiserId, len(req.Data))

	var updateItems []sdk.UniPromotionRoiGoalUpdateItem
	for _, item := range req.Data {
		updateItems = append(updateItems, sdk.UniPromotionRoiGoalUpdateItem{
			AdId:     item.AdId,
			Roi2Goal: item.Roi2Goal,
		})
	}

	resp, err := h.service.Client.UniPromotionRoiGoalUpdate(c.Request.Context(), sdk.UniPromotionRoiGoalUpdateReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		Data:         updateItems,
	})
	if err != nil {
		util.ServerError(c, "更新全域推广ROI目标失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("更新全域推广ROI目标失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{"results": resp.Data.Results})
}

// UpdateScheduleTime 更新全域推广投放时间
// POST /qianchuan/uni_promotion/schedule/update
func (h *UniPromotionHandler) UpdateScheduleTime(c *gin.Context) {
	var req struct {
		AdvertiserId uint64 `json:"advertiser_id"`
		Data         []struct {
			AdId      uint64 `json:"ad_id"`
			StartTime string `json:"start_time"`
			EndTime   string `json:"end_time"`
		} `json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userSession, _ := middleware.GetUserSession(c)
	if req.AdvertiserId == 0 {
		req.AdvertiserId = uint64(userSession.AdvertiserID)
	}

	log.Printf("UniPromotion ScheduleUpdate: advertiser_id=%d, data_count=%d", req.AdvertiserId, len(req.Data))

	var updateItems []sdk.UniPromotionScheduleUpdateItem
	for _, item := range req.Data {
		updateItems = append(updateItems, sdk.UniPromotionScheduleUpdateItem{
			AdId:      item.AdId,
			StartTime: item.StartTime,
			EndTime:   item.EndTime,
		})
	}

	resp, err := h.service.Client.UniPromotionScheduleUpdate(c.Request.Context(), sdk.UniPromotionScheduleUpdateReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: req.AdvertiserId,
		Data:         updateItems,
	})
	if err != nil {
		util.ServerError(c, "更新全域推广投放时间失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("更新全域推广投放时间失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{"results": resp.Data.Results})
}

// GetBudgetSchedule 获取可投全域推广抖音号列表
// GET /qianchuan/uni_promotion/authorized/get
func (h *UniPromotionHandler) GetBudgetSchedule(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	advertiserId, _ := strconv.ParseUint(advertiserIdStr, 10, 64)
	if advertiserId == 0 {
		advertiserId = uint64(userSession.AdvertiserID)
	}

	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)

	log.Printf("UniPromotion AuthorizedGet: advertiser_id=%d, page=%d, page_size=%d", advertiserId, page, pageSize)

	resp, err := h.service.Client.UniPromotionAuthorizedGet(c.Request.Context(), sdk.UniPromotionAuthorizedGetReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: advertiserId,
		Page:         page,
		PageSize:     pageSize,
	})
	if err != nil {
		util.ServerError(c, "获取可投全域推广抖音号列表失败: "+err.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("获取可投全域推广抖音号列表失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{
		"list":      resp.Data.List,
		"page_info": resp.Data.PageInfo,
	})
}

// UpdateBudgetSchedule 获取全域推广素材
// GET /qianchuan/uni_promotion/material/get
func (h *UniPromotionHandler) UpdateBudgetSchedule(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserIdStr := c.Query("advertiser_id")
	adIdStr := c.Query("ad_id")

	advertiserId, _ := strconv.ParseUint(advertiserIdStr, 10, 64)
	if advertiserId == 0 {
		advertiserId = uint64(userSession.AdvertiserID)
	}
	adId, err := strconv.ParseUint(adIdStr, 10, 64)
	if err != nil || adId == 0 {
		util.BadRequest(c, "ad_id 参数必填")
		return
	}

	log.Printf("UniPromotion MaterialGet: advertiser_id=%d, ad_id=%d", advertiserId, adId)

	resp, errSdk := h.service.Client.UniPromotionMaterialGet(c.Request.Context(), sdk.UniPromotionMaterialGetReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: advertiserId,
		AdId:         adId,
	})
	if errSdk != nil {
		util.ServerError(c, "获取全域推广素材失败: "+errSdk.Error())
		return
	}
	if resp.Code == 501 {
		util.NotImplemented(c, resp.Message, "请使用 oceanengine 构建版本以启用全域推广功能")
		return
	}
	if resp.Code != 0 {
		util.BadRequest(c, fmt.Sprintf("获取全域推广素材失败[%d]: %s", resp.Code, resp.Message))
		return
	}

	util.Success(c, gin.H{
		"materials": resp.Data.Materials,
	})
}
