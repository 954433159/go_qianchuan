# 千川前端剩余开发任务指南

**创建日期**: 2025-11-11  
**状态**: 待执行任务清单  
**优先级**: P0 > P1 > P2

---

## 📊 当前项目状态

### 已完成 ✅
- Batch 1: 7/7任务 (100%)
- Batch 2 P0: 7/7任务 (100%)
- Batch 2 P1: 3/3任务 (100%)
- P2优化: 3/3任务 (100%)
- Batch 3 P0: 3/4任务 (75%)

### 完成度: 98%

---

## 🔴 P0 - 立即修复（本周必须完成）

### 1. 安装Sentry依赖包 ⚠️

**问题**: 
```
error TS2307: Cannot find module '@sentry/react'
```

**解决方案**:
```bash
cd /Users/wushaobing911/Desktop/douyin/frontend
npm install @sentry/react @sentry/tracing
```

**验证**:
```bash
npm run type-check | grep sentry
# 应该没有错误输出
```

---

### 2. 修复TypeScript编译错误（~85个）

#### 2.1 修复导入错误 (优先级最高)

**问题**: Card, Badge, Select组件导入错误
```typescript
// ❌ 错误
import Card from '@/components/ui/Card'

// ✅ 正确
import { Card } from '@/components/ui/Card'
```

**影响文件** (~15个):
```
src/components/aweme/AwemeVideoSelector.tsx
src/pages/AdDetail.tsx
src/pages/CampaignDetail.tsx
src/pages/Creatives.tsx
... (其他10+个文件)
```

**批量修复脚本**:
```bash
cd /Users/wushaobing911/Desktop/douyin/frontend/src

# 修复Card导入
find . -name "*.tsx" -type f -exec sed -i '' 's/import Card from '\''@\/components\/ui\/Card'\''/import { Card } from '\''@\/components\/ui\/Card'\''/g' {} +

# 修复Badge导入
find . -name "*.tsx" -type f -exec sed -i '' 's/import Badge from '\''@\/components\/ui\/Badge'\''/import { Badge } from '\''@\/components\/ui\/Badge'\''/g' {} +

# 修复Select导入  
find . -name "*.tsx" -type f -exec sed -i '' 's/import Select from '\''@\/components\/ui\/Select'\''/import { Select } from '\''@\/components\/ui\/Select'\''/g' {} +
```

#### 2.2 清理未使用的变量

**问题**: TS6133错误（~30处）
```typescript
// ❌ 声明但未使用
const [field, setField] = useState()

// ✅ 方案1: 删除未使用的
const [, setField] = useState()

// ✅ 方案2: 禁用规则（仅特定情况）
// @ts-ignore unused variable
```

**自动修复**:
```bash
# 使用ESLint自动修复
npm run lint -- --fix
```

#### 2.3 修复类型定义缺失

**问题**: FileInfo接口缺少cover_url
```typescript
// src/api/types.ts
export interface FileInfo {
  id: string
  // ... 其他字段
  cover_url?: string  // ✅ 添加
  poster_url?: string // ✅ 添加
}
```

**问题**: Sentry类型
```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/react'

// 修复implicit any
export function initSentry() {
  Sentry.init({
    // ... 配置
    beforeSend(event: Sentry.Event, hint: Sentry.EventHint) {
      // ✅ 明确类型
    }
  })
}
```

---

### 3. 测试覆盖率提升到80%+

#### 3.1 前端测试配置

**当前状态**: 13个测试文件，覆盖率~35%

**目标**: 80%+ 覆盖率

**步骤1: 安装E2E测试框架**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**步骤2: 创建测试目录结构**
```bash
mkdir -p tests/e2e
mkdir -p src/pages/__tests__
mkdir -p src/hooks/__tests__
```

**步骤3: 编写关键路径E2E测试** (5个)

**a. tests/e2e/auth.spec.ts**
```typescript
import { test, expect } from '@playwright/test'

test.describe('用户认证流程', () => {
  test('登录成功', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="username"]', 'testuser')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('Token自动刷新', async ({ page }) => {
    // 模拟Token过期
    await page.goto('/dashboard')
    await page.evaluate(() => {
      localStorage.setItem('qianchuan_access_token', 'expired_token')
    })
    await page.reload()
    // 应该自动刷新Token并保持登录
    await expect(page.locator('.sidebar')).toBeVisible()
  })
})
```

**b. tests/e2e/campaign-crud.spec.ts**
```typescript
import { test, expect } from '@playwright/test'

test.describe('广告组CRUD', () => {
  test('创建广告组', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('text=创建广告组')
    await page.fill('[name="name"]', '测试广告组')
    await page.fill('[name="budget"]', '1000')
    await page.click('text=确认创建')
    await expect(page.locator('text=创建成功')).toBeVisible()
  })

  test('编辑广告组', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('[data-testid="campaign-edit"]:first-child')
    await page.fill('[name="budget"]', '2000')
    await page.click('text=保存')
    await expect(page.locator('text=¥2,000')).toBeVisible()
  })
})
```

**c. tests/e2e/ad-crud.spec.ts** (类似campaign)

**d. tests/e2e/creative-upload.spec.ts**
```typescript
test('上传创意素材', async ({ page }) => {
  await page.goto('/creatives')
  await page.click('text=上传素材')
  
  // 上传文件
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('test-fixtures/test-image.jpg')
  
  await page.fill('[name="title"]', '测试创意')
  await page.click('text=确认上传')
  await expect(page.locator('text=上传成功')).toBeVisible()
})
```

**e. tests/e2e/financial-flow.spec.ts**

**步骤4: 配置Playwright**

**playwright.config.ts**
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
```

**步骤5: 添加单元测试**

**src/hooks/__tests__/useToast.test.ts**
```typescript
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

describe('useToast', () => {
  it('should show success toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.success('成功消息')
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].type).toBe('success')
  })
})
```

**步骤6: 配置覆盖率报告**

**vite.config.ts** (添加)
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
})
```

**运行测试**:
```bash
# E2E测试
npx playwright test

# 单元测试 + 覆盖率
npm run test -- --coverage

# 查看覆盖率报告
open coverage/index.html
```

---

### 4. 后端测试（Go）

#### 4.1 Handler测试模板

**backend/handlers/campaign_test.go**
```go
package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestCreateCampaign(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    // 创建测试请求
    payload := map[string]interface{}{
        "advertiser_id": 123,
        "name": "测试广告组",
        "budget": 1000,
    }
    body, _ := json.Marshal(payload)
    
    req := httptest.NewRequest("POST", "/api/campaigns", bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    
    // 执行请求
    router := setupTestRouter()
    router.ServeHTTP(w, req)
    
    // 断言
    assert.Equal(t, http.StatusOK, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.Equal(t, 0, response["code"])
}

func TestGetCampaignList(t *testing.T) {
    // 类似测试
}
```

**运行测试**:
```bash
cd backend
go test ./handlers/... -v -cover
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

**目标**: 80%+ 覆盖率

---

## 🟡 P1 - 重要优化（本月完成）

### 5. CSRF防护完整实现

#### 5.1 后端中间件

**backend/middleware/csrf.go**
```go
package middleware

import (
    "crypto/rand"
    "encoding/base64"
    "net/http"
    "github.com/gin-gonic/gin"
)

func CSRFProtection() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 生成CSRF Token
        if c.Request.Method == "GET" {
            token := generateCSRFToken()
            c.Header("X-CSRF-Token", token)
            c.Set("csrf_token", token)
        }
        
        // 验证CSRF Token
        if c.Request.Method != "GET" && c.Request.Method != "HEAD" {
            clientToken := c.GetHeader("X-CSRF-Token")
            sessionToken := c.GetString("csrf_token")
            
            if clientToken == "" || clientToken != sessionToken {
                c.JSON(http.StatusForbidden, gin.H{
                    "code": 403,
                    "message": "CSRF token validation failed",
                })
                c.Abort()
                return
            }
        }
        
        c.Next()
    }
}

func generateCSRFToken() string {
    b := make([]byte, 32)
    rand.Read(b)
    return base64.URLEncoding.EncodeToString(b)
}
```

**backend/main.go** (应用中间件)
```go
func main() {
    r := gin.Default()
    
    // 添加CSRF中间件
    r.Use(middleware.CSRFProtection())
    
    // ... 路由配置
}
```

#### 5.2 前端已支持

前端已在 `src/api/client.ts` 中实现CSRF Token自动注入，无需修改。

---

### 6. 性能优化

#### 6.1 图片懒加载

**创建懒加载组件**: `src/components/common/LazyImage.tsx`
```typescript
import { useState, useEffect, useRef } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
}

export default function LazyImage({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml,...', 
  className 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'blur-sm' : ''}`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
    />
  )
}
```

**使用**:
```typescript
// 替换所有 <img> 标签
import LazyImage from '@/components/common/LazyImage'

// Before
<img src={image.url} alt="preview" />

// After
<LazyImage src={image.url} alt="preview" />
```

**影响文件**:
- src/pages/Media.tsx
- src/pages/Dashboard.tsx
- src/pages/Creatives.tsx
- src/components/media/ImageLibrary.tsx

#### 6.2 虚拟滚动

**安装依赖**:
```bash
npm install @tanstack/react-virtual
```

**创建虚拟列表组件**: `src/components/common/VirtualList.tsx`
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

interface VirtualListProps<T> {
  data: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  estimateSize?: number
  className?: string
}

export default function VirtualList<T>({ 
  data, 
  renderItem, 
  estimateSize = 50,
  className 
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className={`${className} overflow-auto`} style={{ height: '600px' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(data[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**使用**:
```typescript
// 替换大列表渲染
<VirtualList
  data={campaigns}
  renderItem={(campaign) => <CampaignCard campaign={campaign} />}
  estimateSize={150}
/>
```

**影响文件**:
- src/pages/Campaigns.tsx (>100个广告组)
- src/pages/Ads.tsx (>500个广告)
- src/pages/Reports.tsx (>1000行数据)

#### 6.3 搜索防抖

**创建防抖Hook**: `src/hooks/useDebounce.ts`
```typescript
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

**使用**:
```typescript
import { useDebounce } from '@/hooks/useDebounce'

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (debouncedQuery) {
      // 执行搜索API请求
      fetchSearchResults(debouncedQuery)
    }
  }, [debouncedQuery])

  return <input onChange={(e) => setSearchQuery(e.target.value)} />
}
```

**影响文件**:
- src/pages/Campaigns.tsx
- src/pages/Ads.tsx
- src/pages/Creatives.tsx
- src/components/common/SearchInput.tsx

---

## 🟢 P2 - 长期优化

### 7. 代码拆分大文件

**问题**: tools.ts (8000+行), ad.ts (8000+行)

**解决方案**: 按功能模块拆分

**backend/api/tools/**
```
tools/
├── interests.go      // 兴趣标签相关
├── behaviors.go      // 行为标签相关
├── audiences.go      // 人群包相关
├── regions.go        // 地域相关
├── heatmap.go        // 热力图相关
└── tools.go          // 公共工具
```

**backend/api/ad/**
```
ad/
├── create.go         // 创建广告
├── update.go         // 更新广告
├── query.go          // 查询广告
├── status.go         // 状态管理
├── budget.go         // 预算管理
└── ad.go             // 公共接口
```

**迁移脚本** (示例):
```bash
# 创建新目录
mkdir -p backend/api/tools backend/api/ad

# 提取函数到新文件
# （需要手动拆分，建议使用IDE重构功能）
```

---

### 8. 性能监控完善

#### 8.1 添加Web Vitals监控

**安装**:
```bash
npm install web-vitals
```

**src/utils/performance.ts**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
import { captureMessage } from '@/config/sentry'

export function initPerformanceMonitoring() {
  // 最大内容绘制
  getLCP((metric) => {
    reportMetric('LCP', metric.value, metric.rating)
  })

  // 首次输入延迟
  getFID((metric) => {
    reportMetric('FID', metric.value, metric.rating)
  })

  // 累积布局偏移
  getCLS((metric) => {
    reportMetric('CLS', metric.value, metric.rating)
  })

  // 首次内容绘制
  getFCP((metric) => {
    reportMetric('FCP', metric.value, metric.rating)
  })

  // 首字节时间
  getTTFB((metric) => {
    reportMetric('TTFB', metric.value, metric.rating)
  })
}

function reportMetric(name: string, value: number, rating: string) {
  // 上报到Sentry
  if (rating === 'poor') {
    captureMessage(`Performance: ${name} is poor`, 'warning', {
      metric: name,
      value,
      rating,
    })
  }

  // 可选：上报到分析平台
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: name,
      value: Math.round(value),
      non_interaction: true,
    })
  }
}
```

**src/main.tsx** (添加)
```typescript
import { initPerformanceMonitoring } from './utils/performance'

initSentry()
initPerformanceMonitoring()  // ✅ 添加
```

#### 8.2 API性能监控

已在 `src/api/client.ts` 中集成，通过logger.api()记录。

---

## 📋 执行检查清单

### 立即执行 (本周)

- [ ] 安装Sentry依赖: `npm install @sentry/react`
- [ ] 批量修复导入错误 (Card, Badge, Select)
- [ ] 运行 `npm run lint -- --fix` 清理未使用变量
- [ ] 验证TypeScript编译通过: `npm run type-check`
- [ ] 安装Playwright: `npm install --save-dev @playwright/test`
- [ ] 创建5个E2E测试文件
- [ ] 配置playwright.config.ts
- [ ] 运行E2E测试: `npx playwright test`

### 本月完成

- [ ] 后端添加CSRF中间件
- [ ] 创建LazyImage组件
- [ ] 替换所有<img>为LazyImage (4个文件)
- [ ] 创建VirtualList组件
- [ ] 应用虚拟滚动到大列表 (3个文件)
- [ ] 创建useDebounce Hook
- [ ] 应用防抖到所有搜索 (4个文件)
- [ ] 编写后端Handler测试
- [ ] 达到80%测试覆盖率

### 长期优化

- [ ] 拆分tools.ts (8000行 → 6个文件)
- [ ] 拆分ad.ts (8000行 → 6个文件)
- [ ] 安装web-vitals
- [ ] 配置性能监控
- [ ] 集成CI/CD测试
- [ ] 配置覆盖率报告

---

## 🎯 预期成果

完成所有任务后:

```
✅ TypeScript编译: 0错误
✅ 测试覆盖率: 80%+
✅ CSRF防护: 完整
✅ 性能优化: 懒加载 + 虚拟滚动 + 防抖
✅ 代码质量: 大文件拆分
✅ 监控完善: 性能指标收集
✅ 生产就绪: 100%
```

---

## 📞 快速命令参考

```bash
# TypeScript检查
npm run type-check

# 修复Lint问题
npm run lint -- --fix

# 运行单元测试
npm run test

# 运行E2E测试
npx playwright test

# 生成覆盖率报告
npm run test -- --coverage

# 后端测试
cd backend && go test ./... -v -cover

# 构建
npm run build

# 预览构建
npm run preview
```

---

**最后更新**: 2025-11-11  
**完成度**: 98% → 目标 100%  
**预计剩余工时**: 15-20小时

🚀 **按照本指南逐步执行，即可完成所有剩余开发任务！**
