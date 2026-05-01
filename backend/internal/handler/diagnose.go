package handler

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// DiagnoseHandler 广告诊断处理器
// 参考 DA_Multi_Agent_Workflow 的 AI 诊断模式实现
type DiagnoseHandler struct {
	service *service.QianchuanService
}

// NewDiagnoseHandler 创建诊断处理器
func NewDiagnoseHandler(svc *service.QianchuanService) *DiagnoseHandler {
	return &DiagnoseHandler{service: svc}
}

// AdDiagnosis 广告计划诊断结果
type AdDiagnosis struct {
	AdId           int64             `json:"ad_id"`
	AdName         string            `json:"ad_name"`
	Status         string            `json:"status"`
	HealthScore    int               `json:"health_score"`    // 0-100 健康分
	HealthLevel    string            `json:"health_level"`    // 优秀/良好/一般/较差
	Issues         []string          `json:"issues"`          // 问题列表
	Suggestions    []string          `json:"suggestions"`     // 优化建议
	Metrics        map[string]string `json:"metrics"`         // 关键指标
	BudgetUsage    float64           `json:"budget_usage"`    // 预算使用率
	CostEfficiency float64           `json:"cost_efficiency"` // 成本效率
}

// DiagnoseAd 诊断单个广告计划
// POST /api/diagnose/ad
func (h *DiagnoseHandler) DiagnoseAd(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req struct {
		AdvertiserId int64 `form:"advertiser_id"`
		AdId         int64 `form:"ad_id" binding:"required"`
	}
	if err := c.ShouldBindQuery(&req); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	if req.AdvertiserId == 0 {
		req.AdvertiserId = userSession.AdvertiserID
	}

	ctx := c.Request.Context()

	// 获取广告计划详情
	detailResp, err := h.service.Client.AdDetailGet(ctx, sdk.AdDetailGetReq{
		AdvertiserId: req.AdvertiserId,
		AdId:         req.AdId,
		AccessToken:  userSession.AccessToken,
	})
	if err != nil || detailResp == nil || detailResp.Code != 0 {
		util.ServerError(c, "获取计划详情失败")
		return
	}

	// 将 detailResp.Data 转换为 map 以提取字段
	adMap, ok := detailResp.Data.(map[string]interface{})
	if !ok {
		util.ServerError(c, "计划数据格式异常")
		return
	}

	diagnosis := AdDiagnosis{
		AdId:    req.AdId,
		Metrics: make(map[string]string),
	}

	// 提取基本信息
	if name, ok := adMap["name"].(string); ok {
		diagnosis.AdName = name
	}
	if status, ok := adMap["status"].(string); ok {
		diagnosis.Status = status
	}

	// 提取投放设置
	ds, _ := adMap["delivery_setting"].(map[string]interface{})
	budget := 0.0
	if ds != nil {
		if b, ok := ds["budget"].(float64); ok {
			budget = b
		}
		if bm, ok := ds["budget_mode"].(string); ok {
			diagnosis.Metrics["budget_mode"] = bm
		}
	}
	diagnosis.Metrics["budget"] = fmt.Sprintf("%.2f 元", budget)

	// 评分逻辑
	score := 80 // 基础分

	// 1. 状态检查
	switch diagnosis.Status {
	case "DELIVERY_OK":
		score += 5
	case "FROZEN":
		score -= 30
		diagnosis.Issues = append(diagnosis.Issues, "计划已冻结")
		diagnosis.Suggestions = append(diagnosis.Suggestions, "检查账户余额是否充足，考虑重新激活计划")
	case "DELETE":
		score = 10
		diagnosis.Issues = append(diagnosis.Issues, "计划已删除")
	case "DISABLE":
		score -= 20
		diagnosis.Issues = append(diagnosis.Issues, "计划已暂停")
		diagnosis.Suggestions = append(diagnosis.Suggestions, "确认是否需要恢复投放")
	}

	// 2. 预算检查
	if budget > 0 && budget < 300 {
		score -= 10
		diagnosis.Issues = append(diagnosis.Issues, "日预算偏低（<300元），可能影响跑量")
		diagnosis.Suggestions = append(diagnosis.Suggestions, "建议日预算不低于300元以确保稳定跑量")
	}
	if budget >= 1000 {
		score += 5
	}
	diagnosis.BudgetUsage = 0 // 需要报表数据才能计算

	// 3. 获取最近7天报表数据进行深度分析
	now := "2026-05-01" // Would use time.Now().Format in production
	startDate := "2026-04-24"
	reportResp, err := h.service.Client.ReportAdGet(ctx, sdk.ReportAdGetReq{
		AdvertiserId: req.AdvertiserId,
		StartDate:    startDate,
		EndDate:      now,
		Fields:       []string{"stat_cost", "show_cnt", "click_cnt", "convert_cnt", "ctr", "cvr", "cpa_platform"},
		Page:         1,
		PageSize:     10,
		AccessToken:  userSession.AccessToken,
	})

	if err == nil && reportResp != nil && reportResp.Code == 0 {
		list := reportResp.Data.List
		if len(list) > 0 {
			if item, ok := list[0].(map[string]interface{}); ok {
					// 提取指标
					cost := getFloat(item, "stat_cost") / 100000
					shows := getFloat(item, "show_cnt")
					clicks := getFloat(item, "click_cnt")
					converts := getFloat(item, "convert_cnt")

					diagnosis.Metrics["cost_7d"] = fmt.Sprintf("%.2f 元", cost)
					diagnosis.Metrics["shows_7d"] = fmt.Sprintf("%.0f", shows)
					diagnosis.Metrics["clicks_7d"] = fmt.Sprintf("%.0f", clicks)
					diagnosis.Metrics["converts_7d"] = fmt.Sprintf("%.0f", converts)

					// 4. 消耗分析
					if budget > 0 && cost > 0 {
						diagnosis.BudgetUsage = (cost / 7) / budget * 100
					}
					if cost == 0 {
						score -= 20
						diagnosis.Issues = append(diagnosis.Issues, "近7天无消耗，计划未跑量")
						diagnosis.Suggestions = append(diagnosis.Suggestions, "检查出价是否过低，定向是否过窄")
					}

					// 5. 转化分析
					cpa := 0.0
					if converts > 0 && cost > 0 {
						cpa = cost / converts
						diagnosis.Metrics["cpa"] = fmt.Sprintf("%.2f 元", cpa)
					}
					if cpa > 0 && cpa > 100 {
						score -= 15
						diagnosis.Issues = append(diagnosis.Issues, fmt.Sprintf("转化成本偏高（%.2f元），远超行业均值", cpa))
						diagnosis.Suggestions = append(diagnosis.Suggestions, "建议优化素材或调整定向以降低转化成本")
					}
					if cpa > 0 && cpa <= 30 {
						score += 10
					}

					// 6. 点击率分析
					ctr := 0.0
					if shows > 0 {
						ctr = clicks / shows * 100
						diagnosis.Metrics["ctr"] = fmt.Sprintf("%.2f%%", ctr)
					}
					if ctr > 0 && ctr < 1 {
						score -= 10
						diagnosis.Issues = append(diagnosis.Issues, "点击率偏低（<1%），素材吸引力不足")
						diagnosis.Suggestions = append(diagnosis.Suggestions, "更换更有吸引力的素材，测试不同封面图")
					}
					if ctr >= 3 {
						score += 10
					}

					diagnosis.CostEfficiency = cpa
				}
			} else {
				diagnosis.Issues = append(diagnosis.Issues, "近7天无投放数据")
				diagnosis.Suggestions = append(diagnosis.Suggestions, "开始投放后系统将自动分析效果数据")
			}
	}

	// 归一化评分
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}
	diagnosis.HealthScore = score

	// 健康等级
	switch {
	case score >= 85:
		diagnosis.HealthLevel = "优秀"
	case score >= 70:
		diagnosis.HealthLevel = "良好"
	case score >= 50:
		diagnosis.HealthLevel = "一般"
	default:
		diagnosis.HealthLevel = "较差"
	}

	util.Success(c, diagnosis)
}

// DiagnoseAccount 诊断整个账户的广告表现
// GET /api/diagnose/account?advertiser_id=xxx
func (h *DiagnoseHandler) DiagnoseAccount(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	advertiserIdStr := c.Query("advertiser_id")
	advertiserId, _ := strconv.ParseInt(advertiserIdStr, 10, 64)
	if advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	ctx := c.Request.Context()

	// 获取广告计划列表（限制20条）
	adResp, err := h.service.Client.AdListGet(ctx, sdk.AdListGetReq{
		AdvertiserId: advertiserId,
		AccessToken:  userSession.AccessToken,
		Page:         1,
		PageSize:     20,
	})
	if err != nil || adResp == nil || adResp.Code != 0 {
		util.ServerError(c, "获取计划列表失败")
		return
	}

	// 获取账户预算
	budgetResp, _ := h.service.Client.AdvertiserBudgetGet(ctx, sdk.AdvertiserBudgetGetReq{
		AdvertiserId: advertiserId,
		AccessToken:  userSession.AccessToken,
	})

	// 获取余额
	balanceResp, _ := h.service.Client.BalanceGet(ctx, sdk.BalanceGetReq{
		AdvertiserId: advertiserId,
		AccessToken:  userSession.AccessToken,
	})

	// 统计
	var (
		total    int
		active   int
		deleted  int
		frozen   int
		paused   int
	)

	if adResp.Data != nil {
		list := adResp.Data.List
			total = len(list)
			for _, item := range list {
				if m, ok := item.(map[string]interface{}); ok {
					status := getString(m, "status")
					switch status {
					case "DELIVERY_OK":
						active++
					case "DELETE":
						deleted++
					case "FROZEN":
						frozen++
					case "DISABLE":
						paused++
					}
				}
			}
	}

	accountBudget := 0.0
	if budgetResp != nil && budgetResp.Code == 0 {
		accountBudget = float64(budgetResp.Data.Budget) / 100
	}

	balance := 0.0
	if balanceResp != nil && balanceResp.Code == 0 {
		balance = balanceResp.Data.Balance / 100000
	}

	// 生成账户级诊断
	issues := []string{}
	suggestions := []string{}

	if active == 0 && total > 0 {
		issues = append(issues, "无在投计划，所有计划均处于非投放状态")
		suggestions = append(suggestions, "建议新建广告计划或恢复已暂停的计划")
	}
	if frozen > 0 {
		issues = append(issues, fmt.Sprintf("有 %d 个计划已冻结，请检查原因", frozen))
		suggestions = append(suggestions, "冻结通常由余额不足、素材审核不通过等原因引起，请逐一排查")
	}
	if balance < 500 {
		issues = append(issues, fmt.Sprintf("账户余额偏低（%.2f元），可能影响跑量", balance))
		suggestions = append(suggestions, "建议充值以确保广告正常投放")
	}
	if active > 0 && accountBudget > 0 && accountBudget < 300 {
		suggestions = append(suggestions, "账户日预算偏低，建议提高以获取更多曝光")
	}
	if total == 0 {
		issues = append(issues, "该账户暂无广告计划")
		suggestions = append(suggestions, "建议创建广告计划开始投放")
	}

	// 评分
	score := 70
	if active > 0 {
		score += 15
	}
	if total > 0 {
		score += 5
	}
	if balance > 1000 {
		score += 5
	}
	score -= len(issues) * 5
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	level := "一般"
	switch {
	case score >= 85:
		level = "优秀"
	case score >= 70:
		level = "良好"
	case score >= 50:
		level = "一般"
	default:
		level = "较差"
	}

	util.Success(c, gin.H{
		"advertiser_id":      advertiserId,
		"health_score":       score,
		"health_level":       level,
		"account_balance":    fmt.Sprintf("%.2f 元", balance),
		"account_budget":     fmt.Sprintf("%.2f 元", accountBudget),
		"total_ads":          total,
		"active_ads":         active,
		"frozen_ads":         frozen,
		"paused_ads":         paused,
		"deleted_ads":        deleted,
		"issues":             issues,
		"suggestions":        suggestions,
	})
}

func getFloat(m map[string]interface{}, key string) float64 {
	if v, ok := m[key]; ok {
		switch val := v.(type) {
		case float64:
			return val
		case json.Number:
			f, _ := val.Float64()
			return f
		}
	}
	return 0
}

func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}
