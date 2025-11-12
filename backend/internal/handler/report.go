package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuanSDK"
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

// GetCampaignReport 获取广告组报表
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
	resp, err := h.service.Manager.AdvertiserReport(qianchuanSDK.AdvertiserReportReq{
		AdvertiserId: userSession.AdvertiserID,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
		Filtering: qianchuanSDK.AdvertiserReportFiltering{
			MarketingGoal: req.MarketingGoal,
			OrderPlatform: req.OrderPlatform,
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
	resp, err := h.service.Manager.ReportAdGet(qianchuanSDK.ReportAdGetReq{
		AdvertiserId: userSession.AdvertiserID,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
		Filtering: qianchuanSDK.ReportAdGetFiltering{
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
	resp, err := h.service.Manager.ReportCreativeGet(qianchuanSDK.ReportCreativeGetReq{
		AdvertiserId: userSession.AdvertiserID,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
		Filtering: qianchuanSDK.ReportCreativeGetFiltering{
			CreativeIds:   req.CreativeIds,
			MarketingGoal: req.MarketingGoal,
		},
		OrderField:  req.OrderField,
		OrderType:   req.OrderType,
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

	// 定义通用请求结构
	var req struct {
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

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 100
	}

	var data interface{}
	var err error

	switch reportType {
	case "creative":
		resp, e := h.service.Manager.ReportCreativeGet(qianchuanSDK.ReportCreativeGetReq{
			AdvertiserId: userSession.AdvertiserID,
			StartDate:    req.StartDate,
			EndDate:      req.EndDate,
			Fields:       req.Fields,
			Filtering: qianchuanSDK.ReportCreativeGetFiltering{
				CreativeIds:   req.CreativeIds,
				MarketingGoal: req.MarketingGoal,
			},
			OrderField:  req.OrderField,
			OrderType:   req.OrderType,
			Page:        req.Page,
			PageSize:    req.PageSize,
			AccessToken: userSession.AccessToken,
		})
		data, err = resp.Data, e
	default: // ad
		resp, e := h.service.Manager.ReportAdGet(qianchuanSDK.ReportAdGetReq{
			AdvertiserId: userSession.AdvertiserID,
			StartDate:    req.StartDate,
			EndDate:      req.EndDate,
			Fields:       req.Fields,
			Filtering: qianchuanSDK.ReportAdGetFiltering{
				AdIds:         req.AdIds,
				MarketingGoal: req.MarketingGoal,
			},
			OrderField:  req.OrderField,
			OrderType:   req.OrderType,
			Page:        req.Page,
			PageSize:    req.PageSize,
			AccessToken: userSession.AccessToken,
		})
		data, err = resp.Data, e
	}

	if err != nil {
		log.Printf("Export report failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "导出报表失败: " + err.Error(),
		})
		return
	}

	// 序列化为JSON并作为文件下载返回
	bytes, mErr := json.MarshalIndent(data, "", "  ")
	if mErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "导出报表失败: " + mErr.Error(),
		})
		return
	}

	filename := fmt.Sprintf("%s_report_%s_%s_%d.json", reportType, req.StartDate, req.EndDate, time.Now().Unix())
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "application/json", bytes)
}
