# API Contract Issues & Implementation Roadmap

**Last Updated:** 2025-11-19  
**Project Completion:** ~72%

## Overview

This document tracks all API contract mismatches between frontend and backend, categorized by priority and type. Use this as a roadmap for completing the remaining 28% of the project.

---

## Issue Categories

### Category 1: Frontend Calls Non-Existent Backend Endpoints (404)

These endpoints are called by the frontend but have no corresponding backend route.

#### High Priority (Blocks Core Workflows)

1. **`PUT /api/advertiser/update`**
   - Frontend: `src/api/advertiser.ts`
   - Used in: Advertiser management pages
   - Impact: Cannot update advertiser information
   - Recommendation: Implement or use account budget APIs instead

2. **`GET /api/qianchuan/advertiser/budget/get`** ✅
   - Frontend: `src/api/advertiser.ts`
   - Used in: Account budget display
   - Backend Status: **IMPLEMENTED** with OceanEngine mode (`-tags oceanengine`)
   - Frontend Status: **UPDATED** - AccountBudget page now calls real API with fallback
   - Note: Returns 501 in default mode, works in OceanEngine mode

3. **`POST /api/qianchuan/advertiser/budget/update`** ✅
   - Frontend: `src/api/advertiser.ts`
   - Used in: Budget adjustment features
   - Backend Status: **IMPLEMENTED** with OceanEngine mode (`-tags oceanengine`)
   - Note: Returns 501 in default mode, works in OceanEngine mode

#### Medium Priority (Advanced Features)

4. **`GET /api/qianchuan/advertiser/aweme/authorized`** ✅
   - Frontend: `src/api/advertiser.ts`
   - Used in: Aweme authorization pages
   - Backend Status: **IMPLEMENTED** - Uses qianchuanSDK.AwemeAuthorizedGet
   - Returns list of authorized Douyin accounts for an advertiser

5. **`GET /api/qianchuan/advertiser/aweme/auth-list`**
   - Frontend: `src/api/advertiser.ts`
   - Backend Status: 501 NotImplemented (API does not exist in Qianchuan OpenAPI)
   - Recommendation: Use `/api/qianchuan/advertiser/aweme/authorized` instead (duplicate functionality)

6. **Extended Report APIs**
   - `/api/qianchuan/report/material/get` - Material report
   - `/api/qianchuan/report/search-word/get` - Search word report
   - `/api/qianchuan/report/video-user-lose/get` - Video user loss report
   - `/api/qianchuan/report/custom/get` - Custom report
   - `/api/qianchuan/report/custom/config` - Report config
   - Backend Status: All 501 NotImplemented
   - Recommendation: Implement progressively or mark as "Coming Soon"

#### Low Priority (Phase 2 Features)

7. **All Uni-Promotion (全域推广) Endpoints**
   - `/api/qianchuan/uni-promotion/*` (all methods)
   - Frontend: Complete API module in `src/api/uniPromotion.ts`
   - Backend: All handlers return 501 NotImplemented
   - Impact: Entire feature is non-functional
   - Recommendation: Either implement fully or hide from main navigation

8. **Product Analysis APIs**
   - `/api/qianchuan/product/analyse/*`
   - Frontend: `src/api/product.ts`
   - Backend: No routes registered
   - Recommendation: Phase 2 feature, hide from UI

---

### Category 2: Path/Method Mismatches (Quick Wins)

These endpoints exist in backend but frontend calls them incorrectly. **Easy to fix by updating frontend code.**

#### Fixed (✅)

1. ~~**Aweme Suggest Bid**~~
   - ~~Frontend was: `GET /qianchuan/aweme/suggest-bid`~~
   - ~~Backend is: `POST /qianchuan/aweme/suggest/bid`~~
   - **Status:** ✅ Fixed in aweme.ts

2. ~~**Aweme Estimate**~~
   - ~~Frontend was: `GET /qianchuan/aweme/estimate-profit`~~
   - ~~Backend is: `POST /qianchuan/aweme/estimate`~~
   - **Status:** ✅ Fixed in aweme.ts

3. ~~**Aweme Quota**~~
   - ~~Frontend was: `GET /qianchuan/aweme/order/quota/get`~~
   - ~~Backend is: `GET /qianchuan/aweme/quota`~~
   - **Status:** ✅ Fixed in aweme.ts

#### Pending Fix

4. **Keyword Management Endpoints**
   - Review `src/api/keyword.ts` vs `backend/cmd/server/main.go` keyword routes
   - Some methods may be GET vs POST mismatches
   - Recommendation: Audit and align

---

### Category 3: Backend Returns 501 or Mock Data

These endpoints exist in backend but return "Not Implemented" or mock data.

#### High Priority

1. **Creative Management**
   - `POST /api/qianchuan/creative/create` - 501
   - `POST /api/qianchuan/creative/status/update` - 501
   - Impact: Cannot create creatives independently (must create with ad)
   - Recommendation: Implement or document workaround

2. **Ad Plan Granular Updates**
   - `POST /api/qianchuan/ad/region/update` - 501
   - `POST /api/qianchuan/ad/schedule/date/update` - 501
   - `POST /api/qianchuan/ad/schedule/time/update` - 501
   - `POST /api/qianchuan/ad/schedule/fixed-range/update` - 501
   - Recommendation: All return hint to use `POST /qianchuan/ad/update` instead
   - Action: Update frontend to use comprehensive update endpoint

#### Medium Priority

3. **File AI Features**
   - `GET /api/qianchuan/file/material/title/get` - 501 (AI title suggestions)
   - Impact: Advanced creative optimization unavailable
   - Recommendation: Implement if SDK supports, otherwise hide

4. **Smart Suggestion Tools (Mock Data)**
   - `POST /api/qianchuan/ad/suggest-bid` - Returns mock
   - `POST /api/qianchuan/ad/suggest-budget` - Returns mock
   - `POST /api/qianchuan/ad/suggest-roi-goal` - Returns mock
   - `POST /api/qianchuan/ad/estimate-effect` - Returns mock
   - Impact: Displayed data is fake, misleading
   - Recommendation: Either implement real SDK integration or add "Demo Data" badge

5. **Aweme Tools (Not Implemented)**
   - ROI goal suggestions - Endpoint missing
   - Delivery time suggestions - Endpoint missing
   - Interest keywords for Aweme - Endpoint missing
   - **Status:** ✅ Frontend now shows friendly error messages
   - Recommendation: Implement backend support or use general tools APIs

---

## Implementation Priority Matrix

### Sprint 1: Critical Path (2-3 days)

**Goal:** Make core workflows fully functional

- [x] Implement `POST /api/advertiser/update` (Returns 501 with hint - OpenAPI doesn't support)
- [x] Implement `GET /api/qianchuan/advertiser/budget/get` (OceanEngine mode)
- [x] Implement `POST /api/qianchuan/advertiser/budget/update` (OceanEngine mode)
- [x] Update AccountBudget frontend to call real APIs with fallback
- [ ] Fix ad plan updates to use comprehensive endpoint
- [ ] Add UI badges for mock data endpoints
- [ ] Implement creative creation API
- [ ] Add "Feature Not Available" overlays for unimplemented modules

### Sprint 2: Enhanced Features (3-5 days)

**Goal:** Complete advertiser management and reporting

- [ ] Implement advertiser budget APIs
- [ ] Implement advertiser aweme authorization APIs
- [ ] Replace mock smart suggestions with real SDK calls
- [ ] Implement material report
- [ ] Implement search word report

### Sprint 3: Advanced Modules (5-7 days)

**Goal:** Deliver full domain promotion and analytics

- [ ] Implement Uni-Promotion full backend
- [ ] Implement custom report builder
- [ ] Implement video user loss report
- [ ] Complete keyword management alignment
- [ ] Implement product analysis module

---

## Frontend UI Actions Required

### 1. Add "Not Implemented" Indicators

**Files to Update:**
- `src/pages/UniPromotions.tsx` - Add banner: "全域推广功能正在开发中"
- `src/pages/account/*` - Disable budget/auth buttons, add tooltips
- `src/pages/reports/ExtendedReports.tsx` - Add "Coming Soon" badges
- `src/pages/AwemeOrderEffect.tsx` - Add "Demo Data" badge

**Component to Create:**
```typescript
// src/components/common/FeatureBadge.tsx
<FeatureBadge status="not-implemented" | "mock-data" | "beta" />
```

### 2. Graceful Error Handling

**Files to Update:**
- `src/api/client.ts` - Intercept 501 responses, show friendly message
- `src/components/common/ErrorBoundary.tsx` - Handle 501 with specific UI

**Example:**
```typescript
if (response.code === 501) {
  toast.info(response.hint || '该功能暂未实现，敬请期待')
  return // Don't throw, show placeholder UI
}
```

### 3. Disable Unusable UI Elements

**Pages Requiring Updates:**
- Account Budget page - Disable edit buttons
- Creative creation page - Hide standalone create, show ad-only notice
- Uni-Promotion pages - Disable all CTA buttons, add overlay

---

## Backend Implementation Checklist

### Advertiser APIs

- [x] `PUT /api/advertiser/update` - Returns 501 (OpenAPI doesn't support)
- [x] `GET /api/qianchuan/advertiser/budget/get` - Query budget (OceanEngine mode)
- [x] `POST /api/qianchuan/advertiser/budget/update` - Update budget (OceanEngine mode)
- [ ] `GET /api/qianchuan/advertiser/aweme/authorized` - Check auth status
- [ ] `GET /api/qianchuan/advertiser/aweme/auth-list` - List authorizations

### Creative APIs

- [ ] `POST /api/qianchuan/creative/create` - Standalone creative creation
- [ ] `POST /api/qianchuan/creative/status/update` - Status management

### Report APIs

- [ ] `POST /api/qianchuan/report/material/get` - Material performance
- [ ] `POST /api/qianchuan/report/search-word/get` - Search keyword data
- [ ] `POST /api/qianchuan/report/video-user-lose/get` - Video retention
- [ ] `GET /api/qianchuan/report/custom/get` - Custom report query
- [ ] `GET /api/qianchuan/report/custom/config` - Available dimensions/metrics

### File APIs

- [ ] `GET /api/qianchuan/file/material/title/get` - AI title suggestions

### Aweme Tools

- [ ] `POST /api/qianchuan/aweme/suggest/roi-goal` - ROI recommendations
- [ ] `GET /api/qianchuan/aweme/order/suggest-delivery-time` - Time extension
- [ ] `GET /api/qianchuan/aweme/interest-action/interest-keyword` - Interest tags

### Smart Tools (Replace Mock)

- [ ] `POST /api/qianchuan/ad/suggest-bid` - Real bid suggestions
- [ ] `POST /api/qianchuan/ad/suggest-budget` - Real budget suggestions
- [ ] `POST /api/qianchuan/ad/suggest-roi-goal` - Real ROI goals
- [ ] `POST /api/qianchuan/ad/estimate-effect` - Real effect estimates

### Uni-Promotion (Phase 2)

- [ ] All `/api/qianchuan/uni-promotion/*` endpoints (15+ endpoints)

---

## Testing Strategy

### API Contract Tests

Create integration tests to verify frontend-backend alignment:

```bash
# Test all frontend API calls against backend
npm run test:api-contracts
```

### Endpoint Coverage Report

Generate report of:
- Implemented endpoints
- 501 endpoints
- Missing endpoints
- Mock data endpoints

---

## Migration Notes

### Breaking Changes

None expected - all changes are additive or fix existing bugs.

### Backward Compatibility

- All 501 responses include `hint` field for user guidance
- Mock data endpoints include `is_mock_data: true` flag
- Frontend handles missing endpoints gracefully

---

## Metrics

**Current Status (2025-11-19):**
- Total API Endpoints (Backend): ~100
- Fully Functional: ~72
- Returns 501: ~18
- Returns Mock: ~5
- Missing (404): ~10

**Target (100% Complete):**
- Fully Functional: 100
- Returns 501: 0
- Returns Mock: 0
- Missing: 0

---

## Contact & Maintenance

For questions or updates to this document, see project maintainers in `README.md`.

**Document Version:** 1.0  
**Next Review Date:** After Sprint 1 completion
