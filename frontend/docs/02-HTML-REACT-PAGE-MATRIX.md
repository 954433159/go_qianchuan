# HTML 与 React 页面对照矩阵

对照来源：/Users/wushaobing911/Desktop/douyin/html（18 个静态页面） vs /Users/wushaobing911/Desktop/douyin/frontend（React SPA，10 条路由）。

标记说明：
- ✅ 已对齐（已有对应 React 页面/路由）
- 🔧 以 Dialog 形式替代（建议补深链路由）
- ⏳ 建议新增（缺少对应 React 页面/路由）
- ❌ 缺失（高优先级缺口）

## 映射清单（18 → 10）
- index.html → React：无独立 index，默认重定向到 /dashboard（接受）✅
- dashboard.html → /dashboard → src/pages/Dashboard.tsx ✅
- login.html → /login → src/pages/Login.tsx ✅
- callback.html → /auth/callback → src/pages/AuthCallback.tsx ✅
- advertisers.html → /advertisers → src/pages/Advertisers.tsx ✅
- advertiser-detail.html → 建议 /advertisers/:id → src/pages/AdvertiserDetail.tsx ⏳
- campaigns.html → /campaigns → src/pages/Campaigns.tsx ✅
- campaign-create.html → 现为 CreateCampaignDialog（建议 /campaigns/new）→ src/pages/CampaignCreate.tsx 🔧/⏳
- campaign-edit.html → 建议 /campaigns/:id/edit → src/pages/CampaignEdit.tsx ⏳
- campaign-detail.html → 建议 /campaigns/:id → src/pages/CampaignDetail.tsx ⏳
- ads.html → /ads → src/pages/Ads.tsx ✅
- ad-create.html → 现为 CreateAdDialog（建议 /ads/new）→ src/pages/AdCreate.tsx 🔧/⏳
- creatives.html → /creatives → src/pages/Creatives.tsx ✅
- creative-upload.html → 建议 /creatives/upload → src/pages/CreativeUpload.tsx ⏳
- media.html → /media → src/pages/Media.tsx ✅
- tools-targeting.html → 建议 /tools/targeting → src/pages/ToolsTargeting.tsx ❌/⏳
- audiences.html → /audiences → src/pages/Audiences.tsx ✅
- reports.html → /reports → src/pages/Reports.tsx ✅

## 汇总
- 静态 18 页 vs React 10 路由，存在 8 个深链/新页缺口。
- 最高优先级缺口：/tools/targeting（定向工具工作台）。
- 重要深链建议：/advertisers/:id、/campaigns/new、/campaigns/:id、/campaigns/:id/edit、/ads/new、/creatives/upload。

## 建议（按阶段）
- Phase 1（P0）：新增 /tools/targeting；统一 Sidebar（新增“工具”，迁移“人群包”）；Creatives 增补上传入口（对话框或 /creatives/upload）。
- Phase 2（P1）：补足详情/编辑/创建的深链路由（广告主、计划、广告）。
- Phase 3（P2）：完善 breadcrumb、页面级空态/错误态、返回导航策略等。
