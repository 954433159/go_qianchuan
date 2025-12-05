.PHONY: help dev build test clean docker-build docker-up docker-down install-backend install-frontend

# 默认目标
help:
	@echo "千川SDK管理平台 - 可用命令:"
	@echo ""
	@echo "  开发相关:"
	@echo "    make dev              - 启动开发环境（前后端）"
	@echo "    make backend          - 仅启动后端"
	@echo "    make frontend         - 仅启动前端"
	@echo ""
	@echo "  安装依赖:"
	@echo "    make install          - 安装所有依赖"
	@echo "    make install-backend  - 安装后端依赖"
	@echo "    make install-frontend - 安装前端依赖"
	@echo ""
	@echo "  构建相关:"
	@echo "    make build            - 构建前后端"
	@echo "    make build-backend    - 构建后端"
	@echo "    make build-frontend   - 构建前端"
	@echo ""
	@echo "  测试相关:"
	@echo "    make test             - 运行所有测试"
	@echo "    make test-backend     - 运行后端测试"
	@echo "    make test-frontend    - 运行前端测试"
	@echo ""
	@echo "  Docker相关:"
	@echo "    make docker-build     - 构建Docker镜像"
	@echo "    make docker-up        - 启动Docker服务"
	@echo "    make docker-down      - 停止Docker服务"
	@echo ""
	@echo "  腾讯云部署:"
	@echo "    make deploy-init      - 初始化部署脚本权限"
	@echo "    make tke-build        - 构建 TKE 镜像"
	@echo "    make tke-deploy       - 部署到 TKE"
	@echo "    make tke-status       - 查看 TKE 状态"
	@echo "    make scf-build        - 构建 SCF 镜像"
	@echo "    make scf-deploy       - 部署到 SCF"
	@echo ""
	@echo "  其他:"
	@echo "    make clean            - 清理构建文件"
	@echo "    make fmt              - 格式化代码"
	@echo "    make lint             - 代码检查"
	@echo ""

# 开发环境
dev:
	@echo "🚀 启动开发环境..."
	@make -j2 backend frontend

backend:
	@echo "🔧 启动后端服务..."
	@cd backend && go run cmd/server/main.go

frontend:
	@echo "⚛️  启动前端服务..."
	@cd frontend && npm run dev

# 安装依赖
install: install-backend install-frontend
	@echo "✅ 所有依赖安装完成"

install-backend:
	@echo "📦 安装后端依赖..."
	@cd backend && go mod tidy && go mod download

install-frontend:
	@echo "📦 安装前端依赖..."
	@cd frontend && npm install

# 构建
build: build-backend build-frontend
	@echo "✅ 构建完成"

build-backend:
	@echo "🔨 构建后端..."
	@cd backend && go build -o bin/server ./cmd/server

build-frontend:
	@echo "🔨 构建前端..."
	@cd frontend && npm run build

# 测试
test: test-backend test-frontend
	@echo "✅ 所有测试通过"

test-backend:
	@echo "🧪 运行后端测试..."
	@cd backend && go test -v ./...

test-frontend:
	@echo "🧪 运行前端测试..."
	@cd frontend && npm run test

# Docker
docker-build:
	@echo "🐳 构建Docker镜像..."
	@docker-compose build

docker-up:
	@echo "🐳 启动Docker服务..."
	@docker-compose up -d
	@echo "✅ 服务已启动，访问 http://localhost:3000"

docker-down:
	@echo "🐳 停止Docker服务..."
	@docker-compose down

# 清理
clean:
	@echo "🧹 清理构建文件..."
	@rm -rf backend/bin
	@rm -rf frontend/dist
	@rm -rf frontend/node_modules/.cache
	@echo "✅ 清理完成"

# 格式化
fmt:
	@echo "📝 格式化代码..."
	@cd backend && go fmt ./...
	@cd frontend && npm run format || true
	@echo "✅ 格式化完成"

# 代码检查
lint:
	@echo "🔍 代码检查..."
	@cd backend && go vet ./...
	@cd frontend && npm run lint
	@echo "✅ 检查完成"

# 版本信息
version:
	@echo "千川SDK管理平台"
	@echo "版本: 1.0.0"
	@echo "Go版本: $$(go version)"
	@echo "Node版本: $$(node --version)"
	@echo "npm版本: $$(npm --version)"

# =============================================================================
# 腾讯云部署
# =============================================================================

# TKE 容器服务部署
.PHONY: tke-build tke-deploy tke-status tke-logs tke-rollback

tke-build:
	@echo "🐳 构建 TKE 镜像..."
	@bash deploy/tencent/tke/deploy.sh build-all

tke-deploy:
	@echo "🚀 部署到 TKE..."
	@bash deploy/tencent/tke/deploy.sh deploy

tke-status:
	@echo "📊 查看 TKE 状态..."
	@bash deploy/tencent/tke/deploy.sh status

tke-logs:
	@echo "📜 查看 TKE 日志..."
	@bash deploy/tencent/tke/deploy.sh logs

tke-rollback:
	@echo "⏪ 回滚 TKE 部署..."
	@bash deploy/tencent/tke/deploy.sh rollback

# SCF 云函数部署
.PHONY: scf-build scf-deploy scf-info scf-logs scf-remove

scf-build:
	@echo "🔨 构建 SCF 镜像..."
	@bash deploy/tencent/scf/deploy.sh build
	@bash deploy/tencent/scf/deploy.sh push

scf-deploy:
	@echo "🚀 部署到 SCF..."
	@bash deploy/tencent/scf/deploy.sh deploy

scf-info:
	@echo "ℹ️  查看 SCF 部署信息..."
	@bash deploy/tencent/scf/deploy.sh info

scf-logs:
	@echo "📜 查看 SCF 日志..."
	@bash deploy/tencent/scf/deploy.sh logs

scf-remove:
	@echo "🗑️  移除 SCF 部署..."
	@bash deploy/tencent/scf/deploy.sh remove

# 部署脚本权限设置
.PHONY: deploy-init

deploy-init:
	@echo "🔧 初始化部署脚本..."
	@chmod +x deploy/tencent/cvm/deploy.sh
	@chmod +x deploy/tencent/tke/deploy.sh
	@chmod +x deploy/tencent/scf/deploy.sh
	@chmod +x deploy/tencent/lighthouse/deploy.sh
	@echo "✅ 部署脚本权限设置完成"
