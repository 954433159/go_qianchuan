# 实施计划（分阶段）

目标：最小代价完成“前端对齐静态HTML基线”的关键缺口，并为后续深链/可维护性打好基础。

## 范围
- 代码：frontend/src/** 与 docs/**
- 不涉及：后端改造（仅在需要时补充 Mock 或接口占位）

## 里程碑与时间评估（工作日）
- M1（P0，1~2 天）：导航与路由对齐 + 关键入口补齐
- M2（P1，2~4 天）：深链页面与面包屑规范
- M3（P2，2 天+）：UX/A11y/性能细节

## M1（P0）
1) 统一 Sidebar（增加“工具”分组，迁移“人群包”，新增“定向工具”）
   - 位置：src/components/layout/Sidebar.tsx
   - 交付：5 组 9 项与静态一致，当前页高亮正确
2) 新增 /tools/targeting 页面
   - 位置：src/pages/ToolsTargeting.tsx（新） + src/App.tsx（路由）
   - 复用：src/components/targeting/* 选择器 + 右侧“已保存受众/相关工具”侧栏
   - 占位：地域热力图先用占位组件，后续接入地图 SDK
3) Creatives 上传入口
   - 方案A：在 Creatives 页加“上传创意”Dialog
   - 方案B：新增 /creatives/upload 页面
   - 建议：两者都保留（快捷 + 深链）

## M2（P1）
4) 深链页面
   - /advertisers/:id → AdvertiserDetail.tsx
   - /campaigns/new → CampaignCreate.tsx（或保留 Dialog + 路由直达）
   - /campaigns/:id → CampaignDetail.tsx
   - /campaigns/:id/edit → CampaignEdit.tsx
   - /ads/new → AdCreate.tsx（或保留 Dialog + 路由直达）
5) 面包屑（Breadcrumb）
   - 位置：components/common/Breadcrumbs.tsx（新）
   - 规范：列表/详情/编辑/新建的路径层级统一
6) 文档与 README 同步
   - 统一 “核心32 + 扩展X” 表述；标记每个页面与 API 的映射

## M3（P2）
7) UX 与可访问性（A11y）
   - 键盘导航、焦点管理、ARIA 标签
8) 性能
   - 选择器与大表去抖/节流；必要时表格虚拟化
   - 懒加载 + 路由分包；关键路径组件预取
9) 统一反馈组件
   - EmptyState / ErrorState / Loading 组件化

## 验收标准（Definition of Done）
- /tools/targeting 可达且功能可用（可选择兴趣/行为/地域/设备等，并能保存为受众或导出配置）
- Sidebar 与静态 HTML 一致（5 组 9 项），点击高亮、可达性正确
- Creatives 有“上传创意”入口（Dialog 或 /creatives/upload）
- 至少实现 /campaigns/new 与 /creatives/upload 两个深链路径（可直达、可返回）
- 文档更新：本目录 01~07 全部生成且与代码一致

## 风险与缓解
- 风险：路由新增影响现有书签
  - 缓解：新增而非替换；必要时添加 Redirect
- 风险：组件抽象带来回归
  - 缓解：小步重构、可回退；保留旧用法到稳定后再移除
- 风险：地图/热力占位长期未替换
  - 缓解：标明“占位组件”，不影响核心流程

