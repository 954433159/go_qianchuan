# 问题清单与风险评估（按优先级）

本清单聚焦“静态 HTML vs React 前端”的差异与待办，明确优先级与处置策略。

## P0（必须优先处理）
1) Sidebar 导航分组不一致，缺少“工具”分组
   - 目标：对齐 HTML 的 5 组 9 项
   - 动作：修改 src/components/layout/Sidebar.tsx，新增“工具”，迁移“人群包”，新增“定向工具”入口
2) 缺失页面与路由：/tools/targeting
   - 目标：落地“定向工具”工作台（与 html/tools-targeting.html 对齐）
   - 动作：新增页面 src/pages/ToolsTargeting.tsx 与路由 <Route path="/tools/targeting" ... />
3) Creatives 缺少“上传创意”深链入口
   - 目标：对齐 html/creative-upload.html
   - 动作：新增 Dialog 或 /creatives/upload 页面

## P1（重要，优先级次之）
4) 详情/编辑/创建的深链路由缺失
   - /advertisers/:id, /campaigns/new, /campaigns/:id, /campaigns/:id/edit, /ads/new
5) README 声称“40+ API”与静态 32 方法存在口径不一致
   - 动作：统一成“核心 32 + 扩展 X”，标注映射与差异
6) 空状态/错误状态/加载状态展示不统一
   - 动作：抽象 components/feedback/{EmptyState, ErrorState, Loading}

## P2（可优化，可并行推进）
7) Dashboard 快捷卡片不全
   - 动作：补齐与 index.html 八宫格一致（广告、计划、广告、创意、媒体库、定向工具、人群包、报表、广告主）
8) 无障碍（A11y）与键盘导航、ARIA 标记优化
9) 性能细节：搜索去抖、列表虚拟化、懒加载切分等

## 风险与回退策略
- 导航调整引起用户路径变化：保留旧路径临时 Redirect；仅改 Sidebar 分组呈现
- 新路由上线上书签影响：新增而不替换；保留原 Dialog 入口
- 性能抖动：渐进开启懒加载，关键路径保守处理

## 验收标准（阶段性）
- Sidebar 显示 5 组 9 项，顺序/命名一致
- /tools/targeting 可访问（初期允许占位），Creatives 提供“上传”入口
- README/API 覆盖口径明确：核心 32 方法一一可映射

