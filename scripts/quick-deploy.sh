#!/bin/bash

# 快速部署脚本 - 代理商应用版本
# 用于快速部署新配置到腾讯云服务器
#
# 新应用信息:
# APP_ID: 1850228280031387
# 应用类型: 巨量千川-自研投放系统-代理商

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}千川SDK管理平台 - 快速部署${NC}"
echo -e "${BLUE}应用类型: 代理商（已更新）${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 配置
SERVER_IP="1.12.234.253"
SERVER_USER="root"
PROJECT_DIR="/Users/wushaobing911/Desktop/douyin"

# 检查前端是否已构建
if [ ! -d "$PROJECT_DIR/frontend/dist" ]; then
    echo -e "${YELLOW}[1/6] 构建前端...${NC}"
    cd $PROJECT_DIR/frontend
    npm run build
    echo -e "${GREEN}✓ 前端构建完成${NC}"
else
    echo -e "${GREEN}✓ 前端已构建${NC}"
fi
echo ""

# 上传后端代码
echo -e "${YELLOW}[2/7] 上传后端代码...${NC}"
rsync -av --exclude='*.log' --exclude='bin' \
    $PROJECT_DIR/backend/ \
    $SERVER_USER@$SERVER_IP:/opt/qianchuan-source/
echo -e "${GREEN}✓ 后端代码上传完成${NC}"
echo ""

# 上传后端配置文件
echo -e "${YELLOW}[3/7] 上传后端配置...${NC}"
scp $PROJECT_DIR/backend/.env.server \
    $SERVER_USER@$SERVER_IP:/opt/qianchuan-source/.env
echo -e "${GREEN}✓ 后端配置上传完成${NC}"
echo ""

# 上传前端构建产物
echo -e "${YELLOW}[4/7] 上传前端...${NC}"
rsync -av --delete \
    $PROJECT_DIR/frontend/dist/ \
    $SERVER_USER@$SERVER_IP:/opt/qianchuan-frontend/dist/
echo -e "${GREEN}✓ 前端上传完成${NC}"
echo ""

# 上传 nginx 配置
echo -e "${YELLOW}[5/7] 上传 nginx 配置...${NC}"
scp $PROJECT_DIR/nginx/nginx.conf \
    $SERVER_USER@$SERVER_IP:/opt/qianchuan-nginx/nginx.conf
echo -e "${GREEN}✓ Nginx 配置上传完成${NC}"
echo ""

# 构建并重启后端
echo -e "${YELLOW}[6/7] 构建并重启后端...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/qianchuan-source
echo "→ 构建后端..."
/usr/local/go/bin/go build -o qianchuan-server ./cmd/server/main.go
echo "→ 停止旧服务..."
pkill qianchuan-server || true
sleep 2
echo "→ 启动新服务..."
nohup ./qianchuan-server > /opt/qianchuan/server.log 2>&1 &
sleep 2
echo "✓ 后端服务已重启"
EOF
echo -e "${GREEN}✓ 后端重启完成${NC}"
echo ""

# 验证部署
echo -e "${YELLOW}[7/7] 验证部署...${NC}"
sleep 3
HEALTH_CHECK=$(ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost:8080/health" || echo "error")
if [[ $HEALTH_CHECK == *"status"* ]]; then
    echo -e "${GREEN}✓ 后端服务健康检查通过${NC}"
else
    echo -e "${RED}✗ 后端服务可能有问题${NC}"
    echo -e "${YELLOW}→ 查看日志:${NC}"
    ssh $SERVER_USER@$SERVER_IP "tail -30 /opt/qianchuan/server.log"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "访问地址: ${GREEN}http://$SERVER_IP/login${NC}"
echo ""
echo -e "查看日志:"
echo -e "  ${YELLOW}ssh $SERVER_USER@$SERVER_IP 'tail -f /opt/qianchuan/server.log'${NC}"
echo ""

