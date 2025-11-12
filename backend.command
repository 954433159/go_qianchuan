#!/bin/bash

# 千川SDK管理平台 - 后端启动脚本（Go 版）
set -Eeuo pipefail

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  千川SDK管理平台 - 后端服务（Go）${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Go 环境
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 Go${NC}"
    echo -e "${YELLOW}请先安装 Go 1.21 或更高版本${NC}"
    exit 1
fi

GO_VERSION=$(go version)
echo -e "${GREEN}✓${NC} Go 环境: ${GO_VERSION}"

# 进入后端目录
cd backend

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ 未找到 .env 文件${NC}"
    if [ -f ".env.example" ]; then
        echo -e "${BLUE}→${NC} 从 .env.example 创建 .env 文件..."
        cp .env.example .env
        echo -e "${YELLOW}⚠ 请编辑 .env 文件配置必要的环境变量${NC}"
    else
        echo -e "${RED}❌ 错误: 缺少 .env.example 文件${NC}"
    fi
fi

# 读取端口（默认 8080）
PORT_VAL=8080
if [ -f ".env" ]; then
    PORT_IN_ENV=$(grep -E '^PORT=' .env | tail -n 1 | cut -d= -f2- | tr -d '"' | xargs || true)
    if [ -n "${PORT_IN_ENV:-}" ]; then
        PORT_VAL="$PORT_IN_ENV"
    fi
fi

# 显示配置信息
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓${NC} 后端服务配置:"
echo -e "  • 端口: ${GREEN}${PORT_VAL}${NC}"
echo -e "  • 健康检查: ${GREEN}http://localhost:${PORT_VAL}/health${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 启动服务
echo -e "${BLUE}→${NC} 启动 Go 服务..."
echo -e "${YELLOW}提示: 按 Ctrl+C 停止服务${NC}"
echo ""

exec go run cmd/server/main.go
