package handler

import (
	"net/http"

	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// WebhookHandler 处理webhook相关请求
type WebhookHandler struct{}

// NewWebhookHandler 创建webhook处理器
func NewWebhookHandler() *WebhookHandler {
	return &WebhookHandler{}
}

// ChallengeRequest webhook challenge验证请求
type ChallengeRequest struct {
	Challenge string `json:"challenge" binding:"required"`
}

// ChallengeResponse webhook challenge验证响应
type ChallengeResponse struct {
	Challenge string `json:"challenge"`
}

// HandleChallenge 处理webhook订阅的challenge验证
// @Summary      Webhook订阅验证
// @Description  响应千川平台的webhook订阅challenge验证
// @Tags         webhook
// @Accept       json
// @Produce      json
// @Param        request  body  ChallengeRequest  true  "Challenge验证请求"
// @Success      200  {object}  ChallengeResponse  "验证成功"
// @Failure      400  {object}  util.ErrorResponse  "请求参数错误"
// @Router       /webhook/callback [post]
// @Router       /webhook/callback [get]
func (h *WebhookHandler) HandleChallenge(c *gin.Context) {
	// 同时支持GET和POST请求
	var req ChallengeRequest
	
	if c.Request.Method == http.MethodPost {
		// POST请求从body获取
		if err := c.ShouldBindJSON(&req); err != nil {
			util.ErrorResponse(c, http.StatusBadRequest, "无效的challenge参数: "+err.Error())
			return
		}
	} else {
		// GET请求从query参数获取
		challenge := c.Query("challenge")
		if challenge == "" {
			util.ErrorResponse(c, http.StatusBadRequest, "缺少challenge参数")
			return
		}
		req.Challenge = challenge
	}
	
	// 返回challenge，确认订阅
	c.JSON(http.StatusOK, ChallengeResponse{
		Challenge: req.Challenge,
	})
}

// HandleWebhookEvent 处理webhook事件推送
// @Summary      接收Webhook事件
// @Description  接收千川平台推送的webhook事件
// @Tags         webhook
// @Accept       json
// @Produce      json
// @Param        event  body  object  true  "Webhook事件数据"
// @Success      200  {object}  util.SuccessResponse  "接收成功"
// @Failure      400  {object}  util.ErrorResponse  "请求参数错误"
// @Router       /webhook/callback [post]
func (h *WebhookHandler) HandleWebhookEvent(c *gin.Context) {
	// 获取原始请求体
	var event map[string]interface{}
	if err := c.ShouldBindJSON(&event); err != nil {
		util.ErrorResponse(c, http.StatusBadRequest, "无效的webhook事件数据")
		return
	}
	
	// TODO: 实现webhook事件处理逻辑
	// 1. 验证签名（如果千川提供签名机制）
	// 2. 解析事件类型
	// 3. 业务逻辑处理
	// 4. 持久化存储
	
	util.Success(c, gin.H{
		"message": "webhook事件已接收",
		"event_type": event["event_type"],
	})
}
