# 静态页面 vs SPA 功能对照

目的: 将 `html/` 中的静态页面与 `frontend/` SPA 实际页面进行一一/一对多映射，对照功能要点与缺口。

说明: 下列为按业务域归纳的代表性映射，完整列表过长，建议按域分批对齐实施。

— 账号/授权
- 静态: `accounts.html`, `account-*.html`, `brand-*.html`, `shop-*.html`
- SPA: `AccountCenter.tsx`, `AccountAdvertiserPublic.tsx`, `BrandAuthorizedList.tsx`, `AccountShopAuth.tsx`
- 差异: 静态页中的“安全中心/操作日志/多维授权视图”在 SPA 中入口分散或未完整对齐；建议在 AccountCenter 聚合导航

— 活动/广告/创意
- 静态: `campaigns.html`, `campaign-*.html`, `ad-*.html`, `creatives.html`, `creative-*.html`
- SPA: `Campaigns/CampaignCreate/CampaignEdit.tsx`, `Ads/AdCreate/AdEdit.tsx`, `Creatives/CreativeUpload/CreativeDetail.tsx`
- 差异: 批量操作/建议与学习状态基本对齐；静态页“创意审核建议/词包”等深水区功能在 SPA 有组件与入口，但流程未完全闭合

— 财务
- 静态: `finance-*.html`, `refund-*.html`, `transfer-*.html`
- SPA: `FinanceWallet.tsx`, `FinanceBalance.tsx`, `FinanceTransactions.tsx`, `TransferCreate/Commit.tsx`, `RefundCreate/Commit.tsx`
- 差异: 基本一致；可增强对账/发票视图与大表虚拟化

— 报表
- 静态: `reports.html`, `report-*.html`
- SPA: `Reports.tsx`（基础版说明 + 若干报表入口）, `LiveData/LiveRooms/Detail.tsx`
- 差异: 静态页有“自定义/高级/素材/搜索词/流失用户”等，SPA 仅基础版与直播数据；需要分阶段对齐

— 随心推（Aweme）
- 静态: `suixintui-*.html`, `aweme-*.html`
- SPA: `AwemeOrders/AwemeOrderCreate/AwemeOrderDetail/AwemeOrderEffect.tsx`, `AwemeTools.tsx`
- 差异: 主要链路已闭环；建议完善“兴趣标签/建议投放时段”辅助页

— 全域推广（Uni Promotion）
- 静态: `uni-promotion-*.html`
- SPA: `UniPromotions/Create/Edit/Detail.tsx`（带“开发中”横幅）
- 差异: 功能未对齐；建议先打通最小可用链路（查询/创建/修改/状态）

— 工具/定向
- 静态: `tools-*.html`, `interest-*.html`, `author-*.html`, `keyword-*.html`
- SPA: `ToolsTargeting.tsx`, 组件 `targeting/*`, `keywords.tsx`
- 差异: 定向工作台功能较完善；静态页中的“灰度/配额/系统推荐全量”未全部暴露

建议:
- 以域为单位建立“对齐清单”（子任务化），每周至少完成一个子域的“从入口到提交”的闭环打通
- 在页面内添加“基础版/高级版”切换与功能提示，避免用户困惑
