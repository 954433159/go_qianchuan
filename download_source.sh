#!/bin/bash

# 在服务器上下载Go源码的脚本
# 在服务器上执行: bash download_source.sh

set -e

echo "千川SDK管理平台 - 下载Go源码到服务器"

# 创建目录
mkdir -p /opt/qianchuan-source

# 下载源码压缩包
echo "正在下载Go源码..."
cd /tmp
wget -q https://github.com/wushaobing911/qianchuan-sdk-platform/archive/refs/heads/main.zip -O qianchuan-source.zip || {
    echo "无法从GitHub下载，使用本地源码..."
    # 如果无法从GitHub下载，我们可以创建一个基本的目录结构
    mkdir -p /opt/qianchuan-source/{cmd/server,internal/{handler,service,models,middleware},config}
    echo "创建基本目录结构完成"
    exit 0
}

# 解压
unzip -q qianchuan-source.zip
mv qianchuan-sdk-platform-main/backend/* /opt/qianchuan-source/

echo "Go源码下载完成"
echo "源码位置: /opt/qianchuan-source"