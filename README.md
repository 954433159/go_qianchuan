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

- ✅ OAuth授权流程
- ✅ 广告主管理
- 🚧 广告计划CRUD (占位实现)
- 🚧 广告单元CRUD (占位实现)
- 🚧 创意管理 (占位实现)
- 🚧 数据报表 (占位实现)
- 🚧 文件上传 (占位实现)

**注**: 标记为🚧的功能已有API端点，但返回模拟数据，需要根据实际业务完善

## 📊 项目进度

### 完成度: 85%

- ✅ 前端应用: **95%**
- ✅ 后端服务器: **70%** (核心功能完成)
- ✅ SDK封装: **100%**
- ✅ 文档: **95%**
- ✅ 部署配置: **100%**
- ⚠️ 测试覆盖: **30%** (仅SDK有测试)

### 待完善项

1. 完整实现所有业务API Handler
2. 添加前端单元测试和E2E测试
3. 添加API请求/响应日志
4. 实现文件上传功能
5. 添加CI/CD流水线

## 📚 文档

- **快速开始**: [QUICKSTART.md](./QUICKSTART.md)
- **架构设计**: [docs/ARCHITECTURE_STATIC_SITE.md](./docs/ARCHITECTURE_STATIC_SITE.md)
- **OAuth流程**: [docs/OAUTH_FLOW_AND_AUTH.md](./docs/OAUTH_FLOW_AND_AUTH.md)
- **API契约**: [docs/API_CONTRACTS.md](./docs/API_CONTRACTS.md)
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
- ✅ HttpOnly + Secure Cookie
- ✅ CSRF保护
- ✅ CORS跨域配置
- ✅ Session过期检测
- ✅ 前端零秘钥设计
- ✅ 安全响应头

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
