#!/bin/bash

echo "=============================================="
echo "修复后端配置"
echo "=============================================="

# 备份现有配置
if [ -f "/root/qianchuan/backend/.env" ]; then
    cp /root/qianchuan/backend/.env /root/qianchuan/backend/.env.backup
    echo "已备份现有.env文件"
fi

# 创建新的.env文件
cat > /root/qianchuan/backend/.env << EOF
# Backend Production Configuration
# 后端生产环境配置

# Qianchuan API Configuration
APP_ID=1846842779198378
APP_SECRET=YOUR_APP_SECRET_HERE

# Server Configuration
PORT=8080
GIN_MODE=release

# CORS Configuration
CORS_ORIGIN=http://1.12.234.253

# Cookie Configuration
COOKIE_SECRET=$(openssl rand -hex 16)
COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax

# Session Configuration
SESSION_TTL=86400
SESSION_NAME=qianchuan_session

# Logging Configuration
LOG_LEVEL=info
EOF

echo "已创建新的.env文件"
echo "请编辑 /root/qianchuan/backend/.env 文件，设置正确的 APP_SECRET"
echo "然后重启后端服务："
echo "  systemctl restart qianchuan-backend"
echo "或者"
echo "  cd /root/qianchuan && docker-compose restart backend"

echo ""
echo "=============================================="
echo "修复完成"
echo "=============================================="