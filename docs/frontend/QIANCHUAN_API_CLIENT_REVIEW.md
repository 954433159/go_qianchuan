# API 客户端评审（frontend/src/api/client.ts）

要点盘点:
- 统一响应格式 ApiResponse<T>，非 0 code 走 reject，成功时将 `data.data` 透出
- 幂等方法重试（GET/HEAD/OPTIONS/PUT/DELETE），含指数型延迟（基于 RETRY_DELAY 与尝试次数）
- 401 自动刷新 Token，设置 `_skipAuthRefresh` 防止循环；新增 `_refreshAttempts` 上限（3次）
- 501 未实现: 触发全局 toast（App.tsx 监听），将 hint 透出到 error 供页面级兜底
- Sentry 面包屑记录 API 重试与错误

已存在测试: `src/api/__tests__/client.test.ts`（18 个用例全过）

改进建议:
- CSRF: 在 request 拦截器读取 `<meta name="csrf-token">` 并作为 header 透传（静态页上常用）
- 取消与去重: 支持同键请求取消或仅保留最后一次（搜索/类型ahead场景）
- 缓存策略: 为 GET 提供可选 SWR/TTL 缓存层，避免重复请求
- 错误语义: 将常见错误映射为具名错误类型（AuthError/RateLimitError/...）统一页面处理
- 细粒度重试: 429 与 5xx 区分策略；对某些 5xx（如502）尝试更短间隔快速重试
- 性能: 请求级别的 `signal` 支持（AbortController），配合组件卸载自动取消

落地优先级: CSRF 与 AbortController（低风险，高收益） → 去重/缓存 → 错误具名化
