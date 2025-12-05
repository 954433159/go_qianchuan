#!/bin/bash

# 千川SDK管理平台 - 部署选择脚本
# 提供交互式菜单选择不同的部署方法

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}千川SDK管理平台 - 部署维护工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}请选择部署方式：${NC}"
echo ""
echo "1) 交叉编译部署 (推荐用于生产环境)"
echo "2) Docker容器化部署 (推荐用于开发环境)"
echo "3) 源码上传构建部署 (用于快速调试)"
echo "4) 查看当前服务状态"
echo "5) 查看服务日志"
echo "6) 停止所有服务"
echo "7) 启动所有服务"
echo "8) 备份当前部署"
echo "9) 回滚到上一个版本"
echo "0) 退出"
echo ""

read -p "请输入选项 (0-9): " choice
echo ""

case $choice in
    1)
        echo -e "${YELLOW}执行交叉编译部署...${NC}"
        $SCRIPT_DIR/cross-compile-deploy.sh
        ;;
    2)
        echo -e "${YELLOW}执行Docker容器化部署...${NC}"
        $SCRIPT_DIR/docker-deploy.sh
        ;;
    3)
        echo -e "${YELLOW}执行源码上传构建部署...${NC}"
        $SCRIPT_DIR/source-build-deploy.sh
        ;;
    4)
        echo -e "${YELLOW}查看当前服务状态...${NC}"
        ssh root@1.12.234.253 "ps aux | grep -E '(qianchuan|nginx|docker)' | grep -v grep || echo '没有找到运行中的服务'"
        ;;
    5)
        echo -e "${YELLOW}查看服务日志...${NC}"
        echo "后端服务日志："
        ssh root@1.12.234.253 "tail -20 /opt/qianchuan/server.log 2>/dev/null || echo '后端日志文件不存在'"
        echo ""
        echo "前端Nginx日志："
        ssh root@1.12.234.253 "tail -10 /var/log/nginx/access.log 2>/dev/null || echo 'Nginx日志文件不存在'"
        ;;
    6)
        echo -e "${YELLOW}停止所有服务...${NC}"
        ssh root@1.12.234.253 "systemctl stop qianchuan-backend || pkill -f qianchuan-server || true"
        ssh root@1.12.234.253 "systemctl stop nginx || pkill -f nginx || true"
        ssh root@1.12.234.253 "cd /opt/qianchuan-docker && docker-compose -f docker-compose.prod.yml down || true"
        echo -e "${GREEN}所有服务已停止${NC}"
        ;;
    7)
        echo -e "${YELLOW}启动所有服务...${NC}"
        ssh root@1.12.234.253 "systemctl start qianchuan-backend || cd /opt/qianchuan && nohup ./qianchuan-server > server.log 2>&1 &"
        ssh root@1.12.234.253 "systemctl start nginx || nginx -c /tmp/qianchuan_nginx.conf || true"
        ssh root@1.12.234.253 "cd /opt/qianchuan-docker && docker-compose -f docker-compose.prod.yml up -d || true"
        echo -e "${GREEN}服务启动命令已执行${NC}"
        ;;
    8)
        echo -e "${YELLOW}备份当前部署...${NC}"
        BACKUP_DIR="/opt/qianchuan-backup-$(date +%Y%m%d_%H%M%S)"
        ssh root@1.12.234.253 "mkdir -p $BACKUP_DIR"
        ssh root@1.12.234.253 "cp -r /opt/qianchuan/* $BACKUP_DIR/ 2>/dev/null || true"
        ssh root@1.12.234.253 "cp -r /var/www/qianchuan $BACKUP_DIR/frontend 2>/dev/null || true"
        ssh root@1.12.234.253 "cp -r /tmp/qianchuan_nginx.conf $BACKUP_DIR/ 2>/dev/null || true"
        echo -e "${GREEN}备份完成：$BACKUP_DIR${NC}"
        ;;
    9)
        echo -e "${YELLOW}回滚到上一个版本...${NC}"
        LATEST_BACKUP=$(ssh root@1.12.234.253 "ls -1 /opt/qianchuan-backup-* 2>/dev/null | tail -1" || echo "")
        if [ -z "$LATEST_BACKUP" ]; then
            echo -e "${RED}没有找到备份${NC}"
        else
            echo "找到最新备份：$LATEST_BACKUP"
            read -p "确认回滚到此备份？(y/n): " confirm
            if [ "$confirm" = "y" ]; then
                ssh root@1.12.234.253 "systemctl stop qianchuan-backend || pkill -f qianchuan-server || true"
                ssh root@1.12.234.253 "cp $LATEST_BACKUP/qianchuan-server /opt/qianchuan/ 2>/dev/null || true"
                ssh root@1.12.234.253 "cp $LATEST_BACKUP/.env /opt/qianchuan/ 2>/dev/null || true"
                ssh root@1.12.234.253 "cp -r $LATEST_BACKUP/frontend/* /var/www/qianchuan/ 2>/dev/null || true"
                ssh root@1.12.234.253 "systemctl start qianchuan-backend || cd /opt/qianchuan && nohup ./qianchuan-server > server.log 2>&1 &"
                echo -e "${GREEN}回滚完成${NC}"
            fi
        fi
        ;;
    0)
        echo "退出"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}操作完成${NC}"
read -p "按回车键继续..."