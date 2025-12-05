package sdk

import (
	"context"
	"fmt"
)

// QianchuanClient 是所有千川相关 API 的统一抽象入口。
//
// 设计原则：
// 1. 所有方法第一个参数为 context.Context，支持超时控制和链路追踪
// 2. 错误处理统一：返回包装后的 QianchuanError，保留原始 code/message
// 3. 所有 Req/Res 类型在 types.go 中独立定义，解耦 SDK
//
type QianchuanClient interface {
	// ===== Auth & Session =====
	OauthAccessToken(ctx context.Context, req OauthAccessTokenReq) (*OauthAccessTokenRes, error)
	OauthRefreshToken(ctx context.Context, req OauthRefreshTokenReq) (*OauthRefreshTokenRes, error)
	UserInfo(ctx context.Context, req UserInfoReq) (*UserInfoRes, error)

	// ===== Advertiser & Account =====
	AdvertiserList(ctx context.Context, req AdvertiserListReq) (*AdvertiserListRes, error)
	AdvertiserInfo(ctx context.Context, req AdvertiserInfoReq) (*AdvertiserInfoRes, error)
	ShopAdvertiserList(ctx context.Context, req ShopAdvertiserListReq) (*ShopAdvertiserListRes, error)
	AgentAdvertiserList(ctx context.Context, req AgentAdvertiserListReq) (*AgentAdvertiserListRes, error)
	AwemeAuthorizedGet(ctx context.Context, req AwemeAuthorizedGetReq) (*AwemeAuthorizedGetRes, error)
	ProductAvailableGet(ctx context.Context, req ProductAvailableGetReq) (*ProductAvailableGetRes, error)

	// ===== Campaign =====
	CampaignListGet(ctx context.Context, req CampaignListGetReq) (*CampaignListGetRes, error)
	CampaignCreate(ctx context.Context, req CampaignCreateReq) (*CampaignCreateRes, error)
	CampaignUpdate(ctx context.Context, req CampaignUpdateReq) (*CampaignUpdateRes, error)
	BatchCampaignStatusUpdate(ctx context.Context, req BatchCampaignStatusUpdateReq) (*BatchCampaignStatusUpdateRes, error)


		// ===== Advertiser Budget =====
		AdvertiserBudgetGet(ctx context.Context, req AdvertiserBudgetGetReq) (*AdvertiserBudgetGetRes, error)
		AdvertiserBudgetUpdate(ctx context.Context, req AdvertiserBudgetUpdateReq) (*AdvertiserBudgetUpdateRes, error)

	// ===== Ad =====
	AdListGet(ctx context.Context, req AdListGetReq) (*AdListGetRes, error)
	AdDetailGet(ctx context.Context, req AdDetailGetReq) (*AdDetailGetRes, error)
	AdCreate(ctx context.Context, req AdCreateReq) (*AdCreateRes, error)
	AdUpdate(ctx context.Context, req AdUpdateReq) (*AdUpdateRes, error)
	AdStatusUpdate(ctx context.Context, req AdStatusUpdateReq) (*AdStatusUpdateRes, error)
	AdBudgetUpdate(ctx context.Context, req AdBudgetUpdateReq) (*AdBudgetUpdateRes, error)
	AdBidUpdate(ctx context.Context, req AdBidUpdateReq) (*AdBidUpdateRes, error)

	// ===== Creative =====
	CreativeGet(ctx context.Context, req CreativeGetReq) (*CreativeGetRes, error)
	CreativeRejectReason(ctx context.Context, req CreativeRejectReasonReq) (*CreativeRejectReasonRes, error)

	// ===== File / Material =====
	FileImageAd(ctx context.Context, req FileImageAdReq) (*FileImageAdRes, error)
	FileVideoAd(ctx context.Context, req FileVideoAdReq) (*FileVideoAdRes, error)
	FileImageGet(ctx context.Context, req FileImageGetReq) (*FileImageGetRes, error)
	FileVideoGet(ctx context.Context, req FileVideoGetReq) (*FileVideoGetRes, error)

	// ===== Report =====
	AdvertiserReport(ctx context.Context, req AdvertiserReportReq) (*AdvertiserReportRes, error)
	ReportAdGet(ctx context.Context, req ReportAdGetReq) (*ReportAdGetRes, error)
	ReportCreativeGet(ctx context.Context, req ReportCreativeGetReq) (*ReportCreativeGetRes, error)

	// ===== Tools =====
	ToolsIndustryGet(ctx context.Context, req ToolsIndustryGetReq) (*ToolsIndustryGetRes, error)
	ToolsInterestActionInterestCategory(ctx context.Context, req ToolsInterestActionInterestCategoryReq) (*ToolsInterestActionInterestCategoryRes, error)
	ToolsInterestActionInterestKeyword(ctx context.Context, req ToolsInterestActionInterestKeywordReq) (*ToolsInterestActionInterestKeywordRes, error)
	ToolsInterestActionActionCategory(ctx context.Context, req ToolsInterestActionActionCategoryReq) (*ToolsInterestActionActionCategoryRes, error)
	ToolsInterestActionActionKeyword(ctx context.Context, req ToolsInterestActionActionKeywordReq) (*ToolsInterestActionActionKeywordRes, error)
	ToolsAwemeMultiLevelCategoryGet(ctx context.Context, req ToolsAwemeMultiLevelCategoryGetReq) (*ToolsAwemeMultiLevelCategoryGetRes, error)
	ToolsAwemeAuthorInfoGet(ctx context.Context, req ToolsAwemeAuthorInfoGetReq) (*ToolsAwemeAuthorInfoGetRes, error)
	ToolsCreativeWordSelect(ctx context.Context, req ToolsCreativeWordSelectReq) (*ToolsCreativeWordSelectRes, error)
	DmpAudiencesGet(ctx context.Context, req DmpAudiencesGetReq) (*DmpAudiencesGetRes, error)

	// ===== Finance =====
	WalletGet(ctx context.Context, req WalletGetReq) (*WalletGetRes, error)
	BalanceGet(ctx context.Context, req BalanceGetReq) (*BalanceGetRes, error)
	DetailGet(ctx context.Context, req DetailGetReq) (*DetailGetRes, error)
	FundTransferSeqCreate(ctx context.Context, req FundTransferSeqCreateReq) (*FundTransferSeqCreateRes, error)
	FundTransferSeqCommit(ctx context.Context, req FundTransferSeqCommitReq) (*FundTransferSeqCommitRes, error)
	RefundTransferSeqCreate(ctx context.Context, req RefundTransferSeqCreateReq) (*RefundTransferSeqCreateRes, error)
	RefundTransferSeqCommit(ctx context.Context, req RefundTransferSeqCommitReq) (*RefundTransferSeqCommitRes, error)

	// ===== Live =====
	LiveGet(ctx context.Context, req LiveGetReq) (*LiveGetRes, error)
	LiveRoomGet(ctx context.Context, req LiveRoomGetReq) (*LiveRoomGetRes, error)
	LiveRoomDetailGet(ctx context.Context, req LiveRoomDetailGetReq) (*LiveRoomDetailGetRes, error)
	LiveRoomFlowPerformanceGet(ctx context.Context, req LiveRoomFlowPerformanceGetReq) (*LiveRoomFlowPerformanceGetRes, error)
	LiveRoomUserGet(ctx context.Context, req LiveRoomUserGetReq) (*LiveRoomUserGetRes, error)
	LiveRoomProductListGet(ctx context.Context, req LiveRoomProductListGetReq) (*LiveRoomProductListGetRes, error)

	// ===== Aweme (随心推) =====
	AwemeOrderGet(ctx context.Context, req AwemeOrderGetReq) (*AwemeOrderGetRes, error)
	AwemeOrderDetailGet(ctx context.Context, req AwemeOrderDetailGetReq) (*AwemeOrderDetailGetRes, error)
	AwemeOrderCreate(ctx context.Context, req AwemeOrderCreateReq) (*AwemeOrderCreateRes, error)
	AwemeOrderTerminate(ctx context.Context, req AwemeOrderTerminateReq) (*AwemeOrderTerminateRes, error)
	AwemeVideoGet(ctx context.Context, req AwemeVideoGetReq) (*AwemeVideoGetRes, error)
	AwemeOrderBudgetAdd(ctx context.Context, req AwemeOrderBudgetAddReq) (*AwemeOrderBudgetAddRes, error)
	AwemeSuggestBid(ctx context.Context, req AwemeSuggestBidReq) (*AwemeSuggestBidRes, error)
	AwemeEstimateProfit(ctx context.Context, req AwemeEstimateProfitReq) (*AwemeEstimateProfitRes, error)
	AwemeOrderQuotaGet(ctx context.Context, req AwemeOrderQuotaGetReq) (*AwemeOrderQuotaGetRes, error)

	// ===== Keywords =====
	KeywordPackageGet(ctx context.Context, req KeywordPackageGetReq) (*KeywordPackageGetRes, error)
	RecommendKeywordsGet(ctx context.Context, req RecommendKeywordsGetReq) (*RecommendKeywordsGetRes, error)
	KeywordCheck(ctx context.Context, req KeywordCheckReq) (*KeywordCheckRes, error)
	PrivatewordsGet(ctx context.Context, req PrivatewordsGetReq) (*PrivatewordsGetRes, error)
	KeywordsUpdate(ctx context.Context, req KeywordsUpdateReq) (*KeywordsUpdateRes, error)
	KeywordsGet(ctx context.Context, req KeywordsGetReq) (*KeywordsGetRes, error)
	PrivatewordsUpdate(ctx context.Context, req PrivatewordsUpdateReq) (*PrivatewordsUpdateRes, error)

	// ===== UniPromotion (全域推广) =====
	UniPromotionList(ctx context.Context, req UniPromotionListReq) (*UniPromotionListRes, error)
	UniPromotionDetail(ctx context.Context, req UniPromotionDetailReq) (*UniPromotionDetailRes, error)
	UniPromotionCreate(ctx context.Context, req UniPromotionCreateReq) (*UniPromotionCreateRes, error)
	UniPromotionUpdate(ctx context.Context, req UniPromotionUpdateReq) (*UniPromotionUpdateRes, error)
	UniPromotionStatusUpdate(ctx context.Context, req UniPromotionStatusUpdateReq) (*UniPromotionStatusUpdateRes, error)
	UniPromotionBudgetUpdate(ctx context.Context, req UniPromotionBudgetUpdateReq) (*UniPromotionBudgetUpdateRes, error)
	UniPromotionRoiGoalUpdate(ctx context.Context, req UniPromotionRoiGoalUpdateReq) (*UniPromotionRoiGoalUpdateRes, error)
	UniPromotionScheduleUpdate(ctx context.Context, req UniPromotionScheduleUpdateReq) (*UniPromotionScheduleUpdateRes, error)
	UniPromotionMaterialGet(ctx context.Context, req UniPromotionMaterialGetReq) (*UniPromotionMaterialGetRes, error)
	UniPromotionMaterialDelete(ctx context.Context, req UniPromotionMaterialDeleteReq) (*UniPromotionMaterialDeleteRes, error)
	UniPromotionAuthorizedGet(ctx context.Context, req UniPromotionAuthorizedGetReq) (*UniPromotionAuthorizedGetRes, error)
	UniPromotionAuthInit(ctx context.Context, req UniPromotionAuthInitReq) (*UniPromotionAuthInitRes, error)
}

// QianchuanError 统一错误类型
// 封装底层 SDK 的错误信息，便于统一处理和日志记录
type QianchuanError struct {
	Code    int64  `json:"code"`     // SDK 返回的错误码
	Message string `json:"message"`  // SDK 返回的错误信息
	Err     error  `json:"-"`        // 原始错误（用于 error 链）
}

func (e *QianchuanError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

func (e *QianchuanError) Unwrap() error {
	return e.Err
}
