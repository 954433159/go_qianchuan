# 前端与静态 HTML 对齐：总览与现状评估

本文档基于以下代码与资源进行深度摸底与对齐评估：
- React 前端：/Users/wushaobing911/Desktop/douyin/frontend
- 静态页面：/Users/wushaobing911/Desktop/douyin/html（18 个基准页面）
- 参考开源要求：https://github.com/CriarBrand/qianchuanSDK

## 1. 结论摘要（TL;DR）
- Sidebar 导航结构与静态版不完全一致：React 版缺少「工具」分组，且将「人群包」放在了「内容管理」下。
- 路由缺口：缺少 /tools/targeting 页面与路由；静态 HTML 中的多个“详情/编辑/创建”独立页在 React 中以对话框形式存在（无深链路由）。
- 功能覆盖：核心功能（广告主/计划/广告/创意/媒体/报表/人群包）已可用；定向能力完整（已用于创建广告），但缺少独立「定向工具」工作台页。
- 与开源要求一致性：API 与 UI 具备对接基础；建议补齐「工具入口与路由」+「详情页/编辑页深链」以提升一致性与可用性。

建议先按 Phase 1 完成“导航与路由对齐 + 定向工具页”，随后视需求迭代“详情/编辑深链路由”。

## 2. 目录结构与关键文件映射
- 前端页面（React，当前 10 页）：
  - src/pages/{Dashboard, Advertisers, Campaigns, Ads, Creatives, Media, Reports, Audiences, Login, AuthCallback}.tsx
  - 路由注册：src/App.tsx
  - 布局与导航：src/components/layout/{Layout, Header, Sidebar}.tsx
- 静态页面（HTML，18 页）作为 UI 参考基线：
  - index.html, dashboard.html, login.html, callback.html
  - advertisers.html, advertiser-detail.html
  - campaigns.html, campaign-{create,edit,detail}.html
  - ads.html, ad-create.html
  - creatives.html, creative-upload.html
  - media.html
  - tools-targeting.html  ← 缺少对应 React 页
  - audiences.html, reports.html

## 3. Sidebar 目标形态（静态基线，9 个入口，5 个分组）
- 概览：工作台 (/dashboard)
- 广告管理：广告主(/advertisers)、广告计划(/campaigns)、广告(/ads)
- 内容管理：创意(/creatives)、媒体库(/media)
- 工具：定向工具(/tools/targeting)、人群包(/audiences)
- 数据分析：数据报表(/reports)

现状：React 版无“工具”分组，人群包被放在“内容管理”，且缺少 /tools/targeting 路由与页面。

## 4. 路由对齐现状
- 已有：/dashboard, /advertisers, /campaigns, /ads, /creatives, /media, /audiences, /reports, /login, /auth/callback
- 缺失：/tools/targeting（定向工具工作台）
- 差异：静态 HTML 存在独立详情/编辑/创建页面；React 目前以对话框（Dialog）形态实现（无深链直达 URL）

取舍建议：保留高效的对话框创建体验，同时新增深链（如 /campaigns/new、/ads/new、/campaigns/:id、/campaigns/:id/edit）用于分享/书签/回访。

## 5. 功能覆盖核对（聚焦“工具/定向”与“按钮链接”）
- 定向功能：兴趣/行为/地域/设备品牌/平台/网络/运营商 已在 CreateAdDialog 中完备，组件位于 src/components/targeting/*。
- 人群包：列表/创建/编辑/删除 完整（src/pages/Audiences.tsx），API 对应 src/api/tools.ts。
- 按钮链接：页面级 CTA 基本可用；Creatives 的“上传创意”尚未挂接（建议对齐为 Dialog 或 /creatives/upload）。

## 6. 与 qianchuanSDK 开源要求的对齐
- API 安全：前端已采用 OAuth 回调 + 会话管理（后端代理假定存在），建议补充限频与错误态可视化。
- 数据安全：无前端明文秘钥；建议在文档中强调 Cookie/CSRF/XSS 约束与后端要求（README 已有纲要）。
- 物料规范：Media 页已有体积/格式校验文案，建议补充更多校验提示与失败原因透出。
- DMP 人群包：已具备；建议加入“覆盖度趋势/更新时间/来源类型”展示。

## 7. 快速改进清单（Quick Wins）
1) Sidebar 对齐：新增“工具”分组；移动“人群包”；新增“定向工具”入口。
2) 新增页面与路由：/tools/targeting（复用现有 Targeting* 组件，提供独立的探索/保存受众体验）。
3) Dashboard 快捷入口对齐静态版：补齐“广告/创意/人群包/定向工具”。
4) Creatives：“上传创意”接入 Dialog 或 /creatives/upload。
5) 文档化：生成对齐矩阵、路由方案、组件完善计划与实施方案（已在本套文档中）。

## 8. 后续增强（Phase 2+）
- 深链详情/编辑页：广告主详情、计划详情/编辑、广告创建深链等。
- 面包屑与路由守卫：统一在 PageHeader 与 App.tsx 控制。
- 可观测性：全局 Loading/Error Portal + 网络失败重试策略。
- 可访问性：键盘导航/ARIA 标签检查与补齐。

## 9. 验收口径（本阶段）
- Sidebar 与静态版一致（含“工具”分组与 9 个入口）。
- /tools/targeting 页功能可用：可选兴趣/行为/地域/设备/平台网络运营商，且支持保存为人群包或导出配置。
- Dashboard 快捷入口覆盖度 ≥ 静态基线。
- Creatives 上传入口可用（Dialog 或路由）。

> 详细差异列表、任务方案与验收标准详见本目录下 02~07 文档。
