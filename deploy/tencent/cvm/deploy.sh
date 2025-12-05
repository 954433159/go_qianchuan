#!/bin/bash
# =============================================================================
# 腾讯云 CVM 云服务器部署脚本
# 千川SDK管理平台
# =============================================================================

set -e

# 配置变量
APP_NAME="qianchuan-api"
APP_DIR="/opt/qianchuan"
SERVICE_USER="qianchuan"
GITHUB_REPO="your-org/qianchuan-backend"
BRANCH="${DEPLOY_BRANCH:-main}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用 root 用户执行此脚本"
        exit 1
    fi
}

# 安装系统依赖
install_dependencies() {
    log_info "安装系统依赖..."
    
    # 检测系统类型
    if [ -f /etc/debian_version ]; then
        apt-get update
        apt-get install -y curl wget git nginx supervisor
    elif [ -f /etc/redhat-release ]; then
        yum install -y curl wget git nginx supervisor
    else
        log_error "不支持的操作系统"
        exit 1
    fi
}

# 安装 Go 环境
install_golang() {
    if command -v go &> /dev/null; then
        log_info "Go 已安装: $(go version)"
        return
    fi
    
    log_info "安装 Go 1.21..."
    GO_VERSION="1.21.5"
    wget -q "https://golang.google.cn/dl/go${GO_VERSION}.linux-amd64.tar.gz" -O /tmp/go.tar.gz
    tar -C /usr/local -xzf /tmp/go.tar.gz
    rm /tmp/go.tar.gz
    
    echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    source /etc/profile
    
    log_info "Go 安装完成: $(go version)"
}

# 安装 Node.js 环境
install_nodejs() {
    if command -v node &> /dev/null; then
        log_info "Node.js 已安装: $(node --version)"
        return
    fi
    
    log_info "安装 Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    log_info "Node.js 安装完成: $(node --version)"
}

# 创建服务用户
create_service_user() {
    if id "$SERVICE_USER" &>/dev/null; then
        log_info "服务用户 $SERVICE_USER 已存在"
        return
    fi
    
    log_info "创建服务用户: $SERVICE_USER"
    useradd -r -s /bin/false -d "$APP_DIR" "$SERVICE_USER"
}

# 部署后端
deploy_backend() {
    log_info "部署后端服务..."
    
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    # 克隆或更新代码
    if [ -d "$APP_DIR/.git" ]; then
        log_info "更新代码..."
        git fetch origin
        git checkout "$BRANCH"
        git pull origin "$BRANCH"
    else
        log_info "克隆代码..."
        git clone -b "$BRANCH" "https://github.com/$GITHUB_REPO.git" .
    fi
    
    # 构建后端
    log_info "构建后端..."
    cd backend
    export GOPROXY=https://goproxy.cn,direct
    go mod tidy
    CGO_ENABLED=0 go build -o "$APP_DIR/bin/$APP_NAME" ./cmd/server/main.go
    
    # 设置权限
    chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"
    chmod +x "$APP_DIR/bin/$APP_NAME"
}

# 部署前端
deploy_frontend() {
    log_info "部署前端..."
    
    cd "$APP_DIR/frontend"
    npm install
    npm run build
    
    # 复制到 nginx 目录
    mkdir -p /var/www/qianchuan
    cp -r dist/* /var/www/qianchuan/
    chown -R www-data:www-data /var/www/qianchuan
}

# 配置 systemd 服务
setup_systemd() {
    log_info "配置 systemd 服务..."
    
    cat > /etc/systemd/system/qianchuan-api.service << EOF
[Unit]
Description=Qianchuan SDK API Service
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=$APP_DIR/bin/$APP_NAME
Restart=always
RestartSec=5
LimitNOFILE=65535

# 安全配置
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR/logs

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable qianchuan-api
    systemctl restart qianchuan-api
    
    log_info "服务已启动"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    cat > /etc/nginx/sites-available/qianchuan << 'EOF'
upstream qianchuan_backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

server {
    listen 80;
    server_name _;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 前端静态文件
    location / {
        root /var/www/qianchuan;
        try_files $uri $uri/ /index.html;
        
        # 缓存控制
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 代理
    location /api {
        proxy_pass http://qianchuan_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲区
        proxy_buffer_size 4k;
        proxy_buffers 4 32k;
        proxy_busy_buffers_size 64k;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://qianchuan_backend/health;
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/qianchuan /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t && systemctl restart nginx
    
    log_info "Nginx 配置完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
    fi
}

# 创建环境配置模板
create_env_template() {
    if [ -f "$APP_DIR/.env" ]; then
        log_warn ".env 文件已存在，跳过创建"
        return
    fi
    
    log_info "创建环境配置模板..."
    
    cat > "$APP_DIR/.env" << 'EOF'
# 千川SDK配置（必填）
APP_ID=your_qianchuan_app_id
APP_SECRET=your_qianchuan_app_secret

# 服务配置
PORT=8080
GIN_MODE=release

# Session配置（必填，请生成随机密钥）
COOKIE_SECRET=your_random_32_char_secret_key
COOKIE_ENC_SECRET=your_random_32_char_enc_secret

# Cookie配置
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
SESSION_NAME=qianchuan_session

# CORS配置
CORS_ORIGIN=https://your-domain.com
EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$APP_DIR/.env"
    chmod 600 "$APP_DIR/.env"
    
    log_warn "请编辑 $APP_DIR/.env 填写正确的配置"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    for i in {1..30}; do
        if curl -sf http://localhost:8080/health > /dev/null; then
            log_info "服务健康检查通过 ✓"
            return 0
        fi
        sleep 1
    done
    
    log_error "服务健康检查失败"
    return 1
}

# 显示部署信息
show_info() {
    echo ""
    echo "=========================================="
    echo "  千川SDK管理平台部署完成"
    echo "=========================================="
    echo ""
    echo "服务状态: systemctl status qianchuan-api"
    echo "查看日志: journalctl -u qianchuan-api -f"
    echo "重启服务: systemctl restart qianchuan-api"
    echo ""
    echo "配置文件: $APP_DIR/.env"
    echo "应用目录: $APP_DIR"
    echo ""
    echo "访问地址: http://$(hostname -I | awk '{print $1}')"
    echo ""
}

# 主函数
main() {
    log_info "开始部署千川SDK管理平台到腾讯云 CVM..."
    
    check_root
    install_dependencies
    install_golang
    install_nodejs
    create_service_user
    deploy_backend
    deploy_frontend
    create_env_template
    setup_systemd
    setup_nginx
    setup_firewall
    health_check
    show_info
    
    log_info "部署完成！"
}

# 执行主函数
main "$@"
