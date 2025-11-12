# 组件库完善计划（对齐静态页面设计）

目标：以“可复用、可扩展、与静态HTML一致”为原则，梳理与补齐组件库短板，降低后续页面扩展成本。

## 1. 现有能力速览
- Layout：Header、Sidebar、Layout 容器结构完善
- 表单：React Hook Form + Zod 校验，输入组件基础完备
- 可视化：Tremor 图表满足看板/报表
- Targeting（定向）：已有 6 类选择器（兴趣、行为、地域、设备品牌、平台/网络/运营商）
- Dialog：CreateCampaignDialog、CreateAdDialog 等

## 2. 与静态HTML差异/缺失
- ToolsTargeting 工作台页面缺失（静态参考：html/tools-targeting.html）
- CreativeUpload 独立上传页缺失（静态参考：html/creative-upload.html）
- AdvertiserDetail/CampaignDetail/Edit 独立页缺失（静态参考：advertiser-detail、campaign-*）
- Dashboard 快捷入口卡片不足（与静态 index.html 的八宫格不一致）

## 3. 新增/抽象组件建议
- TargetingWorkbench（定向工作台容器）
  - Tabs（受众分析/地域热力/兴趣标签/行为特征）
  - 左右双栏布局（表单/结果 + 提示/已保存受众/相关工具）
  - 复用既有 Targeting* 选择器
- SavedAudienceList（侧栏“已保存受众”卡片组）
  - 接口：listSavedAudiences()（src/api/tools.ts 已具备 Audience CRUD，可复用）
- HeatmapPlaceholder（地域热力可视化占位）
  - 先占位组件，后续可接入 AMap/Mapbox
- CreativeUploadPanel（创意上传面板）
  - 图片/视频分组、拖拽上传、校验提示
  - 与 Media 页上传逻辑解耦，便于独立路由使用
- Breadcrumbs（统一面包屑）
  - API：items=[{label, to?}]，在 PageHeader 中组合

## 4. 重构与复用
- 将 CreateAdDialog 中的 Targeting 部分解耦为可独立挂载的 <TargetingWorkbench />
- PageHeader/Breadcrumbs 提炼到 components/common 下，复用到所有列表/详情/编辑页
- EmptyState/Loading/Error 三兄弟统一到 components/feedback 下

## 5. 预研与性能
- 选择器类组件全部支持受控/非受控模式（便于路由态恢复）
- 体积控制：TargetingWorkbench 使用按需异步加载（React.lazy + Suspense）
- 大列表虚拟化（如果数据量大）：react-virtualized/virtualizer（后续评估）

## 6. 对应代码位置建议
- src/components/targeting/Workbench/TargetingWorkbench.tsx（新）
- src/components/audience/SavedAudienceList.tsx（新）
- src/components/media/CreativeUploadPanel.tsx（新）
- src/components/common/{Breadcrumbs,EmptyState,ErrorState,Loading}.tsx（新/迁移）

## 7. 验收标准
- 组件以 props 驱动、无业务强耦合；
- 关键组件具备 Story 或 examples（可在 docs 或 /playground 路由中演示）；
- 新页（/tools/targeting, /creatives/upload）纯组装上述组件即可完成≥80%功能；
- 迁移后 CreateAdDialog 与 TargetingWorkbench 复用比例≥80%。

