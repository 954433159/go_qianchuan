# 千川平台前端 - 重构版本

基于千川SDK官方文档和静态页面设计的完整前端重构。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问: http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

## 📚 文档索引

- **[设计系统使用指南](./DESIGN_SYSTEM_GUIDE.md)** - 千川设计系统完整说明
- **[重构进度追踪](./REFACTORING_PROGRESS.md)** - 实时更新的重构进度
- **[实施总结](./IMPLEMENTATION_SUMMARY.md)** - 已完成工作总结
- **[重构方案文档](../docs/frontend-refactoring/)** - 详细的重构方案

## 🎨 设计系统

### 千川品牌色

- 主色调：红橙渐变 `#EF4444` → `#F97316`
- 成功色：`#10B981`
- 警告色：`#F59E0B`
- 错误色：`#EF4444`

### 组件样式类

```tsx
// 按钮
<button className="qc-btn-primary">千川主按钮</button>
<button className="qc-btn-secondary">次要按钮</button>

// 卡片
<div className="qc-card">卡片内容</div>

// 徽章
<span className="qc-badge-success">成功</span>
<span className="qc-badge-warning">警告</span>

// GMV高亮
<span className="qc-gmv-highlight">¥120,000</span>

// ROI分级
<span className="qc-roi-excellent">6.8</span>  // 绿色
<span className="qc-roi-good">4.2</span>       // 黄色
<span className="qc-roi-poor">2.1</span>       // 红色
```

### 工具函数

```typescript
import {
  formatGMV,
  formatROI,
  formatPercent,
  getROIClassName,
} from '@/lib/design-tokens'

formatGMV(123456)           // "¥12.3万"
formatROI(6.789)            // "6.79"
formatPercent(0.234)        // "23.4%"
getROIClassName(6.5)        // "qc-roi-excellent"
```

## 🗂️ 项目结构

```
src/
├── config/              # 配置文件
│   └── routes.ts        # 路由配置
├── lib/                 # 工具库
│   └── design-tokens.ts # 设计系统工具
├── store/               # 状态管理
│   ├── authStore.ts
│   ├── campaignStore.ts
│   ├── promotionStore.ts
│   └── uiStore.ts
├── components/
│   ├── layout/          # 布局组件
│   ├── dashboard/       # 工作台组件
│   ├── campaign/        # 广告组组件
│   ├── promotion/       # 推广计划组件
│   ├── common/          # 通用组件
│   └── ui/              # UI基础组件
├── pages/               # 页面组件
├── api/                 # API层
├── hooks/               # 自定义Hooks
└── types/               # TypeScript类型
```

## 🔄 状态管理

使用 Zustand 进行状态管理：

```typescript
// Campaign Store 示例
import { useCampaignStore } from '@/store/campaignStore'

const {
  campaigns,
  getFilteredCampaigns,
  toggleSelect,
  batchUpdateStatus,
} = useCampaignStore()
```

## 📦 核心依赖

- **React 18** - UI框架
- **TypeScript** - 类型系统
- **React Router v6** - 路由管理
- **Zustand** - 状态管理
- **Tailwind CSS** - 样式框架
- **Tremor React** - 数据可视化
- **Radix UI** - 无样式UI组件
- **Lucide React** - 图标库

## 🎯 开发规范

### 1. 组件开发

```tsx
// ✅ 使用千川设计系统
<button className="qc-btn-primary">确定</button>

// ❌ 避免硬编码样式
<button className="bg-red-500 text-white">确定</button>
```

### 2. 数据格式化

```tsx
// ✅ 使用工具函数
{formatGMV(gmv)}

// ❌ 避免重复逻辑
¥{(gmv / 10000).toFixed(1)}万
```

### 3. 状态管理

```tsx
// ✅ 使用 Store
const { campaigns } = useCampaignStore()

// ❌ 避免 prop drilling
<Child data={data} onChange={onChange} />
```

## 🔍 代码质量

### TypeScript 严格模式

所有代码通过 TypeScript 严格模式检查，0错误。

### ESLint 规则

遵循 React 和 TypeScript 最佳实践。

## 📈 性能优化

- ✅ 路由懒加载 - 使用 `React.lazy`
- ✅ 组件懒加载 - 按需导入
- ✅ 状态管理优化 - Zustand 轻量级
- ✅ CSS优化 - Tailwind JIT模式
- ✅ 图片懒加载 - loading="lazy"

## 🔐 开发模式预览

开发模式下可以使用 URL 参数跳过登录：

```
http://localhost:5173/dashboard?preview=true
```

## 🐛 问题排查

### TypeScript 错误

```bash
npm run type-check
```

### ESLint 错误

```bash
npm run lint
```

### 构建错误

```bash
rm -rf node_modules
npm install
npm run build
```

## 📝 提交规范

```bash
feat: 添加新功能
fix: 修复bug
style: 样式调整
refactor: 代码重构
docs: 文档更新
test: 测试相关
chore: 构建/工具链
```

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目仅供内部使用。

## 🔗 相关链接

- [千川SDK官方文档](../QIANCHUAN.md)
- [静态页面参考](../html/qianchuan/)
- [重构方案文档](../docs/frontend-refactoring/)

---

**当前版本**: v1.0.0  
**开发状态**: 进行中 🚀  
**最后更新**: 2025-11-11
