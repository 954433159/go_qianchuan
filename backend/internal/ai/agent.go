package ai

import (
	"context"
	"fmt"
	"strings"
)

// AdAgent 千川广告 AI 代理
// 参考 claude-code-go 的代理模式：会话管理 + 子代理编排 + 工具调用
type AdAgent struct {
	ai     *MultiProvider
	ctx    context.Context
	config *AgentConfig
}

// AgentConfig AI 代理配置
type AgentConfig struct {
	MaxRetries     int    // 最大重试次数
	DetailLevel    string // 分析详细程度: brief/normal/detailed
	Language       string // 输出语言
}

// DefaultAgentConfig 默认配置
func DefaultAgentConfig() *AgentConfig {
	return &AgentConfig{
		MaxRetries:  2,
		DetailLevel: "normal",
		Language:    "zh",
	}
}

// NewAdAgent 创建千川广告 AI 代理
func NewAdAgent(ai *MultiProvider) *AdAgent {
	return &AdAgent{
		ai:     ai,
		ctx:    context.Background(),
		config: DefaultAgentConfig(),
	}
}

// AdContext 广告分析上下文
type AdContext struct {
	AdvertiserName string            `json:"advertiser_name"`
	AdName         string            `json:"ad_name"`
	Budget         float64           `json:"budget"`
	Status         string            `json:"status"`
	Metrics        map[string]string `json:"metrics"`
	HealthScore    int               `json:"health_score"`
	Issues         []string          `json:"issues"`
}

// OptimizationSuggestion AI 优化建议
type OptimizationSuggestion struct {
	Category    string   `json:"category"`     // 出价/预算/素材/定向/时段
	Priority    string   `json:"priority"`     // high/medium/low
	Title       string   `json:"title"`        // 建议标题
	Description string   `json:"description"`  // 详细说明
	ExpectedImpact string `json:"expected_impact"` // 预期效果
	ActionItems []string `json:"action_items"` // 操作步骤
}

// SuggestOptimizations 基于广告数据生成 AI 优化建议
// 参考 DA_Multi_Agent_Workflow 的 AI 诊断模式
func (a *AdAgent) SuggestOptimizations(adCtx AdContext) ([]OptimizationSuggestion, error) {
	// 构建 system prompt
	systemPrompt := `你是巨量千川广告投放优化专家。基于提供的广告数据，给出具体可执行的优化建议。

分析维度：
1. 出价策略 - 根据转化成本判断出价是否合理
2. 预算分配 - 根据消耗率建议预算调整
3. 素材优化 - 根据点击率判断素材质量
4. 定向优化 - 根据曝光量判断定向宽窄
5. 时段策略 - 根据投放时段建议调整

输出格式：每条建议包含 category(出价/预算/素材/定向/时段)、priority(high/medium/low)、title、description、expected_impact、action_items

请用中文输出，每条建议简洁明确，直接给出可操作步骤。`

	// 构建 user prompt
	var sb strings.Builder
	sb.WriteString("请分析以下广告数据并给出优化建议：\n\n")
	sb.WriteString(fmt.Sprintf("广告主: %s\n", adCtx.AdvertiserName))
	sb.WriteString(fmt.Sprintf("计划名称: %s\n", adCtx.AdName))
	sb.WriteString(fmt.Sprintf("状态: %s | 预算: %.2f 元 | 健康分: %d/100\n\n", adCtx.Status, adCtx.Budget, adCtx.HealthScore))

	sb.WriteString("关键指标:\n")
	for k, v := range adCtx.Metrics {
		sb.WriteString(fmt.Sprintf("  %s: %s\n", metricLabel(k), v))
	}

	if len(adCtx.Issues) > 0 {
		sb.WriteString("\n已知问题:\n")
		for _, issue := range adCtx.Issues {
			sb.WriteString(fmt.Sprintf("  - %s\n", issue))
		}
	}

	// 如果配置了 AI 提供商，调用 AI；否则使用规则引擎
	if a.ai != nil && a.ai.Available() {
		return a.callAIForSuggestions(systemPrompt, sb.String())
	}

	return a.ruleBasedSuggestions(adCtx), nil
}

// callAIForSuggestions 调用 AI 获取建议
func (a *AdAgent) callAIForSuggestions(systemPrompt, userPrompt string) ([]OptimizationSuggestion, error) {
	resp, err := a.ai.Chat(ChatRequest{
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		MaxTokens:   2000,
		Temperature: 0.3,
	})
	if err != nil {
		return nil, err
	}

	// 从 AI 响应中解析建议
	return a.parseAISuggestions(resp.Content), nil
}

// parseAISuggestions 解析 AI 响应为结构化建议
func (a *AdAgent) parseAISuggestions(content string) []OptimizationSuggestion {
	// 简单的基于段落拆分（实际使用时可根据 AI 输出格式调整）
	suggestions := []OptimizationSuggestion{
		{
			Category:    "ai_analysis",
			Priority:    "medium",
			Title:       "AI 分析结果",
			Description: content,
			ExpectedImpact: "参考 AI 分析",
			ActionItems: []string{"根据 AI 分析调整投放策略"},
		},
	}
	return suggestions
}

// ruleBasedSuggestions 规则引擎：离线模式下的智能建议
// 作为 AI 不可用时的降级方案
func (a *AdAgent) ruleBasedSuggestions(adCtx AdContext) []OptimizationSuggestion {
	var suggestions []OptimizationSuggestion

	cost, _ := parseFloat(adCtx.Metrics["cost_7d"])
	shows, _ := parseFloat(adCtx.Metrics["shows_7d"])
	clicks, _ := parseFloat(adCtx.Metrics["clicks_7d"])
	converts, _ := parseFloat(adCtx.Metrics["converts_7d"])

	// 出价建议
	if converts > 0 && cost > 0 {
		cpa := cost / converts
		if cpa > 100 {
			suggestions = append(suggestions, OptimizationSuggestion{
				Category:    "出价",
				Priority:    "high",
				Title:       "转化成本过高，建议优化出价",
				Description: fmt.Sprintf("当前转化成本约 %.2f 元，远超行业均值。建议降低出价 10-20%% 或切换为控成本投放", cpa),
				ExpectedImpact: "预计转化成本降低15-30%",
				ActionItems: []string{
					"将出价降低到当前转化成本的80%",
					"开启智能出价功能",
					"监控未来3天的成本变化",
				},
			})
		}
	}

	// 预算建议
	dailyBudget := adCtx.Budget
	if dailyBudget > 0 && dailyBudget < 300 {
		suggestions = append(suggestions, OptimizationSuggestion{
			Category:    "预算",
			Priority:    "high",
			Title:       "日预算偏低，建议提升",
			Description: fmt.Sprintf("当前日预算 %.0f 元偏低，可能限制系统跑量能力。建议提升至300元以上", dailyBudget),
			ExpectedImpact: "预计曝光量提升50-100%",
			ActionItems: []string{
				"将日预算调整至300元或更高",
				"观察3天后的消耗率和曝光量变化",
			},
		})
	}

	// 素材建议
	if shows > 0 && clicks > 0 {
		ctr := clicks / shows * 100
		if ctr < 1.5 {
			suggestions = append(suggestions, OptimizationSuggestion{
				Category:    "素材",
				Priority:    "medium",
				Title:       "点击率偏低，建议优化素材",
				Description: fmt.Sprintf("当前点击率 %.1f%%，低于行业均值。建议更换更具吸引力的封面图和标题", ctr),
				ExpectedImpact: "预计点击率提升0.5-1%",
				ActionItems: []string{
					"准备3-5套新素材进行A/B测试",
					"使用高对比度、突出产品卖点的封面图",
					"标题加入紧迫感词汇（限时、新品、特惠）",
				},
			})
		}
	}

	// 跑量建议
	if shows == 0 && adCtx.Budget > 0 {
		suggestions = append(suggestions, OptimizationSuggestion{
			Category:    "定向",
			Priority:    "high",
			Title:       "计划未跑量，建议放宽定向",
			Description: "当前计划无曝光数据，可能因定向过窄或出价过低导致",
			ExpectedImpact: "预计可实现正常跑量",
			ActionItems: []string{
				"放宽地域定向至更多城市",
				"扩大年龄范围至18-50岁",
				"提高出价10-20%作为启动出价",
			},
		})
	}

	// 时段建议
	if adCtx.Status == "DELIVERY_OK" && dailyBudget > 0 {
		suggestions = append(suggestions, OptimizationSuggestion{
			Category:    "时段",
			Priority:    "low",
			Title:       "建议优化投放时段",
			Description: "根据直播带货特点，建议集中在晚间黄金时段（19:00-23:00）加大投放力度",
			ExpectedImpact: "预计转化率提升10-20%",
			ActionItems: []string{
				"设置分时段出价：19-23点提高30%",
				"非黄金时段降低出价或暂停",
			},
		})
	}

	return suggestions
}

// GenerateReportNarrative 生成自然语言报表摘要
// 参考 claude-code-go 的流式响应模式
func (a *AdAgent) GenerateReportNarrative(advertiserName string, metrics map[string]string) string {
	balance := metrics["balance"]
	totalAds := metrics["total_ads"]
	activeAds := metrics["active_ads"]

	var parts []string
	parts = append(parts, fmt.Sprintf("【%s】投放概览：", advertiserName))

	if balance != "" {
		parts = append(parts, fmt.Sprintf("账户余额 %s 元，", balance))
	}
	if totalAds != "" {
		parts = append(parts, fmt.Sprintf("共有 %s 个广告计划，其中 %s 个在投。", totalAds, activeAds))
	}

	return strings.Join(parts, "")
}

func metricLabel(key string) string {
	labels := map[string]string{
		"cost_7d":     "近7天消耗",
		"shows_7d":    "近7天曝光",
		"clicks_7d":   "近7天点击",
		"converts_7d": "近7天转化",
		"ctr":         "点击率",
		"cpa":         "转化成本",
		"budget":      "日预算",
		"budget_mode": "预算模式",
	}
	if label, ok := labels[key]; ok {
		return label
	}
	return key
}

func parseFloat(s string) (float64, error) {
	var f float64
	// 移除 "元", "%" 等后缀
	s = strings.TrimSuffix(s, " 元")
	s = strings.TrimSuffix(s, "元")
	s = strings.TrimSuffix(s, "%")
	_, err := fmt.Sscanf(s, "%f", &f)
	return f, err
}
