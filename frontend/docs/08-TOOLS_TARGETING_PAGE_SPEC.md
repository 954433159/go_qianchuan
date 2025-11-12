# “定向工具”页面对齐规格（React 对齐 html/tools-targeting.html）

目标：在 React 中还原并增强静态页面“定向工具”的核心体验，形成可复用的定向工作台（Targeting Workbench）。

## 1. 信息架构
- 路由：/tools/targeting（新）
- 面包屑：工作台 / 工具 / 定向工具
- 布局：左右双栏（左：表单+结果，右：提示+已保存受众+相关工具）
- Tab（4）：受众分析｜地域热力图｜兴趣标签库｜行为特征

## 2. 组件拆分
- TargetingWorkbench（容器）：管理 tab、状态、提交与结果
- AudienceEstimator（受众规模预估）：
  - 地域（RegionSelector）
  - 性别/年龄（本地常量 + 选择器）
  - 兴趣标签（InterestSelector）
  - 提交按钮（开始分析）
- AnalysisResult（结果展示）：规模、活跃度、竞争指数、建议CPC 等卡片
- DemographicsBreakdown（人群特征）：年龄段进度条等
- HeatmapPlaceholder（地域热力图占位）：后续接入地图 SDK
- InterestLibrary（兴趣标签库）：搜索 + 类目 + tag 多选
- BehaviorTraits（行为特征）：购物/内容互动/直播行为等勾选
- SavedAudiencesPanel（右栏）：列表 + “保存当前配置”按钮
- RelatedToolsPanel（右栏）：“人群包管理”“创建广告”等入口

## 3. 数据与 API 映射
- 现有：src/api/tools.ts
  - 兴趣/行为/地域/设备/平台/网络/运营商 等已有接口
  - 受众 CRUD 已有
- 需扩展（可 Mock）：行业/类目/词包（Tools* 系列 3 组）
- 结果估算：前期以静态/规则推导展示，可后续对接后端预估接口

## 4. 交互流程（用户旅程）
1) 进入 /tools/targeting，默认落在“受众分析”tab
2) 配置地域/性别/年龄/兴趣，点击“开始分析”
3) 左侧展示结果卡片与人群特征分布
4) 右侧可一键“保存当前配置”为人群包（走 audiences API）
5) 切换到“兴趣标签库”“行为特征”补充筛选；“地域热力图”仅占位
6) 右侧“相关工具”支持跳转“人群包管理”“创建广告（保留当前定向）”

## 5. 视觉与文案（对齐静态）
- Tailwind class 对齐静态配色与间距；标题/分隔/卡片边框风格一致
- 按钮：主操作 bg-blue-600 hover:bg-blue-700；次级操作边框按钮
- 高亮：选中 tab 添加 border-b-2 + text-blue-600

## 6. 文件与路径
- src/pages/ToolsTargeting.tsx（新）
- src/components/targeting/workbench/{TargetingWorkbench, AudienceEstimator, AnalysisResult, DemographicsBreakdown, HeatmapPlaceholder, InterestLibrary, BehaviorTraits}.tsx（新）
- src/components/targeting/SavedAudiencesPanel.tsx（新）
- src/components/targeting/RelatedToolsPanel.tsx（新）

## 7. 可用性与可维护性
- 组件均为受控/可控（受 props 驱动），便于从 /ads/new 复用同一套定向
- 大组件按需加载（React.lazy），首屏性能可控
- 状态管理：优先局部 state；必要时放入 zustand store（toolsStore）

## 8. 验收
- /tools/targeting 可访问，4 个 tab 可切换
- 可配置兴趣/行为/地域等并得到结果展示
- 可保存当前配置为人群包，并在 Audiences 页可见
- 右侧入口可跳转到 Audiences 与 Ads 创建

