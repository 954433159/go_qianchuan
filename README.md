# 千川SDK管理平台

基于巨量引擎千川广告SDK (oceanengineSDK) 的全栈广告管理系统

## 技术栈

**前端**: React 18 + TypeScript 5 + Vite 5 + Zustand + Tailwind CSS 3  
**后端**: Go 1.21 + Gin + Session-based Auth  
**SDK**: [oceanengineSDK](https://github.com/bububa/oceanengine) (第三方千川OpenAPI SDK)

## 快速开始

### 本地开发

```bash
# 安装依赖
make install

# 配置环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# 编辑 .env 文件填入 APP_ID 和 APP_SECRET

# 启动开发服务器 (前后端并行)
make dev

# 或分别启动
make backend   # 后端 http://localhost:8080
make frontend  # 前端 http://localhost:3000
```

### Docker 部署

```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

## 项目结构

```
├── backend/                  # Go 后端
│   ├── cmd/server/           # 入口
│   ├── internal/
│   │   ├── handler/          # HTTP 处理器
│   │   ├── middleware/       # 中间件
│   │   ├── service/          # 业务逻辑
│   │   └── sdk/              # SDK 封装层
│   └── pkg/session/          # Session 管理
│
├── frontend/                 # React 前端
│   └── src/
│       ├── api/              # API 调用
│       ├── components/       # 组件
│       ├── pages/            # 页面
│       └── store/            # 状态管理
│
└── docs/                     # 文档
```

## 常用命令

```bash
make dev              # 启动开发环境
make build            # 构建前后端
make test             # 运行测试
make docker-up        # Docker 启动
make docker-down      # Docker 停止
make clean            # 清理构建产物
```

## API 实现状态

官方 API 总数: 158 | 已实现: 63 (40%) | 返回501: 21 | 未实现: 74

**完成模块**: OAuth授权、账户预算、广告计划管理、关键词管理、否定词管理、直播间报表、全域推广(86%)

详见 [QIANCHUAN.md](./QIANCHUAN.md) 和 [docs/QIANCHUAN_IMPLEMENTATION_STATUS.md](./docs/QIANCHUAN_IMPLEMENTATION_STATUS.md)

## 文档

- [QIANCHUAN.md](./QIANCHUAN.md) - SDK API 文档与实现状态
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 部署指南
- [docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) - 部署检查清单
- [docs/QIANCHUAN_IMPLEMENTATION_STATUS.md](./docs/QIANCHUAN_IMPLEMENTATION_STATUS.md) - API 实现详情
- [docs/ISSUES_AND_FIXES.md](./docs/ISSUES_AND_FIXES.md) - 问题与修复记录
- [docs/PROJECT_COMPREHENSIVE_ANALYSIS.md](./docs/PROJECT_COMPREHENSIVE_ANALYSIS.md) - 项目分析
- [docs/SDK_COMPARISON_ANALYSIS.md](./docs/SDK_COMPARISON_ANALYSIS.md) - SDK 对比分析
- [docs/OCEANENGINE_INTEGRATION_GUIDE.md](./docs/OCEANENGINE_INTEGRATION_GUIDE.md) - SDK 集成指南

## 环境变量

**后端** (`backend/.env`):
```bash
APP_ID=千川AppID
APP_SECRET=千川AppSecret
COOKIE_SECRET=随机32字节密钥
PORT=8080
```

**前端** (`frontend/.env`):
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_OAUTH_APP_ID=千川AppID
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

## 已知限制

- 21个端点返回 HTTP 501 (SDK 未提供对应 API)
- 无数据库持久化，服务重启后 Session 清空
- 单租户设计，每个 Session 只能绑定一个广告主

## License

MIT
