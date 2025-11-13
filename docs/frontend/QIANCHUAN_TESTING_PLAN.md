# 测试现状与覆盖率提升方案

现状:
- 单元测试: API client（18 用例）+ UI 基础组件（Button/Card/Dialog/Input/Loading/Select...）
- 后端集成测试: 重点 handler（Finance/Aweme）已覆盖（供联调参考）
- 页面/路由测试: 缺失

建议方案（前端）:
1) 引入 MSW（Mock Service Worker）
   - 为 `api/*.ts` 提供服务端 Mock，隔离后端不确定性
   - 复用模拟数据到 Story 或 Playground
2) 页面级测试（Vitest + React Testing Library）
   - 目标页面: Reports（报表空态/错误态/导出）、AwemeOrders（创建流）、Finance（转账与退款）
   - 验收: 每个目标页面 ≥ 3 个关键路径测试
3) 路由守卫测试
   - 未登录访问受保护路由应重定向 `/login`
   - 登录态访问 `/login` 自动跳转 `/dashboard`
4) Store 测试
   - `useAuthStore`, `useLoadingStore` 的行为测试（fetchUser/logout/withLoading）
5) 可访问性（a11y）静态检查
   - 集成 `@axe-core/react` 于 dev 模式或测试环境

阶段目标:
- 短期: 新增 ≥ 10 个页面/路由/Store 层测试；CI 内跑通
- 中期: 关键业务页面（创建/编辑/导出）均有基本用例；覆盖率提升至 50%+
