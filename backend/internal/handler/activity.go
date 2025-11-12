package handler

import (
	"net/http"
	"time"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

// ActivityHandler 活动历史处理器
type ActivityHandler struct{}

// NewActivityHandler 创建活动历史处理器
func NewActivityHandler() *ActivityHandler {
	return &ActivityHandler{}
}

// Activity 活动记录
type Activity struct {
	ID           int64     `json:"id"`
	Type         string    `json:"type"`          // campaign_status, ad_status, creative_upload, etc.
	Title        string    `json:"title"`         // 活动标题
	Description  string    `json:"description"`   // 活动描述
	Status       string    `json:"status"`        // success, error, warning
	ResourceID   int64     `json:"resource_id"`   // 关联资源ID
	ResourceType string    `json:"resource_type"` // campaign, ad, creative
	CreatedAt    time.Time `json:"created_at"`
}

// List 获取活动历史列表（Demo功能，返回模拟数据）
// 注意：当前为示例实现，生产环境应从数据库读取真实的活动记录
func (h *ActivityHandler) List(c *gin.Context) {
	// 从middleware获取Session
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	// 解析参数
	var req struct {
		Page     int64  `form:"page"`
		PageSize int64  `form:"page_size"`
		Type     string `form:"type"` // 活动类型过滤
	}

	if err := c.ShouldBindQuery(&req); err != nil {
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

	// 这里应该从数据库获取活动历史
	// 目前返回模拟数据作为示例
	activities := generateMockActivities(userSession.AdvertiserID, int(req.PageSize))

	// 如果有类型过滤
	if req.Type != "" {
		filtered := []Activity{}
		for _, activity := range activities {
			if activity.Type == req.Type {
				filtered = append(filtered, activity)
			}
		}
		activities = filtered
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"list":  activities,
			"total": int64(len(activities)),
			"page": gin.H{
				"page":      req.Page,
				"page_size": req.PageSize,
			},
		},
	})
}

// generateMockActivities 生成模拟活动数据
// TODO: 后续应该从数据库读取真实数据
func generateMockActivities(advertiserID int64, count int) []Activity {
	now := time.Now()
	activities := []Activity{
		{
			ID:           1,
			Type:         "campaign_status",
			Title:        "广告计划状态更新",
			Description:  "广告计划 #12345 已启用",
			Status:       "success",
			ResourceID:   12345,
			ResourceType: "campaign",
			CreatedAt:    now.Add(-time.Minute * 2),
		},
		{
			ID:           2,
			Type:         "ad_status",
			Title:        "广告状态更新",
			Description:  "广告 #67890 已暂停",
			Status:       "warning",
			ResourceID:   67890,
			ResourceType: "ad",
			CreatedAt:    now.Add(-time.Minute * 15),
		},
		{
			ID:           3,
			Type:         "creative_upload",
			Title:        "创意上传完成",
			Description:  "视频创意 #11111 上传成功",
			Status:       "success",
			ResourceID:   11111,
			ResourceType: "creative",
			CreatedAt:    now.Add(-time.Hour * 1),
		},
		{
			ID:           4,
			Type:         "campaign_created",
			Title:        "创建广告计划",
			Description:  "新建广告计划 #12346 \"春节促销\"",
			Status:       "success",
			ResourceID:   12346,
			ResourceType: "campaign",
			CreatedAt:    now.Add(-time.Hour * 2),
		},
		{
			ID:           5,
			Type:         "creative_audit",
			Title:        "创意审核失败",
			Description:  "图片创意 #11112 审核未通过",
			Status:       "error",
			ResourceID:   11112,
			ResourceType: "creative",
			CreatedAt:    now.Add(-time.Hour * 3),
		},
		{
			ID:           6,
			Type:         "ad_created",
			Title:        "创建广告",
			Description:  "新建广告 #67891 \"新品推广\"",
			Status:       "success",
			ResourceID:   67891,
			ResourceType: "ad",
			CreatedAt:    now.Add(-time.Hour * 5),
		},
		{
			ID:           7,
			Type:         "budget_alert",
			Title:        "预算预警",
			Description:  "广告计划 #12345 日预算即将用完",
			Status:       "warning",
			ResourceID:   12345,
			ResourceType: "campaign",
			CreatedAt:    now.Add(-time.Hour * 8),
		},
		{
			ID:           8,
			Type:         "campaign_status",
			Title:        "广告计划状态更新",
			Description:  "广告计划 #12347 已完成",
			Status:       "success",
			ResourceID:   12347,
			ResourceType: "campaign",
			CreatedAt:    now.Add(-time.Hour * 12),
		},
	}

	if count > len(activities) {
		count = len(activities)
	}

	return activities[:count]
}
