package qianchuanSDK

import (
	"context"
	"fmt"
	"sync"
	"time"
	
	"github.com/CriarBrand/qianchuanSDK/auth"
)

// RateLimiter 限流器
type RateLimiter struct {
	rate     float64       // 每秒允许的请求数
	capacity int           // 令牌桶容量
	tokens   float64       // 当前令牌数
	lastTime time.Time     // 上次更新时间
	mu       sync.Mutex    // 互斥锁
}

// NewRateLimiter 创建限流器
// rate: 每秒允许的请求数
// capacity: 令牌桶容量（通常设置为rate的2-3倍）
func NewRateLimiter(rate float64, capacity int) *RateLimiter {
	// 处理负数情况
	if rate < 0 {
		rate = 0
	}
	if capacity < 0 {
		capacity = 0
	}
	
	return &RateLimiter{
		rate:     rate,
		capacity: capacity,
		tokens:   float64(capacity), // 初始令牌数满
		lastTime: time.Now(),
	}
}

// Wait 等待获取令牌（阻塞）
func (rl *RateLimiter) Wait(ctx context.Context) error {
	for {
		if allowed := rl.Allow(); allowed {
			return nil
		}
		
		// 计算需要等待的时间
		waitTime := rl.calculateWaitTime()
		
		select {
		case <-time.After(waitTime):
			// 继续尝试
		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

// Allow 检查是否允许请求（非阻塞）
func (rl *RateLimiter) Allow() bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	// 补充令牌
	rl.refillTokens()
	
	// 检查是否有可用令牌
	if rl.tokens >= 1.0 {
		rl.tokens -= 1.0
		return true
	}
	
	return false
}

// refillTokens 补充令牌（内部方法，需要持有锁）
func (rl *RateLimiter) refillTokens() {
	now := time.Now()
	elapsed := now.Sub(rl.lastTime).Seconds()
	
	// 根据经过的时间补充令牌
	newTokens := elapsed * rl.rate
	rl.tokens += newTokens
	
	// 令牌数不能超过容量
	if rl.tokens > float64(rl.capacity) {
		rl.tokens = float64(rl.capacity)
	}
	
	rl.lastTime = now
}

// calculateWaitTime 计算需要等待的时间
func (rl *RateLimiter) calculateWaitTime() time.Duration {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	rl.refillTokens()
	
	if rl.tokens >= 1.0 {
		return 0
	}
	
	// 计算获得1个令牌需要的时间
	tokensNeeded := 1.0 - rl.tokens
	waitSeconds := tokensNeeded / rl.rate
	return time.Duration(waitSeconds * float64(time.Second))
}

// GetRate 获取当前速率
func (rl *RateLimiter) GetRate() float64 {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	return rl.rate
}

// SetRate 设置新的速率
func (rl *RateLimiter) SetRate(rate float64) {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	rl.rate = rate
}

// GetTokens 获取当前令牌数（用于调试）
func (rl *RateLimiter) GetTokens() float64 {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	rl.refillTokens()
	return rl.tokens
}

// ManagerWithRateLimit Manager with 限流器
type ManagerWithRateLimit struct {
	*Manager
	rateLimiter *RateLimiter
}

// NewManagerWithRateLimit 创建带限流的Manager
func NewManagerWithRateLimit(credentials *auth.Credentials, rps float64) *ManagerWithRateLimit {
	manager := NewManager(credentials, nil)
	return &ManagerWithRateLimit{
		Manager:     manager,
		rateLimiter: NewRateLimiter(rps, int(rps*2)),
	}
}

// WaitForRateLimit 等待限流器允许
func (m *ManagerWithRateLimit) WaitForRateLimit(ctx context.Context) error {
	return m.rateLimiter.Wait(ctx)
}

// GetRateLimiter 获取限流器
func (m *ManagerWithRateLimit) GetRateLimiter() *RateLimiter {
	return m.rateLimiter
}

// Example 使用示例
func ExampleRateLimiter() {
	// 创建限流器：每秒10个请求
	limiter := NewRateLimiter(10, 20)
	
	ctx := context.Background()
	
	// 方式1：阻塞等待
	if err := limiter.Wait(ctx); err != nil {
		fmt.Printf("限流等待失败: %v\n", err)
		return
	}
	// 执行请求...
	
	// 方式2：非阻塞检查
	if limiter.Allow() {
		// 执行请求...
	} else {
		fmt.Println("请求被限流")
	}
}
