#!/bin/bash

# 千川SDK管理平台 - 部署脚本
# 用于同步本地代码到腾讯云服务器并重新部署

set -e

# ==================== 配置 ====================
SERVER_IP="1.12.234.253"
SERVER_USER="root"
REMOTE_PATH="/root/douyin_20251117151352"
LOCAL_PATH="/Users/wushaobing911/Desktop/douyin"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  千川SDK管理平台 - 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ==================== 步骤1: 构建前端 ====================
echo -e "${YELLOW}[1/5] 构建前端...${NC}"
cd "$LOCAL_PATH/frontend"

# 检查是否需要安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 构建
echo "执行前端构建..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}前端构建失败！${NC}"
    exit 1
fi
echo -e "${GREEN}前端构建完成 ✓${NC}"

# ==================== 步骤2: 同步代码到服务器 ====================
echo ""
echo -e "${YELLOW}[2/5] 同步代码到服务器...${NC}"
cd "$LOCAL_PATH"

# 同步主要目录（排除不需要的文件）
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='__pycache__' \
    --exclude='.cursor' \
    backend/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/

rsync -avz --progress \
    frontend/dist/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/frontend/dist/

rsync -avz --progress \
    --exclude='.git' \
    oceanengineSDK/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/oceanengineSDK/

rsync -avz --progress \
    nginx/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/nginx/

rsync -avz --progress \
    docker-compose.prod.yml ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/

echo -e "${GREEN}代码同步完成 ✓${NC}"

# ==================== 步骤3: 在服务器上重新部署 ====================
echo ""
echo -e "${YELLOW}[3/5] 重新部署服务...${NC}"

# 注意：使用不带引号的ENDSSH以允许变量展开
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd ${REMOTE_PATH}

echo "停止现有服务..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

echo "重新构建并启动服务..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "等待服务启动..."
sleep 10
ENDSSH

echo -e "${GREEN}服务部署完成 ✓${NC}"

# ==================== 步骤4: 验证部署 ====================
echo ""
echo -e "${YELLOW}[4/5] 验证部署...${NC}"

# 等待服务完全启动
sleep 5

# 检查健康端点
echo "检查健康状态..."
HEALTH_RESPONSE=$(curl -s --connect-timeout 10 http://${SERVER_IP}/health 2>/dev/null)

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}健康检查通过 ✓${NC}"
else
    echo -e "${RED}健康检查失败！响应: $HEALTH_RESPONSE${NC}"
fi

# 检查 ready 端点
echo "检查就绪状态..."
READY_RESPONSE=$(curl -s --connect-timeout 10 http://${SERVER_IP}/ready 2>/dev/null)

if echo "$READY_RESPONSE" | grep -q '"status":"ready"'; then
    echo -e "${GREEN}就绪检查通过 ✓${NC}"
else
    echo -e "${YELLOW}就绪检查: $READY_RESPONSE${NC}"
fi

# 检查 API
echo "检查 API 代理..."
API_RESPONSE=$(curl -s --connect-timeout 10 http://${SERVER_IP}/api/advertiser/list 2>/dev/null)

if echo "$API_RESPONSE" | grep -q '401\|code'; then
    echo -e "${GREEN}API 代理正常 ✓ (需要登录)${NC}"
else
    echo -e "${YELLOW}API 响应: ${API_RESPONSE:0:100}...${NC}"
fi

# ==================== 步骤5: 输出结果 ====================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "访问地址: ${GREEN}http://${SERVER_IP}/${NC}"
echo -e "健康检查: ${GREEN}http://${SERVER_IP}/health${NC}"
echo -e "API 文档: ${GREEN}http://${SERVER_IP}/swagger/index.html${NC}"
echo ""
echo -e "${YELLOW}如需查看日志，请执行:${NC}"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'docker logs -f qianchuan-backend'"
echo ""
