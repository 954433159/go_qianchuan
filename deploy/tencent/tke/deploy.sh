#!/bin/bash
# =============================================================================
# 腾讯云 TKE 容器服务部署脚本
# 千川SDK管理平台
# =============================================================================

set -e

# 配置
NAMESPACE="qianchuan"
REGISTRY="ccr.ccs.tencentyun.com"
REPO_NAME="qianchuan"
IMAGE_TAG="${IMAGE_TAG:-latest}"

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
    
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl 未安装"; exit 1; }
    command -v docker >/dev/null 2>&1 || { log_error "docker 未安装"; exit 1; }
    
    # 检查 kubectl 连接
    if ! kubectl cluster-info &>/dev/null; then
        log_error "无法连接到 Kubernetes 集群，请检查 kubeconfig"
        exit 1
    fi
    
    log_info "工具检查通过 ✓"
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

# 构建并推送后端镜像
build_backend() {
    log_info "构建后端镜像..."
    
    cd "$(dirname "$0")/../../../"
    
    docker build \
        -f backend/Dockerfile \
        -t "$REGISTRY/$REPO_NAME/backend:$IMAGE_TAG" \
        .
    
    log_info "推送后端镜像..."
    docker push "$REGISTRY/$REPO_NAME/backend:$IMAGE_TAG"
}

# 构建并推送前端镜像
build_frontend() {
    log_info "构建前端镜像..."
    
    cd "$(dirname "$0")/../../../frontend"
    
    docker build \
        -t "$REGISTRY/$REPO_NAME/frontend:$IMAGE_TAG" \
        .
    
    log_info "推送前端镜像..."
    docker push "$REGISTRY/$REPO_NAME/frontend:$IMAGE_TAG"
}

# 部署到 TKE
deploy() {
    log_info "部署到 TKE..."
    
    DEPLOY_DIR="$(dirname "$0")"
    
    # 创建 Namespace（如果不存在）
    kubectl apply -f "$DEPLOY_DIR/service.yaml"
    
    # 应用 ConfigMap 和 Secret
    kubectl apply -f "$DEPLOY_DIR/configmap.yaml"
    
    # 部署应用
    kubectl apply -f "$DEPLOY_DIR/deployment.yaml"
    
    # 等待部署完成
    log_info "等待部署完成..."
    kubectl rollout status deployment/qianchuan-backend -n "$NAMESPACE" --timeout=300s
    kubectl rollout status deployment/qianchuan-frontend -n "$NAMESPACE" --timeout=300s
    
    log_info "部署完成 ✓"
}

# 回滚部署
rollback() {
    log_info "回滚部署..."
    
    kubectl rollout undo deployment/qianchuan-backend -n "$NAMESPACE"
    kubectl rollout undo deployment/qianchuan-frontend -n "$NAMESPACE"
    
    log_info "回滚完成 ✓"
}

# 查看状态
status() {
    log_info "集群状态..."
    
    echo ""
    echo "=== Pods ==="
    kubectl get pods -n "$NAMESPACE" -o wide
    
    echo ""
    echo "=== Services ==="
    kubectl get svc -n "$NAMESPACE"
    
    echo ""
    echo "=== Ingress ==="
    kubectl get ingress -n "$NAMESPACE"
    
    echo ""
    echo "=== HPA ==="
    kubectl get hpa -n "$NAMESPACE"
}

# 查看日志
logs() {
    local component="${1:-backend}"
    log_info "查看 $component 日志..."
    
    kubectl logs -f -l "app=qianchuan,component=$component" -n "$NAMESPACE" --tail=100
}

# 清理资源
cleanup() {
    log_warn "清理所有资源..."
    
    read -p "确认删除所有资源？[y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        kubectl delete namespace "$NAMESPACE" --ignore-not-found
        log_info "清理完成 ✓"
    else
        log_info "取消清理"
    fi
}

# 显示帮助
show_help() {
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  build-backend   构建并推送后端镜像"
    echo "  build-frontend  构建并推送前端镜像"
    echo "  build-all       构建并推送所有镜像"
    echo "  deploy          部署到 TKE"
    echo "  rollback        回滚到上一版本"
    echo "  status          查看部署状态"
    echo "  logs [component] 查看日志 (backend/frontend)"
    echo "  cleanup         清理所有资源"
    echo ""
    echo "环境变量:"
    echo "  IMAGE_TAG       镜像标签 (默认: latest)"
    echo "  TCR_USERNAME    腾讯云镜像仓库用户名"
    echo "  TCR_PASSWORD    腾讯云镜像仓库密码"
}

# 主函数
main() {
    case "${1:-}" in
        build-backend)
            check_prerequisites
            login_registry
            build_backend
            ;;
        build-frontend)
            check_prerequisites
            login_registry
            build_frontend
            ;;
        build-all)
            check_prerequisites
            login_registry
            build_backend
            build_frontend
            ;;
        deploy)
            check_prerequisites
            deploy
            ;;
        rollback)
            check_prerequisites
            rollback
            ;;
        status)
            check_prerequisites
            status
            ;;
        logs)
            check_prerequisites
            logs "${2:-backend}"
            ;;
        cleanup)
            check_prerequisites
            cleanup
            ;;
        *)
            show_help
            ;;
    esac
}

main "$@"
