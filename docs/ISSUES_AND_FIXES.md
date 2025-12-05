# 千川SDK管理平台 - 问题清单与修复方案

**生成时间**: 2025-11-28  
**关联文档**: `QIANCHUAN_IMPLEMENTATION_STATUS.md`

---

## 一、问题分类汇总

| 类别 | 数量 | 严重程度 |
|------|------|----------|
| 返回501的方法 | 7 | 高 |
| 完全缺失的API | 74 | 中 |
| 临时文件待清理 | 0 | 低 |
| 文档引用问题 | 1 | 低 |

> **更新时间**: 2025-11-28
> **本次修复**: 工具类API 14个方法已实现

---

## 二、高优先级问题（影响核心功能）

### 2.1 广告计划创建/更新不可用

**问题描述**:  
`AdCreate` 和 `AdUpdate` 方法返回 HTTP 501

**影响范围**:
- 无法通过API创建新广告计划
- 无法通过API更新广告计划配置

**文件位置**:
```
backend/internal/sdk/sdk_client.go:641-655
```

**修复方案**:
1. 使用 SDK 的 `ad.Create` 和 `ad.Update` 方法
2. 构造完整的请求体
3. 处理创意、定向、出价等复杂参数

---

### 2.2 ✅ 素材上传已实现

**状态**: 已修复 ✅ (2025-11-28)

`FileImageAd` 和 `FileVideoAd` 方法已实现，使用 `globalFileAPI.ImageAd` 和 `globalFileAPI.VideoAd`。

---

### 2.3 ✅ 随心推订单创建已实现

**状态**: 已修复 ✅ (2025-11-28)

`AwemeOrderCreate` 方法已实现，使用 `awemeAPI.OrderCreate`。

---

## 三、中优先级问题（影响辅助功能）

### 3.1 ✅ 工具类API已全部实现

**状态**: 已修复 ✅ (2025-11-28)

已实现的14个工具类方法:
- `ToolsIndustryGet` - 使用 `toolsAPI.IndustryGet`
- `ToolsInterestActionInterestCategory` - 使用 `interestactionAPI.InterestCategory`
- `ToolsInterestActionInterestKeyword` - 使用 `interestactionAPI.InterestKeyword`
- `ToolsInterestActionActionCategory` - 使用 `interestactionAPI.ActionCategory`
- `ToolsInterestActionActionKeyword` - 使用 `interestactionAPI.ActionKeyword`
- `ToolsAwemeMultiLevelCategoryGet` - 使用 `toolsAwemeAPI.AwemeMultiLevelCategoryGet`
- `ToolsAwemeAuthorInfoGet` - 使用 `toolsAwemeAPI.AwemeAuthorInfoGet`
- `ToolsCreativeWordSelect` - 使用 `creativewordAPI.Select`
- `DmpAudiencesGet` - 使用 `qianchuanDmpAPI.AudiencesGet`
- `AwemeSuggestBid` - 使用 `awemeAPI.SuggestBid`
- `AwemeEstimateProfit` - 使用 `awemeAPI.EstimateProfit`

---

### 3.2 资金转账API返回501

**问题描述**:  
4个资金转账方法返回 HTTP 501:
- `FundTransferSeqCreate`
- `FundTransferSeqCommit`
- `RefundTransferSeqCreate`
- `RefundTransferSeqCommit`

**原因分析**:
SDK可能未提供方舟(agent)相关的转账API

**修复方案**:
1. 确认 SDK 是否有 `agent.FundTransferSeqCreate` 等方法
2. 如SDK不支持，可考虑直接调用HTTP API

---

## 四、低优先级问题

### 4.1 文档引用问题

**问题描述**:  
`QIANCHUAN.md` 第192-200行引用了不存在的 `docs/frontend/` 目录

**当前内容**:
```markdown
计划文档（位于 `docs/frontend/`）：
- QIANCHUAN_FRONTEND_STATUS.md — 前端完成度与覆盖率盘点 (待创建)
...
```

**修复方案**:
方案A - 创建文档目录:
```bash
mkdir -p /Users/wushaobing911/Desktop/douyin/docs/frontend
```

方案B - 更新引用说明:
将 "(待创建)" 改为 "(计划中，尚未创建)"

---

## 五、已清理/无需处理的项目

### 5.1 临时文件
**状态**: ✅ 无临时文件需要清理
- 未发现 `.tmp`、`.bak`、`.log` 文件
- 未发现 `.DS_Store` 文件

### 5.2 构建产物
**状态**: ⚠️ 可选择性清理
- `backend/bin/` 目录包含多个二进制文件
- 建议保留 `server` 和 `server-linux-amd64`

---

## 六、修复优先级排序

### 第一批（本周）
1. [ ] `AdCreate` - 广告计划创建
2. [ ] `AdUpdate` - 广告计划更新
3. [ ] `FileImageAd` - 图片上传
4. [ ] `FileVideoAd` - 视频上传

### 第二批（下周）
5. [ ] `AwemeOrderCreate` - 随心推订单创建
6. [ ] `ToolsIndustryGet` - 行业列表
7. [ ] `ToolsInterestActionInterestCategory` - 兴趣类目

### 第三批（后续）
8. [ ] 其他工具类API
9. [ ] 资金转账API
10. [ ] 缺失的报表API

---

## 七、关联文件索引

| 文件 | 说明 |
|------|------|
| `backend/internal/sdk/sdk_client.go` | 需要修复的核心文件 |
| `backend/internal/sdk/types.go` | 可能需要添加新类型 |
| `QIANCHUAN.md` | 官方SDK API文档 |
| `docs/QIANCHUAN_IMPLEMENTATION_STATUS.md` | 完整实现状态 |

---

*本文档将随着修复进度持续更新*
