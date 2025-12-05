#!/bin/bash
# =============================================================================
# 腾讯云轻量应用服务器部署脚本
# 千川SDK管理平台
# 
# 轻量应用服务器特点：
# - 开箱即用，配置简单
# - 适合小型应用和开发测试
# - 价格实惠，按月计费
# - 内置防火墙和监控
# =============================================================================

set -e

# 配置变量
APP_NAME="qianchuan"
APP_DIR="/opt/qianchuan"
SERVICE_USER="qianchuan"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# 显示欢迎信息
show_banner() {
    echo ""
    echo "=============================================="
    echo "  千川SDK管理平台 - 轻量应用服务器部署"
    echo "=============================================="
    echo ""
}

# 检查系统环境
check_system() {
    log_step "检查系统环境..."
    
    # 检查是否为 root
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用 root 用户执行此脚本"
        exit 1
    fi
    
    # 检查系统类型
    if [ -f /etc/debian_version ]; then
        OS_TYPE="debian"
        PKG_MANAGER="apt-get"
    elif [ -f /etc/redhat-release ]; then
        OS_TYPE="centos"
        PKG_MANAGER="yum"
    else
        log_error "不支持的操作系统"
        exit 1
    fi
    
    log_info "系统类型: $OS_TYPE"
}

# 安装 Docker（轻量服务器推荐使用 Docker 部署）
install_docker() {
    log_step "安装 Docker..."
    
    if command -v docker &> /dev/null; then
        log_info "Docker 已安装: $(docker --version)"
        return
    fi
    
    if [ "$OS_TYPE" = "debian" ]; then
        apt-get update
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    else
        yum install -y yum-utils
        yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    fi
    
    systemctl enable docker
    systemctl start docker
    
    log_info "Docker 安装完成"
}

# 安装 Docker Compose
install_docker_compose() {
    log_step "安装 Docker Compose..."
    
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        log_info "Docker Compose 已安装"
        return
    fi
    
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    log_info "Docker Compose 安装完成"
}

# 创建应用目录
setup_directories() {
    log_step "创建应用目录..."
    
    mkdir -p "$APP_DIR"/{data,logs,config}
    
    log_info "目录创建完成: $APP_DIR"
}

# 创建 Docker Compose 配置
create_compose_config() {
    log_step "创建 Docker Compose 配置..."
    
    cat > "$APP_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

# 千川SDK管理平台 - 轻量应用服务器部署配置
# 使用 Docker Compose 一键部署

services:
  # 后端 API 服务
  backend:
    image: ccr.ccs.tencentyun.com/qianchuan/backend:latest
    container_name: qianchuan-backend
    restart: always
    expose:
      - "8080"
    environment:
      - PORT=8080
      - GIN_MODE=release
    env_file:
      - ./config/.env
    volumes:
      - ./logs/backend:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    networks:
      - qianchuan-net

  # 前端 + Nginx 反向代理
  frontend:
    image: ccr.ccs.tencentyun.com/qianchuan/frontend:latest
    container_name: qianchuan-frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./data/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - qianchuan-net

networks:
  qianchuan-net:
    driver: bridge
EOF

    log_info "Docker Compose 配置创建完成"
}

# 创建 Nginx 配置
create_nginx_config() {
    log_step "创建 Nginx 配置..."
    
    cat > "$APP_DIR/config/nginx.conf" << 'EOF'
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /tmp/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # 上游后端
    upstream backend {
        server backend:8080;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # 静态文件
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;

            # 静态资源缓存
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
                expires 30d;
                add_header Cache-Control "public, immutable";
            }
        }

        # API 代理
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";

            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 健康检查
        location /health {
            proxy_pass http://backend/health;
        }
    }

    # HTTPS 配置（可选，需要 SSL 证书）
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com;
    #
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #
    #     # ... 其余配置同上 ...
    # }
}
EOF

    log_info "Nginx 配置创建完成"
}

# 创建环境配置模板
create_env_template() {
    log_step "创建环境配置..."
    
    if [ -f "$APP_DIR/config/.env" ]; then
        log_warn ".env 文件已存在，跳过创建"
        return
    fi
    
    cat > "$APP_DIR/config/.env" << 'EOF'
# =============================================================================
# 千川SDK管理平台 - 环境配置
# =============================================================================

# 千川SDK配置（必填）
APP_ID=your_qianchuan_app_id
APP_SECRET=your_qianchuan_app_secret

# 服务配置
PORT=8080
GIN_MODE=release

# Session配置（必填，请生成随机密钥）
# 生成命令: openssl rand -base64 32
COOKIE_SECRET=your_random_32_char_secret_key
COOKIE_ENC_SECRET=your_random_32_char_enc_secret

# Cookie配置
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
SESSION_NAME=qianchuan_session

# CORS配置
CORS_ORIGIN=http://your-domain.com
EOF

    chmod 600 "$APP_DIR/config/.env"
    
    log_warn "请编辑 $APP_DIR/config/.env 填写正确的配置"
}

# 配置防火墙
setup_firewall() {
    log_step "配置防火墙..."
    
    # 轻量应用服务器通常使用腾讯云控制台配置防火墙
    # 这里提供命令行配置作为备选
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
    fi
    
    log_info "防火墙配置完成"
    log_warn "请在腾讯云控制台开放 80、443 端口"
}

# 启动服务
start_services() {
    log_step "启动服务..."
    
    cd "$APP_DIR"
    
    # 拉取最新镜像
    docker compose pull
    
    # 启动服务
    docker compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    docker compose ps
    
    log_info "服务启动完成"
}

# 健康检查
health_check() {
    log_step "健康检查..."
    
    for i in {1..30}; do
        if curl -sf http://localhost:80/health > /dev/null; then
            log_info "服务健康检查通过 ✓"
            return 0
        fi
        sleep 1
    done
    
    log_error "服务健康检查失败"
    docker compose logs
    return 1
}

# 创建管理脚本
create_management_scripts() {
    log_step "创建管理脚本..."
    
    # 启动脚本
    cat > "$APP_DIR/start.sh" << 'EOF'
#!/bin/bash
cd /opt/qianchuan
docker compose up -d
echo "服务已启动"
EOF
    chmod +x "$APP_DIR/start.sh"
    
    # 停止脚本
    cat > "$APP_DIR/stop.sh" << 'EOF'
#!/bin/bash
cd /opt/qianchuan
docker compose down
echo "服务已停止"
EOF
    chmod +x "$APP_DIR/stop.sh"
    
    # 重启脚本
    cat > "$APP_DIR/restart.sh" << 'EOF'
#!/bin/bash
cd /opt/qianchuan
docker compose restart
echo "服务已重启"
EOF
    chmod +x "$APP_DIR/restart.sh"
    
    # 查看日志
    cat > "$APP_DIR/logs.sh" << 'EOF'
#!/bin/bash
cd /opt/qianchuan
docker compose logs -f --tail=100
EOF
    chmod +x "$APP_DIR/logs.sh"
    
    # 更新脚本
    cat > "$APP_DIR/update.sh" << 'EOF'
#!/bin/bash
cd /opt/qianchuan
echo "拉取最新镜像..."
docker compose pull
echo "重启服务..."
docker compose up -d
echo "更新完成"
EOF
    chmod +x "$APP_DIR/update.sh"
    
    log_info "管理脚本创建完成"
}

# 显示部署信息
show_info() {
    echo ""
    echo "=============================================="
    echo "  千川SDK管理平台部署完成"
    echo "=============================================="
    echo ""
    echo "访问地址: http://$(curl -s ifconfig.me)"
    echo ""
    echo "管理命令:"
    echo "  启动服务: $APP_DIR/start.sh"
    echo "  停止服务: $APP_DIR/stop.sh"
    echo "  重启服务: $APP_DIR/restart.sh"
    echo "  查看日志: $APP_DIR/logs.sh"
    echo "  更新服务: $APP_DIR/update.sh"
    echo ""
    echo "配置文件:"
    echo "  环境变量: $APP_DIR/config/.env"
    echo "  Nginx:    $APP_DIR/config/nginx.conf"
    echo ""
    echo "日志目录:"
    echo "  后端日志: $APP_DIR/logs/backend/"
    echo "  Nginx日志: $APP_DIR/logs/nginx/"
    echo ""
    echo "⚠️  重要提示:"
    echo "  1. 请编辑 $APP_DIR/config/.env 填写千川 APP_ID 和 APP_SECRET"
    echo "  2. 请在腾讯云控制台开放 80、443 端口"
    echo "  3. 建议配置 HTTPS 证书以保护数据安全"
    echo ""
}

# 主函数
main() {
    show_banner
    check_system
    install_docker
    install_docker_compose
    setup_directories
    create_compose_config
    create_nginx_config
    create_env_template
    setup_firewall
    create_management_scripts
    start_services
    health_check
    show_info
    
    log_info "部署完成！"
}

# 执行主函数
main "$@"
