# OAuth 授权问题修复 - 部署指南

## 问题描述

授权后页面跳回登录页面，无法进入工作台。

## 根本原因

1. **SDK 错误处理问题**：OAuth API 调用失败时没有正确返回错误
2. **应用类型配置问题**：官方平台配置的应用类型可能与实际使用场景不匹配
3. **广告主列表 API 调用失败**：当应用类型为"广告主"时，`oauth2/advertiser/get` API 可能返回空列表

## 已修复内容

### 1. SDK 错误处理 (`backend/internal/sdk/sdk_client.go`)
- ✅ 修复 `OauthAccessToken` 方法，失败时正确返回 error
- ✅ 添加对空响应的检查
- ✅ 添加对空 AccessToken 的检查

### 2. Handler 错误处理增强 (`backend/internal/handler/auth.go`)
- ✅ 检查 OAuth 响应码 (`tokenResp.Code != 0`)
- ✅ 检查响应数据是否为空
- ✅ 优先使用 Token 响应中的 `AdvertiserId`
- ✅ 允许在没有广告主列表的情况下登录（针对广告主类型应用）
- ✅ 添加详细的调试日志

### 3. 前端错误显示 (`frontend/src/pages/AuthCallback.tsx`)
- ✅ 显示详细的错误信息
- ✅ 显示当前处理步骤
- ✅ 延长错误提示时间到 5 秒

## 应用配置建议

### ✅ 新配置（已更新）
```
APP_ID: 1850228280031387
应用类型: 巨量千川-自研投放系统-代理商
接入能力范围: 千川PC版
```

### ~~旧配置（已废弃）~~
```
APP_ID: 1846842779198378
应用类型: 巨量千川-自研投放系统-广告主（不适合平台类应用）
接入能力范围: 千川随心推
```

### ⚠️ 配置变更说明

**已修改为代理商类型**，这是正确的配置，因为：
- ✅ 适合为多个广告主提供服务
- ✅ 可以获取授权的广告主列表
- ✅ 支持完整的千川 API 功能

### 临时方案（已集成到代码）

代码已修改为自动兼容不同类型的应用：
- 优先使用 Token 响应中的 `advertiser_id`
- 如果 `advertiser_id` 为 0，允许登录但记录警告
- 不会因为获取广告主列表失败而阻止登录

## 部署步骤

### 步骤 1：检查服务器 .env 配置

```bash
ssh root@1.12.234.253
cat /opt/qianchuan/.env
```

确保有以下配置：
```bash
APP_ID=1850228280031387
APP_SECRET=a30dd267362779428e97330f49d73216208233a5
CORS_ORIGIN=http://1.12.234.253
COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

### 步骤 2：上传代码

```bash
# 在本地项目目录执行
scp -r backend root@1.12.234.253:/opt/qianchuan-source/
scp -r frontend/dist root@1.12.234.253:/opt/qianchuan-frontend/
scp nginx/nginx.conf root@1.12.234.253:/opt/qianchuan-nginx/
```

### 步骤 3：重启服务

#### 如果使用 Docker Compose
```bash
ssh root@1.12.234.253
cd /opt/qianchuan
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

#### 如果直接运行
```bash
ssh root@1.12.234.253
cd /opt/qianchuan-source
go build -o qianchuan-server ./cmd/server/main.go
systemctl restart qianchuan-backend
# 或
pkill qianchuan-server
nohup ./qianchuan-server > /opt/qianchuan/server.log 2>&1 &
```

### 步骤 4：查看日志

```bash
# Docker 方式
docker logs qianchuan-backend -f

# 直接运行方式
tail -f /opt/qianchuan/server.log
```

## 预期日志输出

授权成功时，应该看到：

```
🔵 [OAuthExchange] Starting OAuth exchange...
🔵 [OAuthExchange] Request Origin: http://1.12.234.253
🔵 [OAuthExchange] Auth code received: abc123...
🔵 [OAuthExchange] Step 1: Exchanging auth code for access token...
✅ [OAuthExchange] Step 1 Success: Got access token
   - AccessToken: eyJhbGciOiJIUzI1NiI...
   - ExpiresIn: 86400 seconds
🔵 [OAuthExchange] Step 2: Fetching advertiser list...
✅ [OAuthExchange] Using AdvertiserId from token response: 1234567890
🔵 [OAuthExchange] Step 3: Creating session...
✅ [OAuthExchange] Step 3 Success: Session saved
🎉 [OAuthExchange] OAuth exchange completed successfully!
```

## 故障排查

### 问题 1：仍然跳回登录页

**检查浏览器控制台**:
1. 打开开发者工具 (F12)
2. 查看 Network 标签页
3. 查找 `/api/oauth/exchange` 请求的响应

**可能原因**:
- OAuth code 已过期（10分钟有效期）
- APP_ID 或 Secret 配置错误
- 网络问题

### 问题 2：提示"获取广告主信息失败"

这通常发生在应用类型为"广告主"时。

**解决方案**:
1. 已修复：代码现在允许在没有广告主列表时登录
2. 长期方案：修改应用类型为"代理商"

### 问题 3：Cookie 未设置

**检查**:
1. 浏览器 DevTools > Application > Cookies
2. 查看是否有 `qianchuan_session` cookie

**可能原因**:
- `COOKIE_DOMAIN` 配置错误（IP访问时必须为空）
- `COOKIE_SAME_SITE` 设置为 `strict`（应为 `lax`）

## 验证部署

1. 访问 http://1.12.234.253/login
2. 点击"同意并授权"
3. 在千川授权页面点击"同意授权"
4. 应该成功跳转到工作台（`/` 或 `/dashboard`）

## 联系支持

如果问题仍然存在，请提供：
1. 后端日志（从"🔵 [OAuthExchange]"开始的部分）
2. 浏览器控制台的错误信息
3. Network 标签页中 API 请求的截图

