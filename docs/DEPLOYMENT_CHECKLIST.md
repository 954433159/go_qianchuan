# 千川SDK管理平台 - 部署检查清单

## 部署地址
- 生产环境: http://1.12.234.253/

## 一、环境配置检查

### 后端 (.env)
```bash
# 必需项
APP_ID=your_qianchuan_app_id          # 千川应用ID
APP_SECRET=your_qianchuan_app_secret  # 千川应用密钥
COOKIE_SECRET=random_32_byte_string   # Cookie签名密钥 (至少32字符)

# 生产环境推荐配置
GIN_MODE=release                      # 生产模式
PORT=8080                             # 服务端口
CORS_ORIGIN=http://1.12.234.253       # CORS允许的源
COOKIE_DOMAIN=1.12.234.253            # Cookie域名
COOKIE_SECURE=false                   # HTTP环境设置为false，HTTPS设置为true
COOKIE_SAME_SITE=Lax                  # SameSite策略
SESSION_NAME=qianchuan_session        # Session名称
```

### 前端 (.env)
```bash
VITE_API_BASE_URL=http://1.12.234.253/api
VITE_OAUTH_APP_ID=your_oauth_app_id
VITE_OAUTH_REDIRECT_URI=http://1.12.234.253/auth/callback
```

## 二、部署步骤

### 1. 构建前端
```bash
cd frontend
npm install
npm run build  # 输出到 frontend/dist/
```

### 2. 确保目录结构
```
/path/to/deployment/
├── backend/
│   ├── .env              # 后端环境配置
│   └── Dockerfile
├── frontend/
│   └── dist/             # 前端构建产物
├── oceanengineSDK/       # SDK依赖（必需）
├── nginx/
│   └── nginx.conf
└── docker-compose.prod.yml
```

### 3. 启动服务
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. 验证部署
```bash
# 健康检查
curl http://1.12.234.253/health
# 预期返回: {"status":"ok","version":"1.0.0",...}

# 就绪检查
curl http://1.12.234.253/ready
# 预期返回: {"status":"ready","sdk":"oceanengine",...}

# 前端访问
curl -I http://1.12.234.253/
# 预期返回: HTTP/1.1 200 OK
```

## 三、功能验证清单

### OAuth 认证流程
- [ ] 访问 http://1.12.234.253/login 显示登录页面
- [ ] 点击授权跳转到巨量引擎授权页
- [ ] 授权后正确回调到 /auth/callback
- [ ] 登录成功后跳转到 /dashboard

### 核心功能
- [ ] 广告主列表加载正常
- [ ] 广告计划列表加载正常
- [ ] 广告组列表加载正常
- [ ] 创意列表加载正常
- [ ] 数据报表查询正常
- [ ] 文件上传功能正常

### API 端点测试
- [ ] GET /api/advertiser/list
- [ ] GET /api/qianchuan/campaign/list
- [ ] GET /api/qianchuan/ad/list
- [ ] POST /api/qianchuan/report/ad/get

## 四、常见问题排查

### 1. Cookie/Session 问题
**症状**: 登录后无法保持会话，请求返回 401
**检查**:
- CORS_ORIGIN 是否与前端地址匹配
- COOKIE_DOMAIN 是否正确
- 浏览器开发者工具 → Application → Cookies 是否存在 qianchuan_session

### 2. API 代理问题
**症状**: 前端请求 404 或无法连接
**检查**:
- nginx.conf 中 upstream backend 配置
- docker network 是否正确连接
- 后端服务是否正常运行: `docker logs qianchuan-backend`

### 3. SDK 初始化失败
**症状**: /ready 返回 503 "SDK未初始化"
**检查**:
- APP_ID 和 APP_SECRET 是否正确
- oceanengineSDK 目录是否存在

### 4. CORS 错误
**症状**: 浏览器控制台显示 CORS policy 错误
**检查**:
- backend .env 中 CORS_ORIGIN 设置
- nginx.conf 是否有额外 CORS 配置冲突

## 五、监控与日志

### 查看日志
```bash
# 后端日志
docker logs -f qianchuan-backend

# Nginx 日志
docker logs -f qianchuan-frontend

# 所有服务
docker-compose -f docker-compose.prod.yml logs -f
```

### 性能指标
- Prometheus 指标: http://1.12.234.253/metrics
- 健康检查详情: http://1.12.234.253/healthz

## 六、回滚方案

如需回滚到之前版本:
```bash
# 停止服务
docker-compose -f docker-compose.prod.yml down

# 恢复之前的镜像/代码

# 重新启动
docker-compose -f docker-compose.prod.yml up -d
```
