package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-gonic/gin"
)

// ReportHandler 数据报表处理器
type ReportHandler struct {
	service *service.QianchuanService
}

// NewReportHandler 创建数据报表处理器
func NewReportHandler(service *service.QianchuanService) *ReportHandler {
	return &ReportHandler{
		service: service,
	}
}

// GetAdvertiserReport 获取广告主账户报表
func (h *ReportHandler) GetAdvertiserReport(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析请求参数 (支持 GET query 和 POST JSON)
	var req struct {
		StartDate     string   `form:"start_date" json:"start_date"`
		EndDate       string   `form:"end_date" json:"end_date"`
		Fields        []string `form:"fields" json:"fields"`
		AdvertiserId  int64    `form:"advertiser_id" json:"advertiser_id"`
		MarketingGoal string   `form:"marketing_goal" json:"marketing_goal"`
	}
	if c.Request.Method == "GET" {
		if err := c.ShouldBindQuery(&req); err != nil {
			util.BadRequest(c, "参数错误: "+err.Error())
			return
		}
	} else {
		if err := c.ShouldBindJSON(&req); err != nil {
			util.BadRequest(c, "参数错误: "+err.Error())
			return
		}
	}

	if req.StartDate == "" || req.EndDate == "" {
		util.BadRequest(c, "start_date和end_date不能为空")
		return
	}
	if len(req.Fields) == 0 {
		req.Fields = []string{"stat_cost", "show_cnt", "click_cnt", "convert_cnt"}
	}
	if req.AdvertiserId == 0 {
		req.AdvertiserId = userSession.AdvertiserID
	}

	resp, err := h.service.Client.AdvertiserReport(c.Request.Context(), sdk.AdvertiserReportReq{
		AdvertiserId: req.AdvertiserId,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
		Filtering: &sdk.AdvertiserReportFiltering{
			MarketingGoal: req.MarketingGoal,
		},
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get advertiser report failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告主报表失败: " + err.Error(),
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

// GetCampaignReport 获取广告组报表 (已弃用，保留向后兼容，实际调用广告主报表)
// Deprecated: Use GetAdvertiserReport instead
func (h *ReportHandler) GetCampaignReport(c *gin.Context) {
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
		StartDate     string   `json:"start_date" binding:"required"`
		EndDate       string   `json:"end_date" binding:"required"`
		Fields        []string `json:"fields" binding:"required"`
		MarketingGoal string   `json:"marketing_goal"`
		OrderPlatform string   `json:"order_platform"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 调用SDK
	resp, err := h.service.Client.AdvertiserReport(c.Request.Context(), sdk.AdvertiserReportReq{
		AdvertiserId: userSession.AdvertiserID,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
		Filtering: &sdk.AdvertiserReportFiltering{
			MarketingGoal: req.MarketingGoal,
		},
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get advertiser report failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告主报表失败: " + err.Error(),
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

// GetAdReport 获取广告计划报表
func (h *ReportHandler) GetAdReport(c *gin.Context) {
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
		StartDate     string   `json:"start_date" binding:"required"`
		EndDate       string   `json:"end_date" binding:"required"`
		Fields        []string `json:"fields" binding:"required"`
		AdIds         []int64  `json:"ad_ids"`
		MarketingGoal string   `json:"marketing_goal"`
		OrderField    string   `json:"order_field"`
		OrderType     string   `json:"order_type"`
		Page          int64    `json:"page"`
		PageSize      int64    `json:"page_size"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
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

	// 调用SDK
	resp, err := h.service.Client.ReportAdGet(c.Request.Context(), sdk.ReportAdGetReq{
		AdvertiserId: userSession.AdvertiserID,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
		Filtering: &sdk.ReportAdGetFiltering{
			AdIds:         req.AdIds,
			MarketingGoal: req.MarketingGoal,
		},
		OrderField:  req.OrderField,
		OrderType:   req.OrderType,
		Page:        req.Page,
		PageSize:    req.PageSize,
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get ad report failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告计划报表失败: " + err.Error(),
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

// GetCreativeReport 获取广告创意报表
func (h *ReportHandler) GetCreativeReport(c *gin.Context) {
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
		StartDate     string   `json:"start_date" binding:"required"`
		EndDate       string   `json:"end_date" binding:"required"`
		Fields        []string `json:"fields" binding:"required"`
		CreativeIds   []int64  `json:"creative_ids"`
		MarketingGoal string   `json:"marketing_goal"`
		OrderField    string   `json:"order_field"`
		OrderType     string   `json:"order_type"`
		Page          int64    `json:"page"`
		PageSize      int64    `json:"page_size"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
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

	// 调用SDK
	resp, err := h.service.Client.ReportCreativeGet(c.Request.Context(), sdk.ReportCreativeGetReq{
		AdvertiserId: userSession.AdvertiserID,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
		Filtering: &sdk.ReportCreativeGetFiltering{
			CreativeIds:   req.CreativeIds,
			MarketingGoal: req.MarketingGoal,
		},
		Page:        req.Page,
		PageSize:    req.PageSize,
		AccessToken: userSession.AccessToken,
	})

	if err != nil {
		log.Printf("Get creative report failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取创意报表失败: " + err.Error(),
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

// exportReportRequest 导出报表请求结构
type exportReportRequest struct {
	StartDate     string   `json:"start_date" binding:"required"`
	EndDate       string   `json:"end_date" binding:"required"`
	Fields        []string `json:"fields" binding:"required"`
	CampaignId    int64    `json:"campaign_id"`
	AdIds         []int64  `json:"ad_ids"`
	CreativeIds   []int64  `json:"creative_ids"`
	MarketingGoal string   `json:"marketing_goal"`
	OrderField    string   `json:"order_field"`
	OrderType     string   `json:"order_type"`
	Page          int64    `json:"page"`
	PageSize      int64    `json:"page_size"`
}

// fetchReportData 根据报表类型获取数据
func (h *ReportHandler) fetchReportData(reportType string, req exportReportRequest, userSession *session.UserSession, ctx context.Context) (interface{}, error) {
	switch reportType {
	case "creative":
		resp, err := h.service.Client.ReportCreativeGet(ctx, sdk.ReportCreativeGetReq{
			AdvertiserId: userSession.AdvertiserID,
			StartDate:    req.StartDate,
			EndDate:      req.EndDate,
			Fields:       req.Fields,
			Filtering: &sdk.ReportCreativeGetFiltering{
				CreativeIds:   req.CreativeIds,
				MarketingGoal: req.MarketingGoal,
			},
			Page:        req.Page,
			PageSize:    req.PageSize,
			AccessToken: userSession.AccessToken,
		})
		if err != nil {
			return nil, err
		}
		return resp.Data, nil
	default: // ad
		resp, err := h.service.Client.ReportAdGet(ctx, sdk.ReportAdGetReq{
			AdvertiserId: userSession.AdvertiserID,
			StartDate:    req.StartDate,
			EndDate:      req.EndDate,
			Fields:       req.Fields,
			Filtering: &sdk.ReportAdGetFiltering{
				AdIds:         req.AdIds,
				MarketingGoal: req.MarketingGoal,
			},
			OrderField:  req.OrderField,
			OrderType:   req.OrderType,
			Page:        req.Page,
			PageSize:    req.PageSize,
			AccessToken: userSession.AccessToken,
		})
		if err != nil {
			return nil, err
		}
		return resp.Data, nil
	}
}

// ExportReport 导出报表为JSON文件（通用导出）
func (h *ReportHandler) ExportReport(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	reportType := c.Query("type") // campaign/ad/creative
	if reportType == "" {
		reportType = "ad"
	}

	// 解析请求参数
	var req exportReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 设置默认分页参数
	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 100
	}

	// 获取报表数据
	data, err := h.fetchReportData(reportType, req, userSession, c.Request.Context())
	if err != nil {
		log.Printf("Export report failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "导出报表失败: " + err.Error(),
		})
		return
	}

	// 序列化为JSON
	bytes, mErr := json.MarshalIndent(data, "", "  ")
	if mErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "导出报表失败: " + mErr.Error(),
		})
		return
	}

	// 返回文件下载
	filename := fmt.Sprintf("%s_report_%s_%s_%d.json", reportType, req.StartDate, req.EndDate, time.Now().Unix())
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "application/json", bytes)
}

// ==================== 报表扩展接口（批次A-3） ====================

// GetMaterialReport 获取素材报表
// POST /qianchuan/report/material/get
func (h *ReportHandler) GetMaterialReport(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.ReportMaterialGetReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken
	req.AdvertiserId = userSession.AdvertiserID

	resp, err := h.service.Client.ReportMaterialGet(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "获取素材报表")
		return
	}
	util.Success(c, resp.Data)
}

// GetSearchWordReport 获取搜索词报表
func (h *ReportHandler) GetSearchWordReport(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.ReportSearchWordGetReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken
	req.AdvertiserId = userSession.AdvertiserID

	resp, err := h.service.Client.ReportSearchWordGet(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "获取搜索词报表")
		return
	}
	util.Success(c, resp.Data)
}

// GetVideoUserLoseReport 获取视频流失报表
func (h *ReportHandler) GetVideoUserLoseReport(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.ReportVideoUserLoseGetReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken
	req.AdvertiserId = userSession.AdvertiserID

	resp, err := h.service.Client.ReportVideoUserLoseGet(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "获取视频流失报表")
		return
	}
	util.Success(c, resp.Data)
}

// GetCustomReport 获取自定义报表
func (h *ReportHandler) GetCustomReport(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req sdk.ReportCustomGetReq
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	req.AccessToken = userSession.AccessToken
	req.AdvertiserId = userSession.AdvertiserID

	resp, err := h.service.Client.ReportCustomGet(c.Request.Context(), req)
	if err != nil {
		util.RespondWithSDKError(c, err, "获取自定义报表")
		return
	}
	util.Success(c, resp.Data)
}

// GetCustomReportConfig 获取自定义报表配置
func (h *ReportHandler) GetCustomReportConfig(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	resp, err := h.service.Client.ReportCustomConfigGet(c.Request.Context(), sdk.ReportCustomConfigGetReq{
		AccessToken:  userSession.AccessToken,
		AdvertiserId: userSession.AdvertiserID,
	})
	if err != nil {
		util.RespondWithSDKError(c, err, "获取自定义报表配置")
		return
	}
	util.Success(c, resp.Data)
}
