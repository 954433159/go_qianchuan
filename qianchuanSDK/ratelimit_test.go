package qianchuanSDK

import (
	"context"
	"sync"
	"sync/atomic"
	"testing"
	"time"
	
	"github.com/CriarBrand/qianchuanSDK/auth"
)

// TestNewRateLimiter 测试创建限流器
func TestNewRateLimiter(t *testing.T) {
	limiter := NewRateLimiter(10, 20)
	if limiter == nil {
		t.Fatal("NewRateLimiter returned nil")
	}
	if limiter.rate != 10 {
		t.Errorf("Expected rate 10, got %f", limiter.rate)
	}
	if limiter.capacity != 20 {
		t.Errorf("Expected capacity 20, got %d", limiter.capacity)
	}
	if limiter.tokens != 20 {
		t.Errorf("Expected initial tokens 20, got %f", limiter.tokens)
	}
}

// TestRateLimiterAllow 测试非阻塞允许检查
func TestRateLimiterAllow(t *testing.T) {
	limiter := NewRateLimiter(10, 10)

	// 应该可以立即获取10个令牌
	for i := 0; i < 10; i++ {
		if !limiter.Allow() {
			t.Errorf("Expected Allow() to return true for request %d", i+1)
		}
	}

	// 令牌用完，下一次应该失败
	if limiter.Allow() {
		t.Error("Expected Allow() to return false when tokens are exhausted")
	}

	// 等待一段时间，令牌应该补充
	time.Sleep(200 * time.Millisecond)
	if !limiter.Allow() {
		t.Error("Expected Allow() to return true after waiting for token refill")
	}
}

// TestRateLimiterWait 测试阻塞等待
func TestRateLimiterWait(t *testing.T) {
	limiter := NewRateLimiter(10, 10)
	ctx := context.Background()

	// 快速消耗所有令牌
	for i := 0; i < 10; i++ {
		if err := limiter.Wait(ctx); err != nil {
			t.Errorf("Unexpected error on request %d: %v", i+1, err)
		}
	}

	// 下一次应该阻塞并等待
	start := time.Now()
	if err := limiter.Wait(ctx); err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	elapsed := time.Since(start)

	// 应该等待约100ms（1/10秒）
	if elapsed < 50*time.Millisecond || elapsed > 200*time.Millisecond {
		t.Errorf("Expected wait time ~100ms, got %v", elapsed)
	}
}

// TestRateLimiterWaitWithContext 测试带上下文的等待
func TestRateLimiterWaitWithContext(t *testing.T) {
	limiter := NewRateLimiter(1, 1) // 每秒1个请求

	// 消耗唯一的令牌
	limiter.Allow()

	// 创建会取消的上下文
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	// 等待应该被上下文取消打断
	err := limiter.Wait(ctx)
	if err == nil {
		t.Error("Expected context cancellation error")
	}
	if err != context.DeadlineExceeded {
		t.Errorf("Expected DeadlineExceeded, got %v", err)
	}
}

// TestRateLimiterConcurrent 测试并发访问
func TestRateLimiterConcurrent(t *testing.T) {
	limiter := NewRateLimiter(100, 100) // 每秒100个请求
	ctx := context.Background()

	var wg sync.WaitGroup
	var successCount int32
	goroutines := 200

	start := time.Now()

	// 启动200个goroutine，每个尝试获取1个令牌
	for i := 0; i < goroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := limiter.Wait(ctx); err == nil {
				atomic.AddInt32(&successCount, 1)
			}
		}()
	}

	wg.Wait()
	elapsed := time.Since(start)

	// 所有请求都应该成功
	if successCount != int32(goroutines) {
		t.Errorf("Expected %d successful requests, got %d", goroutines, successCount)
	}

	// 应该需要约1秒（因为限流100/秒，200个请求需要2秒，但初始有100个令牌）
	expectedTime := 1 * time.Second
	if elapsed < expectedTime-100*time.Millisecond || elapsed > expectedTime+300*time.Millisecond {
		t.Logf("Elapsed time: %v (expected ~1s)", elapsed)
	}
}

// TestRateLimiterSetRate 测试动态设置速率
func TestRateLimiterSetRate(t *testing.T) {
	limiter := NewRateLimiter(10, 10)

	// 验证初始速率
	if limiter.rate != 10 {
		t.Errorf("Expected initial rate 10, got %f", limiter.rate)
	}

	// 修改速率
	limiter.SetRate(20)
	if limiter.rate != 20 {
		t.Errorf("Expected rate 20, got %f", limiter.rate)
	}

	// 验证新速率生效
	for i := 0; i < 10; i++ {
		limiter.Allow()
	}

	// 现在速率是20/秒，应该很快补充令牌
	time.Sleep(100 * time.Millisecond) // 100ms应该补充约2个令牌
	if !limiter.Allow() {
		t.Error("Expected Allow() to return true after rate increase")
	}
}

// TestRateLimiterZeroRate 测试零速率
func TestRateLimiterZeroRate(t *testing.T) {
	limiter := NewRateLimiter(0, 10)

	// 初始令牌应该可用
	if !limiter.Allow() {
		t.Error("Expected initial tokens to be available")
	}

	// 消耗所有令牌
	for i := 0; i < 9; i++ {
		limiter.Allow()
	}

	// 零速率意味着不补充令牌
	time.Sleep(200 * time.Millisecond)
	if limiter.Allow() {
		t.Error("Expected no token refill with zero rate")
	}
}

// TestRateLimiterHighRate 测试高速率
func TestRateLimiterHighRate(t *testing.T) {
	limiter := NewRateLimiter(1000, 1000) // 每秒1000个请求
	ctx := context.Background()

	// 应该能快速处理大量请求
	start := time.Now()
	for i := 0; i < 500; i++ {
		if err := limiter.Wait(ctx); err != nil {
			t.Errorf("Unexpected error: %v", err)
		}
	}
	elapsed := time.Since(start)

	// 500个请求在1000/秒的速率下应该很快完成
	if elapsed > 600*time.Millisecond {
		t.Errorf("Expected fast completion, got %v", elapsed)
	}
}

// TestRateLimiterTokenRefill 测试令牌补充机制
func TestRateLimiterTokenRefill(t *testing.T) {
	limiter := NewRateLimiter(10, 10)

	// 消耗5个令牌
	for i := 0; i < 5; i++ {
		limiter.Allow()
	}

	// 等待500ms，应该补充约5个令牌
	time.Sleep(500 * time.Millisecond)

	// 现在应该有约10个令牌（剩余5个 + 补充5个）
	count := 0
	for i := 0; i < 15; i++ {
		if limiter.Allow() {
			count++
		}
	}

	// 应该能获取约10个令牌（允许一些误差）
	if count < 8 || count > 12 {
		t.Errorf("Expected ~10 tokens, got %d", count)
	}
}

// TestRateLimiterCapacity 测试容量限制
func TestRateLimiterCapacity(t *testing.T) {
	limiter := NewRateLimiter(10, 5) // 速率10/秒，但容量只有5

	// 等待足够长时间让令牌补充
	time.Sleep(1 * time.Second)

	// 最多只能获取5个令牌（容量限制）
	count := 0
	for i := 0; i < 10; i++ {
		if limiter.Allow() {
			count++
		}
	}

	if count != 5 {
		t.Errorf("Expected exactly 5 tokens due to capacity limit, got %d", count)
	}
}

// TestRateLimiterBurst 测试突发请求
func TestRateLimiterBurst(t *testing.T) {
	limiter := NewRateLimiter(5, 20) // 速率5/秒，容量20
	ctx := context.Background()

	// 立即发送20个请求（使用初始容量）
	var wg sync.WaitGroup
	errors := make(chan error, 20)

	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := limiter.Wait(ctx); err != nil {
				errors <- err
			}
		}()
	}

	wg.Wait()
	close(errors)

	// 所有请求都应该成功
	for err := range errors {
		t.Errorf("Unexpected error: %v", err)
	}
}

// TestNewManagerWithRateLimit 测试带限流的Manager
func TestNewManagerWithRateLimit(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	rps := 10.0

	manager := NewManagerWithRateLimit(credentials, rps)
	if manager == nil {
		t.Fatal("NewManagerWithRateLimit returned nil")
	}
}

// TestManagerWithRateLimitIntegration 测试Manager与限流器集成
func TestManagerWithRateLimitIntegration(t *testing.T) {
	credentials := auth.New(123456, "test_secret")
	manager := NewManagerWithRateLimit(credentials, 5) // 每秒5个请求

	if manager == nil {
		t.Fatal("Manager not initialized")
	}
}

// BenchmarkRateLimiterAllow 性能测试：非阻塞检查
func BenchmarkRateLimiterAllow(b *testing.B) {
	limiter := NewRateLimiter(1000, 1000)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		limiter.Allow()
	}
}

// BenchmarkRateLimiterWait 性能测试：阻塞等待
func BenchmarkRateLimiterWait(b *testing.B) {
	limiter := NewRateLimiter(10000, 10000) // 高速率避免真正阻塞
	ctx := context.Background()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = limiter.Wait(ctx)
	}
}

// BenchmarkRateLimiterConcurrent 性能测试：并发访问
func BenchmarkRateLimiterConcurrent(b *testing.B) {
	limiter := NewRateLimiter(10000, 10000)
	ctx := context.Background()

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			_ = limiter.Wait(ctx)
		}
	})
}

// TestRateLimiterEdgeCases 测试边界情况
func TestRateLimiterEdgeCases(t *testing.T) {
	t.Run("Negative rate", func(t *testing.T) {
		limiter := NewRateLimiter(-10, 10)
		// 负速率应该被处理为0或最小值
		if limiter.rate < 0 {
			t.Error("Rate should not be negative")
		}
	})

	t.Run("Zero capacity", func(t *testing.T) {
		limiter := NewRateLimiter(10, 0)
		// 零容量意味着无法存储令牌
		if limiter.Allow() {
			t.Error("Should not allow requests with zero capacity")
		}
	})

	t.Run("Very small rate", func(t *testing.T) {
		limiter := NewRateLimiter(0.1, 1) // 每10秒1个请求
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
		defer cancel()

		limiter.Allow() // 消耗初始令牌
		err := limiter.Wait(ctx)
		if err != context.DeadlineExceeded {
			t.Error("Expected timeout for very slow rate")
		}
	})
}

