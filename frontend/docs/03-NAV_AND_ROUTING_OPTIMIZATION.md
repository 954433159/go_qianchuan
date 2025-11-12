# 路由与导航优化方案（对齐静态 HTML 设计）

目标：在不破坏现有体验的前提下，将 React 前端的导航与路由完全对齐静态 HTML 的 5 组 9 项导航与 18 页基线。

## 1. 目标导航结构（Sidebar）
- 概览
  - 工作台：/dashboard
- 广告管理
  - 广告主：/advertisers
  - 广告计划：/campaigns
  - 广告：/ads
- 内容管理
  - 创意：/creatives
  - 媒体库：/media
- 工具（新增分组）
  - 定向工具：/tools/targeting（新增）
  - 人群包：/audiences（从“内容管理”迁移至“工具”）
- 数据分析
  - 数据报表：/reports

验收：Sidebar.tsx 渲染的分组与顺序、图标与文案、激活态均与上表一致。

## 2. 最小变更代码草案
- 修改：src/components/layout/Sidebar.tsx
  - 新增“工具”分组，移动“人群包”，新增“定向工具”。
- 修改：src/App.tsx
  - 新增路由 <Route path="/tools/targeting" element={<ToolsTargeting/>} />
  - 若暂未实现页面，可先使用占位页，不影响上线节奏。

## 3. 路由对齐清单（含建议深链）
- 已有：/dashboard, /advertisers, /campaigns, /ads, /creatives, /media, /audiences, /reports, /login, /auth/callback
- 新增（P0）：/tools/targeting
- 建议（P1 深链）：
  - /advertisers/:id（广告主详情）
  - /campaigns/new（创建计划）
  - /campaigns/:id（计划详情）
  - /campaigns/:id/edit（编辑计划）
  - /ads/new（创建广告）
  - /creatives/upload（上传创意）

## 4. 面包屑（Breadcrumb）规范
- 列表页：工作台 / 模块 / 列表
- 详情页：工作台 / 模块 / 列表 / 详情（#ID）
- 编辑页：工作台 / 模块 / 列表 / 详情 / 编辑
- 创建页：工作台 / 模块 / 列表 / 新建

## 5. 页面级 CTA 与跳转规范
- 列表页“新建”按钮：优先打开 Dialog；同时在更多入口提供“在新页面打开”（跳 /new 深链）。
- 表格行“查看/编辑”：优先路由跳转（/id 或 /id/edit）；保持可分享与可回访。

## 6. Dashboard 快捷入口对齐
- 建议至少包含：广告、广告计划、创意、媒体库、人群包、定向工具、报表、广告主（与静态 index.html 八宫格一致或更丰富）。

## 7. 渐进式上线策略
- 第一步（P0）：Sidebar 分组与 /tools/targeting route；Dashboard 卡片补齐；Creatives 上传入口可用（Dialog 或 /upload）。
- 第二步（P1）：补齐深链路由与面包屑；为 Dialog 同时支持路由直达（带状态的 Modal Route）。
- 第三步（P2）：可访问性（A11y）与键盘导航、聚焦管理、ARIA 标签统一。

## 8. 风险与回退
- 风险：路由调整导致书签失效。对策：保留旧路径临时 Redirect（如 audiences 从内容管理迁回工具组不改路径，仅改 Sidebar 分组表现）。
- 风险：Sidebar 改动影响选中态。对策：以 path 开头匹配判断 active（如 startsWith）。

## 9. 验收标准
- Sidebar 显示 5 组 9 项，顺序一致；
- /tools/targeting 可访问（占位或正式页均可）；
- Dashboard 快捷入口覆盖静态基线；
- 关键页面具备可回访深链（最少 /campaigns/new 与 /creatives/upload）。
