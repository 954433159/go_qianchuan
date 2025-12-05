#!/bin/bash

# 千川SDK管理平台 - 自动化交叉编译部署脚本
# 用于在本地交叉编译并部署到服务器

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}千川SDK管理平台 - 交叉编译部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 配置
SERVER_IP="1.12.234.253"
PROJECT_DIR="/Users/wushaobing911/Desktop/douyin"
BACKEND_DIR="$PROJECT_DIR/backend"
BUILD_DIR="$PROJECT_DIR/deploy_cross_compile"

# 1. 清理旧的构建文件
echo -e "${YELLOW}[1/5] 清理旧的构建文件...${NC}"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR/backend
echo -e "${GREEN}✓ 清理完成${NC}"
echo ""

# 2. 交叉编译Go二进制文件
echo -e "${YELLOW}[2/5] 交叉编译Go二进制文件...${NC}"
cd $BACKEND_DIR
GOOS=linux GOARCH=amd64 go build -o qianchuan-server-linux-amd64 ./cmd/server/main.go
echo -e "${GREEN}✓ 编译完成: qianchuan-server-linux-amd64${NC}"
echo ""

# 3. 复制文件到部署目录
echo -e "${YELLOW}[3/5] 准备部署文件...${NC}"
cp qianchuan-server-linux-amd64 $BUILD_DIR/backend/qianchuan-server
cp .env $BUILD_DIR/backend/
echo -e "${GREEN}✓ 文件准备完成${NC}"
echo ""

# 4. 上传到服务器
echo -e "${YELLOW}[4/5] 上传到服务器...${NC}"
scp -q $BUILD_DIR/backend/qianchuan-server root@$SERVER_IP:/tmp/qianchuan-server-new
scp -q $BUILD_DIR/backend/.env root@$SERVER_IP:/tmp/qianchuan-env-new
echo -e "${GREEN}✓ 上传完成${NC}"
echo ""

# 5. 部署到服务器
echo -e "${YELLOW}[5/5] 部署到服务器...${NC}"
ssh root@$SERVER_IP "systemctl stop qianchuan-backend || true"
ssh root@$SERVER_IP "cp /tmp/qianchuan-server-new /opt/qianchuan/qianchuan-server"
ssh root@$SERVER_IP "cp /tmp/qianchuan-env-new /opt/qianchuan/.env"
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

echo -e "${GREEN}交叉编译部署完成！${NC}"
echo "后端服务地址: http://$SERVER_IP:8080"