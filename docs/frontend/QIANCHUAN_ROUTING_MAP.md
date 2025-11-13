# 路由与信息架构（基于 App.tsx）

受保护路由: 所有业务路由均包裹于 `ProtectedRoute`（依赖 `useAuthStore`）。未登录重定向 `/login`。

主要路由聚合:
- 仪表盘: `/dashboard`
- 账号与授权: `/account-center`, `/account/advertiser-public`, `/account/brand-authorized`, `/account/agent-advertisers`, `/account/shop-auth`, `/aweme-auth`, `/aweme-auth/add`
- 活动/广告/创意: `/campaigns`, `/campaigns/new`, `/campaigns/:id`, `/campaigns/:id/edit`, `/ads`, `/ads/new`, `/ads/:id`, `/ads/:id/edit`, 批量 `/ads/batch/*`, 创意 `/creatives`, `/creatives/upload`, `/creatives/:id`
- 素材效率/关系: `/materials/efficiency`, `/materials/relations`
- 报表与直播: `/reports`, `/live-data`, `/live-rooms`, `/live-rooms/:id`, 产品分析 `/product-analyse`, `/product-compare`
- 工具/定向/关键词: `/tools/targeting`, `/keywords`
- 财务: `/finance/wallet`, `/finance/balance`, `/finance/transactions`, `/finance/transfer/*`, `/finance/refund/*`
- 随心推: `/aweme-orders`, `/aweme-orders/new`, `/aweme-orders/:id`, `/aweme-orders/:id/effect`, `/aweme/tools`
- 全域推广: `/uni-promotions`, `/uni-promotions/new`, `/uni-promotions/:id`, `/uni-promotions/:id/edit`

默认路由: `/` -> `/dashboard`
404: 目前使用通配重定向到 `/dashboard`（建议新增 404 页）

建议改进:
- 新增 `NotFound.tsx` 与 `Forbidden.tsx`，在 `App.tsx` 显式配置 404/403
- 在 AccountCenter 汇聚账号相关二级导航，减少入口分散
- 在报表域统一过滤器与导出/列配置组件，形成“报表框架”
- 路由层面按域拆分懒加载 chunk，结合 `vite` 预取提示
