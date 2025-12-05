#!/bin/bash

# 千川SDK管理平台 - Docker容器化部署脚本
# 用于在服务器上使用Docker部署应用

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}千川SDK管理平台 - Docker容器化部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 配置
SERVER_IP="1.12.234.253"
PROJECT_DIR="/Users/wushaobing911/Desktop/douyin"
TEMP_DIR="/tmp/qianchuan-docker"

# 1. 准备部署文件
echo -e "${YELLOW}[1/4] 准备部署文件...${NC}"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# 创建部署包
mkdir -p $TEMP_DIR/{backend,nginx,scripts}
cp $PROJECT_DIR/backend/* $TEMP_DIR/backend/
cp $PROJECT_DIR/nginx/nginx.conf $TEMP_DIR/nginx/
cp $PROJECT_DIR/docker-compose.prod.yml $TEMP_DIR/
cp $PROJECT_DIR/scripts/* $TEMP_DIR/scripts/
echo -e "${GREEN}✓ 文件准备完成${NC}"
echo ""

# 2. 上传到服务器
echo -e "${YELLOW}[2/4] 上传到服务器...${NC}"
scp -r $TEMP_DIR/* root@$SERVER_IP:/opt/qianchuan-docker/
echo -e "${GREEN}✓ 上传完成${NC}"
echo ""

# 3. 在服务器上部署
echo -e "${YELLOW}[3/4] 在服务器上部署...${NC}"
ssh root@$SERVER_IP "cd /opt/qianchuan-docker && \
  pkill -f qianchuan-server || true && \
  pkill -f nginx || true && \
  docker-compose -f docker-compose.prod.yml down || true && \
  docker-compose -f docker-compose.prod.yml up -d --build"
echo -e "${GREEN}✓ 部署完成${NC}"
echo ""

# 4. 验证部署
echo -e "${YELLOW}[4/4] 验证部署...${NC}"
sleep 10
FRONTEND_CHECK=$(ssh root@$SERVER_IP "curl -s http://localhost:3000/ | head -1")
BACKEND_CHECK=$(ssh root@$SERVER_IP "curl -s http://localhost:8080/health")

if [[ $FRONTEND_CHECK == *"<!DOCTYPE html>"* ]]; then
    echo -e "${GREEN}✓ 前端服务正常${NC}"
else
    echo -e "${RED}✗ 前端服务异常${NC}"
fi

if [[ $BACKEND_CHECK == *"status"* ]]; then
    echo -e "${GREEN}✓ 后端服务正常${NC}"
else
    echo -e "${RED}✗ 后端服务异常${NC}"
fi
echo ""

echo -e "${GREEN}Docker部署完成！${NC}"
echo "前端地址: http://$SERVER_IP:3000"
echo "后端地址: http://$SERVER_IP:8080"