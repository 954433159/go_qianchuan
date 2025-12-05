#!/bin/bash

echo "=============================================="
echo "检查后端配置"
echo "=============================================="

# 检查后端环境变量
echo "1. 检查后端环境变量文件..."
if [ -f "/root/qianchuan/backend/.env" ]; then
    echo "找到.env文件"
    echo "内容如下："
    cat /root/qianchuan/backend/.env
else
    echo "未找到.env文件，这是问题所在！"
fi

echo ""
echo "2. 检查后端服务状态..."
if pgrep -f "qianchuan-backend" > /dev/null; then
    echo "后端服务正在运行"
else
    echo "后端服务未运行！"
fi

echo ""
echo "3. 检查端口监听状态..."
netstat -tlnp | grep :8080

echo ""
echo "4. 检查nginx配置..."
if [ -f "/etc/nginx/sites-enabled/qianchuan" ]; then
    echo "找到nginx配置文件"
    cat /etc/nginx/sites-enabled/qianchuan
else
    echo "未找到nginx配置文件"
fi

echo ""
echo "=============================================="
echo "检查完成"
echo "=============================================="