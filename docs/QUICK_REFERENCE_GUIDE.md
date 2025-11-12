# 🚀 项目快速参考指南

## 📋 核心命令速查

### 后端开发

```bash
# 快速启动
cd backend && go run cmd/server/main.go

# 运行测试
go test ./... -v
go test ./internal/handler -run TestAuth

# 构建
go build -o bin/server ./cmd/server
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# 代码格式化
go fmt ./...
gofmt -l -w .

# 静态分析
go vet ./...
golangci-lint run ./...

# 依赖管理
go mod tidy
go mod download
go mod graph
```

### 前端开发

```bash
# 快速启动
cd frontend && npm run dev

# 代码检查
npm run lint        # ESLint检查
npm run type-check  # TypeScript类型检查

# 测试
npm test            # Vitest单元测试
npm run test:ui     # 测试UI界面
npm run test:coverage  # 覆盖率报告

# 构建
npm run build       # 生产构建
npm run preview      # 预览构建结果

# 性能分析
npm run build       # 会生成dist/stats.html
# 在浏览器打开 dist/stats.html 查看bundle分析
```

### Docker与部署

```bash
# 查看当前运行状态
docker ps

# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs backend
docker-compose logs frontend

# 停止服务
docker-compose down

# 重启单个服务
docker-compose restart backend
```

### 项目级命令

```bash
# Makefile命令
make help         # 显示所有可用命令
make dev          # 启动开发环境（前后端）
make build        # 构建前后端
make test         # 运行所有测试
make clean        # 清理构建文件
make fmt          # 格式化代码
make lint         # 代码检查
```

---

## 🔍 关键文件速查表

### 后端文件映射

| 功能 | 文件位置 | 作用 |
|------|---------|------|
| **服务器启动** | `backend/cmd/server/main.go` | 主入口，路由定义，中间件配置 |
| **认证逻辑** | `backend/internal/handler/auth.go` | OAuth交换、会话管理、登出 |
| **广告主管理** | `backend/internal/handler/advertiser.go` | 广告主列表、详情查询 |
| **广告计划** | `backend/internal/handler/ad.go` | 广告计划CRUD、状态管理 |
| **广告组** | `backend/internal/handler/campaign.go` | 广告组操作 |
| **创意管理** | `backend/internal/handler/creative.go` | 创意上传、状态更新 |
| **数据报表** | `backend/internal/handler/report.go` | 广告组/计划/创意报表 |
| **文件上传** | `backend/internal/handler/file.go` | 图片/视频上传 |
| **认证中间件** | `backend/internal/middleware/auth.go` | 会话验证、Token检查 |
| **CORS配置** | `backend/internal/middleware/cors.go` | 跨域资源共享设置 |
| **会话管理** | `backend/pkg/session/session.go` | UserSession结构、过期检查 |
| **依赖管理** | `backend/go.mod` | Go依赖声明 |

### 前端文件映射

| 功能 | 文件位置 | 行数 |
|------|---------|------|
| **应用入口** | `frontend/src/main.tsx` | 18 |
| **路由配置** | `frontend/src/App.tsx` | 156 |
| **认证存储** | `frontend/src/store/authStore.ts` | 53 |
| **API客户端** | `frontend/src/api/client.ts` | 220 |
| **认证API** | `frontend/src/api/auth.ts` | 29 |
| **登录页面** | `frontend/src/pages/Login.tsx` | - |
| **仪表板** | `frontend/src/pages/Dashboard.tsx` | - |
| **广告列表** | `frontend/src/pages/Ads.tsx` | - |
| **广告创建** | `frontend/src/pages/AdCreate.tsx` | - |
| **UI组件** | `frontend/src/components/ui/` | 多个 |
| **布局组件** | `frontend/src/components/layout/Layout.tsx` | - |
| **TypeScript配置** | `frontend/tsconfig.json` | - |
| **Vite配置** | `frontend/vite.config.ts` | 82 |

### SDK文件映射

| 功能 | 文件位置 |
|------|---------|
| **OAuth流程** | `qianchuanSDK/oauth.go` |
| **广告主管理** | `qianchuanSDK/advertiser.go` |
| **广告计划** | `qianchuanSDK/ad.go` |
| **广告组** | `qianchuanSDK/campaign.go` |
| **创意管理** | `qianchuanSDK/creative.go` |
| **数据报表** | `qianchuanSDK/report.go` |
| **财务管理** | `qianchuanSDK/finance.go` |
| **文件操作** | `qianchuanSDK/file.go` |
| **HTTP客户端** | `qianchuanSDK/client/` |
| **单元测试** | `qianchuanSDK/*_test.go` |

---

## 🐛 常见问题排查

### 问题：后端启动失败 "APP_ID invalid"

**原因**: 未配置环境变量
```bash
# 解决方案
cd backend
cp .env.example .env
# 编辑.env填入实际的APP_ID和APP_SECRET
cat .env  # 验证配置
go run cmd/server/main.go
```

### 问题：前端无法连接后端

**原因**: CORS配置或后端未启动
```bash
# 检查清单
1. 后端是否运行: lsof -i :8080
2. CORS配置: 检查backend/.env中CORS_ORIGIN
3. 前端API地址: 检查frontend/.env中VITE_API_BASE_URL
4. 查看浏览器DevTools Network标签，找到失败请求查看详情
```

### 问题：Token刷新后登录状态丢失

**原因**: 会话管理或Token刷新逻辑问题
```bash
# 检查
1. 后端日志: docker-compose logs backend | grep -i token
2. 浏览器DevTools: Application > Cookies查看session
3. 验证: backend/pkg/session/session.go中IsExpired()逻辑
```

### 问题：Docker镜像构建失败

**原因**: 依赖缺失或网络问题
```bash
# 解决方案
docker-compose build --no-cache  # 清缓存重建
docker system prune -a  # 清理所有未使用资源
# 检查Dockerfile中的基础镜像是否可访问
```

### 问题：前端build失败 "Out of memory"

**原因**: node_modules过大
```bash
# 解决方案
cd frontend
rm -rf node_modules
npm cache clean --force
npm install  # 重新安装
npm run build
```

---

## 🔑 环境变量快速参考

### 后端环境变量（.env）

```env
# 必填
APP_ID=你的千川AppID
APP_SECRET=你的千川AppSecret

# 可选（有默认值）
PORT=8080                           # 服务器端口
GIN_MODE=debug                      # debug/release
CORS_ORIGIN=http://localhost:3000   # 允许的前端地址
COOKIE_SECRET=生成的32字符密钥      # Session加密密钥
COOKIE_DOMAIN=localhost              # Cookie域名
COOKIE_SECURE=false                 # HTTPS时设true
SESSION_NAME=qianchuan_session      # Session名称
LOG_LEVEL=debug                     # 日志级别
```

### 前端环境变量（.env）

```env
# 必填
VITE_API_BASE_URL=http://localhost:8080/api   # 后端API地址

# 可选
VITE_OAUTH_APP_ID=1846842779198378            # 千川AppID
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_APP_TITLE=千川SDK管理平台
VITE_APP_VERSION=1.0.0
```

---

## 🧪 测试快速指南

### 后端单元测试

```bash
# 运行所有测试
go test ./...

# 运行特定包的测试
go test ./internal/handler -v

# 运行特定测试函数
go test ./internal/handler -run TestAuth

# 生成覆盖率报告
go test ./... -cover
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### 前端单元测试

```bash
# 运行Vitest
npm test

# 监听模式
npm test -- --watch

# 覆盖率报告
npm run test:coverage

# UI模式
npm run test:ui
```

### E2E测试（Playwright）

```bash
# 运行E2E测试（需配置playwright.config.ts）
npm run test:e2e

# 调试模式
npm run test:e2e -- --debug

# 生成报告
npm run test:e2e -- --reporter=html
```

---

## 📊 API调试速查

### 常用API端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/oauth/exchange` | 交换OAuth授权码 |
| GET | `/api/user/info` | 获取用户信息 |
| POST | `/api/auth/logout` | 登出 |
| POST | `/api/auth/refresh` | 刷新Token |
| GET | `/api/advertiser/list` | 获取广告主列表 |
| GET | `/api/advertiser/info` | 获取广告主详情 |
| GET | `/api/qianchuan/ad/list` | 获取广告计划列表 |
| GET | `/api/qianchuan/ad/get?ad_id=xxx` | 获取广告计划详情 |
| POST | `/api/qianchuan/report/ad/get` | 获取广告报表 |

### 使用curl测试

```bash
# 获取访问token
curl -X POST http://localhost:8080/api/oauth/exchange \
  -H "Content-Type: application/json" \
  -d '{"code":"YOUR_AUTH_CODE"}'

# 获取用户信息（需Cookie）
curl -X GET http://localhost:8080/api/user/info \
  -b "qianchuan_session=YOUR_SESSION_ID"

# 刷新token
curl -X POST http://localhost:8080/api/auth/refresh \
  -b "qianchuan_session=YOUR_SESSION_ID"
```

### 使用Postman/Insomnia

1. **导入环境变量**
   ```json
   {
     "API_BASE_URL": "http://localhost:8080",
     "SESSION_ID": "从Cookie中复制"
   }
   ```

2. **设置前置脚本**
   ```javascript
   // 在POST请求后自动更新session
   if (pm.response.code === 200) {
     const sessionCookie = pm.response.headers.get('set-cookie');
     // 提取并保存session
   }
   ```

---

## 🚀 部署流程速查

### 本地快速启动

```bash
# 1. 配置环境
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
cd ..

# 2. 编辑配置文件
# 更新 backend/.env 和 frontend/.env

# 3. Docker启动
docker-compose up -d

# 4. 验证
curl http://localhost:8080/health
curl http://localhost:3000
```

### 生产部署清单

- [ ] 初始化Git仓库: `git init && git add . && git commit`
- [ ] 环境变量: 使用密钥管理服务而非.env文件
- [ ] HTTPS: 启用SSL证书，设置COOKIE_SECURE=true
- [ ] 日志: 配置日志收集（ELK、Datadog等）
- [ ] 监控: 配置性能监控（Prometheus、New Relic等）
- [ ] 备份: 定期备份数据库和配置
- [ ] 测试: 运行完整测试套件
- [ ] CI/CD: 使用GitHub Actions自动部署

---

## 📱 浏览器开发者工具使用

### Network标签调试

```
1. 打开DevTools (F12)
2. 进入Network标签
3. 刷新页面查看所有请求
4. 点击失败请求查看：
   - Headers: 请求头、响应头
   - Preview: 响应内容（格式化）
   - Response: 原始响应
   - Cookies: Session信息
```

### Application标签检查

```
1. 打开DevTools (F12)
2. 进入Application标签
3. Cookies > http://localhost:3000
   - 查看qianchuan_session值
   - 检查过期时间
4. Local Storage
   - 查看是否存储token（不推荐）
5. Session Storage
   - 检查临时会话数据
```

### Console调试

```javascript
// 查看当前认证状态
fetch('/api/user/info').then(r => r.json()).then(console.log)

// 手动调用logout
fetch('/api/auth/logout', {method: 'POST'})

// 检查API配置
fetch('/api/advertiser/list')
  .then(r => r.json())
  .then(d => console.table(d.data?.list))
```

---

## ⚡ 性能优化速查

### 后端优化

```bash
# 性能分析
go test -bench=. -benchmem

# 内存分析
go test -memprofile=mem.prof
go tool pprof mem.prof

# CPU分析
go test -cpuprofile=cpu.prof
go tool pprof cpu.prof
```

### 前端优化

```bash
# 分析bundle大小
npm run build  # 查看 dist/stats.html

# 性能指标
npm run build -- --analyze

# 动态导入优化
// 代码分割示例
const AdCreate = lazy(() => import('./pages/AdCreate'))
```

---

## 🔧 故障排查工具

### 日志查看

```bash
# 后端日志
docker-compose logs -f backend

# 前端日志（需在浏览器console）
console.log('debug info')

# 查看最近50行
docker-compose logs --tail=50 backend
```

### 网络诊断

```bash
# 检查端口是否开放
lsof -i :8080      # 后端
lsof -i :3000      # 前端

# 检查网络连接
nc -zv localhost 8080

# 查看网络流量
tcpdump -i lo port 8080
```

### 进程管理

```bash
# 查看Go进程
ps aux | grep go

# 杀死进程
kill -9 <PID>

# 查看内存使用
top -p <PID>

# 查看文件描述符
lsof -p <PID>
```

---

## 📖 相关文档索引

| 文档 | 位置 | 说明 |
|------|------|------|
| **项目概览** | `README.md` | 快速开始、技术栈、功能列表 |
| **深度检查报告** | `docs/DEEP_INSPECTION_2024-11-12.md` | 项目完整分析、问题清单 |
| **架构设计** | `docs/ARCHITECTURE_STATIC_SITE.md` | 系统架构、数据流 |
| **OAuth流程** | `docs/OAUTH_FLOW_AND_AUTH.md` | 认证流程、安全措施 |
| **API契约** | `docs/API_CONTRACTS.md` | API详细说明、数据格式 |
| **SDK文档** | `qianchuanSDK/README.md` | SDK使用指南 |
| **开发进度** | `docs/DEVELOPMENT_PROGRESS.md` | 项目进度追踪 |

---

## 💡 常用快捷键

### VS Code

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+B` | 启动任务（编译） |
| `Ctrl+Shift+D` | 启动调试 |
| `F5` | 继续运行 |
| `F10` | 单步执行 |
| `F11` | 步进 |
| `Ctrl+K Ctrl+0` | 折叠所有区域 |
| `Ctrl+K Ctrl+J` | 展开所有区域 |
| `Ctrl+Shift+P` | 命令面板 |

### 浏览器DevTools

| 快捷键 | 功能 |
|--------|------|
| `F12` | 打开DevTools |
| `Ctrl+Shift+I` | 打开检查元素 |
| `Ctrl+Shift+C` | 选择元素 |
| `Ctrl+Shift+K` | 打开Console |
| `Ctrl+Shift+E` | 打开Network |

---

**最后更新**: 2024-11-12  
**项目路径**: `/Users/wushaobing911/Desktop/douyin`  
**维护者**: Team  

有问题？查看 `DEEP_INSPECTION_2024-11-12.md` 的问题分析章节 🔍
