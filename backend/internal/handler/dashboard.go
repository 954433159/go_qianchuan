package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/util"
	"github.com/gin-gonic/gin"
)

// DashboardHandler 仪表盘处理器
// 提供跨账号聚合统计、AI诊断等高级功能
type DashboardHandler struct {
	service *service.QianchuanService
}

// NewDashboardHandler 创建仪表盘处理器
func NewDashboardHandler(svc *service.QianchuanService) *DashboardHandler {
	return &DashboardHandler{service: svc}
}

// AccountSummary 单个账号汇总
type AccountSummary struct {
	AdvertiserId   int64   `json:"advertiser_id"`
	AdvertiserName string  `json:"advertiser_name"`
	Company        string  `json:"company"`
	Balance        float64 `json:"balance"`         // 账户余额（元）
	ValidBalance   float64 `json:"valid_balance"`   // 可用余额（元）
	CashBalance    float64 `json:"cash_balance"`    // 现金余额（元）
	GrantBalance   float64 `json:"grant_balance"`   // 赠款余额（元）
	CampaignCount  int     `json:"campaign_count"`  // 广告组数量
	AdCount        int     `json:"ad_count"`         // 广告计划数量
	Budget         float64 `json:"budget"`           // 日预算（元）
	BudgetMode     string  `json:"budget_mode"`      // 预算模式
}

// DashboardSummary 仪表盘汇总
type DashboardSummary struct {
	TotalAccounts  int              `json:"total_accounts"`
	TotalBalance   float64          `json:"total_balance"`    // 总余额
	TotalCash      float64          `json:"total_cash"`       // 总现金
	TotalGrant     float64          `json:"total_grant"`      // 总赠款
	TotalCampaigns int              `json:"total_campaigns"`
	TotalAds       int              `json:"total_ads"`
	Accounts       []AccountSummary `json:"accounts"`
}

// Summary 仪表盘汇总 - 聚合全部托管账号的核心指标
// GET /api/dashboard/summary
func (h *DashboardHandler) Summary(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	ids := getManagedAdvertiserIDs()
	if len(ids) == 0 {
		util.BadRequest(c, "未配置 MANAGED_ADVERTISER_IDS 环境变量")
		return
	}

	// 第一步：批量获取账号基本信息
	infoResp, err := h.service.Client.AdvertiserInfo(c.Request.Context(), sdk.AdvertiserInfoReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserIds: ids,
	})
	if err != nil || infoResp == nil || infoResp.Code != 0 {
		// 降级：即使获取详情失败也继续
		log.Printf("[Dashboard] AdvertiserInfo failed: %v", err)
	}

	// 构建账号名称映射
	nameMap := make(map[int64]AccountSummary)
	for _, info := range infoResp.Data {
		nameMap[info.AdvertiserId] = AccountSummary{
			AdvertiserId:   info.AdvertiserId,
			AdvertiserName: info.AdvertiserName,
			Company:        info.Company,
		}
	}

	// 第二步：并发查询各账号余额、预算、投放数据
	var (
		mu      sync.Mutex
		wg      sync.WaitGroup
		results []AccountSummary
	)

	sem := make(chan struct{}, 5) // 最多5个并发

	for _, id := range ids {
		wg.Add(1)
		go func(advertiserId int64) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			summary := AccountSummary{AdvertiserId: advertiserId}
			if s, ok := nameMap[advertiserId]; ok {
				summary.AdvertiserName = s.AdvertiserName
				summary.Company = s.Company
			}

			ctx := context.Background()

			// 查询余额
			if balResp, err := h.service.Client.BalanceGet(ctx, sdk.BalanceGetReq{
				AdvertiserId: advertiserId,
				AccessToken:  userSession.AccessToken,
			}); err == nil && balResp != nil && balResp.Code == 0 {
				summary.Balance = balResp.Data.Balance / 100000
				summary.ValidBalance = balResp.Data.ValidBalance / 100000
				summary.CashBalance = balResp.Data.Cash / 100000
				summary.GrantBalance = balResp.Data.Grant / 100000
			}

			// 查询预算
			if budgetResp, err := h.service.Client.AdvertiserBudgetGet(ctx, sdk.AdvertiserBudgetGetReq{
				AdvertiserId: advertiserId,
				AccessToken:  userSession.AccessToken,
			}); err == nil && budgetResp != nil && budgetResp.Code == 0 {
				summary.Budget = float64(budgetResp.Data.Budget) / 100
				summary.BudgetMode = budgetResp.Data.BudgetMode
			}

			// 查询广告组数量
			if campResp, err := h.service.Client.CampaignListGet(ctx, sdk.CampaignListGetReq{
				AdvertiserId: advertiserId,
				AccessToken:  userSession.AccessToken,
				Page:         1,
				PageSize:     1,
			}); err == nil && campResp != nil && campResp.Code == 0 && campResp.Data != nil {
				summary.CampaignCount = int(campResp.Data.PageInfo.TotalNumber)
			}

			// 查询广告计划数量
			if adResp, err := h.service.Client.AdListGet(ctx, sdk.AdListGetReq{
				AdvertiserId: advertiserId,
				AccessToken:  userSession.AccessToken,
				Page:         1,
				PageSize:     1,
			}); err == nil && adResp != nil && adResp.Code == 0 && adResp.Data != nil {
				summary.AdCount = int(adResp.Data.PageInfo.TotalNumber)
			}

			mu.Lock()
			results = append(results, summary)
			mu.Unlock()
		}(id)
	}
	wg.Wait()

	// 第三步：汇总
	dashboard := DashboardSummary{
		TotalAccounts: len(results),
		Accounts:      results,
	}
	for _, r := range results {
		dashboard.TotalBalance += r.Balance
		dashboard.TotalCash += r.CashBalance
		dashboard.TotalGrant += r.GrantBalance
		dashboard.TotalCampaigns += r.CampaignCount
		dashboard.TotalAds += r.AdCount
	}

	util.Success(c, dashboard)
}

// BatchBalance 批量查询多账号余额
// POST /api/dashboard/batch_balance  body: {"ids": [1,2,3]}
func (h *DashboardHandler) BatchBalance(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	var req struct {
		Ids []int64 `json:"ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	if len(req.Ids) == 0 {
		req.Ids = getManagedAdvertiserIDs()
	}

	type result struct {
		AdvertiserId int64   `json:"advertiser_id"`
		Name         string  `json:"name"`
		Balance      float64 `json:"balance"`
		Cash         float64 `json:"cash"`
		Grant        float64 `json:"grant"`
		Budget       float64 `json:"budget"`
		BudgetMode   string  `json:"budget_mode"`
		Error        string  `json:"error,omitempty"`
	}

	var results []result
	for _, id := range req.Ids {
		r := result{AdvertiserId: id}
		if balResp, err := h.service.Client.BalanceGet(c.Request.Context(), sdk.BalanceGetReq{
			AdvertiserId: id, AccessToken: userSession.AccessToken,
		}); err == nil && balResp.Code == 0 {
			r.Balance = balResp.Data.Balance / 100000
			r.Cash = balResp.Data.Cash / 100000
			r.Grant = balResp.Data.Grant / 100000
		} else {
			r.Error = "查询失败"
		}
		if budgetResp, err := h.service.Client.AdvertiserBudgetGet(c.Request.Context(), sdk.AdvertiserBudgetGetReq{
			AdvertiserId: id, AccessToken: userSession.AccessToken,
		}); err == nil && budgetResp.Code == 0 {
			r.Budget = float64(budgetResp.Data.Budget) / 100
			r.BudgetMode = budgetResp.Data.BudgetMode
		}
		results = append(results, r)
	}

	util.Success(c, results)
}

// ExportCSV 导出报表为CSV
// GET /api/dashboard/export_csv?advertiser_id=xxx&start_date=2026-04-01&end_date=2026-04-30
func (h *DashboardHandler) ExportCSV(c *gin.Context) {
	userSession, ok := middleware.GetUserSession(c)
	if !ok {
		util.Unauthorized(c, "")
		return
	}

	advertiserId, _ := strconv.ParseInt(c.Query("advertiser_id"), 10, 64)
	startDate := c.DefaultQuery("start_date", "2026-04-01")
	endDate := c.DefaultQuery("end_date", "2026-04-30")

	if advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	resp, err := h.service.Client.ReportAdGet(c.Request.Context(), sdk.ReportAdGetReq{
		AdvertiserId: advertiserId,
		StartDate:    startDate,
		EndDate:      endDate,
		Fields:       []string{"stat_cost", "show_cnt", "click_cnt", "convert_cnt", "ctr", "cvr", "cpa_platform"},
		Page:         1,
		PageSize:     100,
		AccessToken:  userSession.AccessToken,
	})
	if err != nil || resp == nil || resp.Code != 0 {
		util.ServerError(c, "获取报表数据失败")
		return
	}

	// 构建 CSV
	var sb strings.Builder
	sb.WriteString("日期,消耗(元),展示次数,点击次数,转化次数,点击率(%),转化率(%),转化成本(元)\n")

	for _, item := range resp.Data.List {
		if m, ok := item.(map[string]interface{}); ok {
			cost := getFloatFromMap(m, "stat_cost") / 100000
			shows := getFloatFromMap(m, "show_cnt")
			clicks := getFloatFromMap(m, "click_cnt")
			converts := getFloatFromMap(m, "convert_cnt")
			ctr := getFloatFromMap(m, "ctr")
			cvr := getFloatFromMap(m, "cvr")
			cpa := getFloatFromMap(m, "cpa_platform") / 100000

			sb.WriteString(fmt.Sprintf("%s,%.2f,%.0f,%.0f,%.0f,%.2f,%.2f,%.2f\n",
				startDate, cost, shows, clicks, converts, ctr, cvr, cpa))
		}
	}

	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=report_%d_%s_%s.csv", advertiserId, startDate, endDate))
	c.String(200, sb.String())
}

func getFloatFromMap(m map[string]interface{}, key string) float64 {
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

// getManagedAdvertiserIDs 从环境变量读取托管账户ID列表
func getManagedAdvertiserIDs() []int64 {
	idsStr := os.Getenv("MANAGED_ADVERTISER_IDS")
	if idsStr == "" {
		return nil
	}
	parts := strings.Split(idsStr, ",")
	ids := make([]int64, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if id, err := strconv.ParseInt(p, 10, 64); err == nil && id > 0 {
			ids = append(ids, id)
		}
	}
	return ids
}
