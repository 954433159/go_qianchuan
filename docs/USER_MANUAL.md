# 千川SDK管理平台 - 用户操作手册

**版本**: v1.0.0  
**更新日期**: 2025-11-10  
**适用人群**: 广告投放人员、运营人员、开发人员

---

## 📚 目录

1. [系统概述](#系统概述)
2. [快速开始](#快速开始)
3. [功能模块](#功能模块)
4. [常见问题](#常见问题)
5. [技术规格](#技术规格)

---

## 系统概述

### 什么是千川SDK管理平台？

千川SDK管理平台是基于抖音千川开放平台API构建的全栈Web应用，提供以下核心功能：

- 🔐 **OAuth2.0安全登录** - 安全的千川账号授权登录
- 📊 **广告主管理** - 查看和管理授权的广告账户
- 🎯 **广告计划管理** - 创建、编辑、查看广告计划（Campaign）
- 📱 **广告管理** - 创建、编辑、查看广告（Ad）
- 🎨 **创意管理** - 查看广告创意列表
- 📁 **素材管理** - 上传和管理图片/视频素材
- 📈 **数据报表** - 查看广告投放数据和ROI分析
- ⚠️  **定向工具** - （开发中）地域、兴趣、行为定向
- 👥 **人群包管理** - （开发中）自定义人群包

### 技术架构

```
前端: React 18 + TypeScript + Vite + Tailwind CSS
后端: Go 1.21 + Gin + gorilla/sessions
SDK: 自研 qianchuanSDK
数据库: 无（Session存储使用Cookie）
部署: Docker + Docker Compose
```

---

## 快速开始

### 1. 环境要求

**开发环境**:
- Node.js 18+
- Go 1.21+
- Docker & Docker Compose

**生产环境**:
- Docker 20.10+
- Docker Compose 2.0+

### 2. 获取千川应用凭证

访问 [巨量开放平台](https://open.oceanengine.com/)：

1. 注册/登录账号
2. 创建应用
3. 获取 `APP_ID` 和 `APP_SECRET`
4. 配置回调地址: `http://your-domain.com/auth/callback`

### 3. 配置环境变量

#### 后端配置 (`backend/.env`)

```bash
# 千川应用凭证
QIANCHUAN_APP_ID=your_app_id
QIANCHUAN_APP_SECRET=your_app_secret

# Cookie配置
COOKIE_SECRET=your_random_32_char_secret
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

# 服务端口
PORT=8080
```

#### 前端配置 (`frontend/.env`)

```bash
# API地址
VITE_API_BASE_URL=http://localhost:8080/api

# OAuth配置
VITE_OAUTH_APP_ID=your_app_id
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# 环境
VITE_ENV=development
```

### 4. 启动应用

#### 方式一：Docker Compose (推荐)

```bash
# 1. 克隆项目
git clone <repository_url>
cd douyin

# 2. 配置环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# 编辑 .env 文件，填入你的 APP_ID 和 APP_SECRET

# 3. 启动服务
docker-compose up -d

# 4. 访问
# 前端: http://localhost:3000
# 后端: http://localhost:8080
```

#### 方式二：本地开发

**后端**:
```bash
cd backend
go mod download
go run cmd/server/main.go
```

**前端**:
```bash
cd frontend
npm install
npm run dev
```

### 5. 首次登录

1. 访问 `http://localhost:3000`
2. 点击"登录"按钮
3. 跳转到千川授权页面
4. 使用千川账号授权
5. 自动跳转回系统，完成登录

---

## 功能模块

### 🔐 1. 登录与授权

#### 1.1 OAuth登录流程

```
步骤1: 访问登录页 → 点击"登录"
步骤2: 跳转千川授权页 → 确认授权
步骤3: 自动回调 → 验证身份
步骤4: 创建Session → 跳转首页
```

#### 1.2 登出

点击右上角头像 → "登出"

#### 1.3 Session管理

- **有效期**: 24小时
- **自动刷新**: Token过期前5分钟自动刷新
- **安全特性**: HttpOnly Cookie + CSRF防护

---

### 📊 2. 广告主管理

#### 2.1 查看广告主列表

**路径**: 首页 → "广告主管理"

**功能**:
- 查看所有已授权的广告账户
- 显示账户ID、名称、角色、状态
- 统计总账户数、启用账户数

**操作**:
- 点击"查看"打开详情抽屉
- 选择多个账户进行批量导出

#### 2.2 筛选广告主

**支持的筛选条件**:
- 广告主名称（模糊搜索）
- 状态（启用/禁用）
- 最小余额
- 创建时间范围

#### 2.3 已知限制

⚠️  **当前版本限制**:
- 余额显示为0（SDK不返回余额字段）
- 公司名称为空（AdvertiserList API不返回）
- 创建时间为空（AdvertiserList API不返回）

**解决方案**: 后续版本将调用 AdvertiserInfo API 获取完整数据

---

### 🎯 3. 广告计划管理

#### 3.1 创建广告计划 (Campaign)

**步骤**:
1. 进入"广告计划" → 点击"新建计划"
2. 填写基本信息
   - 计划名称
   - 营销目标 (marketing_goal)
   - 预算类型（日预算/总预算）
   - 预算金额
3. 配置投放设置
   - 投放时间
   - 投放速度
4. 点击"创建"提交

**营销目标选项**:
- `VIDEO_AND_IMAGE` - 短视频/图文带货
- `LIVE` - 直播带货
- `PRODUCT` - 商品推广

#### 3.2 查看广告计划列表

**显示字段**:
- 计划ID、计划名称
- 预算、预算类型
- 状态（启用/暂停/删除）
- 创建/修改时间

**操作**:
- 编辑计划
- 启用/暂停
- 查看详情
- 删除计划

#### 3.3 批量操作

- 批量启用/暂停
- 批量删除
- 批量导出

---

### 📱 4. 广告管理

#### 4.1 创建广告 (Ad)

**步骤**:
1. 进入"广告管理" → 点击"新建广告"
2. 选择所属广告计划
3. 填写基本信息
   - 广告名称
   - 营销场景 (FEED/SEARCH)
4. 配置投放设置
   - 出价方式
   - 出价金额
   - 投放时间
5. 配置定向设置
   - 地域定向
   - 人群定向
   - 兴趣定向
6. 配置创意
   - 创意类型（自定义/程序化）
   - 上传素材
   - 填写文案
7. 点击"创建"提交

#### 4.2 查看广告详情

**API端点**: `GET /api/qianchuan/ad/get?ad_id={id}`

**返回信息**:
- 基本信息（ID、名称、状态）
- 投放设置（预算、出价、时间）
- 定向设置（地域、人群、兴趣）
- 创意信息（素材、文案）
- 实时数据（展现、点击、转化）

#### 4.3 广告状态管理

**状态类型**:
- `ENABLE` - 启用
- `DISABLE` - 暂停
- `DELETE` - 删除

**批量操作**:
```
选择多个广告 → 点击"批量操作" → 选择操作类型 → 确认
```

---

### 🎨 5. 创意管理

#### 5.1 查看创意列表

**路径**: "创意管理"

**显示字段**:
- 创意ID、标题
- 素材类型（图片/视频）
- 审核状态（通过/待审/拒绝）
- 所属广告ID
- 创建时间

**筛选条件**:
- 广告ID
- 素材类型
- 审核状态
- 创建时间

#### 5.2 创意创建限制 ⚠️

**当前版本不支持独立创建创意**

**原因**: qianchuanSDK 未提供 CreativeCreate 方法

**解决方案**: 在创建广告时一并创建创意（一体化创建）

**API响应**:
```json
{
  "code": 501,
  "message": "创意创建功能暂不支持，请使用广告计划一体化创建"
}
```

---

### 📁 6. 素材管理

#### 6.1 上传图片

**路径**: "素材管理" → "图片库" → "上传图片"

**支持格式**: JPG, PNG, GIF  
**文件大小**: 最大10MB  
**尺寸要求**: 宽高比1:1, 3:4, 16:9

**上传方式**:

**方式一：文件上传**
```bash
POST /api/qianchuan/file/image/upload
Content-Type: multipart/form-data

upload_type=UPLOAD_BY_FILE
image_file=<file>
image_signature=<optional_md5>
```

**方式二：URL上传**
```bash
POST /api/qianchuan/file/image/upload
Content-Type: multipart/form-data

upload_type=UPLOAD_BY_URL
image_url=https://example.com/image.jpg
image_signature=<optional_md5>
```

#### 6.2 上传视频

**路径**: "素材管理" → "视频库" → "上传视频"

**支持格式**: MP4, MOV, AVI  
**文件大小**: 最大500MB  
**时长要求**: 5秒 - 60秒  
**尺寸要求**: 1080x1920 (竖版), 1280x720 (横版)

**上传方式**:
```bash
POST /api/qianchuan/file/video/upload
Content-Type: multipart/form-data

video_file=<file>
video_signature=<optional_md5>
```

#### 6.3 查看素材库

**图片列表**:
```
GET /api/qianchuan/file/image/get?page=1&page_size=20
```

**视频列表**:
```
GET /api/qianchuan/file/video/get?page=1&page_size=20
```

**返回字段**:
- 素材ID、文件名
- 预览URL
- 尺寸、大小
- 时长（视频）
- 上传时间

---

### 📈 7. 数据报表

#### 7.1 广告主报表

**路径**: "数据报表" → "广告主报表"

**API端点**:
```
POST /api/qianchuan/report/campaign/get
```

**请求参数**:
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "fields": [
    "stat_cost",        // 消耗
    "show_cnt",         // 展现量
    "click_cnt",        // 点击量
    "ctr",              // 点击率
    "pay_order_count",  // 成交订单数
    "pay_order_amount", // 成交金额
    "create_order_roi"  // ROI
  ],
  "marketing_goal": "VIDEO_AND_IMAGE",
  "order_platform": "ALL"
}
```

#### 7.2 广告计划报表

**API端点**:
```
POST /api/qianchuan/report/ad/get
```

**额外参数**:
- `ad_ids`: 指定广告ID列表
- `order_field`: 排序字段
- `order_type`: ASC/DESC
- `page`, `page_size`: 分页

#### 7.3 创意报表

**API端点**:
```
POST /api/qianchuan/report/creative/get
```

**支持字段**:
- 基础数据（展现、点击、消耗）
- 转化数据（订单数、成交额）
- 视频数据（播放完成率、平均播放时长）

#### 7.4 导出报表

**格式**: CSV / Excel  
**操作**: 点击"导出"按钮 → 选择日期范围 → 选择字段 → 下载

---

### ⚠️  8. 定向工具 (开发中)

**状态**: ❌ 后端handler未实现

**计划功能**:
- 地域定向查询
- 兴趣标签查询
- 行为标签查询
- 设备品牌查询

**SDK支持**: ✅ `qianchuanSDK/tools.go` 已实现

**预计上线**: 下个版本

---

### 👥 9. 人群包管理 (开发中)

**状态**: ❌ 后端handler未实现

**计划功能**:
- 创建自定义人群包
- 查看人群包列表
- 编辑人群包
- 删除人群包

**依赖**: 定向工具handler

**预计上线**: 下个版本

---

## 常见问题

### Q1: 登录后提示"未登录"

**原因**: Cookie未正确设置

**解决方案**:
1. 检查 `COOKIE_DOMAIN` 配置
2. 确保前后端域名一致
3. 开发环境设置 `COOKIE_SECURE=false`
4. 清除浏览器Cookie后重新登录

---

### Q2: Token过期如何处理？

**自动处理**: 系统会在Token过期前5分钟自动刷新

**手动刷新**:
```
POST /api/auth/refresh
```

**RefreshToken过期**: 需要重新登录

---

### Q3: 广告主列表显示余额为0

**原因**: AdvertiserList API 不返回余额字段

**当前版本**: 显示为0（占位）

**未来版本**: 将调用 AdvertiserInfo 或其他API获取真实余额

---

### Q4: 无法创建独立创意

**原因**: SDK未提供 CreativeCreate 方法

**解决方案**: 在创建广告时一并创建创意

**返回码**: 501 Not Implemented

---

### Q5: 上传素材失败

**可能原因**:
- 文件格式不支持
- 文件大小超限
- 网络超时

**解决方案**:
1. 检查文件格式和大小
2. 使用压缩后的文件
3. 重试上传

---

### Q6: 定向工具功能不可用

**原因**: 当前版本后端handler未实现

**状态**: 开发中

**临时方案**: 在千川后台手动配置定向

---

## 技术规格

### API规范

#### 请求格式

**GET请求**:
```
GET /api/qianchuan/{module}/{action}?param=value
Authorization: Cookie (自动携带)
```

**POST请求**:
```
POST /api/qianchuan/{module}/{action}
Content-Type: application/json
Authorization: Cookie (自动携带)

{
  "param": "value"
}
```

#### 响应格式

**成功响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": { /* 业务数据 */ }
}
```

**错误响应**:
```json
{
  "code": 500,
  "message": "错误描述"
}
```

**状态码**:
- `0`: 成功
- `400`: 参数错误
- `401`: 未登录
- `500`: 服务器错误
- `501`: 功能未实现

---

### 认证与授权

#### Cookie Session

**名称**: `session_name`  
**有效期**: 24小时  
**存储内容**:
```json
{
  "advertiser_id": 1234567890,
  "access_token": "xxx",
  "refresh_token": "yyy",
  "expires_at": 1704067200,
  "refresh_expires": 1706745600,
  "created_at": 1704067200
}
```

#### 受保护路由

所有 `/api/qianchuan/*` 路径需要登录

公开路由:
- `POST /api/oauth/exchange`

---

### 部署架构

```
Nginx (80/443)
  ├─> Frontend (Container 3000)
  └─> Backend (Container 8080)
      └─> qianchuanSDK
          └─> 千川API (api.oceanengine.com)
```

---

### 性能指标

| 指标 | 目标值 |
|------|--------|
| 首页加载时间 | < 2s |
| API响应时间 | < 500ms |
| 素材上传时间 | < 10s (10MB) |
| 报表查询时间 | < 3s |

---

### 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

### 安全特性

✅ OAuth2.0标准流程  
✅ CSRF防护 (state参数)  
✅ XSS防护 (HttpOnly Cookie)  
✅ HTTPS支持 (生产环境)  
✅ SameSite Cookie  
✅ Token自动刷新  

---

## 附录

### A. API端点清单

#### 认证模块
```
POST   /api/oauth/exchange         - OAuth code换session
GET    /api/user/info              - 获取用户信息
POST   /api/auth/logout            - 登出
POST   /api/auth/refresh           - 刷新session
```

#### 广告主模块
```
GET    /api/advertiser/list        - 广告主列表
GET    /api/advertiser/info        - 广告主详情
```

#### 广告计划模块
```
GET    /api/qianchuan/campaign/list              - 列表
POST   /api/qianchuan/campaign/create            - 创建
POST   /api/qianchuan/campaign/update            - 更新
POST   /api/qianchuan/campaign/status/update     - 状态更新
```

#### 广告模块
```
GET    /api/qianchuan/ad/list              - 列表
GET    /api/qianchuan/ad/get               - 详情
POST   /api/qianchuan/ad/create            - 创建
POST   /api/qianchuan/ad/update            - 更新
POST   /api/qianchuan/ad/status/update     - 状态更新
```

#### 创意模块
```
GET    /api/qianchuan/creative/list        - 列表
POST   /api/qianchuan/creative/create      - 创建 (501)
```

#### 文件模块
```
POST   /api/qianchuan/file/image/upload    - 上传图片
POST   /api/qianchuan/file/video/upload    - 上传视频
GET    /api/qianchuan/file/image/get       - 图片列表
GET    /api/qianchuan/file/video/get       - 视频列表
```

#### 报表模块
```
POST   /api/qianchuan/report/campaign/get  - 广告主报表
POST   /api/qianchuan/report/ad/get        - 广告计划报表
POST   /api/qianchuan/report/creative/get  - 创意报表
```

---

### B. 错误码对照表

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 0 | 成功 | - |
| 400 | 参数错误 | 检查请求参数 |
| 401 | 未登录 | 跳转登录页 |
| 500 | 服务器错误 | 联系技术支持 |
| 501 | 功能未实现 | 等待后续版本 |
| 40001 | Token过期 | 自动刷新 |
| 40002 | Token无效 | 重新登录 |

---

### C. 联系我们

**技术支持**: tech-support@example.com  
**产品反馈**: product@example.com  
**官方文档**: https://docs.example.com

---

**文档版本**: v1.0.0  
**最后更新**: 2025-11-10  
**维护团队**: AI Agent
