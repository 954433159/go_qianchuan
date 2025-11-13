# 千川SDK管理平台

> 基于巨量引擎千川广告SDK的完整全栈管理系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.21+-blue.svg)](https://golang.org/)
[![Node Version](https://img.shields.io/badge/Node-18.0+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

## 📖 项目简介

千川SDK管理平台是一个完整的广告投放管理系统，采用**前后端分离**架构，提供：

- 🔐 安全的OAuth2.0授权流程
- 📊 广告主/计划/创意全流程管理
- 📈 实时数据报表与可视化
- 🎨 现代化响应式UI设计
- ⚡ 高性能API代理服务
- 🐳 完整的Docker部署方案

## 🏗️ 技术栈

### 前端
- **React 18** + **TypeScript 5** + **Vite 5**
- **Zustand** (状态管理)
- **React Router v6** (路由)
- **Tailwind CSS 3** (样式)
- **Axios** (HTTP客户端)

### 后端
- **Go 1.21** + **Gin** (HTTP框架)
- **qianchuanSDK** (千川API封装)
- **Session-based Auth** (会话认证)
- **CORS + Security Headers** (安全防护)

### 基础设施
- **Docker** + **Docker Compose**
- **Nginx** (生产环境Web服务器)
- **ESLint** + **TypeScript** (代码质量)

## 🚀 快速开始

### 方式一：本地开发（推荐）

```bash
# 1. 克隆项目
cd /Users/wushaobing911/Desktop/douyin

# 2. 后端启动
cd backend
cp .env.example .env
# 编辑.env填入APP_ID和APP_SECRET
go mod tidy
go run cmd/server/main.go

# 3. 前端启动（新终端）
cd frontend
cp .env.example .env
# 编辑.env填入OAuth配置
npm install
npm run dev

# 4. 访问 http://localhost:3000
```

### 方式二：Docker一键启动

```bash
# 创建环境配置
cat > .env << EOF
APP_ID=你的千川AppID
APP_SECRET=你的千川AppSecret
COOKIE_SECRET=$(openssl rand -base64 32)
EOF

# 启动
docker-compose up -d

# 访问 http://localhost:3000
```

**详细说明**: 请查看 [快速开始指南](./docs/QUICK_START_GUIDE.md)

## 📂 项目结构

```
.
├── backend/                 # Go后端服务器
│   ├── cmd/server/          # 服务器入口
│   ├── internal/            # 内部包
│   │   ├── handler/         # HTTP处理器
│   │   ├── middleware/      # 中间件
│   │   └── service/         # 业务逻辑
│   └── pkg/session/         # Session管理
│
├── frontend/                # React前端应用
│   ├── src/
│   │   ├── api/             # API调用层
│   │   ├── components/      # React组件
│   │   ├── pages/           # 页面组件
│   │   └── store/           # 状态管理
│   └── public/              # 静态资源
│
├── qianchuanSDK/            # Go SDK (千川API封装)
│   ├── auth/                # 认证
│   ├── client/              # HTTP客户端
│   └── docs/                # SDK文档
│
├── docs/                    # 项目文档
│   ├── README.md            # 文档总览
│   ├── ARCHITECTURE_STATIC_SITE.md
│   ├── OAUTH_FLOW_AND_AUTH.md
│   └── API_CONTRACTS.md
│
├── docker-compose.yml       # Docker编排
├── QUICKSTART.md            # 快速启动指南
└── PROJECT_DEEP_ANALYSIS_REPORT.md  # 深度分析报告
```

## 🎯 核心功能

### 已实现功能 ✅

| 模块 | 功能 | 状态 |
|------|------|------|
| 🔐 认证 | OAuth2.0授权登录 | ✅ |
| 🔐 认证 | Session会话管理 | ✅ |
| 🔐 认证 | 自动Token刷新 | ✅ |
| 👤 广告主 | 列表查询 | ✅ |
| 👤 广告主 | 详情查看 | ✅ |
| 📊 仪表盘 | 数据概览 | ✅ |
| 📊 仪表盘 | 快速入口 | ✅ |
| 🎨 UI | 响应式设计 | ✅ |
| 🎨 UI | 9个完整页面 | ✅ |
| 🐳 部署 | Docker支持 | ✅ |
| 🐳 部署 | Docker Compose | ✅ |

### API端点支持

#### 已对接SDK的接口 (18个) ✅

**财务管理** (7个)
- ✅ 获取钱包信息
- ✅ 获取账户余额
- ✅ 获取财务流水
- ✅ 创建转账交易号
- ✅ 提交转账交易号
- ✅ 创建退款交易号
- ✅ 提交退款交易号

**随心推管理** (9个)
- ✅ 获取随心推订单列表
- ✅ 获取随心推订单详情
- ✅ 创建随心推订单
- ✅ 终止随心推订单
- ✅ 获取可投视频列表
- ✅ 追加订单预算
- ✅ 获取建议出价
- ✅ 获取投放效果预估
- ✅ 获取订单配额信息

**授权查询** (2个)
- ✅ 获取店铺关联的广告账户
- ✅ 获取代理商关联的广告账户

#### SDK未实现的接口 (21个) 🚧

**全域推广模块** (12个) - SDK完全未实现
**报表扩展模块** (5个) - SDK仅有基本报表
**账户预算模块** (2个) - SDK未实现
**抽音号授权模块** (2个) - SDK未实现

**注**: 标记为🚧的功能返回501占位响应，等待SDK更新后才能对接

> 📊 **SDK对接进度**: 18/39 (46%) | 详见 [SDK对接报告](./SDK_INTEGRATION_COMPLETE.md)

## 📊 项目进度

### 完成度: 72%

- ✅ 前端应用: **85%** (核心页面完成,部分功能待对接)
- ✅ 后端服务器: **70%** (核心功能完成)
  - ✅ OAuth授权: 100%
  - ✅ 财务管理: 100% (7个SDK接口已对接)
  - ✅ 随心推管理: 100% (9个SDK接口已对接)
  - ✅ 授权查询: 100% (2个SDK接口已对接)
  - ⏳ 广告管理: 50% (基础CRUD完成,27个端点返回501)
  - ⏳ 全域推广: 0% (SDK未实现)
  - ⏳ 报表扩展: 30% (基础报表完成,高级功能未实现)
- ✅ SDK封装: **100%** (核心API已完成)
- ✅ 文档: **90%**
- ✅ 部署配置: **100%**
- ⚠️ 测试覆盖: **30%** (SDK ~95%, Backend ~30%, Frontend 0%)

### 待完善项

1. 等待qianchuanSDK更新支持剩余21个接口
2. 实现CSRF Token验证（当前使用SameSite Cookie替代）
3. 添加前端单元测试和E2E测试
4. 为已对接的18个接口添加单元测试
5. 实现文件上传功能（当前返回501占位）
6. 添加CI/CD流水线

### 已知限制

**安全限制**:
- 无CSRF Token实现（依赖SameSite=Lax/Strict保护）
- 无数据库持久化（重启服务会清空Session）
- 单租户设计（一个Session只能绑定一个广告主）

**功能限制**:
- 27个后端接口返回HTTP 501（SDK未实现或等待对接）
  - 全域推广：12个接口完全未实现
  - 广告区域/时段更新：4个接口需使用完整更新接口代替
  - 创意独立创建/状态更新：2个接口未实现
  - AI标题推荐：1个接口未实现
  - 报表扩展模块：5个接口未实现
  - 账户预算/授权列表：3个接口未实现
- 部分前端页面使用Mock数据（文件上传、高级定向等）
- 后端单元测试存在panic（SDK未Mock、Session中间件未注入）

**构建状态**: ✅ Frontend (npm run build) | ✅ Backend (go build)

## 📚 文档

- **快速开始**: [QUICKSTART.md](./QUICKSTART.md)
- **架构设计**: [docs/ARCHITECTURE_STATIC_SITE.md](./docs/ARCHITECTURE_STATIC_SITE.md)
- **OAuth流程**: [docs/OAUTH_FLOW_AND_AUTH.md](./docs/OAUTH_FLOW_AND_AUTH.md)
- **API契约**: [docs/API_CONTRACTS.md](./docs/API_CONTRACTS.md)
- **SDK对接报告**: [SDK_INTEGRATION_COMPLETE.md](./SDK_INTEGRATION_COMPLETE.md) 🎉
- **SDK对接详情**: [SDK_INTEGRATION_REPORT.md](./SDK_INTEGRATION_REPORT.md)
- **深度分析**: [深度分析报告](./docs/PROJECT_DEEP_ANALYSIS_COMPREHENSIVE.md)
- **SDK文档**: [qianchuanSDK/README.md](./qianchuanSDK/README.md)
- **前端文档**: [前端优化总结](./docs/FRONTEND_OPTIMIZATION_SUMMARY.md)

## 🔧 开发指南

### 开发环境要求

- Node.js >= 18.0.0
- Go >= 1.21
- Docker (可选)

### 代码规范

```bash
# 前端
cd frontend
npm run lint        # ESLint检查
npm run type-check  # TypeScript类型检查

# 后端
cd backend
go fmt ./...        # 代码格式化
go vet ./...        # 静态分析
```

### 构建

```bash
# 前端生产构建
cd frontend && npm run build

# 后端构建
cd backend && go build -o server ./cmd/server
```

## 🔐 安全特性

- ✅ OAuth2.0标准授权流程
- ✅ HttpOnly + Secure Cookie (可选AES-256-GCM加密)
- ✅ SameSite Cookie保护
- ✅ CORS跨域配置
- ✅ Session过期检测
- ✅ 前端零秘钥设计
- ✅ 生产环境强制SECRET检查
- ⚠️ CSRF Token：暂未实现（使用SameSite=Lax替代）

## 📈 性能优化

- ✅ 代码分割（React Lazy）
- ✅ Vendor Chunk独立
- ✅ Gzip压缩
- ✅ 静态资源缓存
- ✅ API响应缓存（前端）
- ✅ 限流保护（SDK内置）

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 提交规范

使用[Conventional Commits](https://www.conventionalcommits.org/)规范：

- `feat:` 新功能
- `fix:` Bug修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

## 📜 许可证

MIT License © 2024

## 👥 维护者

- 项目地址: [GitHub](https://github.com/CriarBrand/qianchuanSDK)
- SDK仓库: [qianchuanSDK](https://github.com/CriarBrand/qianchuanSDK)

## 🙏 致谢

- 巨量引擎千川开放平台
- React & Vite团队
- Gin框架

---

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**
