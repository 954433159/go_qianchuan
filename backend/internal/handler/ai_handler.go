package handler

import (
	"fmt"

	"github.com/CriarBrand/qianchuan-backend/internal/ai"
	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// AIHandler AI 功能处理器
// 集成多提供商 AI 代理，提供智能优化建议和报表解读
type AIHandler struct {
	service *service.QianchuanService
	agent   *ai.AdAgent
}

// NewAIHandler 创建 AI 处理器
func NewAIHandler(svc *service.QianchuanService) *AIHandler {
	return &AIHandler{
		service: svc,
		agent:   ai.NewAdAgent(ai.NewMultiProvider()),
	}
}

// GetSuggestions 获取 AI 优化建议
// POST /api/ai/suggestions
func (h *AIHandler) GetSuggestions(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req struct {
		AdvertiserId int64 `json:"advertiser_id"`
		AdId         int64 `json:"ad_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	if req.AdvertiserId == 0 {
		req.AdvertiserId = userSession.AdvertiserID
	}

	// 获取广告详情 + 诊断数据
	adCtx := ai.AdContext{HealthScore: 50}

	if req.AdId > 0 {
		detailResp, err := h.service.Client.AdDetailGet(c.Request.Context(), sdk.AdDetailGetReq{
			AdvertiserId: req.AdvertiserId,
			AdId:         req.AdId,
			AccessToken:  userSession.AccessToken,
		})
		if err == nil && detailResp != nil && detailResp.Code == 0 {
			if adMap, ok := detailResp.Data.(map[string]interface{}); ok {
				adCtx.AdvertiserName = getStringFromMap(adMap, "advertiser_name")
				adCtx.AdName = getStringFromMap(adMap, "name")
				adCtx.Status = getStringFromMap(adMap, "status")
				if ds, ok := adMap["delivery_setting"].(map[string]interface{}); ok {
					if b, ok := ds["budget"].(float64); ok {
						adCtx.Budget = b
					}
				}
				adCtx.Metrics = map[string]string{
					"status": adCtx.Status,
					"budget": formatFloat(adCtx.Budget) + " 元",
				}
			}
		}
	}

	suggestions, err := h.agent.SuggestOptimizations(adCtx)
	if err != nil {
		util.ServerError(c, "AI分析失败: "+err.Error())
		return
	}

	util.Success(c, gin.H{
		"suggestions":   suggestions,
		"ad_context":    adCtx,
		"ai_providers":  ai.NewMultiProvider().Providers(),
		"ai_available":  ai.NewMultiProvider().Available(),
		"mode":          h.getMode(),
	})
}

// GetStatus 获取 AI 模块状态
// GET /api/ai/status
func (h *AIHandler) GetStatus(c *gin.Context) {
	mp := ai.NewMultiProvider()
	util.Success(c, gin.H{
		"available":  mp.Available(),
		"providers":  mp.Providers(),
		"mode":       h.getMode(),
	})
}

func (h *AIHandler) getMode() string {
	if ai.NewMultiProvider().Available() {
		return "ai_powered"
	}
	return "rule_engine"
}

func getStringFromMap(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func formatFloat(f float64) string {
	if f == 0 {
		return "0.00"
	}
	return fmt.Sprintf("%.2f", f)
}
