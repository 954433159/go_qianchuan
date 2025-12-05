#!/bin/bash

# 千川SDK管理平台 - 源码上传构建部署脚本
# 用于上传Go源码到服务器并直接编译

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}千川SDK管理平台 - 源码上传构建部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 配置
SERVER_IP="1.12.234.253"
PROJECT_DIR="/Users/wushaobing911/Desktop/douyin"
TEMP_DIR="/tmp/qianchuan-source"

# 1. 准备源码
echo -e "${YELLOW}[1/5] 准备源码...${NC}"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR
cp -r $PROJECT_DIR/backend/* $TEMP_DIR/
echo -e "${GREEN}✓ 源码准备完成${NC}"
echo ""

# 2. 上传到服务器
echo -e "${YELLOW}[2/5] 上传到服务器...${NC}"
scp -r $TEMP_DIR/* root@$SERVER_IP:/opt/qianchuan-source/
echo -e "${GREEN}✓ 上传完成${NC}"
echo ""

# 3. 在服务器上安装Go环境（如果未安装）
echo -e "${YELLOW}[3/5] 检查Go环境...${NC}"
GO_CHECK=$(ssh root@$SERVER_IP "which go && go version" || echo "Go not installed")
if [[ $GO_CHECK == *"go version"* ]]; then
    echo -e "${GREEN}✓ Go环境已安装${NC}"
else
    echo -e "${YELLOW}正在安装Go环境...${NC}"
    ssh root@$SERVER_IP "cd /tmp && wget -q https://go.dev/dl/go1.20.5.linux-amd64.tar.gz && \
      tar -C /usr/local -xzf go1.20.5.linux-amd64.tar.gz && \
      echo 'export PATH=\$PATH:/usr/local/go/bin' >> /etc/profile && \
      ln -sf /usr/local/go/bin/go /usr/local/bin/go"
    echo -e "${GREEN}✓ Go环境安装完成${NC}"
fi
echo ""

# 4. 构建应用
echo -e "${YELLOW}[4/5] 构建应用...${NC}"
ssh root@$SERVER_IP "cd /opt/qianchuan-source && \
  export PATH=\$PATH:/usr/local/go/bin && \
  go mod tidy && \
  go build -o qianchuan-server ./cmd/server/main.go"
echo -e "${GREEN}✓ 构建完成${NC}"
echo ""

# 5. 部署到服务器
echo -e "${YELLOW}[5/5] 部署到服务器...${NC}"
ssh root@$SERVER_IP "systemctl stop qianchuan-backend || true"
ssh root@$SERVER_IP "cp /opt/qianchuan-source/qianchuan-server /opt/qianchuan/qianchuan-server"
ssh root@$SERVER_IP "cp /opt/qianchuan-source/.env /opt/qianchuan/.env"
ssh root@$SERVER_IP "chmod +x /opt/qianchuan/qianchuan-server"
ssh root@$SERVER_IP "systemctl start qianchuan-backend || nohup /opt/qianchuan/qianchuan-server > /opt/qianchuan/server.log 2>&1 &"
echo -e "${GREEN}✓ 部署完成${NC}"
echo ""

# 6. 验证部署
echo -e "${YELLOW}[6/6] 验证部署...${NC}"
sleep 3
HEALTH_CHECK=$(ssh root@$SERVER_IP "curl -s http://localhost:8080/health")
if [[ $HEALTH_CHECK == *"status"* ]]; then
    echo -e "${GREEN}✓ 部署成功！后端服务正常运行${NC}"
else
    echo -e "${RED}✗ 部署可能有问题，请检查日志${NC}"
    ssh root@$SERVER_IP "tail -10 /opt/qianchuan/server.log"
fi
echo ""

echo -e "${GREEN}源码构建部署完成！${NC}"
echo "后端服务地址: http://$SERVER_IP:8080"