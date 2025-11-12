# API 集成完整性检查（结合 qianchuanSDK 要求）

目标：核对 README 与代码实现的 API 覆盖度，确保与静态页面的功能入口一致，并给出缺口与行动项。

数据来源：
- 开源参考：https://github.com/CriarBrand/qianchuanSDK （32 个核心方法）
- 静态页面索引：html/index.html（展示 32 个方法与 9 模块）
- 前端现有接口层：frontend/src/api/*.ts（auth.ts、report.ts、tools.ts 等）

## 1. 模块与方法（基线：32 个）
1) OAuth（5）：OauthConnect、OauthAccessToken、OauthRenewRefreshToken、OauthClientAccessToken、OauthUserinfo
2) 广告主（2）：AdvertiserGet、AdvertiserDetail
3) 广告计划（6）：CampaignGet、CampaignDetail、CampaignCreate、CampaignUpdate、CampaignUpdateStatus、CampaignRejectReason
4) 广告（3）：AdGet、AdCreate、AdUpdate
5) 创意（3）：CreativeGet、CreativeCreate、CreativeRejectReason
6) 媒体库（4）：FileImageGet、FileVideoGet、FileImageUpload、FileVideoAwemeGet
7) 定向工具（4）：ToolsInterestActionInterestCategory、ToolsInterestActionInterestKeyword、ToolsInterestActionActionCategory、ToolsInterestActionActionKeyword
8) 行业/类目/词包（4）：ToolsIndustryGet、ToolsAwemeMultiLevelCategoryGet、ToolsAwemeCategoryTopAuthorGet、ToolsCreativeWordSelect
9) 人群包（1）：DmpAudiencesGet

> 注：README 中声称“40+ API”，需与后端/代理层对齐口径，明确“核心 32 个 + 扩展 X 个”。

## 2. 现有前端 API 文件覆盖点评
- auth.ts：OAuth 相关交换/用户信息/刷新，覆盖良好；建议：增加显式限流/错误码提示（401/429）
- report.ts：计划/广告/创意维度的报表查询已具备；建议：补充字段级别校验与空结果提示
- tools.ts：兴趣/行为/地域/设备品牌/平台网络运营商/人群 CRUD，覆盖面广；建议：
  - 将“行业/类目/词包”三类查询纳入（若后端未实现，可先给出前端类型与 Mock 占位）
  - 统一分页/搜索入参约定（page/size/query）

## 3. 与静态页面入口的一致性
- /tools/targeting（缺失）：应映射到 tools.ts 里的兴趣/行为/地域/设备等查询接口集合；
- /creatives/upload（缺失）：应使用媒体库上传接口（FileImage/VideoUpload）与创意创建接口组合；
- /campaigns/:id & /:id/edit（缺失）：详情/编辑页调用 CampaignDetail/Update/RejectReason 等；

## 4. 风险与注意事项（互联网规范 & 巨量引擎）
- 安全：
  - OAuth 回调 state 校验（前端已做）；
  - Token 放置 HttpOnly Cookie；暴露最小化；
  - 后端代理负责 App Secret/签名与重试；
- 限流：
  - 429/频控时在前端弹出“稍后重试/指数退避”提示；
  - 对列表/联想搜索类接口做去抖（debounce 300-500ms）；
- 物料规范：
  - 图片 ≤5MB、视频 ≤100MB、视频 5-60s；
  - 失败时提示清晰原因（大小/格式/码率/分辨率）与重试建议；
- 隐私与合规：
  - 人群包上传/匹配过程敏感，确保加密传输与结果脱敏；

## 5. 行动项（P0 → P2）
- P0：
  - 新增 /tools/targeting 页面与路由；
  - Creatives 增加上传入口（Dialog 或 /creatives/upload）；
- P1：
  - 扩展 tools.ts：加入行业/类目/词包 3 组 API（若无后端即 Mock 占位）；
  - 新增 /campaigns/new、/campaigns/:id、/campaigns/:id/edit、/ads/new；
- P2：
  - API 错误与空态可视化统一（ErrorBoundary/EmptyState）；
  - 搜索/列表接口加去抖与结果缓存；

## 6. 验收标准
- 所有静态页面上的入口在 React 端均有对应路由或 Dialog；
- 32 个核心方法在代码/文档中有明确“调用点/页面/组件”映射；
- 错误提示、限流告警、上传规范提示可见且一致；

