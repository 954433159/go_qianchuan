#!/bin/bash

echo "=============================================="
echo "测试OAuth流程"
echo "=============================================="

# 测试后端API是否正常
echo "1. 测试后端API连通性..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://1.12.234.253/api/user/info)
if [ "$response" = "401" ]; then
    echo "✅ 后端API正常，返回401未授权（预期行为）"
else
    echo "❌ 后端API异常，返回状态码: $response"
fi

# 测试OAuth交换接口（预期会失败，因为使用测试code）
echo ""
echo "2. 测试OAuth交换接口..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://1.12.234.253/api/oauth/exchange -H "Content-Type: application/json" -d '{"code":"test"}')
if [ "$response" = "500" ]; then
    echo "⚠️ OAuth交换接口返回500错误，可能是因为APP_SECRET未配置或测试code无效"
else
    echo "OAuth交换接口返回状态码: $response"
fi

# 测试获取环境信息
echo ""
echo "3. 测试获取环境信息..."
curl -s http://1.12.234.253/api/oauth/authorize | jq .

echo ""
echo "=============================================="
echo "测试完成"
echo "=============================================="