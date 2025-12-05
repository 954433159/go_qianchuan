# 腾讯云部署指南

千川SDK管理平台支持多种腾讯云部署方式，根据您的需求选择合适的方案。

## 部署方式对比

| 特性 | CVM 云服务器 | TKE 容器服务 | SCF 云函数 | 轻量应用服务器 |
|------|-------------|-------------|-----------|---------------|
| **适用场景** | 生产环境 | 大规模生产 | 低流量/测试 | 小型应用/测试 |
| **运维复杂度** | 中等 | 较高 | 低 | 低 |
| **扩展性** | 手动扩展 | 自动扩展 | 自动扩展 | 手动扩展 |
| **成本** | 按量/包月 | 较高 | 按调用 | 低 |
| **冷启动** | 无 | 无 | 有 | 无 |
| **推荐指数** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 快速开始

### 1. CVM 云服务器部署

适合需要完全控制服务器的场景。

```bash
# 1. 购买腾讯云 CVM 实例（推荐 2核4G 以上）

# 2. SSH 连接到服务器
ssh root@your-server-ip

# 3. 下载并执行部署脚本
curl -sSL https://raw.githubusercontent.com/your-org/qianchuan/main/deploy/tencent/cvm/deploy.sh | bash

# 4. 配置环境变量
vim /opt/qianchuan/.env

# 5. 重启服务
systemctl restart qianchuan-api
```

**详细文档**: [CVM 部署指南](./cvm/)

### 2. TKE 容器服务部署

适合需要高可用和自动扩展的生产环境。

```bash
# 1. 创建 TKE 集群（通过腾讯云控制台）

# 2. 配置 kubectl
tke config use-context your-cluster

# 3. 构建并推送镜像
./deploy/tencent/tke/deploy.sh build-all

# 4. 部署到 TKE
./deploy/tencent/tke/deploy.sh deploy

# 5. 查看状态
./deploy/tencent/tke/deploy.sh status
```

**详细文档**: [TKE 部署指南](./tke/)

### 3. SCF 云函数部署

适合低流量场景，按调用量付费。

```bash
# 1. 安装 Serverless Framework
npm install -g serverless

# 2. 配置腾讯云凭证
export TENCENT_SECRET_ID=your-secret-id
export TENCENT_SECRET_KEY=your-secret-key

# 3. 构建并推送镜像
./deploy/tencent/scf/deploy.sh build
./deploy/tencent/scf/deploy.sh push

# 4. 部署
./deploy/tencent/scf/deploy.sh deploy
```

**详细文档**: [SCF 部署指南](./scf/)

### 4. 轻量应用服务器部署

适合个人开发者和小型团队，开箱即用。

```bash
# 1. 购买腾讯云轻量应用服务器（推荐 2核2G 以上）

# 2. SSH 连接到服务器
ssh root@your-server-ip

# 3. 一键部署
curl -sSL https://raw.githubusercontent.com/your-org/qianchuan/main/deploy/tencent/lighthouse/deploy.sh | bash

# 4. 配置环境变量
vim /opt/qianchuan/config/.env

# 5. 重启服务
/opt/qianchuan/restart.sh
```

**详细文档**: [轻量应用服务器部署指南](./lighthouse/)

## 环境变量配置

所有部署方式都需要配置以下环境变量：

```bash
# 必填 - 千川 SDK 配置
APP_ID=your_qianchuan_app_id
APP_SECRET=your_qianchuan_app_secret

# 必填 - Session 安全密钥（生成方法: openssl rand -base64 32）
COOKIE_SECRET=your_random_32_char_secret_key
COOKIE_ENC_SECRET=your_random_32_char_enc_secret

# 服务配置
PORT=8080
GIN_MODE=release

# Cookie 配置
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
SESSION_NAME=qianchuan_session

# CORS 配置
CORS_ORIGIN=https://your-domain.com
```

## 域名和 HTTPS 配置

### 1. 域名解析

在腾讯云 DNS 解析中添加记录：
- 类型: A
- 主机记录: @ 或 www
- 记录值: 服务器 IP

### 2. SSL 证书

推荐使用腾讯云免费 SSL 证书：

1. 访问 [SSL 证书控制台](https://console.cloud.tencent.com/ssl)
2. 申请免费 DV 证书
3. 下载证书并配置到 Nginx

### 3. CDN 加速（可选）

对于前端静态资源，推荐使用腾讯云 CDN：

1. 创建 CDN 加速域名
2. 配置回源地址
3. 开启 HTTPS

## 监控和告警

### 1. 云监控

- 在腾讯云控制台配置 CPU、内存、网络告警
- 推荐告警阈值：CPU > 80%，内存 > 85%

### 2. 日志服务

- CVM/轻量服务器：日志存储在 `/opt/qianchuan/logs/`
- TKE：使用 kubectl logs 查看
- SCF：使用腾讯云日志服务

### 3. APM 监控（可选）

推荐集成腾讯云 APM 或 SkyWalking：

```bash
# 后端启动时添加 APM Agent
# 详见各部署方式的具体配置
```

## 常见问题

### Q1: 服务启动失败

1. 检查环境变量是否正确配置
2. 检查端口是否被占用
3. 查看日志排查错误

```bash
# CVM/轻量服务器
journalctl -u qianchuan-api -f

# TKE
kubectl logs -f deployment/qianchuan-backend -n qianchuan

# SCF
serverless logs --function qianchuan-api-prod --tail
```

### Q2: OAuth 回调失败

1. 检查千川平台配置的回调地址是否正确
2. 确保 CORS_ORIGIN 配置正确
3. 检查 HTTPS 证书是否有效

### Q3: Session 丢失

1. 检查 COOKIE_SECRET 是否在重启后保持一致
2. 检查 COOKIE_DOMAIN 配置
3. 确保跨域配置正确

### Q4: 内存不足

- CVM/轻量服务器：升级实例配置
- TKE：调整 Pod 资源限制
- SCF：增加函数内存配置

## 成本估算

### CVM 云服务器
- 2核4G: 约 ¥150/月（按量）
- 4核8G: 约 ¥300/月（按量）

### TKE 容器服务
- 集群管理费: 免费（标准托管）
- 节点费用: 按 CVM 计费
- CLB 费用: 约 ¥20/月

### SCF 云函数
- 免费额度: 40万次/月
- 超出部分: ¥0.0000167/次

### 轻量应用服务器
- 2核2G: 约 ¥50/月
- 2核4G: 约 ¥100/月

## 技术支持

- GitHub Issues: https://github.com/your-org/qianchuan/issues
- 腾讯云工单: https://console.cloud.tencent.com/workorder

## 更新日志

### v1.0.0 (2024-01)
- 初始版本
- 支持 CVM、TKE、SCF、轻量应用服务器部署
