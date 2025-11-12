# 前端项目深度分析（文件结构、路径与完成度）

目标：系统梳理 /Users/wushaobing911/Desktop/douyin/frontend 的模块、文件与路径，评估与 /html 静态页面的一致性与完成度。

## 1. 技术栈与运行
- 框架：React 18 + TypeScript 5 + Vite 5
- 状态：Zustand；HTTP：Axios；样式：Tailwind；图表：Tremor；表单：React Hook Form + Zod
- 路由：React Router v6（src/App.tsx）

## 2. 目录结构速览（关键路径）
- src/App.tsx（路由注册）
- src/pages/
  - Dashboard.tsx、Advertisers.tsx、Campaigns.tsx、Ads.tsx、Creatives.tsx、Media.tsx、Reports.tsx、Audiences.tsx
  - Login.tsx、AuthCallback.tsx
- src/components/
  - layout/{Layout,Header,Sidebar}.tsx
  - campaign/CreateCampaignDialog.tsx
  - ad/CreateAdDialog.tsx
  - targeting/{TargetingSelector,InterestSelector,ActionSelector,RegionSelector,DeviceBrandSelector,PlatformNetworkCarrierSelector}.tsx
  - common/{PageHeader,Table,EmptyState,...}
- src/api/{auth.ts, report.ts, tools.ts, ...}
- src/store/{authStore.ts, ...}

## 3. 页面完成度（与 /html 对照）
- 已有：/dashboard、/advertisers、/campaigns、/ads、/creatives、/media、/audiences、/reports、/login、/auth/callback
- 缺失：/tools/targeting；以及 /advertisers/:id、/campaigns/new、/campaigns/:id、/campaigns/:id/edit、/ads/new、/creatives/upload 等深链

## 4. Sidebar（侧边栏）一致性
- 目标：5 组 9 项（概览、广告管理×3、内容管理×2、工具×2、数据分析×1）
- 现状：缺少“工具”组；“人群包”位于“内容管理”；无“定向工具”入口

## 5. 组件能力盘点
- CreateAdDialog：包含完整定向能力（兴趣/行为/地域/设备品牌/平台网络运营商/人群包选择）
- CreateCampaignDialog：计划创建流程完备
- Targeting 选择器：可直接复用到“定向工具”工作台
- Media：上传与列出已覆盖；Creatives：缺“上传”深链

## 6. API 层
- auth.ts：OAuth 与用户信息；
- report.ts：广告/计划/创意统计；
- tools.ts：兴趣/行为/地域/设备/品牌/平台/网络/运营商 + Audiences CRUD；
- 差异：尚未显式覆盖“行业/类目/词包”3 组接口（可扩展/Mock）。

## 7. 与开源/互联网规范的匹配（要点）
- OAuth 安全：回调 state 校验、HttpOnly Cookie、前后端分责（已具备）
- 速率限制：前端提示 429/重试策略、输入去抖（建议补充）
- 素材规范：图片≤5MB、视频≤100MB、5-60s（Media 页面可提示与校验）
- DMP：人群包来源、覆盖度与更新频次（建议在 Audiences 增补字段展示）

## 8. 主要差异与机会
- P0：Sidebar 统一 + /tools/targeting 页面与路由
- P1：深链详情/编辑/创建页；Creatives 上传深链
- P2：Breadcrumb、A11y、性能与加载策略

## 9. 结论
- 核心链路已具备（列表/创建/上传/报表/人群包），可生产演示
- 与静态页面对齐的主要缺口集中在“导航一致性 + 定向工具工作台 + 深链直达”
- 已在 docs/01~08 给出详细落地方案与验收标准

