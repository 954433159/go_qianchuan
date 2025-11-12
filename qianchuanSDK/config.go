package qianchuanSDK

import (
	"fmt"
	"os"
	"strconv"
	"time"
	
	"github.com/CriarBrand/qianchuanSDK/auth"
)

// Environment 环境类型
type Environment string

const (
	// EnvProduction 生产环境
	EnvProduction Environment = "production"
	
	// EnvTest 测试环境
	EnvTest Environment = "test"
	
	// EnvDevelopment 开发环境
	EnvDevelopment Environment = "development"
	
	// EnvSandbox 沙箱环境
	EnvSandbox Environment = "sandbox"
)

// Config SDK配置
type Config struct {
	// 环境配置
	Environment Environment
	APIHost     string
	APIScheme   string
	
	// 超时配置
	Timeout         time.Duration
	ConnectTimeout  time.Duration
	
	// 重试配置
	MaxRetries   int
	RetryBackoff time.Duration
	
	// 限流配置
	RateLimitRPS float64
	
	// 日志配置
	Debug        bool
	LogLevel     string
	
	// Token配置
	AutoRefreshToken bool
	TokenRefreshThreshold time.Duration
}

// DefaultConfig 默认配置
var DefaultConfig = Config{
	Environment:       EnvProduction,
	APIHost:          "ad.oceanengine.com",
	APIScheme:        "https",
	Timeout:          30 * time.Second,
	ConnectTimeout:   10 * time.Second,
	MaxRetries:       3,
	RetryBackoff:     100 * time.Millisecond,
	RateLimitRPS:     10,
	Debug:            false,
	LogLevel:         "INFO",
	AutoRefreshToken: true,
	TokenRefreshThreshold: 5 * time.Minute,
}

// LoadConfig 从环境变量加载配置
func LoadConfig() *Config {
	config := DefaultConfig
	
	// 环境
	if env := getEnv("QIANCHUAN_ENV"); env != "" {
		config.Environment = Environment(env)
	}
	
	// 根据环境设置不同的APIHost
	switch config.Environment {
	case EnvProduction:
		config.APIHost = "ad.oceanengine.com"
	case EnvTest:
		config.APIHost = getEnv("QIANCHUAN_API_HOST", "test-ad.oceanengine.com")
	case EnvDevelopment:
		config.APIHost = getEnv("QIANCHUAN_API_HOST", "dev-ad.oceanengine.com")
	case EnvSandbox:
		config.APIHost = getEnv("QIANCHUAN_API_HOST", "sandbox-ad.oceanengine.com")
	}
	
	// 自定义APIHost（优先级最高）
	if host := getEnv("QIANCHUAN_API_HOST"); host != "" {
		config.APIHost = host
	}
	
	// 超时配置
	if timeout := getEnvDuration("QIANCHUAN_TIMEOUT"); timeout > 0 {
		config.Timeout = timeout
	}
	
	if connectTimeout := getEnvDuration("QIANCHUAN_CONNECT_TIMEOUT"); connectTimeout > 0 {
		config.ConnectTimeout = connectTimeout
	}
	
	// 重试配置
	if maxRetries := getEnvInt("QIANCHUAN_MAX_RETRIES"); maxRetries > 0 {
		config.MaxRetries = maxRetries
	}
	
	// 限流配置
	if rps := getEnvFloat("QIANCHUAN_RATE_LIMIT_RPS"); rps > 0 {
		config.RateLimitRPS = rps
	}
	
	// 日志配置
	if debug := getEnvBool("QIANCHUAN_DEBUG"); debug {
		config.Debug = true
	}
	
	if logLevel := getEnv("QIANCHUAN_LOG_LEVEL"); logLevel != "" {
		config.LogLevel = logLevel
	}
	
	// Token配置
	if autoRefresh := getEnvBool("QIANCHUAN_AUTO_REFRESH_TOKEN"); !autoRefresh {
		config.AutoRefreshToken = false
	}
	
	return &config
}

// Validate 验证配置
func (c *Config) Validate() error {
	// 验证环境
	if !isValidEnvironment(c.Environment) {
		return fmt.Errorf("无效的环境: %s", c.Environment)
	}
	
	if c.APIHost == "" {
		return fmt.Errorf("API Host不能为空")
	}
	
	if c.Timeout <= 0 {
		return fmt.Errorf("Timeout必须大于0")
	}
	
	if c.MaxRetries < 0 {
		return fmt.Errorf("MaxRetries不能为负数")
	}
	
	if c.RateLimitRPS <= 0 {
		return fmt.Errorf("RateLimitRPS必须大于0")
	}
	
	return nil
}

// isValidEnvironment 检查环境是否有效
func isValidEnvironment(env Environment) bool {
	switch env {
	case EnvProduction, EnvTest, EnvDevelopment, EnvSandbox:
		return true
	default:
		return false
	}
}

// GetFullAPIURL 获取完整的API URL
func (c *Config) GetFullAPIURL(path string) string {
	return fmt.Sprintf("%s://%s%s", c.APIScheme, c.APIHost, path)
}

// 辅助函数：获取环境变量（带默认值）
func getEnv(key string, defaultValue ...string) string {
	value := os.Getenv(key)
	if value == "" && len(defaultValue) > 0 {
		return defaultValue[0]
	}
	return value
}

// 辅助函数：获取整数环境变量
func getEnvInt(key string) int {
	value := os.Getenv(key)
	if value == "" {
		return 0
	}
	
	intValue, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}
	return intValue
}

// 辅助函数：获取浮点数环境变量
func getEnvFloat(key string) float64 {
	value := os.Getenv(key)
	if value == "" {
		return 0
	}
	
	floatValue, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0
	}
	return floatValue
}

// 辅助函数：获取布尔环境变量
func getEnvBool(key string) bool {
	value := os.Getenv(key)
	if value == "" {
		return false
	}
	
	boolValue, err := strconv.ParseBool(value)
	if err != nil {
		// 支持 1/0, yes/no, on/off
		switch value {
		case "1", "yes", "on", "true", "TRUE", "True":
			return true
		}
		return false
	}
	return boolValue
}

// 辅助函数：获取时间间隔环境变量（秒）
func getEnvDuration(key string) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return 0
	}
	
	seconds, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}
	return time.Duration(seconds) * time.Second
}

// NewManagerWithConfig 使用配置创建Manager
func NewManagerWithConfig(credentials *auth.Credentials, config *Config) (*Manager, error) {
	if credentials == nil {
		panic("credentials cannot be nil")
	}
	
	if config == nil {
		config = LoadConfig()
	}
	
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("配置验证失败: %w", err)
	}
	
	manager := NewManager(credentials, nil)
	
	// 根据配置设置Debug模式
	if config.Debug {
		// 可以在这里设置client的Debug模式
	}
	
	return manager, nil
}
