#!/bin/bash

echo "=============================================="
echo "检查前端配置"
echo "=============================================="

# 检查前端环境变量
echo "1. 检查前端环境变量文件..."
if [ -f "/root/qianchuan/frontend/.env.production" ]; then
    echo "找到.env.production文件"
    echo "内容如下："
    cat /root/qianchuan/frontend/.env.production
else
    echo "未找到.env.production文件"
fi

echo ""
echo "2. 检查前端构建文件..."
if [ -d "/root/qianchuan/frontend/dist" ]; then
    echo "找到前端构建目录"
    echo "目录内容："
    ls -la /root/qianchuan/frontend/dist
else
    echo "未找到前端构建目录"
fi

echo ""
echo "3. 检查nginx静态文件配置..."
if [ -f "/etc/nginx/sites-enabled/qianchuan" ]; then
    echo "找到nginx配置文件，检查前端静态文件配置..."
    grep -A 10 -B 5 "location /" /etc/nginx/sites-enabled/qianchuan
else
    echo "未找到nginx配置文件"
fi

echo ""
echo "=============================================="
echo "检查完成"
echo "=============================================="