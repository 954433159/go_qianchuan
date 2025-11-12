# 前端开发环境配置指南

## 📋 目录
- [系统要求](#系统要求)
- [环境准备](#环境准备)
- [项目安装](#项目安装)
- [环境变量配置](#环境变量配置)
- [开发工具配置](#开发工具配置)
- [常见问题](#常见问题)

---

## 系统要求

### 必需软件
- **Node.js**: >= 18.0.0 (推荐 18.x LTS 或 20.x LTS)
- **npm**: >= 9.0.0 (随Node.js安装)
- **Git**: >= 2.30.0

### 推荐软件
- **VS Code**: 最新版本
- **Chrome DevTools**: 用于调试

### 操作系统
- macOS 10.15+
- Windows 10/11
- Linux (Ubuntu 20.04+)

---

## 环境准备

### 1. 检查Node.js版本

```bash
# 检查Node.js版本
node -v
# 应该显示: v18.x.x 或更高

# 检查npm版本
npm -v
# 应该显示: 9.x.x 或更高
```

### 2. 如果需要安装Node.js

#### macOS (使用Homebrew)
```bash
# 安装Homebrew (如果还没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js LTS版本
brew install node@18

# 验证安装
node -v
npm -v
```

#### macOS/Windows (使用nvm)
```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装Node.js 18
nvm install 18
nvm use 18

# 验证安装
node -v
npm -v
```

#### Windows (使用安装包)
1. 访问 https://nodejs.org/
2. 下载 LTS 版本
3. 运行安装程序
4. 验证安装

---

## 项目安装

### 1. 克隆或定位项目

```bash
# 项目位置
cd /Users/wushaobing911/Desktop/douyin/html

# 或者如果是克隆
# git clone <repository-url>
# cd html
```

### 2. 安装依赖

```bash
# 清理可能存在的缓存
rm -rf node_modules package-lock.json

# 安装所有依赖
npm install

# 等待安装完成...
# 这可能需要2-5分钟，取决于网络速度
```

### 3. 验证安装

```bash
# 检查是否安装成功
npm list --depth=0

# 应该看到所有主要依赖:
# ├── react@18.2.0
# ├── react-dom@18.2.0
# ├── react-router-dom@6.20.0
# ├── zustand@4.4.7
# ├── axios@1.6.2
# └── ... 其他依赖
```

---

## 环境变量配置

### 1. 创建环境变量文件

```bash
# 复制示例文件
cp .env.example .env

# 编辑环境变量
nano .env  # 或使用你喜欢的编辑器
```

### 2. 配置内容详解

创建 `.env` 文件，包含以下内容：

```env
# API服务器地址
# 开发环境: 后端开发服务器地址
# 生产环境: 生产API域名
VITE_API_BASE_URL=http://localhost:8080

# OAuth配置 - 千川开放平台
# 在 https://open.oceanengine.com/ 创建应用后获取
VITE_OAUTH_APP_ID=your_app_id_here
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# OAuth授权页面地址 (千川官方地址，通常不需要修改)
VITE_OAUTH_URL=https://open.oceanengine.com/oauth/connect
```

### 3. 环境变量说明

#### VITE_API_BASE_URL
- **用途**: 后端API服务器基础地址
- **开发环境**: `http://localhost:8080` 或后端开发服务器地址
- **生产环境**: `https://api.yourdomain.com`
- **注意**: 
  - 不要以 `/` 结尾
  - 必须包含协议 (http:// 或 https://)
  - 确保后端服务已启动

#### VITE_OAUTH_APP_ID
- **用途**: 千川开放平台应用ID
- **获取方式**:
  1. 访问 https://open.oceanengine.com/
  2. 登录并创建应用
  3. 在应用详情中获取 App ID
- **格式**: 纯数字字符串，如 `1234567890123456`

#### VITE_OAUTH_REDIRECT_URI
- **用途**: OAuth授权成功后的回调地址
- **开发环境**: `http://localhost:5173/auth/callback`
- **生产环境**: `https://yourdomain.com/auth/callback`
- **注意**:
  - 必须与千川开放平台配置的回调地址完全一致
  - 包含协议、域名、端口和路径
  - 路径固定为 `/auth/callback`

#### VITE_OAUTH_URL
- **用途**: 千川OAuth授权页面地址
- **默认值**: `https://open.oceanengine.com/oauth/connect`
- **注意**: 一般不需要修改，除非千川更改了授权地址

### 4. 环境文件优先级

```
.env.local        # 本地覆盖（最高优先级，不提交Git）
.env.development  # 开发环境
.env.production   # 生产环境
.env              # 默认配置（最低优先级）
```

### 5. 获取千川API凭证

#### 步骤1: 注册千川开放平台账号
1. 访问 https://open.oceanengine.com/
2. 点击"注册"或"登录"
3. 使用企业信息完成注册

#### 步骤2: 创建应用
1. 登录后，进入"应用管理"
2. 点击"创建应用"
3. 填写应用信息:
   - 应用名称: 千川SDK管理平台
   - 应用类型: Web应用
   - 应用简介: 千川广告管理平台

#### 步骤3: 配置应用
1. 在应用详情页，记录 **App ID**
2. 配置授权回调地址:
   - 开发环境: `http://localhost:5173/auth/callback`
   - 生产环境: `https://yourdomain.com/auth/callback`
3. 申请API权限:
   - 广告主管理权限
   - 广告计划管理权限
   - 广告管理权限
   - 创意管理权限
   - 数据报表权限

#### 步骤4: 获取App Secret
1. 在应用详情中找到 **App Secret**
2. **重要**: App Secret 只在后端使用，不要放在前端代码中
3. 将 App Secret 交给后端开发人员

---

## 开发工具配置

### VS Code 配置

#### 1. 安装推荐扩展

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",           // ESLint
    "esbenp.prettier-vscode",           // Prettier
    "bradlc.vscode-tailwindcss",        // Tailwind CSS智能提示
    "dsznajder.es7-react-js-snippets",  // React代码片段
    "ms-vscode.vscode-typescript-next"  // TypeScript
  ]
}
```

#### 2. VS Code 设置 (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### 3. 创建配置文件

```bash
# 创建 .vscode 目录
mkdir -p .vscode

# 创建 settings.json
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
EOF

# 创建 extensions.json
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
EOF
```

### Chrome DevTools 配置

#### 1. 安装React DevTools扩展
1. 访问 Chrome Web Store
2. 搜索 "React Developer Tools"
3. 点击"添加到Chrome"

#### 2. 配置开发者工具
- 打开 Chrome DevTools (F12 或 Cmd+Option+I)
- 进入 Settings (F1)
- 启用以下选项:
  - ✅ Enable JavaScript source maps
  - ✅ Enable CSS source maps
  - ✅ Disable cache (while DevTools is open)

---

## 启动开发服务器

### 1. 启动前端开发服务器

```bash
# 确保在项目根目录
cd /Users/wushaobing911/Desktop/douyin/html

# 启动开发服务器
npm run dev

# 看到以下输出表示成功:
# VITE v5.0.8  ready in 234 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
# ➜  press h to show help
```

### 2. 访问应用

```bash
# 在浏览器中打开
open http://localhost:5173

# 或手动访问
# Chrome: http://localhost:5173
```

### 3. 开发服务器命令

```bash
# 启动开发服务器
npm run dev

# 启动并自动打开浏览器
npm run dev -- --open

# 指定端口启动
npm run dev -- --port 3000

# 允许外部访问(局域网)
npm run dev -- --host
```

### 4. 热重载说明

- ✅ 文件保存后自动刷新
- ✅ 保持组件状态 (React Fast Refresh)
- ✅ 即时更新样式
- ✅ TypeScript错误实时提示

---

## 验证开发环境

### 1. 检查清单

运行以下命令验证环境:

```bash
# 1. 检查Node版本
node -v
# 期望: v18.0.0 或更高

# 2. 检查npm版本
npm -v
# 期望: 9.0.0 或更高

# 3. 检查依赖安装
npm list --depth=0
# 期望: 无错误，显示所有依赖

# 4. TypeScript类型检查
npm run type-check
# 期望: 无错误

# 5. 构建测试
npm run build
# 期望: 成功构建，生成dist目录

# 6. 启动开发服务器
npm run dev
# 期望: 在 http://localhost:5173 看到登录页面
```

### 2. 功能验证

在浏览器中验证:

- ✅ 页面正常加载
- ✅ 样式正确显示
- ✅ 路由切换正常
- ✅ React DevTools能看到组件树
- ✅ Console无错误信息

---

## 常见问题

### 问题1: 端口已被占用

```bash
# 错误信息
# Error: listen EADDRINUSE: address already in use :::5173

# 解决方案1: 更换端口
npm run dev -- --port 3000

# 解决方案2: 查找并关闭占用端口的进程
lsof -ti:5173 | xargs kill -9
```

### 问题2: 依赖安装失败

```bash
# 错误信息
# npm ERR! code ERESOLVE

# 解决方案1: 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 解决方案2: 使用legacy peer deps
npm install --legacy-peer-deps

# 解决方案3: 更新npm版本
npm install -g npm@latest
```

### 问题3: TypeScript错误

```bash
# 错误信息
# Cannot find module '@/...' or its corresponding type declarations

# 解决方案: 重启TypeScript服务器
# VS Code: Cmd+Shift+P > TypeScript: Restart TS Server

# 或者重新生成tsconfig
npx tsc --init
```

### 问题4: 环境变量不生效

```bash
# 检查1: 确认文件名正确
ls -la | grep .env
# 应该看到 .env 文件

# 检查2: 确认变量前缀
# 所有环境变量必须以 VITE_ 开头

# 检查3: 重启开发服务器
# 修改 .env 后必须重启服务器
npm run dev
```

### 问题5: Tailwind CSS样式不生效

```bash
# 检查1: 确认tailwind.config.js配置
cat tailwind.config.js

# 检查2: 确认index.css导入
grep -r "tailwindcss" src/index.css

# 解决方案: 重新构建
rm -rf node_modules/.vite
npm run dev
```

### 问题6: 热重载不工作

```bash
# 解决方案1: 检查文件监听
# macOS可能需要增加文件监听限制
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 解决方案2: 禁用浏览器缓存
# Chrome DevTools > Network > Disable cache

# 解决方案3: 重启开发服务器
npm run dev
```

---

## 开发最佳实践

### 1. Git工作流

```bash
# 拉取最新代码
git pull origin main

# 创建功能分支
git checkout -b feature/your-feature

# 提交代码
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/your-feature
```

### 2. 代码规范

```bash
# 运行ESLint检查
npm run lint

# 运行TypeScript检查
npm run type-check

# 格式化代码(如果配置了Prettier)
npm run format
```

### 3. 性能监控

在开发时关注:
- 组件渲染次数 (React DevTools Profiler)
- 网络请求时间 (Network面板)
- Bundle大小 (Build输出)

---

## 下一步

环境配置完成后，请继续阅读:

1. **02-API-INTEGRATION.md** - 后端API对接指南
2. **03-COMPONENT-DEVELOPMENT.md** - 组件开发指南
3. **04-STATE-MANAGEMENT.md** - 状态管理指南
4. **05-TESTING-GUIDE.md** - 测试指南

---

## 需要帮助？

如遇到问题:
1. 查看本文档的"常见问题"部分
2. 检查项目README.md
3. 查看项目Issues
4. 联系团队成员

---

**开发环境配置完成！现在可以开始开发了。** 🚀
