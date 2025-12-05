# 千川SDK管理平台 - 部署指南

本文档说明如何在服务器上部署千川SDK管理平台。

## 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **Docker**: 20.10+
- **Docker Compose**: v2.0+
- **内存**: 2GB+ 推荐
- **端口**: 80 (HTTP)

## 部署步骤

### 1. 上传代码到服务器

```bash
# 方式一：使用 Git
git clone <your-repo-url> /opt/douyin
cd /opt/douyin

# 方式二：使用 SCP
scp -r /path/to/douyin root@1.12.234.253:/opt/douyin
ssh root@1.12.234.253
cd /opt/douyin
```

### 2. 配置后端环境变量

```bash
# 复制生产环境配置模板
cp backend/.env.production backend/.env

# 编辑配置文件，填入真实值
nano backend/.env
```

**必填配置项**：
```bash
# 从巨量引擎开放平台获取
APP_ID=your_real_app_id
APP_SECRET=your_real_app_secret

# 生成随机密钥: openssl rand -hex 16
COOKIE_SECRET=your_random_32_char_string

# CORS 来源（使用服务器实际地址）
CORS_ORIGIN=http://1.12.234.253

# Cookie 域名
COOKIE_DOMAIN=1.12.234.253
```

### 3. 构建并启动服务

```bash
# 生产环境部署（推荐）
docker-compose -f docker-compose.prod.yml up -d --build

# 或开发环境部署（端口 3000）
docker-compose up -d --build
```

### 4. 验证部署

```bash
# 检查容器状态
docker-compose -f docker-compose.prod.yml ps

# 测试健康检查端点
curl http://localhost/health

# 测试 API 端点
curl http://localhost/api/user/info
# 应返回 401（未认证），说明 API 代理正常工作
```

### 5. 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 只看后端日志
docker-compose -f docker-compose.prod.yml logs -f qianchuan-backend

# 只看前端日志
docker-compose -f docker-compose.prod.yml logs -f qianchuan-frontend
```

## 重新部署（更新代码后）

```bash
cd /opt/douyin

# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 清理旧镜像（可选）
docker image prune -f
```

## 常见问题排查

### API 返回 404

1. 检查 Nginx 是否正确代理到后端：
```bash
docker exec qianchuan-frontend nginx -t
```

2. 检查后端容器是否运行：
```bash
docker logs qianchuan-backend
```

3. 检查容器网络连通性：
```bash
docker exec qianchuan-frontend ping qianchuan-backend
```

### API 返回 CORS 错误

检查 `backend/.env` 中的 `CORS_ORIGIN` 配置是否与访问地址一致：
```bash
# 如果使用 http://1.12.234.253 访问
CORS_ORIGIN=http://1.12.234.253
```

### Session/Cookie 不生效

1. 确保 `COOKIE_DOMAIN` 与访问域名一致
2. HTTP 环境下 `COOKIE_SECURE` 必须为 `false`
3. 检查浏览器是否阻止了第三方 Cookie

### 容器无法启动

```bash
# 查看详细错误
docker-compose -f docker-compose.prod.yml logs

# 清理后重试
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## 端口说明

| 环境 | 前端端口 | 后端端口 |
|-----|---------|---------|
| 生产 (docker-compose.prod.yml) | 80 | 内部 8080 |
| 开发 (docker-compose.yml) | 3000 | 内部 8080 |

**注意**：生产环境下后端端口不对外暴露，所有 API 请求通过 Nginx 代理。

## 文件结构

```
/opt/douyin/
├── backend/
│   ├── .env              # 后端环境变量（需创建）
│   ├── .env.production   # 生产配置模板
│   └── Dockerfile
├── frontend/
│   ├── .env.production   # 前端生产配置
│   ├── dist/             # 构建产物
│   └── Dockerfile
├── nginx/
│   └── nginx.conf        # Nginx 配置（含 API 代理）
├── docker-compose.yml         # 开发环境 Compose
└── docker-compose.prod.yml    # 生产环境 Compose
```

## 安全建议

1. **使用 HTTPS**: 配置 SSL 证书，将 `COOKIE_SECURE=true`
2. **防火墙**: 仅开放必要端口（80/443）
3. **密钥管理**: 使用密钥管理服务存储敏感配置
4. **定期更新**: 及时更新 Docker 镜像和依赖

## 联系支持

如遇到部署问题，请提供以下信息：
1. `docker-compose -f docker-compose.prod.yml logs`
2. `docker-compose -f docker-compose.prod.yml ps`
3. 服务器操作系统和 Docker 版本
