# 千川广告系统 - 第三批审查快速参考

**快速查阅**: 问题定位 + 修复命令 + 验证方法  
**适用场景**: 快速修复、代码审查、问题排查

---

## 🔍 问题快速定位

### 安全问题

#### 1. COOKIE_SECRET不安全
```bash
# 检查方法
grep -n "COOKIE_SECRET" backend/.env.example
grep -n "cookieSecret :=" backend/cmd/server/main.go

# 问题位置
backend/cmd/server/main.go:69-79

# 影响
⚠️ 生产环境Session可能被伪造
```

#### 2. CSRF防护缺失
```bash
# 检查方法
grep -rn "X-CSRF-Token" backend/
grep -rn "csrf" backend/internal/middleware/

# 问题位置
backend/internal/middleware/ (缺少csrf.go)

# 影响
⚠️ 可能遭受CSRF攻击
```

---

### 测试覆盖问题

#### 3. 后端Handler无测试
```bash
# 检查方法
ls -la backend/internal/handler/*_test.go
go test ./backend/internal/handler/... -cover

# 问题位置
backend/internal/handler/ (所有Handler)

# 影响
⚠️ 代码质量无保障，重构风险高
```

#### 4. 前端页面无测试
```bash
# 检查方法
ls -la frontend/src/test/pages/
npm run test:coverage

# 问题位置
frontend/src/pages/ (所有页面)

# 影响
⚠️ UI回归测试困难
```

---

### 性能问题

#### 5. 图片懒加载缺失
```bash
# 检查方法
grep -rn 'loading="lazy"' frontend/src/components/media/
grep -rn '<img' frontend/src/components/media/ | grep -v 'loading='

# 问题位置
frontend/src/components/media/ImageLibrary.tsx:150
frontend/src/components/media/VideoLibrary.tsx:180

# 影响
⚠️ 首屏加载慢，流量浪费
```

#### 6. 虚拟滚动缺失
```bash
# 检查方法
grep -rn 'useVirtualizer' frontend/src/
npm list @tanstack/react-virtual

# 问题位置
frontend/src/pages/Campaigns.tsx
frontend/src/pages/Ads.tsx

# 影响
⚠️ 大列表卡顿（>100条数据）
```

#### 7. 搜索防抖缺失
```bash
# 检查方法
grep -rn 'useDebounce' frontend/src/pages/
grep -rn 'onChange.*setKeyword' frontend/src/pages/

# 问题位置
frontend/src/pages/Campaigns.tsx:45
frontend/src/pages/Ads.tsx:52

# 影响
⚠️ 频繁请求，服务器压力大
```

---

## 🛠️ 快速修复命令

### P1-1: COOKIE_SECRET强制检查

```bash
# 1. 备份原文件
cp backend/cmd/server/main.go backend/cmd/server/main.go.bak

# 2. 修改代码（手动编辑）
# 在 Line 69-79 添加生产环境检查

# 3. 验证
GIN_MODE=release go run backend/cmd/server/main.go
# 预期: Fatal error (COOKIE_SECRET not set)

# 4. 生成安全密钥
openssl rand -base64 32
# 复制到 .env 文件
```

---

### P1-2: CSRF Token中间件

```bash
# 1. 创建中间件文件
touch backend/internal/middleware/csrf.go

# 2. 复制代码（从BATCH3_ACTION_PLAN.md）

# 3. 修改main.go
# Line 65: 添加 r.Use(middleware.CSRF())

# 4. 测试
curl -i http://localhost:8080/api/campaigns
# 预期: 响应头包含 X-CSRF-Token

curl -X POST http://localhost:8080/api/campaigns -d '{}'
# 预期: 403 Forbidden

# 5. 前端测试
# 打开浏览器控制台，检查请求头是否包含 X-CSRF-Token
```

---

### P1-3: 后端Handler测试

```bash
# 1. 安装依赖
cd backend
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/mock

# 2. 创建测试文件
touch internal/handler/auth_test.go
touch internal/handler/advertiser_test.go
touch internal/handler/campaign_test.go
touch internal/handler/ad_test.go
touch internal/handler/report_test.go

# 3. 复制测试代码（从BATCH3_ACTION_PLAN.md）

# 4. 运行测试
go test ./internal/handler/... -v -cover

# 5. 查看覆盖率报告
go test ./internal/handler/... -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
open coverage.html
```

---

### P1-4: 前端页面测试

```bash
# 1. 创建测试目录
mkdir -p frontend/src/test/pages

# 2. 创建测试文件
touch frontend/src/test/pages/Dashboard.test.tsx
touch frontend/src/test/pages/Campaigns.test.tsx
touch frontend/src/test/pages/CampaignCreate.test.tsx
touch frontend/src/test/pages/Ads.test.tsx
touch frontend/src/test/pages/AdCreate.test.tsx

# 3. 复制测试代码（从BATCH3_ACTION_PLAN.md）

# 4. 运行测试
cd frontend
npm run test

# 5. 查看覆盖率报告
npm run test:coverage
open coverage/index.html
```

---

### P2-1: 图片懒加载

```bash
# 1. 批量添加 loading="lazy"
# 手动编辑以下文件:
# - frontend/src/components/media/ImageLibrary.tsx
# - frontend/src/components/media/VideoLibrary.tsx
# - frontend/src/pages/Creatives.tsx

# 2. 验证
npm run dev
# 打开浏览器，检查Network面板，图片应该按需加载

# 3. 检查修改
grep -rn 'loading="lazy"' frontend/src/components/media/
# 预期: 至少3处匹配
```

---

### P2-2: 虚拟滚动

```bash
# 1. 安装依赖
cd frontend
npm install @tanstack/react-virtual

# 2. 创建VirtualTable组件
touch frontend/src/components/ui/VirtualTable.tsx

# 3. 复制代码（从BATCH3_ACTION_PLAN.md）

# 4. 应用到页面
# 手动编辑:
# - frontend/src/pages/Campaigns.tsx
# - frontend/src/pages/Ads.tsx
# - frontend/src/pages/Creatives.tsx

# 5. 验证
npm run dev
# 打开浏览器，测试大列表滚动性能
```

---

### P2-3: 搜索防抖

```bash
# 1. 创建useDebounce Hook
touch frontend/src/hooks/useDebounce.ts

# 2. 复制代码（从BATCH3_ACTION_PLAN.md）

# 3. 应用到页面
# 手动编辑:
# - frontend/src/pages/Campaigns.tsx
# - frontend/src/pages/Ads.tsx
# - frontend/src/pages/Creatives.tsx
# - frontend/src/pages/Materials.tsx

# 4. 验证
npm run dev
# 打开浏览器控制台，输入搜索关键词，观察Network面板
# 预期: 停止输入300ms后才发送请求
```

---

## ✅ 快速验证清单

### 安全验证

```bash
# COOKIE_SECRET检查
GIN_MODE=release go run backend/cmd/server/main.go
# ✅ 应该Fatal退出（如果COOKIE_SECRET未设置）

# CSRF Token检查
curl -i http://localhost:8080/api/campaigns | grep X-CSRF-Token
# ✅ 应该返回Token

curl -X POST http://localhost:8080/api/campaigns -d '{}'
# ✅ 应该返回403
```

---

### 测试验证

```bash
# 后端测试
cd backend
go test ./internal/handler/... -cover
# ✅ 覆盖率应该 ≥ 60%

# 前端测试
cd frontend
npm run test:coverage
# ✅ 覆盖率应该 ≥ 40%
```

---

### 性能验证

```bash
# 图片懒加载
grep -c 'loading="lazy"' frontend/src/components/media/*.tsx
# ✅ 应该 ≥ 3

# 虚拟滚动
grep -c 'useVirtualizer' frontend/src/pages/*.tsx
# ✅ 应该 ≥ 3

# 搜索防抖
grep -c 'useDebounce' frontend/src/pages/*.tsx
# ✅ 应该 ≥ 4
```

---

## 📊 一键检查脚本

### 安全检查脚本

```bash
#!/bin/bash
# check_security.sh

echo "=== 安全检查 ==="

# 1. COOKIE_SECRET检查
echo "1. 检查COOKIE_SECRET..."
if grep -q "COOKIE_SECRET=" backend/.env; then
    echo "✅ COOKIE_SECRET已设置"
else
    echo "❌ COOKIE_SECRET未设置"
fi

# 2. CSRF中间件检查
echo "2. 检查CSRF中间件..."
if [ -f "backend/internal/middleware/csrf.go" ]; then
    echo "✅ CSRF中间件已实现"
else
    echo "❌ CSRF中间件缺失"
fi

# 3. HTTPS检查
echo "3. 检查HTTPS配置..."
if grep -q "COOKIE_SECURE=true" backend/.env; then
    echo "✅ HTTPS已启用"
else
    echo "⚠️  HTTPS未启用（开发环境可忽略）"
fi

echo ""
```

---

### 测试覆盖率检查脚本

```bash
#!/bin/bash
# check_coverage.sh

echo "=== 测试覆盖率检查 ==="

# 1. 后端测试
echo "1. 后端测试覆盖率..."
cd backend
COVERAGE=$(go test ./internal/handler/... -cover | grep -oP 'coverage: \K[0-9.]+')
if (( $(echo "$COVERAGE >= 60" | bc -l) )); then
    echo "✅ 后端覆盖率: ${COVERAGE}% (≥60%)"
else
    echo "❌ 后端覆盖率: ${COVERAGE}% (<60%)"
fi
cd ..

# 2. 前端测试
echo "2. 前端测试覆盖率..."
cd frontend
npm run test:coverage > /dev/null 2>&1
COVERAGE=$(grep -oP 'All files.*?\K[0-9.]+' coverage/coverage-summary.json | head -1)
if (( $(echo "$COVERAGE >= 40" | bc -l) )); then
    echo "✅ 前端覆盖率: ${COVERAGE}% (≥40%)"
else
    echo "❌ 前端覆盖率: ${COVERAGE}% (<40%)"
fi
cd ..

echo ""
```

---

### 性能优化检查脚本

```bash
#!/bin/bash
# check_performance.sh

echo "=== 性能优化检查 ==="

# 1. 图片懒加载
echo "1. 检查图片懒加载..."
LAZY_COUNT=$(grep -r 'loading="lazy"' frontend/src/components/media/ | wc -l)
if [ "$LAZY_COUNT" -ge 3 ]; then
    echo "✅ 图片懒加载已实现 (${LAZY_COUNT}处)"
else
    echo "❌ 图片懒加载缺失 (${LAZY_COUNT}处)"
fi

# 2. 虚拟滚动
echo "2. 检查虚拟滚动..."
VIRTUAL_COUNT=$(grep -r 'useVirtualizer' frontend/src/pages/ | wc -l)
if [ "$VIRTUAL_COUNT" -ge 3 ]; then
    echo "✅ 虚拟滚动已实现 (${VIRTUAL_COUNT}处)"
else
    echo "❌ 虚拟滚动缺失 (${VIRTUAL_COUNT}处)"
fi

# 3. 搜索防抖
echo "3. 检查搜索防抖..."
DEBOUNCE_COUNT=$(grep -r 'useDebounce' frontend/src/pages/ | wc -l)
if [ "$DEBOUNCE_COUNT" -ge 4 ]; then
    echo "✅ 搜索防抖已实现 (${DEBOUNCE_COUNT}处)"
else
    echo "❌ 搜索防抖缺失 (${DEBOUNCE_COUNT}处)"
fi

echo ""
```

---

### 一键运行所有检查

```bash
#!/bin/bash
# check_all.sh

echo "======================================"
echo "  千川广告系统 - 第三批审查检查"
echo "======================================"
echo ""

# 运行所有检查
bash check_security.sh
bash check_coverage.sh
bash check_performance.sh

echo "======================================"
echo "  检查完成"
echo "======================================"
```

**使用方法**:
```bash
# 1. 创建检查脚本
cat > check_all.sh << 'EOF'
# ... 复制上面的脚本内容
EOF

# 2. 添加执行权限
chmod +x check_all.sh

# 3. 运行检查
./check_all.sh
```

---

## 🔗 相关文档

- **详细审查报告**: `docs/BATCH3_DEEP_TECHNICAL_AUDIT.md`
- **修复计划**: `docs/BATCH3_ACTION_PLAN.md`
- **开发进度**: `docs/DEVELOPMENT_PROGRESS.md`
- **项目完成报告**: `docs/PROJECT_COMPLETION_REPORT.md`

---

## 📞 问题排查

### 常见问题

#### Q1: COOKIE_SECRET生成失败
```bash
# 解决方法
openssl rand -base64 32

# 或使用Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# 或使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Q2: 后端测试失败
```bash
# 检查依赖
go mod tidy

# 清理缓存
go clean -testcache

# 重新运行
go test ./internal/handler/... -v
```

#### Q3: 前端测试失败
```bash
# 清理缓存
rm -rf node_modules/.vite
rm -rf coverage

# 重新安装
npm ci

# 重新运行
npm run test
```

#### Q4: 虚拟滚动不生效
```bash
# 检查依赖
npm list @tanstack/react-virtual

# 重新安装
npm install @tanstack/react-virtual

# 检查导入
grep -rn 'useVirtualizer' frontend/src/
```

---

**创建时间**: 2025-11-11  
**最后更新**: 2025-11-11  
**维护者**: 开发团队

