#!/bin/bash

# 千川SDK管理平台 - 前端启动脚本
# 用途：启动 React + Vite 前端开发服务器

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
echo -e "${BLUE}  千川SDK管理平台 - 前端服务${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 Node.js${NC}"
    echo -e "${YELLOW}请先安装 Node.js 18 或更高版本${NC}"
    exit 1
fi

# 显示 Node.js 版本
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js 环境: ${NODE_VERSION}"

# 检查包管理器
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    PKG_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} 包管理器: pnpm ${PKG_VERSION}"
elif command -v yarn &> /dev/null; then
    PKG_MANAGER="yarn"
    PKG_VERSION=$(yarn --version)
    echo -e "${GREEN}✓${NC} 包管理器: yarn ${PKG_VERSION}"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    PKG_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} 包管理器: npm ${PKG_VERSION}"
else
    echo -e "${RED}❌ 错误: 未找到包管理器 (npm/yarn/pnpm)${NC}"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ 未找到 node_modules，正在安装依赖...${NC}"
    $PKG_MANAGER install
    echo -e "${GREEN}✓${NC} 依赖安装完成"
else
    echo -e "${GREEN}✓${NC} 依赖已安装"
fi

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

# 显示配置信息
# 读取后端端口（默认 8080）
PORT_VAL=8080
if [ -f "$SCRIPT_DIR/backend/.env" ]; then
    PORT_IN_ENV=$(grep -E '^PORT=' "$SCRIPT_DIR/backend/.env" | tail -n 1 | cut -d= -f2- | tr -d '"' | xargs || true)
    if [ -n "${PORT_IN_ENV:-}" ]; then
        PORT_VAL="$PORT_IN_ENV"
    fi
fi

# 读取前端开发端口（默认 5173，若 vite.config.ts 指定则覆盖）
DEV_PORT=5173
if [ -f "$SCRIPT_DIR/frontend/vite.config.ts" ]; then
    VITE_PORT=$(grep -E 'port:\s*[0-9]+' "$SCRIPT_DIR/frontend/vite.config.ts" | sed -E 's/.*port:\s*([0-9]+).*/\1/' | head -n1 || true)
    if [ -n "${VITE_PORT:-}" ]; then
        DEV_PORT="$VITE_PORT"
    fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓${NC} 前端服务配置:"
echo -e "  • 开发服务器: ${GREEN}http://localhost:${DEV_PORT}${NC}"
# en0 不存在时回退到 localhost
HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || echo localhost)
echo -e "  • 网络访问: ${GREEN}http://${HOST_IP}:${DEV_PORT}${NC}"
echo -e "  • 构建工具: ${GREEN}Vite 5${NC}"
echo -e "  • 后端健康检查: ${GREEN}http://localhost:${PORT_VAL}/health${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 显示优化提示
if [ -f "docs/QUICK_START_OPTIMIZATION.md" ]; then
    echo -e "${BLUE}💡 提示:${NC} 发现优化指南文档"
    echo -e "   查看 ${GREEN}frontend/docs/QUICK_START_OPTIMIZATION.md${NC}"
    echo -e "   了解如何优化前端项目"
    echo ""
fi

# 启动服务
echo -e "${BLUE}→${NC} 启动 Vite 开发服务器..."
echo -e "${YELLOW}提示: 按 Ctrl+C 停止服务${NC}"
echo ""

# 使用对应的包管理器启动
$PKG_MANAGER run dev
