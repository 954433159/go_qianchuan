#!/bin/bash
# =============================================================================
# 腾讯云 SCF 云函数部署脚本
# 千川SDK管理平台
# =============================================================================

set -e

# 配置
REGISTRY="ccr.ccs.tencentyun.com"
REPO_NAME="qianchuan"
IMAGE_TAG="${IMAGE_TAG:-latest}"
STAGE="${STAGE:-prod}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查必要工具
check_prerequisites() {
    log_info "检查必要工具..."
    
    # 检查 Serverless Framework
    if ! command -v serverless &> /dev/null; then
        log_warn "Serverless Framework 未安装"
        log_info "安装 Serverless Framework..."
        npm install -g serverless
    fi
    
    # 检查 Docker
    command -v docker >/dev/null 2>&1 || { log_error "docker 未安装"; exit 1; }
    
    log_info "工具检查通过 ✓"
}

# 配置腾讯云凭证
setup_credentials() {
    log_info "配置腾讯云凭证..."
    
    if [ -z "$TENCENT_SECRET_ID" ] || [ -z "$TENCENT_SECRET_KEY" ]; then
        log_warn "环境变量 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY 未设置"
        log_info "请设置环境变量或使用 serverless 登录"
        return
    fi
    
    # 创建凭证文件
    mkdir -p ~/.serverless
    cat > ~/.serverless/credentials << EOF
[default]
tencent_secret_id = $TENCENT_SECRET_ID
tencent_secret_key = $TENCENT_SECRET_KEY
EOF
    
    log_info "凭证配置完成 ✓"
}

# 登录腾讯云镜像仓库
login_registry() {
    log_info "登录腾讯云镜像仓库..."
    
    if [ -z "$TCR_USERNAME" ] || [ -z "$TCR_PASSWORD" ]; then
        log_warn "TCR_USERNAME 或 TCR_PASSWORD 未设置"
        log_info "请手动登录: docker login $REGISTRY"
    else
        echo "$TCR_PASSWORD" | docker login "$REGISTRY" -u "$TCR_USERNAME" --password-stdin
    fi
}

# 构建 SCF 镜像
build_image() {
    log_info "构建 SCF 镜像..."
    
    cd "$(dirname "$0")/../../../"
    
    docker build \
        -f deploy/tencent/scf/Dockerfile \
        -t "$REGISTRY/$REPO_NAME/scf-backend:$IMAGE_TAG" \
        .
    
    log_info "镜像构建完成 ✓"
}

# 推送镜像
push_image() {
    log_info "推送镜像到腾讯云..."
    
    docker push "$REGISTRY/$REPO_NAME/scf-backend:$IMAGE_TAG"
    
    log_info "镜像推送完成 ✓"
}

# 构建前端
build_frontend() {
    log_info "构建前端..."
    
    cd "$(dirname "$0")/../../../frontend"
    
    npm install
    npm run build
    
    log_info "前端构建完成 ✓"
}

# 部署到 SCF
deploy() {
    log_info "部署到 SCF..."
    
    cd "$(dirname "$0")"
    
    # 部署
    serverless deploy --stage "$STAGE" --debug
    
    log_info "部署完成 ✓"
}

# 部署后端
deploy_backend() {
    log_info "部署后端..."
    
    cd "$(dirname "$0")"
    
    serverless deploy --target=./serverless.yml --stage "$STAGE" --debug
    
    log_info "后端部署完成 ✓"
}

# 部署前端
deploy_frontend() {
    log_info "部署前端..."
    
    cd "$(dirname "$0")"
    
    # 确保前端已构建
    if [ ! -d "../../../frontend/dist" ]; then
        build_frontend
    fi
    
    serverless deploy --target=./serverless-frontend.yml --stage "$STAGE" --debug
    
    log_info "前端部署完成 ✓"
}

# 查看部署信息
info() {
    log_info "查看部署信息..."
    
    cd "$(dirname "$0")"
    
    serverless info --stage "$STAGE"
}

# 查看日志
logs() {
    log_info "查看函数日志..."
    
    cd "$(dirname "$0")"
    
    serverless logs --function qianchuan-api-"$STAGE" --tail
}

# 移除部署
remove() {
    log_warn "移除部署..."
    
    read -p "确认移除所有资源？[y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        cd "$(dirname "$0")"
        serverless remove --stage "$STAGE"
        log_info "移除完成 ✓"
    else
        log_info "取消移除"
    fi
}

# 显示帮助
show_help() {
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  build          构建 SCF 镜像"
    echo "  push           推送镜像到腾讯云"
    echo "  build-frontend 构建前端"
    echo "  deploy         部署所有服务"
    echo "  deploy-backend 仅部署后端"
    echo "  deploy-frontend 仅部署前端"
    echo "  info           查看部署信息"
    echo "  logs           查看函数日志"
    echo "  remove         移除所有部署"
    echo ""
    echo "环境变量:"
    echo "  IMAGE_TAG           镜像标签 (默认: latest)"
    echo "  STAGE               部署阶段 (默认: prod)"
    echo "  TENCENT_SECRET_ID   腾讯云 SecretId"
    echo "  TENCENT_SECRET_KEY  腾讯云 SecretKey"
    echo "  TCR_USERNAME        镜像仓库用户名"
    echo "  TCR_PASSWORD        镜像仓库密码"
}

# 主函数
main() {
    case "${1:-}" in
        build)
            check_prerequisites
            login_registry
            build_image
            ;;
        push)
            check_prerequisites
            login_registry
            push_image
            ;;
        build-frontend)
            build_frontend
            ;;
        deploy)
            check_prerequisites
            setup_credentials
            deploy
            ;;
        deploy-backend)
            check_prerequisites
            setup_credentials
            deploy_backend
            ;;
        deploy-frontend)
            check_prerequisites
            setup_credentials
            deploy_frontend
            ;;
        info)
            check_prerequisites
            info
            ;;
        logs)
            check_prerequisites
            logs
            ;;
        remove)
            check_prerequisites
            remove
            ;;
        *)
            show_help
            ;;
    esac
}

main "$@"
