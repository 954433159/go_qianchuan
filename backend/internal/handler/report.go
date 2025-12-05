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

	// 调用SDK (OrderPlatform 字段SDK暂不支持)
	_ = req.OrderPlatform
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
	userSession, _ := middleware.GetUserSession(c)

	var req struct {
		StartDate string   `json:"start_date"`
		EndDate   string   `json:"end_date"`
		Fields    []string `json:"fields"`
		Page      int64    `json:"page"`
		PageSize  int64    `json:"page_size"`
	}
	_ = c.ShouldBindJSON(&req)

	log.Printf("Get material report: start_date=%s, end_date=%s, fields=%v",
		req.StartDate, req.EndDate, req.Fields)

	// SDK 暂未实现素材报表接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "素材报表功能暂未实现",
		"hint":    "SDK 正在对接千川素材报表API，请稍后使用。建议使用创意报表查看素材效果",
		"data": gin.H{
			"list":  []gin.H{},
			"total": 0,
			"page":  req.Page,
			"size":  req.PageSize,
		},
		"session": userSession,
	})
}

// GetSearchWordReport 获取搜索词报表
// POST /qianchuan/report/search-word/get
func (h *ReportHandler) GetSearchWordReport(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)

	var req struct {
		StartDate string   `json:"start_date"`
		EndDate   string   `json:"end_date"`
		Fields    []string `json:"fields"`
		AdIds     []int64  `json:"ad_ids"`
		Page      int64    `json:"page"`
		PageSize  int64    `json:"page_size"`
	}
	_ = c.ShouldBindJSON(&req)

	log.Printf("Get search word report: start_date=%s, end_date=%s, ad_ids=%v",
		req.StartDate, req.EndDate, req.AdIds)

	// SDK 暂未实现搜索词报表接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "搜索词报表功能暂未实现",
		"hint":    "SDK 正在对接千川搜索词报表API，请稍后使用。建议通过关键词管理查看关键词效果",
		"data": gin.H{
			"list":  []gin.H{},
			"total": 0,
			"page":  req.Page,
			"size":  req.PageSize,
		},
		"session": userSession,
	})
}

// GetVideoUserLoseReport 获取视频流失报表
// POST /qianchuan/report/video-user-lose/get
func (h *ReportHandler) GetVideoUserLoseReport(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)

	var req struct {
		StartDate   string   `json:"start_date"`
		EndDate     string   `json:"end_date"`
		Fields      []string `json:"fields"`
		CreativeIds []int64  `json:"creative_ids"`
		Page        int64    `json:"page"`
		PageSize    int64    `json:"page_size"`
	}
	_ = c.ShouldBindJSON(&req)

	log.Printf("Get video user lose report: start_date=%s, end_date=%s, creative_ids=%v",
		req.StartDate, req.EndDate, req.CreativeIds)

	// SDK 暂未实现视频流失报表接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "视频流失报表功能暂未实现",
		"hint":    "SDK 正在对接千川视频流失报表API，请稍后使用。建议通过创意报表查看视频整体表现",
		"data": gin.H{
			"list":  []gin.H{},
			"total": 0,
			"page":  req.Page,
			"size":  req.PageSize,
		},
		"session": userSession,
	})
}

// GetCustomReport 获取自定义报表
// GET /qianchuan/report/custom/get
func (h *ReportHandler) GetCustomReport(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	dimensions := c.QueryArray("dimensions")

	log.Printf("Get custom report: start_date=%s, end_date=%s, dimensions=%v",
		startDate, endDate, dimensions)

	// SDK 暂未实现自定义报表接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "自定义报表功能暂未实现",
		"hint":    "SDK 正在对接千川自定义报表API，请稍后使用。建议使用现有维度报表（广告主/广告/创意）",
		"data": gin.H{
			"list":  []gin.H{},
			"total": 0,
		},
		"session": userSession,
		"request": gin.H{
			"start_date": startDate,
			"end_date":   endDate,
			"dimensions": dimensions,
		},
	})
}

// GetCustomReportConfig 获取自定义报表配置
// GET /qianchuan/report/custom/config
func (h *ReportHandler) GetCustomReportConfig(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)

	log.Printf("Get custom report config")

	// SDK 暂未实现自定义报表配置接口，返回 501
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "自定义报表配置功能暂未实现",
		"hint":    "SDK 正在对接千川自定义报表配置API，请稍后使用",
		"data": gin.H{
			"dimensions": []gin.H{},
			"metrics":    []gin.H{},
		},
		"session": userSession,
	})
}
