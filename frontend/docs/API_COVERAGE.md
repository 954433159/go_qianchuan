# API 方法覆盖文档

本文档详细列出千川SDK管理平台对接的所有API方法，包括端点路径、参数、返回值类型和前端使用位置。

## 目录

- [认证相关 (4个方法)](#认证相关)
- [广告主相关 (3个方法)](#广告主相关)
- [广告计划相关 (5个方法)](#广告计划相关)
- [广告相关 (5个方法)](#广告相关)
- [创意相关 (4个方法)](#创意相关)
- [文件相关 (4个方法)](#文件相关)
- [报表相关 (4个方法)](#报表相关)
- [工具类相关 (11个方法)](#工具类相关)

**总计：40个API方法**

---

## 认证相关

### 1. OAuth Token Exchange
- **端点**: `POST /oauth/exchange`
- **文件**: `src/api/auth.ts::exchangeToken`
- **参数**: `{ code: string, state?: string }`
- **返回值**: `{ access_token: string, refresh_token: string, expires_in: number }`
- **使用位置**: `src/pages/AuthCallback.tsx`

### 2. 获取当前用户信息
- **端点**: `GET /user/info`
- **文件**: `src/api/auth.ts::getCurrentUser`
- **参数**: 无（使用 Authorization header）
- **返回值**: `User`
- **使用位置**: `src/store/authStore.ts::checkAuth`

### 3. 登出
- **端点**: `POST /auth/logout`
- **文件**: `src/api/auth.ts::logout`
- **参数**: 无
- **返回值**: `{ success: boolean }`
- **使用位置**: `src/components/layout/Header.tsx`

### 4. 刷新Token
- **端点**: `POST /auth/refresh`
- **文件**: `src/api/auth.ts::refreshToken`
- **参数**: `{ refresh_token: string }`
- **返回值**: `{ access_token: string, refresh_token: string, expires_in: number }`
- **使用位置**: `src/api/client.ts` (拦截器自动调用)

---

## 广告主相关

### 5. 获取广告主列表
- **端点**: `GET /advertiser/list`
- **文件**: `src/api/advertiser.ts::getAdvertiserList`
- **参数**: `{ page?: number, page_size?: number }`
- **返回值**: `PaginatedResponse<Advertiser>`
- **使用位置**: `src/pages/Advertisers.tsx`

### 6. 获取广告主详情
- **端点**: `GET /advertiser/info`
- **文件**: `src/api/advertiser.ts::getAdvertiserInfo`
- **参数**: `{ advertiser_id: number }`
- **返回值**: `Advertiser`
- **使用位置**: `src/pages/Advertisers.tsx::handleViewDetails`

### 7. 更新广告主信息
- **端点**: `POST /advertiser/update`
- **文件**: `src/api/advertiser.ts::updateAdvertiser`
- **参数**: `UpdateAdvertiserParams`
- **返回值**: `{ advertiser_id: number }`
- **使用位置**: `src/pages/Advertisers.tsx` (预留)

---

## 广告计划相关

### 8. 获取广告计划列表
- **端点**: `GET /api/qianchuan/campaign/list`
- **文件**: `src/api/campaign.ts::getCampaignList`
- **参数**: `CampaignListParams`
- **返回值**: `PaginatedResponse<Campaign>`
- **使用位置**: `src/pages/Campaigns.tsx`, `src/hooks/useCampaign.ts`

### 9. 获取广告计划详情
- **端点**: `GET /api/qianchuan/campaign/get`
- **文件**: `src/api/campaign.ts::getCampaignDetail`
- **参数**: `{ advertiser_id: number, campaign_id: number }`
- **返回值**: `Campaign`
- **使用位置**: `src/pages/Campaigns.tsx`

### 10. 创建广告计划
- **端点**: `POST /api/qianchuan/campaign/create`
- **文件**: `src/api/campaign.ts::createCampaign`
- **参数**: `CreateCampaignParams`
- **返回值**: `{ campaign_id: number }`
- **使用位置**: `src/components/campaign/CreateCampaignDialog.tsx`

### 11. 更新广告计划
- **端点**: `POST /api/qianchuan/campaign/update`
- **文件**: `src/api/campaign.ts::updateCampaign`
- **参数**: `UpdateCampaignParams`
- **返回值**: `{ campaign_id: number }`
- **使用位置**: `src/pages/Campaigns.tsx`

### 12. 更新广告计划状态
- **端点**: `POST /api/qianchuan/campaign/status/update`
- **文件**: `src/api/campaign.ts::updateCampaignStatus`
- **参数**: `CampaignStatusParams`
- **返回值**: `{ campaign_ids: number[] }`
- **使用位置**: `src/pages/Campaigns.tsx::handleStatusChange`

---

## 广告相关

### 13. 获取广告列表
- **端点**: `GET /api/qianchuan/ad/list`
- **文件**: `src/api/ad.ts::getAdList`
- **参数**: `AdListParams`
- **返回值**: `PaginatedResponse<Ad>`
- **使用位置**: `src/pages/Ads.tsx`, `src/hooks/useAd.ts`

### 14. 获取广告详情
- **端点**: `GET /api/qianchuan/ad/get`
- **文件**: `src/api/ad.ts::getAdDetail`
- **参数**: `{ advertiser_id: number, ad_id: number }`
- **返回值**: `Ad`
- **使用位置**: `src/pages/Ads.tsx`

### 15. 创建广告
- **端点**: `POST /api/qianchuan/ad/create`
- **文件**: `src/api/ad.ts::createAd`
- **参数**: `CreateAdParams`
- **返回值**: `{ ad_id: number }`
- **使用位置**: `src/components/ad/CreateAdDialog.tsx`

### 16. 更新广告
- **端点**: `POST /api/qianchuan/ad/update`
- **文件**: `src/api/ad.ts::updateAd`
- **参数**: `UpdateAdParams`
- **返回值**: `{ ad_id: number }`
- **使用位置**: `src/pages/Ads.tsx`

### 17. 更新广告状态
- **端点**: `POST /api/qianchuan/ad/status/update`
- **文件**: `src/api/ad.ts::updateAdStatus`
- **参数**: `AdStatusParams`
- **返回值**: `{ ad_ids: number[] }`
- **使用位置**: `src/pages/Ads.tsx::handleStatusChange`

---

## 创意相关

### 18. 获取创意列表
- **端点**: `GET /api/qianchuan/creative/list`
- **文件**: `src/api/creative.ts::getCreativeList`
- **参数**: `CreativeListParams`
- **返回值**: `PaginatedResponse<Creative>`
- **使用位置**: `src/pages/Creatives.tsx`

### 19. 获取创意详情
- **端点**: `GET /api/qianchuan/creative/get`
- **文件**: `src/api/creative.ts::getCreativeDetail`
- **参数**: `{ advertiser_id: number, creative_id: number }`
- **返回值**: `Creative`
- **使用位置**: `src/pages/Creatives.tsx`

### 20. 创建创意
- **端点**: `POST /api/qianchuan/creative/create`
- **文件**: `src/api/creative.ts::createCreative`
- **参数**: `CreateCreativeParams`
- **返回值**: `{ creative_id: number }`
- **使用位置**: `src/pages/Creatives.tsx`

### 21. 更新创意
- **端点**: `POST /api/qianchuan/creative/update`
- **文件**: `src/api/creative.ts::updateCreative`
- **参数**: `UpdateCreativeParams`
- **返回值**: `{ creative_id: number }`
- **使用位置**: `src/pages/Creatives.tsx`

---

## 文件相关

### 22. 图片上传
- **端点**: `POST /api/qianchuan/file/image/upload`
- **文件**: `src/api/file.ts::uploadImage`
- **参数**: `FormData (file, advertiser_id)`
- **返回值**: `{ image_id: string, url: string }`
- **使用位置**: `src/pages/Media.tsx`

### 23. 视频上传
- **端点**: `POST /api/qianchuan/file/video/upload`
- **文件**: `src/api/file.ts::uploadVideo`
- **参数**: `FormData (file, advertiser_id)`
- **返回值**: `{ video_id: string, url: string }`
- **使用位置**: `src/pages/Media.tsx`

### 24. 获取图片列表
- **端点**: `GET /api/qianchuan/file/image/get`
- **文件**: `src/api/file.ts::getImageList`
- **参数**: `{ advertiser_id: number, page?: number, page_size?: number }`
- **返回值**: `PaginatedResponse<MediaFile>`
- **使用位置**: `src/pages/Media.tsx`

### 25. 获取视频列表
- **端点**: `GET /api/qianchuan/file/video/get`
- **文件**: `src/api/file.ts::getVideoList`
- **参数**: `{ advertiser_id: number, page?: number, page_size?: number }`
- **返回值**: `PaginatedResponse<MediaFile>`
- **使用位置**: `src/pages/Media.tsx`

---

## 报表相关

### 26. 获取广告计划报表
- **端点**: `GET /api/qianchuan/report/campaign/get`
- **文件**: `src/api/report.ts::getCampaignReport`
- **参数**: `ReportParams`
- **返回值**: `ReportData[]`
- **使用位置**: `src/pages/Reports.tsx`

### 27. 获取广告报表
- **端点**: `GET /api/qianchuan/report/ad/get`
- **文件**: `src/api/report.ts::getAdReport`
- **参数**: `ReportParams`
- **返回值**: `ReportData[]`
- **使用位置**: `src/pages/Reports.tsx`

### 28. 获取创意报表
- **端点**: `GET /api/qianchuan/report/creative/get`
- **文件**: `src/api/report.ts::getCreativeReport`
- **参数**: `ReportParams`
- **返回值**: `ReportData[]`
- **使用位置**: `src/pages/Reports.tsx`

### 29. 获取自定义报表
- **端点**: `GET /api/qianchuan/report/custom/get`
- **文件**: `src/api/report.ts::getCustomReport`
- **参数**: `ReportParams & { dimensions: string[] }`
- **返回值**: `ReportData[]`
- **使用位置**: `src/pages/Reports.tsx`

---

## 工具类相关

### 30. 获取地域列表
- **端点**: `GET /api/qianchuan/tools/region/list`
- **文件**: `src/api/tools.ts::getRegionList`
- **参数**: `RegionListParams`
- **返回值**: `Region[]`
- **使用位置**: `src/components/targeting/RegionSelector.tsx`

### 31. 获取兴趣列表
- **端点**: `GET /api/qianchuan/tools/interest/list`
- **文件**: `src/api/tools.ts::getInterestList`
- **参数**: `InterestListParams`
- **返回值**: `Interest[]`
- **使用位置**: `src/components/targeting/InterestSelector.tsx`

### 32. 搜索兴趣关键词
- **端点**: `GET /api/qianchuan/tools/interest/search`
- **文件**: `src/api/tools.ts::searchInterest`
- **参数**: `InterestListParams`
- **返回值**: `Interest[]`
- **使用位置**: `src/components/targeting/InterestSelector.tsx`

### 33. 获取行为列表
- **端点**: `GET /api/qianchuan/tools/action/list`
- **文件**: `src/api/tools.ts::getActionList`
- **参数**: `ActionListParams`
- **返回值**: `Action[]`
- **使用位置**: `src/components/targeting/ActionSelector.tsx`

### 34. 搜索行为关键词
- **端点**: `GET /api/qianchuan/tools/action/search`
- **文件**: `src/api/tools.ts::searchAction`
- **参数**: `ActionListParams`
- **返回值**: `Action[]`
- **使用位置**: `src/components/targeting/ActionSelector.tsx`

### 35. 获取设备品牌列表
- **端点**: `GET /api/qianchuan/tools/device_brand/list`
- **文件**: `src/api/tools.ts::getDeviceBrandList`
- **参数**: `DeviceBrandListParams`
- **返回值**: `DeviceBrand[]`
- **使用位置**: `src/components/targeting/DeviceBrandSelector.tsx`

### 36. 获取人群包列表
- **端点**: `GET /api/qianchuan/tools/audience/list`
- **文件**: `src/api/tools.ts::getAudienceList`
- **参数**: `AudienceListParams`
- **返回值**: `{ list: Audience[], total: number }`
- **使用位置**: `src/pages/Audiences.tsx`, `src/components/ad/CreateAdDialog.tsx`

### 37. 获取人群包详情
- **端点**: `GET /api/qianchuan/tools/audience/get`
- **文件**: `src/api/tools.ts::getAudienceDetail`
- **参数**: `{ advertiser_id: number, audience_id: number }`
- **返回值**: `Audience`
- **使用位置**: `src/pages/Audiences.tsx`

### 38. 创建人群包
- **端点**: `POST /api/qianchuan/tools/audience/create`
- **文件**: `src/api/tools.ts::createAudience`
- **参数**: `CreateAudienceParams`
- **返回值**: `{ audience_id: number }`
- **使用位置**: `src/components/audience/AudienceDialog.tsx`

### 39. 更新人群包
- **端点**: `POST /api/qianchuan/tools/audience/update`
- **文件**: `src/api/tools.ts::updateAudience`
- **参数**: `UpdateAudienceParams`
- **返回值**: `{ audience_id: number }`
- **使用位置**: `src/components/audience/AudienceDialog.tsx`

### 40. 删除人群包
- **端点**: `POST /api/qianchuan/tools/audience/delete`
- **文件**: `src/api/tools.ts::deleteAudience`
- **参数**: `{ advertiser_id: number, audience_ids: number[] }`
- **返回值**: `{ audience_ids: number[] }`
- **使用位置**: `src/pages/Audiences.tsx::handleDelete`

---

## 前端常量方法（不调用API）

以下方法为前端常量，不需要调用后端API：

- **getAgeRanges**: 获取年龄段列表
- **getPlatforms**: 获取平台列表（iOS/Android）
- **getNetworks**: 获取网络类型列表（WiFi/2G/3G/4G/5G）
- **getCarriers**: 获取运营商列表（移动/联通/电信）

**使用位置**:
- `src/components/ad/CreateAdDialog.tsx`
- `src/components/targeting/PlatformNetworkCarrierSelector.tsx`

---

## 类型定义位置

所有接口的TypeScript类型定义位于以下文件：

- **通用类型**: `src/api/types.ts`
- **广告主类型**: `src/api/advertiser.ts`
- **广告计划类型**: `src/api/campaign.ts`
- **广告类型**: `src/api/ad.ts`
- **创意类型**: `src/api/creative.ts`
- **文件类型**: `src/api/file.ts`
- **报表类型**: `src/api/report.ts`
- **工具类型**: `src/api/tools.ts`

---

## API调用规范

### 请求拦截器
位置: `src/api/client.ts`

功能:
- 自动添加 Authorization Bearer Token
- 添加 X-CSRF-Token 防护
- 设置超时时间（30秒）
- 错误重试（最多3次）

### 响应拦截器
位置: `src/api/client.ts`

功能:
- 统一错误处理
- Token 过期自动刷新
- 401 错误自动跳转登录
- 错误信息 Toast 提示

---

## 备注

1. 所有 API 方法都包含完整的 TypeScript 类型定义
2. 所有 API 调用都经过统一的错误处理和 Loading 管理
3. 认证相关的 Token 管理完全自动化
4. 支持开发/生产环境的自动切换（通过 .env 配置）

---

*最后更新: 2025-11-10*
*版本: v1.0.0*
