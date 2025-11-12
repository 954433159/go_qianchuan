# 页面预览导航指南

## 🎨 如何查看所有页面

### 方法1：开发模式预览（推荐）

在开发环境中，可以通过在 URL 后添加 `?preview=true` 参数来跳过登录，直接预览所有页面。

#### 使用方法：

访问任何页面时，在 URL 后面加上 `?preview=true`

例如：
```
http://localhost:3000/dashboard?preview=true
http://localhost:3000/advertisers?preview=true
http://localhost:3000/campaigns?preview=true
```

**注意**：此功能仅在开发模式（`npm run dev`）下可用，生产环境不可用。

---

## 📄 所有页面列表

### 公开页面（无需登录）

1. **登录页面**
   - URL: `http://localhost:3000/login`
   - 描述: 用户登录界面，OAuth 认证入口

2. **OAuth 回调页面**
   - URL: `http://localhost:3000/auth/callback`
   - 描述: OAuth 认证回调处理页面

---

### 主要业务页面（需登录或 preview 模式）

#### 1. 仪表板
- **URL**: `http://localhost:3000/dashboard?preview=true`
- **描述**: 数据概览、关键指标展示
- **功能**: 显示广告投放整体数据、趋势图表

#### 2. 广告主管理
- **列表页**: `http://localhost:3000/advertisers?preview=true`
  - 功能: 查看所有广告主账户
  
- **详情页**: `http://localhost:3000/advertisers/123?preview=true`
  - 功能: 查看广告主详细信息（替换 123 为实际ID）

#### 3. 广告计划管理
- **列表页**: `http://localhost:3000/campaigns?preview=true`
  - 功能: 查看所有广告计划
  
- **创建页**: `http://localhost:3000/campaigns/new?preview=true`
  - 功能: 创建新的广告计划
  
- **详情页**: `http://localhost:3000/campaigns/123?preview=true`
  - 功能: 查看广告计划详情
  
- **编辑页**: `http://localhost:3000/campaigns/123/edit?preview=true`
  - 功能: 编辑广告计划

#### 4. 广告管理
- **列表页**: `http://localhost:3000/ads?preview=true`
  - 功能: 查看所有广告
  
- **创建页**: `http://localhost:3000/ads/new?preview=true`
  - 功能: 创建新广告
  
- **详情页**: `http://localhost:3000/ads/123?preview=true`
  - 功能: 查看广告详情
  
- **编辑页**: `http://localhost:3000/ads/123/edit?preview=true`
  - 功能: 编辑广告

#### 5. 创意管理
- **列表页**: `http://localhost:3000/creatives?preview=true`
  - 功能: 查看和管理创意素材
  
- **上传页**: `http://localhost:3000/creatives/upload?preview=true`
  - 功能: 上传新的创意素材

#### 6. 媒体库
- **URL**: `http://localhost:3000/media?preview=true`
- **功能**: 管理图片、视频等媒体资源

#### 7. 受众管理
- **URL**: `http://localhost:3000/audiences?preview=true`
- **功能**: 管理定向人群包

#### 8. 数据报表
- **URL**: `http://localhost:3000/reports?preview=true`
- **功能**: 查看广告投放数据报表、分析

#### 9. 定向工具
- **URL**: `http://localhost:3000/tools/targeting?preview=true`
- **功能**: 受众定向配置工具

---

## 🚀 快速预览所有页面

在浏览器中依次访问以下 URL（复制整个列表到浏览器书签或新建文本文件）：

```
# 公开页面
http://localhost:3000/login

# 主要页面
http://localhost:3000/dashboard?preview=true
http://localhost:3000/advertisers?preview=true
http://localhost:3000/campaigns?preview=true
http://localhost:3000/ads?preview=true
http://localhost:3000/creatives?preview=true
http://localhost:3000/media?preview=true
http://localhost:3000/audiences?preview=true
http://localhost:3000/reports?preview=true
http://localhost:3000/tools/targeting?preview=true

# 创建/编辑页面
http://localhost:3000/campaigns/new?preview=true
http://localhost:3000/ads/new?preview=true
http://localhost:3000/creatives/upload?preview=true
```

---

## 💡 提示

1. **预览模式下的数据**
   - 由于没有真实登录，页面可能显示空数据或示例数据
   - 需要后端 API 的功能可能无法正常工作
   - 主要用于查看页面布局和UI设计

2. **生产环境**
   - 生产环境中 `?preview=true` 参数无效
   - 必须通过正常的 OAuth 流程登录

3. **真实登录**
   - 配置 `.env` 文件中的 `VITE_OAUTH_APP_ID`
   - 点击登录页面的"使用千川账号登录"按钮
   - 完成 OAuth 认证流程

---

## 🔧 开发技巧

### 在开发工具中快速切换页面

按 F12 打开开发者工具，在 Console 中运行：

```javascript
// 切换到仪表板
location.href = '/dashboard?preview=true'

// 切换到广告列表
location.href = '/ads?preview=true'

// 切换到创建广告页
location.href = '/ads/new?preview=true'
```

### 在侧边栏导航

一旦进入任何 `?preview=true` 的页面，左侧会显示导航栏，可以直接点击切换到其他页面。

---

**最后更新**: 2025-11-10
