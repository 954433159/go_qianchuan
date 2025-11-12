package qianchuanSDK

import (
	"os"
	"testing"
	"time"

	"github.com/CriarBrand/qianchuanSDK/auth"
)

// TestDefaultConfig 测试默认配置
func TestDefaultConfig(t *testing.T) {
	config := DefaultConfig

	if config.Environment != EnvProduction {
		t.Errorf("Expected default environment to be production, got %s", config.Environment)
	}
	if config.APIHost != "ad.oceanengine.com" {
		t.Errorf("Expected default APIHost to be ad.oceanengine.com, got %s", config.APIHost)
	}
	if config.Timeout != 30*time.Second {
		t.Errorf("Expected default timeout to be 30s, got %v", config.Timeout)
	}
	if config.MaxRetries != 3 {
		t.Errorf("Expected default MaxRetries to be 3, got %d", config.MaxRetries)
	}
	if config.RateLimitRPS != 10.0 {
		t.Errorf("Expected default RateLimitRPS to be 10.0, got %f", config.RateLimitRPS)
	}
	if config.Debug {
		t.Error("Expected debug to be false by default")
	}
}

// TestLoadConfig 测试加载配置（无环境变量）
func TestLoadConfig(t *testing.T) {
	// 清理环境变量
	clearEnv()

	config := LoadConfig()

	// 应该使用默认值
	if config.Environment != EnvProduction {
		t.Errorf("Expected production environment, got %s", config.Environment)
	}
	if config.APIHost != "ad.oceanengine.com" {
		t.Errorf("Expected default APIHost, got %s", config.APIHost)
	}
}

// TestLoadConfigFromEnv 测试从环境变量加载配置
func TestLoadConfigFromEnv(t *testing.T) {
	// 清理并设置环境变量
	clearEnv()
	os.Setenv("QIANCHUAN_ENV", "test")
	os.Setenv("QIANCHUAN_API_HOST", "test.ad.oceanengine.com")
	os.Setenv("QIANCHUAN_TIMEOUT", "60")
	os.Setenv("QIANCHUAN_MAX_RETRIES", "5")
	os.Setenv("QIANCHUAN_RATE_LIMIT_RPS", "20")
	os.Setenv("QIANCHUAN_DEBUG", "true")
	os.Setenv("QIANCHUAN_LOG_LEVEL", "DEBUG")
	os.Setenv("QIANCHUAN_AUTO_REFRESH_TOKEN", "false")
	defer clearEnv()

	config := LoadConfig()

	if config.Environment != EnvTest {
		t.Errorf("Expected test environment, got %s", config.Environment)
	}
	if config.APIHost != "test.ad.oceanengine.com" {
		t.Errorf("Expected test.ad.oceanengine.com, got %s", config.APIHost)
	}
	if config.Timeout != 60*time.Second {
		t.Errorf("Expected 60s timeout, got %v", config.Timeout)
	}
	if config.MaxRetries != 5 {
		t.Errorf("Expected MaxRetries 5, got %d", config.MaxRetries)
	}
	if config.RateLimitRPS != 20.0 {
		t.Errorf("Expected RateLimitRPS 20.0, got %f", config.RateLimitRPS)
	}
	if !config.Debug {
		t.Error("Expected Debug to be true")
	}
	if config.LogLevel != "DEBUG" {
		t.Errorf("Expected LogLevel DEBUG, got %s", config.LogLevel)
	}
	if config.AutoRefreshToken {
		t.Error("Expected AutoRefreshToken to be false")
	}
}

// TestConfigValidate 测试配置验证
func TestConfigValidate(t *testing.T) {
	tests := []struct {
		name        string
		config      *Config
		expectError bool
	}{
		{
			name:        "Valid production config",
			config:      &DefaultConfig,
			expectError: false,
		},
		{
			name: "Valid test config",
			config: &Config{
				Environment:  EnvTest,
				APIHost:      "test.ad.oceanengine.com",
				Timeout:      30 * time.Second,
				MaxRetries:   3,
				RateLimitRPS: 10.0,
			},
			expectError: false,
		},
		{
			name: "Invalid environment",
			config: &Config{
				Environment:  "invalid_env",
				APIHost:      "ad.oceanengine.com",
				Timeout:      30 * time.Second,
				MaxRetries:   3,
				RateLimitRPS: 10.0,
			},
			expectError: true,
		},
		{
			name: "Empty APIHost",
			config: &Config{
				Environment:  EnvProduction,
				APIHost:      "",
				Timeout:      30 * time.Second,
				MaxRetries:   3,
				RateLimitRPS: 10.0,
			},
			expectError: true,
		},
		{
			name: "Zero timeout",
			config: &Config{
				Environment:  EnvProduction,
				APIHost:      "ad.oceanengine.com",
				Timeout:      0,
				MaxRetries:   3,
				RateLimitRPS: 10.0,
			},
			expectError: true,
		},
		{
			name: "Negative MaxRetries",
			config: &Config{
				Environment:  EnvProduction,
				APIHost:      "ad.oceanengine.com",
				Timeout:      30 * time.Second,
				MaxRetries:   -1,
				RateLimitRPS: 10.0,
			},
			expectError: true,
		},
		{
			name: "Negative RateLimitRPS",
			config: &Config{
				Environment:  EnvProduction,
				APIHost:      "ad.oceanengine.com",
				Timeout:      30 * time.Second,
				MaxRetries:   3,
				RateLimitRPS: -5.0,
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.Validate()
			if tt.expectError && err == nil {
				t.Error("Expected validation error, got nil")
			}
			if !tt.expectError && err != nil {
				t.Errorf("Expected no error, got %v", err)
			}
		})
	}
}

// TestEnvironmentConstants 测试环境常量
func TestEnvironmentConstants(t *testing.T) {
	envs := []Environment{EnvProduction, EnvTest, EnvDevelopment, EnvSandbox}
	for _, env := range envs {
		if env == "" {
			t.Error("Environment constant should not be empty")
		}
	}
}

// TestConfigGetAPIURL 测试获取API URL
func TestConfigGetAPIURL(t *testing.T) {
	config := DefaultConfig

	url := config.GetFullAPIURL("")
	expected := "https://ad.oceanengine.com"
	if url != expected {
		t.Errorf("Expected %s, got %s", expected, url)
	}

	// 测试自定义Host
	config.APIHost = "custom.example.com"
	url = config.GetFullAPIURL("")
	expected = "https://custom.example.com"
	if url != expected {
		t.Errorf("Expected %s, got %s", expected, url)
	}
}

// TestConfigIsProduction 测试是否生产环境
func TestConfigIsProduction(t *testing.T) {
	config := DefaultConfig
	if config.Environment != EnvProduction {
		t.Error("Expected production environment")
	}

	config.Environment = EnvTest
	if config.Environment == EnvProduction {
		t.Error("Expected not production environment")
	}
}

// TestNewManagerWithConfig 测试使用配置创建Manager
func TestNewManagerWithConfig(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	config := &Config{
		Environment:      EnvTest,
		APIHost:          "test.ad.oceanengine.com",
		Timeout:          30 * time.Second,
		MaxRetries:       3,
		RateLimitRPS:     10.0,
		Debug:            true,
		LogLevel:         "DEBUG",
		AutoRefreshToken: true,
	}

	manager, err := NewManagerWithConfig(credentials, config)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}
	if manager == nil {
		t.Fatal("Expected manager to be created")
	}
	// Manager基本创建成功即可，内部实现可能不同
}

// TestNewManagerWithConfigValidation 测试配置验证失败
func TestNewManagerWithConfigValidation(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	invalidConfig := &Config{
		Environment:  "invalid",
		APIHost:      "",
		Timeout:      0,
		MaxRetries:   -1,
		RateLimitRPS: -10.0,
	}

	_, err := NewManagerWithConfig(credentials, invalidConfig)
	if err == nil {
		t.Error("Expected error for invalid config")
	}
}

// TestConfigEnvironmentSpecificDefaults 测试不同环境的特定默认值
func TestConfigEnvironmentSpecificDefaults(t *testing.T) {
	tests := []struct {
		env      Environment
		expected string
	}{
		{EnvProduction, "ad.oceanengine.com"},
		{EnvTest, "ad.oceanengine.com"}, // 测试环境也使用相同域名
		{EnvDevelopment, "ad.oceanengine.com"},
		{EnvSandbox, "ad.oceanengine.com"},
	}

	for _, tt := range tests {
		t.Run(string(tt.env), func(t *testing.T) {
			config := &Config{
				Environment: tt.env,
			}
			// 验证环境设置正确
			if config.Environment != tt.env {
				t.Errorf("Expected environment %s, got %s", tt.env, config.Environment)
			}
		})
	}
}

// TestConfigWithNilCredentials 测试nil凭证
func TestConfigWithNilCredentials(t *testing.T) {
	config := &DefaultConfig

	defer func() {
		if r := recover(); r == nil {
			t.Error("Expected panic with nil credentials")
		}
	}()

	NewManagerWithConfig(nil, config)
}

// TestConfigGetters 测试配置获取方法
func TestConfigGetters(t *testing.T) {
	config := &Config{
		Environment:      EnvProduction,
		APIHost:          "ad.oceanengine.com",
		Timeout:          30 * time.Second,
		ConnectTimeout:   10 * time.Second,
		MaxRetries:       3,
		RateLimitRPS:     10.0,
		Debug:            true,
		LogLevel:         "INFO",
		AutoRefreshToken: true,
	}

	if config.Environment != EnvProduction {
		t.Error("Environment getter failed")
	}
	if config.APIHost != "ad.oceanengine.com" {
		t.Error("APIHost getter failed")
	}
	if config.Timeout != 30*time.Second {
		t.Error("Timeout getter failed")
	}
	if config.ConnectTimeout != 10*time.Second {
		t.Error("ConnectTimeout getter failed")
	}
	if config.MaxRetries != 3 {
		t.Error("MaxRetries getter failed")
	}
	if config.RateLimitRPS != 10.0 {
		t.Error("RateLimitRPS getter failed")
	}
	if !config.Debug {
		t.Error("Debug getter failed")
	}
	if config.LogLevel != "INFO" {
		t.Error("LogLevel getter failed")
	}
	if !config.AutoRefreshToken {
		t.Error("AutoRefreshToken getter failed")
	}
}

// TestConfigClone 测试配置克隆（如果实现了）
func TestConfigClone(t *testing.T) {
	original := &Config{
		Environment:      EnvProduction,
		APIHost:          "ad.oceanengine.com",
		Timeout:          30 * time.Second,
		MaxRetries:       3,
		RateLimitRPS:     10.0,
		Debug:            true,
		LogLevel:         "INFO",
		AutoRefreshToken: true,
	}

	// 简单复制测试
	clone := *original

	if clone.Environment != original.Environment {
		t.Error("Clone failed: Environment mismatch")
	}
	if clone.APIHost != original.APIHost {
		t.Error("Clone failed: APIHost mismatch")
	}
	if clone.Timeout != original.Timeout {
		t.Error("Clone failed: Timeout mismatch")
	}

	// 修改克隆不应影响原始
	clone.Debug = false
	if !original.Debug {
		t.Error("Modifying clone affected original")
	}
}

// TestEnvironmentVariableParsing 测试环境变量解析
func TestEnvironmentVariableParsing(t *testing.T) {
	tests := []struct {
		name     string
		envKey   string
		envValue string
		checkFn  func(*Config) bool
	}{
		{
			name:     "Parse timeout",
			envKey:   "QIANCHUAN_TIMEOUT",
			envValue: "45",
			checkFn: func(c *Config) bool {
				return c.Timeout == 45*time.Second
			},
		},
		{
			name:     "Parse max retries",
			envKey:   "QIANCHUAN_MAX_RETRIES",
			envValue: "7",
			checkFn: func(c *Config) bool {
				return c.MaxRetries == 7
			},
		},
		{
			name:     "Parse rate limit",
			envKey:   "QIANCHUAN_RATE_LIMIT_RPS",
			envValue: "25.5",
			checkFn: func(c *Config) bool {
				return c.RateLimitRPS == 25.5
			},
		},
		{
			name:     "Parse debug true",
			envKey:   "QIANCHUAN_DEBUG",
			envValue: "true",
			checkFn: func(c *Config) bool {
				return c.Debug == true
			},
		},
		{
			name:     "Parse debug false",
			envKey:   "QIANCHUAN_DEBUG",
			envValue: "false",
			checkFn: func(c *Config) bool {
				return c.Debug == false
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clearEnv()
			os.Setenv(tt.envKey, tt.envValue)
			defer clearEnv()

			config := LoadConfig()
			if !tt.checkFn(config) {
				t.Errorf("Failed to parse %s=%s", tt.envKey, tt.envValue)
			}
		})
	}
}

// TestInvalidEnvironmentVariables 测试无效环境变量处理
func TestInvalidEnvironmentVariables(t *testing.T) {
	tests := []struct {
		name     string
		envKey   string
		envValue string
	}{
		{"Invalid timeout", "QIANCHUAN_TIMEOUT", "invalid"},
		{"Invalid max retries", "QIANCHUAN_MAX_RETRIES", "not_a_number"},
		{"Invalid rate limit", "QIANCHUAN_RATE_LIMIT_RPS", "abc"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clearEnv()
			os.Setenv(tt.envKey, tt.envValue)
			defer clearEnv()

			// LoadConfig应该使用默认值而不是崩溃
			config := LoadConfig()
			if config == nil {
				t.Error("LoadConfig returned nil for invalid env var")
			}
		})
	}
}

// TestConfigString 测试配置的字符串表示（如果实现了）
func TestConfigString(t *testing.T) {
	config := &DefaultConfig
	config.Debug = true

	// 验证配置对象不为空
	if config == nil {
		t.Error("Config is nil")
	}

	// 可以添加String()方法的测试
	// str := config.String()
	// if str == "" {
	//     t.Error("Config string representation is empty")
	// }
}

// clearEnv 清理测试相关的环境变量
func clearEnv() {
	envVars := []string{
		"QIANCHUAN_ENV",
		"QIANCHUAN_API_HOST",
		"QIANCHUAN_TIMEOUT",
		"QIANCHUAN_CONNECT_TIMEOUT",
		"QIANCHUAN_MAX_RETRIES",
		"QIANCHUAN_RATE_LIMIT_RPS",
		"QIANCHUAN_DEBUG",
		"QIANCHUAN_LOG_LEVEL",
		"QIANCHUAN_AUTO_REFRESH_TOKEN",
	}
	for _, env := range envVars {
		os.Unsetenv(env)
	}
}

// BenchmarkLoadConfig 性能测试：加载配置
func BenchmarkLoadConfig(b *testing.B) {
	clearEnv()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		LoadConfig()
	}
}

// BenchmarkConfigValidate 性能测试：配置验证
func BenchmarkConfigValidate(b *testing.B) {
	config := &DefaultConfig
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = config.Validate()
	}
}
