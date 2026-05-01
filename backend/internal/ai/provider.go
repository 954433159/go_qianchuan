package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Provider 表示 AI 服务提供商类型
// 参考 cc-copilot-bridge 的多提供商路由设计
type Provider string

const (
	ProviderClaude  Provider = "claude"  // Anthropic Claude API
	ProviderOpenAI  Provider = "openai"  // OpenAI GPT API
	ProviderOllama  Provider = "ollama"  // 本地 Ollama 模型
	ProviderDefault Provider = ""        // 自动选择
)

// ModelConfig 单个模型的配置
type ModelConfig struct {
	Provider    Provider `json:"provider"`
	Model       string   `json:"model"`
	APIKey      string   `json:"-"` // 不从 JSON 序列化
	BaseURL     string   `json:"base_url"`
	MaxTokens   int      `json:"max_tokens"`
	Temperature float64  `json:"temperature"`
}

// Message 聊天消息
type Message struct {
	Role    string `json:"role"`    // system, user, assistant
	Content string `json:"content"`
}

// ChatRequest AI 聊天请求
type ChatRequest struct {
	Messages    []Message `json:"messages"`
	MaxTokens   int       `json:"max_tokens,omitempty"`
	Temperature float64   `json:"temperature,omitempty"`
}

// ChatResponse AI 聊天响应
type ChatResponse struct {
	Content    string `json:"content"`
	Model      string `json:"model"`
	TokensUsed int    `json:"tokens_used"`
	Provider   string `json:"provider"`
}

// MultiProvider 多提供商路由器
// 参考 cc-copilot-bridge: 支持 Claude/GPT/Ollama 自动切换
type MultiProvider struct {
	providers map[Provider]*ModelConfig
	fallback  []Provider // 降级顺序
	client    *http.Client
}

// NewMultiProvider 创建多提供商路由器
func NewMultiProvider() *MultiProvider {
	mp := &MultiProvider{
		providers: make(map[Provider]*ModelConfig),
		client:    &http.Client{Timeout: 60 * time.Second},
	}

	// 从环境变量加载配置
	if key := os.Getenv("ANTHROPIC_API_KEY"); key != "" {
		mp.providers[ProviderClaude] = &ModelConfig{
			Provider:    ProviderClaude,
			Model:       getEnv("CLAUDE_MODEL", "claude-sonnet-4-6"),
			APIKey:      key,
			BaseURL:     getEnv("CLAUDE_BASE_URL", "https://api.anthropic.com/v1"),
			MaxTokens:   4096,
			Temperature: 0.7,
		}
		mp.fallback = append(mp.fallback, ProviderClaude)
	}

	if key := os.Getenv("OPENAI_API_KEY"); key != "" {
		mp.providers[ProviderOpenAI] = &ModelConfig{
			Provider:    ProviderOpenAI,
			Model:       getEnv("OPENAI_MODEL", "gpt-4o"),
			APIKey:      key,
			BaseURL:     getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
			MaxTokens:   4096,
			Temperature: 0.7,
		}
		mp.fallback = append(mp.fallback, ProviderOpenAI)
	}

	if url := os.Getenv("OLLAMA_BASE_URL"); url != "" {
		mp.providers[ProviderOllama] = &ModelConfig{
			Provider: ProviderOllama,
			Model:    getEnv("OLLAMA_MODEL", "qwen2.5:7b"),
			BaseURL:  url,
		}
		mp.fallback = append(mp.fallback, ProviderOllama)
	}

	return mp
}

// Chat 发送聊天请求，支持多提供商自动降级
// 参考 claude-code-go: 会话管理 + 流式响应 + 自动重试
func (mp *MultiProvider) Chat(req ChatRequest) (*ChatResponse, error) {
	if len(mp.fallback) == 0 {
		return nil, fmt.Errorf("未配置任何 AI 提供商，请设置 ANTHROPIC_API_KEY / OPENAI_API_KEY / OLLAMA_BASE_URL")
	}

	var lastErr error
	for _, provider := range mp.fallback {
		cfg, ok := mp.providers[provider]
		if !ok {
			continue
		}
		resp, err := mp.callProvider(cfg, req)
		if err == nil {
			return resp, nil
		}
		lastErr = err
		// 自动降级到下一个提供商
	}

	return nil, fmt.Errorf("所有 AI 提供商均调用失败，最后错误: %v", lastErr)
}

// callProvider 调用单个 AI 提供商
func (mp *MultiProvider) callProvider(cfg *ModelConfig, req ChatRequest) (*ChatResponse, error) {
	switch cfg.Provider {
	case ProviderClaude:
		return mp.callClaude(cfg, req)
	case ProviderOpenAI:
		return mp.callOpenAI(cfg, req)
	case ProviderOllama:
		return mp.callOllama(cfg, req)
	default:
		return nil, fmt.Errorf("不支持的提供商: %s", cfg.Provider)
	}
}

// callClaude 调用 Anthropic Claude API
func (mp *MultiProvider) callClaude(cfg *ModelConfig, req ChatRequest) (*ChatResponse, error) {
	// 转换消息格式为 Anthropic 格式
	systemMsg := ""
	var anthropicMsgs []map[string]interface{}
	for _, msg := range req.Messages {
		if msg.Role == "system" {
			systemMsg = msg.Content
		} else {
			anthropicMsgs = append(anthropicMsgs, map[string]interface{}{
				"role":    msg.Role,
				"content": msg.Content,
			})
		}
	}

	body := map[string]interface{}{
		"model":      cfg.Model,
		"max_tokens": cfg.MaxTokens,
		"messages":   anthropicMsgs,
	}
	if systemMsg != "" {
		body["system"] = systemMsg
	}
	if req.Temperature > 0 {
		body["temperature"] = req.Temperature
	} else {
		body["temperature"] = cfg.Temperature
	}

	resp, err := mp.doJSON("POST", cfg.BaseURL+"/messages", body, map[string]string{
		"x-api-key":         cfg.APIKey,
		"anthropic-version": "2023-06-01",
	})
	if err != nil {
		return nil, err
	}

	// 解析 Anthropic 响应
	var result struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
		Usage struct {
			InputTokens  int `json:"input_tokens"`
			OutputTokens int `json:"output_tokens"`
		} `json:"usage"`
	}
	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, fmt.Errorf("解析 Claude 响应失败: %w", err)
	}

	text := ""
	if len(result.Content) > 0 {
		text = result.Content[0].Text
	}

	return &ChatResponse{
		Content:    text,
		Model:      cfg.Model,
		TokensUsed: result.Usage.InputTokens + result.Usage.OutputTokens,
		Provider:   "claude",
	}, nil
}

// callOpenAI 调用 OpenAI API
func (mp *MultiProvider) callOpenAI(cfg *ModelConfig, req ChatRequest) (*ChatResponse, error) {
	var openaiMsgs []map[string]string
	for _, msg := range req.Messages {
		openaiMsgs = append(openaiMsgs, map[string]string{
			"role":    msg.Role,
			"content": msg.Content,
		})
	}

	temp := cfg.Temperature
	if req.Temperature > 0 {
		temp = req.Temperature
	}

	body := map[string]interface{}{
		"model":       cfg.Model,
		"messages":    openaiMsgs,
		"max_tokens":  cfg.MaxTokens,
		"temperature": temp,
	}

	resp, err := mp.doJSON("POST", cfg.BaseURL+"/chat/completions", body, map[string]string{
		"Authorization": "Bearer " + cfg.APIKey,
	})
	if err != nil {
		return nil, err
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Usage struct {
			TotalTokens int `json:"total_tokens"`
		} `json:"usage"`
	}
	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, fmt.Errorf("解析 OpenAI 响应失败: %w", err)
	}

	text := ""
	if len(result.Choices) > 0 {
		text = result.Choices[0].Message.Content
	}

	return &ChatResponse{
		Content:    text,
		Model:      cfg.Model,
		TokensUsed: result.Usage.TotalTokens,
		Provider:   "openai",
	}, nil
}

// callOllama 调用本地 Ollama 模型
func (mp *MultiProvider) callOllama(cfg *ModelConfig, req ChatRequest) (*ChatResponse, error) {
	var ollamaMsgs []map[string]string
	for _, msg := range req.Messages {
		ollamaMsgs = append(ollamaMsgs, map[string]string{
			"role":    msg.Role,
			"content": msg.Content,
		})
	}

	body := map[string]interface{}{
		"model":    cfg.Model,
		"messages": ollamaMsgs,
		"stream":   false,
	}

	resp, err := mp.doJSON("POST", cfg.BaseURL+"/api/chat", body, nil)
	if err != nil {
		return nil, err
	}

	var result struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	}
	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, fmt.Errorf("解析 Ollama 响应失败: %w", err)
	}

	return &ChatResponse{
		Content:  result.Message.Content,
		Model:    cfg.Model,
		Provider: "ollama",
	}, nil
}

// doJSON 发送 JSON 请求
func (mp *MultiProvider) doJSON(method, url string, body interface{}, headers map[string]string) ([]byte, error) {
	jsonBody, _ := json.Marshal(body)
	httpReq, err := http.NewRequest(method, url, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		httpReq.Header.Set(k, v)
	}

	httpResp, err := mp.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("HTTP 请求失败: %w", err)
	}
	defer httpResp.Body.Close()

	respBody, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return nil, err
	}

	if httpResp.StatusCode >= 400 {
		return nil, fmt.Errorf("API 返回错误 %d: %s", httpResp.StatusCode, string(respBody[:min(200, len(respBody))]))
	}

	return respBody, nil
}

// Available 检查是否有可用的 AI 提供商
func (mp *MultiProvider) Available() bool {
	return len(mp.fallback) > 0
}

// Providers 返回已配置的提供商列表
func (mp *MultiProvider) Providers() []string {
	var names []string
	for _, p := range mp.fallback {
		if cfg, ok := mp.providers[p]; ok {
			names = append(names, fmt.Sprintf("%s:%s", cfg.Provider, cfg.Model))
		}
	}
	return names
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
