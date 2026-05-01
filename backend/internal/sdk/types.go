package sdk

// ===========================
// 项目内部 DTO 类型定义
// 与底层 SDK 解耦，便于切换 SDK 实现
// ===========================

// ===== Auth & Session Types =====

type OauthAccessTokenReq struct {
	AuthCode string `json:"auth_code"`
}

type OauthAccessTokenRes struct {
	Code    int64                    `json:"code"`
	Message string                   `json:"message"`
	Data    *OauthAccessTokenResData `json:"data,omitempty"`
}

type OauthAccessTokenResData struct {
	AccessToken           string  `json:"access_token"`
	RefreshToken          string  `json:"refresh_token"`
	ExpiresIn             int64   `json:"expires_in"`
	RefreshTokenExpiresIn int64   `json:"refresh_token_expires_in"`
	AdvertiserId          int64   `json:"advertiser_id"`
	AdvertiserIds         []int64 `json:"advertiser_ids"`
}

type OauthRefreshTokenReq struct {
	RefreshToken string `json:"refresh_token"`
}

type OauthRefreshTokenRes struct {
	Code    int64                    `json:"code"`
	Message string                   `json:"message"`
	Data    *OauthAccessTokenResData `json:"data,omitempty"`
}

type UserInfoReq struct {
	AccessToken string `json:"access_token"`
}

type UserInfoRes struct {
	Code    int64        `json:"code"`
	Message string       `json:"message"`
	Data    *UserInfoData `json:"data,omitempty"`
}

type UserInfoData struct {
	Id          int64  `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
}

// ===== Advertiser Budget Types =====

type AdvertiserBudgetGetReq struct {
	AccessToken  string
	AdvertiserId int64
}

type AdvertiserBudgetGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Budget     int64  `json:"budget"`
		BudgetMode string `json:"budget_mode"`
	} `json:"data"`
}

type AdvertiserBudgetUpdateReq struct {
	AccessToken  string
	AdvertiserId int64
	Budget       int64
}

type AdvertiserBudgetUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
}

// ===== Advertiser & Account Types =====

type AdvertiserListReq struct {
	AccessToken string `json:"access_token"`
	AppId       int64  `json:"app_id"`
	Secret      string `json:"secret"`
}

type AdvertiserListRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []AdvertiserListItem `json:"list"`
	} `json:"data"`
}

type AdvertiserListItem struct {
	AdvertiserId   int64  `json:"advertiser_id"`
	AdvertiserName string `json:"advertiser_name"`
	IsValid        bool   `json:"is_valid"`
	AccountRole    string `json:"account_role"`
}

type AdvertiserInfoReq struct {
	AccessToken   string   `json:"access_token"`
	AdvertiserIds []int64  `json:"advertiser_ids"`
	Fields        []string `json:"fields,omitempty"`
}

type AdvertiserInfoRes struct {
	Code    int64                   `json:"code"`
	Message string                  `json:"message"`
	Data    []AdvertiserInfoResData `json:"data"`
}

type AdvertiserInfoResData struct {
	AdvertiserId       int64  `json:"advertiser_id"`
	AdvertiserName     string `json:"advertiser_name"`
	Company            string `json:"company"`
	FirstIndustryName  string `json:"first_industry_name"`
	SecondIndustryName string `json:"second_industry_name"`
}

type ShopAdvertiserListReq struct {
	AccessToken string `json:"access_token"`
	ShopId      int64  `json:"shop_id"`
	Page        int64  `json:"page"`
	PageSize    int64  `json:"page_size"`
}

type ShopAdvertiserListRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []ShopAdvertiserItem `json:"list"`
		PageInfo PageInfo             `json:"page_info"`
	} `json:"data"`
}

type ShopAdvertiserItem struct {
	AdvertiserId   int64  `json:"advertiser_id"`
	AdvertiserName string `json:"advertiser_name"`
}

type AgentAdvertiserListReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	Page         int64  `json:"page"`
	PageSize     int64  `json:"page_size"`
}

type AgentAdvertiserListRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []AgentAdvertiserItem `json:"list"`
		PageInfo PageInfo              `json:"page_info"`
	} `json:"data"`
}

type AgentAdvertiserItem struct {
	AdvertiserId   int64  `json:"advertiser_id"`
	AdvertiserName string `json:"advertiser_name"`
	Company        string `json:"company"`
}

// ===== Aweme Authorized Types =====

type AwemeAuthorizedGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	Page         int64  `json:"page"`
	PageSize     int64  `json:"page_size"`
}

type AwemeAuthorizedGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []AwemeAuthorizedGetResDetail `json:"list"`
		PageInfo PageInfo                      `json:"page_info"`
	} `json:"data"`
}

type AwemeAuthorizedGetResDetail struct {
	AwemeId         int64    `json:"aweme_id"`
	AwemeName       string   `json:"aweme_name"`
	AwemeShowId     string   `json:"aweme_show_id"`
	AwemeAvatar     string   `json:"aweme_avatar"`
	BindType        []string `json:"bind_type"`
	AccountTypeList []string `json:"account_type_list"`
}

// ===== Product Types =====

type ProductAvailableGetReq struct {
	AccessToken  string                     `json:"access_token"`
	AdvertiserId int64                      `json:"advertiser_id"`
	Page         int64                      `json:"page"`
	PageSize     int64                      `json:"page_size"`
	Filtering    *ProductAvailableGetFilter `json:"filtering,omitempty"`
}

type ProductAvailableGetFilter struct {
	ProductIds  []int64 `json:"product_ids,omitempty"`
	ProductName string  `json:"product_name,omitempty"`
}

type ProductAvailableGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []ProductAvailableGetResDetail `json:"list"`
		PageInfo PageInfo                       `json:"page_info"`
	} `json:"data"`
}

type ProductAvailableGetResDetail struct {
	ProductId     int64   `json:"product_id"`
	ProductName   string  `json:"product_name"`
	DiscountPrice float64 `json:"discount_price"`
	MarketPrice   float64 `json:"market_price"`
	Img           string  `json:"img"`
	ProductRate   float64 `json:"product_rate"`
	SaleTime      string  `json:"sale_time"`
	CategoryName  string  `json:"category_name"`
}

// ===== Campaign Types =====

type CampaignListGetReq struct {
	AccessToken  string                `json:"access_token"`
	AdvertiserId int64                 `json:"advertiser_id"`
	Page         int64                 `json:"page"`
	PageSize     int64                 `json:"page_size"`
	Filter       CampaignListGetFilter `json:"filter"`
}

type CampaignListGetFilter struct {
	Ids           []int64 `json:"ids,omitempty"`
	Name          string  `json:"name,omitempty"`
	MarketingGoal string  `json:"marketing_goal,omitempty"`
	Status        string  `json:"status,omitempty"`
}

type CampaignListGetRes struct {
	Code    int64             `json:"code"`
	Message string            `json:"message"`
	Data    *CampaignListData `json:"data,omitempty"`
}

type CampaignListData struct {
	List     []Campaign `json:"list"`
	PageInfo PageInfo   `json:"page_info"`
}

type Campaign struct {
	Id            int64   `json:"id"`
	Name          string  `json:"name"`
	Budget        float64 `json:"budget"`
	BudgetMode    string  `json:"budget_mode"`
	MarketingGoal string  `json:"marketing_goal"`
	Status        string  `json:"status"`
	CreateDate    string  `json:"create_date"`
}

type CampaignCreateReq struct {
	AccessToken  string             `json:"access_token"`
	AdvertiserId int64              `json:"advertiser_id"`
	Body         CampaignCreateBody `json:"body"`
}

type CampaignCreateBody struct {
	AdvertiserId  int64   `json:"advertiser_id"`
	CampaignName  string  `json:"campaign_name"`
	Budget        float64 `json:"budget,omitempty"`
	BudgetMode    string  `json:"budget_mode,omitempty"`
	MarketingGoal string  `json:"marketing_goal"`
}

type CampaignCreateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		CampaignId int64 `json:"campaign_id"`
	} `json:"data"`
}

type CampaignUpdateReq struct {
	AccessToken  string             `json:"access_token"`
	AdvertiserId int64              `json:"advertiser_id"`
	Body         CampaignUpdateBody `json:"body"`
}

type CampaignUpdateBody struct {
	AdvertiserId int64   `json:"advertiser_id"`
	CampaignId   int64   `json:"campaign_id"`
	CampaignName string  `json:"campaign_name,omitempty"`
	Budget       float64 `json:"budget,omitempty"`
	BudgetMode   string  `json:"budget_mode,omitempty"`
}

type CampaignUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		CampaignId int64 `json:"campaign_id"`
	} `json:"data"`
}

type BatchCampaignStatusUpdateReq struct {
	AccessToken  string                        `json:"access_token"`
	AdvertiserId int64                         `json:"advertiser_id"`
	Body         BatchCampaignStatusUpdateBody `json:"body"`
}

type BatchCampaignStatusUpdateBody struct {
	AdvertiserId int64   `json:"advertiser_id"`
	CampaignIds  []int64 `json:"campaign_ids"`
	OptStatus    string  `json:"opt_status"`
}

type BatchCampaignStatusUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		CampaignIds []int64                     `json:"campaign_ids"`
		Errors      []CampaignStatusUpdateError `json:"errors,omitempty"`
	} `json:"data"`
}

type CampaignStatusUpdateError struct {
	CampaignId int64  `json:"campaign_id"`
	ErrorCode  int64  `json:"error_code"`
	ErrorMsg   string `json:"error_msg"`
}

// ===== Ad Types =====

type AdListGetReq struct {
	AccessToken      string             `json:"access_token"`
	AdvertiserId     int64              `json:"advertiser_id"`
	RequestAwemeInfo int64              `json:"request_aweme_info,omitempty"`
	Page             int64              `json:"page"`
	PageSize         int64              `json:"page_size"`
	Filtering        AdListGetFiltering `json:"filtering"`
}

type AdListGetFiltering struct {
	Ids               []int64 `json:"ids,omitempty"`
	AdName            string  `json:"ad_name,omitempty"`
	Status            string  `json:"status,omitempty"`
	CampaignScene     string  `json:"campaign_scene,omitempty"`
	MarketingScene    string  `json:"marketing_scene,omitempty"`
	PromotionWay      string  `json:"promotion_way,omitempty"`
	MarketingGoal     string  `json:"marketing_goal"`
	CampaignId        int64   `json:"campaign_id,omitempty"`
	AdCreateStartDate string  `json:"ad_create_start_date,omitempty"`
	AdCreateEndDate   string  `json:"ad_create_end_date,omitempty"`
	AdModifyTime      string  `json:"ad_modify_time,omitempty"`
	AwemeId           int64   `json:"aweme_id,omitempty"`
	AutoManageFilter  string  `json:"auto_manage_filter,omitempty"`
}

type AdListGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    *AdListData `json:"data,omitempty"`
}

type AdListData struct {
	List     []interface{} `json:"list"`
	PageInfo PageInfo      `json:"page_info"`
	FailList []int64       `json:"fail_list,omitempty"`
}

type AdDetailGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdId         int64  `json:"ad_id"`
}

type AdDetailGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type AdCreateReq struct {
	AccessToken  string       `json:"access_token"`
	AdvertiserId int64        `json:"advertiser_id"`
	Body         AdCreateBody `json:"body"`
}

type AdCreateBody struct {
	AdvertiserId    int64       `json:"advertiser_id"`
	Name            string      `json:"name"`
	CampaignId      int64       `json:"campaign_id,omitempty"`
	DeliverySetting interface{} `json:"delivery_setting,omitempty"`
	Audience        interface{} `json:"audience,omitempty"`
}

type AdCreateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdId int64 `json:"ad_id"`
	} `json:"data"`
}

type AdUpdateReq struct {
	AccessToken  string       `json:"access_token"`
	AdvertiserId int64        `json:"advertiser_id"`
	Body         AdUpdateBody `json:"body"`
}

type AdUpdateBody struct {
	AdvertiserId    int64       `json:"advertiser_id"`
	AdId            int64       `json:"ad_id"`
	Name            string      `json:"name,omitempty"`
	DeliverySetting interface{} `json:"delivery_setting,omitempty"`
	Audience        interface{} `json:"audience,omitempty"`
}

type AdUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdId int64 `json:"ad_id"`
	} `json:"data"`
}

type AdStatusUpdateReq struct {
	AccessToken  string             `json:"access_token"`
	AdvertiserId int64              `json:"advertiser_id"`
	Body         AdStatusUpdateBody `json:"body"`
}

type AdStatusUpdateBody struct {
	AdvertiserId int64   `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
	OptStatus    string  `json:"opt_status"`
}

type AdStatusUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []int64         `json:"ad_ids"`
		Errors []AdStatusError `json:"errors,omitempty"`
	} `json:"data"`
}

type AdStatusError struct {
	AdId      int64  `json:"ad_id"`
	ErrorCode int64  `json:"error_code"`
	ErrorMsg  string `json:"error_msg"`
}

type AdBudgetUpdateReq struct {
	AccessToken  string             `json:"access_token"`
	AdvertiserId int64              `json:"advertiser_id"`
	Body         AdBudgetUpdateBody `json:"body"`
}

type AdBudgetUpdateBody struct {
	AdvertiserId int64          `json:"advertiser_id"`
	Data         []AdBudgetItem `json:"data"`
}

type AdBudgetItem struct {
	AdId   int64   `json:"ad_id"`
	Budget float64 `json:"budget"`
}

type AdBudgetUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []int64         `json:"ad_ids"`
		Errors []AdStatusError `json:"errors,omitempty"`
	} `json:"data"`
}

type AdBidUpdateReq struct {
	AccessToken  string          `json:"access_token"`
	AdvertiserId int64           `json:"advertiser_id"`
	Body         AdBidUpdateBody `json:"body"`
}

type AdBidUpdateBody struct {
	AdvertiserId int64       `json:"advertiser_id"`
	Data         []AdBidItem `json:"data"`
}

type AdBidItem struct {
	AdId int64   `json:"ad_id"`
	Bid  float64 `json:"bid"`
}

type AdBidUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []int64         `json:"ad_ids"`
		Errors []AdStatusError `json:"errors,omitempty"`
	} `json:"data"`
}

type AdRoiGoalUpdateReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
	RoiGoal      float64 `json:"roi_goal"`
}

type AdRoiGoalUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Results []AdOpResult `json:"results"`
	} `json:"data"`
}

type AdOpResult struct {
	AdId      int64  `json:"ad_id"`
	Success   bool   `json:"success"`
	ErrorCode int64  `json:"error_code,omitempty"`
	ErrorMsg  string `json:"error_msg,omitempty"`
}

type AdScheduleDateUpdateReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
	StartDate    string `json:"start_date,omitempty"`
	EndDate      string `json:"end_date,omitempty"`
}

type AdScheduleDateUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []int64         `json:"ad_ids"`
		Errors []AdStatusError `json:"errors,omitempty"`
	} `json:"data"`
}

type AdScheduleTimeUpdateReq struct {
	AccessToken   string `json:"access_token"`
	AdvertiserId  int64  `json:"advertiser_id"`
	AdIds         []int64 `json:"ad_ids"`
	ScheduleTime  string `json:"schedule_time,omitempty"`
}

type AdScheduleTimeUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []int64         `json:"ad_ids"`
		Errors []AdStatusError `json:"errors,omitempty"`
	} `json:"data"`
}

type AdScheduleFixedRangeUpdateReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
	FixedRange   float64 `json:"fixed_range,omitempty"`
}

type AdScheduleFixedRangeUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []int64         `json:"ad_ids"`
		Errors []AdStatusError `json:"errors,omitempty"`
	} `json:"data"`
}

type AdRegionUpdateReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
	District     string `json:"district,omitempty"`
	City         []int64 `json:"city,omitempty"`
	LocationType string `json:"location_type,omitempty"`
}

type AdRegionUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []int64         `json:"ad_ids"`
		Errors []AdStatusError `json:"errors,omitempty"`
	} `json:"data"`
}

type AdRejectReasonReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
}

type AdRejectReasonRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type AdLqAdGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
}

type AdLqAdGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds []int64 `json:"ad_ids"`
	} `json:"data"`
}

type AdSuggestRoiGoalReq struct {
	AccessToken    string `json:"access_token"`
	AdvertiserId   int64  `json:"advertiser_id"`
	MarketingGoal  string `json:"marketing_goal,omitempty"`
	AwemeId        int64  `json:"aweme_id,omitempty"`
	ProductId      int64  `json:"product_id,omitempty"`
	ExternalAction string `json:"external_action,omitempty"`
}

type AdSuggestRoiGoalRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		EcpRoiGoal     float64 `json:"ecp_roi_goal"`
		RoiLowerBound  float64 `json:"roi_lower_bound"`
		RoiUpperBound  float64 `json:"roi_upper_bound"`
	} `json:"data"`
}

type AdSuggestBidReq struct {
	AccessToken    string `json:"access_token"`
	AdvertiserId   int64  `json:"advertiser_id"`
	MarketingGoal  string `json:"marketing_goal,omitempty"`
	AwemeId        int64  `json:"aweme_id,omitempty"`
	ProductId      int64  `json:"product_id,omitempty"`
	ExternalAction string `json:"external_action,omitempty"`
}

type AdSuggestBidRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		SuggestBidLow  float64 `json:"suggest_bid_low"`
		SuggestBidHigh float64 `json:"suggest_bid_high"`
	} `json:"data"`
}

type AdSuggestBudgetReq struct {
	AccessToken        string `json:"access_token"`
	AdvertiserId       int64  `json:"advertiser_id"`
	AwemeId            int64  `json:"aweme_id,omitempty"`
	LiveScheduleType   string `json:"live_schedule_type,omitempty"`
	StartTime          string `json:"start_time,omitempty"`
	EndTime            string `json:"end_time,omitempty"`
	ScheduleTime       string `json:"schedule_time,omitempty"`
	ScheduleFixedRange int64  `json:"schedule_fixed_range,omitempty"`
}

type AdSuggestBudgetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		SuggestBudgetLow  float64 `json:"suggest_budget_low"`
		SuggestBudgetHigh float64 `json:"suggest_budget_high"`
	} `json:"data"`
}

type AdEstimateEffectReq struct {
	AccessToken        string  `json:"access_token"`
	AdvertiserId       int64   `json:"advertiser_id"`
	AwemeId            int64   `json:"aweme_id,omitempty"`
	ExternalAction     string  `json:"external_action,omitempty"`
	BudgetMode         string  `json:"budget_mode,omitempty"`
	Budget             float64 `json:"budget"`
	LiveScheduleType   string  `json:"live_schedule_type,omitempty"`
	DeepExternalAction string  `json:"deep_external_action,omitempty"`
	DeepBidType        string  `json:"deep_bid_type,omitempty"`
}

type AdEstimateEffectRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		EstimateEffectLow  float64 `json:"estimate_effect_low"`
		EstimateEffectHigh float64 `json:"estimate_effect_high"`
	} `json:"data"`
}

type AdCompensateStatusGetReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
}

type AdCompensateStatusGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type AdLearningStatusGetReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	AdIds        []int64 `json:"ad_ids"`
}

type AdLearningStatusGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

// ===== Creative Types =====

type CreativeGetReq struct {
	AccessToken  string                   `json:"access_token"`
	AdvertiserId int64                    `json:"advertiser_id"`
	Page         int64                    `json:"page"`
	PageSize     int64                    `json:"page_size"`
	Filtering    *CreativeGetReqFiltering `json:"filtering,omitempty"`
}

type CreativeGetReqFiltering struct {
	MarketingGoal         string  `json:"marketing_goal,omitempty"`
	Status                string  `json:"status,omitempty"`
	AdIds                 []int64 `json:"ad_ids,omitempty"`
	CreativeId            int64   `json:"creative_id,omitempty"`
	CreativeMaterialMode  string  `json:"creative_material_mode,omitempty"`
	CampaignId            int64   `json:"campaign_id,omitempty"`
	CreativeCreateEndDate string  `json:"creative_create_end_date,omitempty"`
	CreativeModifyTime    string  `json:"creative_modify_time,omitempty"`
}

type CreativeGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type CreativeRejectReasonReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	CreativeIds  []int64 `json:"creative_ids"`
}

type CreativeRejectReasonRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type CreativeUpdateStatusReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	CreativeIds  []int64 `json:"creative_ids"`
	OptStatus    string  `json:"opt_status"`
}

type CreativeUpdateStatusRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		CreativeIds []int64 `json:"creative_ids"`
	} `json:"data"`
}

// ===== File / Material Types =====

type FileImageAdReq struct {
	AccessToken  string             `json:"access_token"`
	AdvertiserId int64              `json:"advertiser_id"`
	Body         FileImageAdReqBody `json:"body"`
}

type FileImageAdReqBody struct {
	AdvertiserId   int64  `json:"advertiser_id"`
	UploadType     string `json:"upload_type"`
	ImageSignature string `json:"image_signature,omitempty"`
	ImageFile      []byte `json:"-"`
	ImageUrl       string `json:"image_url,omitempty"`
	Filename       string `json:"filename,omitempty"`
}

type FileImageAdRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		ImageId   string `json:"image_id"`
		ImageUrl  string `json:"image_url"`
		Size      int64  `json:"size"`
		Width     int64  `json:"width"`
		Height    int64  `json:"height"`
		Format    string `json:"format"`
		Signature string `json:"signature"`
	} `json:"data"`
}

type FileVideoAdReq struct {
	AccessToken  string             `json:"access_token"`
	AdvertiserId int64              `json:"advertiser_id"`
	Body         FileVideoAdReqBody `json:"body"`
}

type FileVideoAdReqBody struct {
	AdvertiserId   int64  `json:"advertiser_id"`
	VideoSignature string `json:"video_signature,omitempty"`
	VideoFile      []byte `json:"-"`
	VideoUrl       string `json:"video_url,omitempty"`
	Filename       string `json:"filename,omitempty"`
}

type FileVideoAdRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		VideoId  string  `json:"video_id"`
		Size     int64   `json:"size"`
		Width    int64   `json:"width"`
		Height   int64   `json:"height"`
		Duration float64 `json:"duration"`
	} `json:"data"`
}

type FileImageGetReq struct {
	AccessToken  string                    `json:"access_token"`
	AdvertiserId int64                     `json:"advertiser_id"`
	Page         int64                     `json:"page"`
	PageSize     int64                     `json:"page_size"`
	Filtering    *FileImageGetReqFiltering `json:"filtering,omitempty"`
}

type FileImageGetReqFiltering struct {
	ImageIds    []string  `json:"image_ids,omitempty"`
	MaterialIds []int64   `json:"material_ids,omitempty"`
	Signatures  []string  `json:"signatures,omitempty"`
	Width       int64     `json:"width,omitempty"`
	Height      int64     `json:"height,omitempty"`
	Ratio       []float64 `json:"ratio,omitempty"`
	StartTime   string    `json:"start_time,omitempty"`
	EndTime     string    `json:"end_time,omitempty"`
}

type FileImageGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type FileVideoGetReq struct {
	AccessToken  string                    `json:"access_token"`
	AdvertiserId int64                     `json:"advertiser_id"`
	Page         int64                     `json:"page"`
	PageSize     int64                     `json:"page_size"`
	Filtering    *FileVideoGetReqFiltering `json:"filtering,omitempty"`
}

type FileVideoGetReqFiltering struct {
	Width       int64     `json:"width,omitempty"`
	Height      int64     `json:"height,omitempty"`
	Ratio       []float64 `json:"ratio,omitempty"`
	VideoIds    []string  `json:"video_ids,omitempty"`
	MaterialIds []int64   `json:"material_ids,omitempty"`
	Signatures  []string  `json:"signatures,omitempty"`
	StartTime   string    `json:"start_time,omitempty"`
	EndTime     string    `json:"end_time,omitempty"`
}

type FileVideoGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

// ===== Report Types =====

type AdvertiserReportReq struct {
	AccessToken  string                     `json:"access_token"`
	AdvertiserId int64                      `json:"advertiser_id"`
	StartDate    string                     `json:"start_date"`
	EndDate      string                     `json:"end_date"`
	Fields       []string                   `json:"fields,omitempty"`
	Filtering    *AdvertiserReportFiltering `json:"filtering,omitempty"`
}

type AdvertiserReportFiltering struct {
	MarketingGoal string `json:"marketing_goal,omitempty"`
}

type AdvertiserReportRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ReportAdGetReq struct {
	AccessToken  string                `json:"access_token"`
	AdvertiserId int64                 `json:"advertiser_id"`
	StartDate    string                `json:"start_date"`
	EndDate      string                `json:"end_date"`
	Page         int64                 `json:"page"`
	PageSize     int64                 `json:"page_size"`
	Fields       []string              `json:"fields,omitempty"`
	Filtering    *ReportAdGetFiltering `json:"filtering,omitempty"`
	OrderField   string                `json:"order_field,omitempty"`
	OrderType    string                `json:"order_type,omitempty"`
}

type ReportAdGetFiltering struct {
	AdIds         []int64 `json:"ad_ids,omitempty"`
	MarketingGoal string  `json:"marketing_goal,omitempty"`
}

type ReportAdGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type ReportCreativeGetReq struct {
	AccessToken  string                      `json:"access_token"`
	AdvertiserId int64                       `json:"advertiser_id"`
	StartDate    string                      `json:"start_date"`
	EndDate      string                      `json:"end_date"`
	Page         int64                       `json:"page"`
	PageSize     int64                       `json:"page_size"`
	Fields       []string                    `json:"fields,omitempty"`
	Filtering    *ReportCreativeGetFiltering `json:"filtering,omitempty"`
}

type ReportCreativeGetFiltering struct {
	CreativeIds   []int64 `json:"creative_ids,omitempty"`
	MarketingGoal string  `json:"marketing_goal,omitempty"`
}

type ReportCreativeGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type ReportMaterialGetReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	Page         int64    `json:"page"`
	PageSize     int64    `json:"page_size"`
	Fields       []string `json:"fields,omitempty"`
}

type ReportMaterialGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type ReportSearchWordGetReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	Page         int64    `json:"page"`
	PageSize     int64    `json:"page_size"`
	Fields       []string `json:"fields,omitempty"`
}

type ReportSearchWordGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type ReportVideoUserLoseGetReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	Page         int64    `json:"page"`
	PageSize     int64    `json:"page_size"`
	Fields       []string `json:"fields,omitempty"`
}

type ReportVideoUserLoseGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type ReportUniPromotionGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	StartDate    string `json:"start_date"`
	EndDate      string `json:"end_date"`
	Fields       []string `json:"fields,omitempty"`
}

type ReportUniPromotionGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type ReportCustomGetReq struct {
	AccessToken  string          `json:"access_token"`
	AdvertiserId int64           `json:"advertiser_id"`
	StartDate    string          `json:"start_date"`
	EndDate      string          `json:"end_date"`
	DataTopic    string          `json:"data_topic,omitempty"`
	Page         int64           `json:"page"`
	PageSize     int64           `json:"page_size"`
	Dimensions   []string        `json:"dimensions,omitempty"`
	Metrics      []string        `json:"metrics,omitempty"`
	Filters      []ReportFilter  `json:"filters,omitempty"`
	OrderBy      []ReportOrderBy `json:"order_by,omitempty"`
}

type ReportFilter struct {
	Field    string   `json:"field"`
	Type     int      `json:"type,omitempty"`
	Operator int      `json:"operator,omitempty"`
	Values   []string `json:"values"`
}

type ReportOrderBy struct {
	Field string `json:"field"`
	Type  int    `json:"type"`
}

type ReportCustomGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type ReportCustomConfigGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
}

type ReportCustomConfigGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

// ===== Tools Types =====

type ToolsIndustryGetReq struct {
	AccessToken string `json:"access_token"`
	Level       int64  `json:"level,omitempty"`
	Type        string `json:"type,omitempty"`
}

type ToolsIndustryGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ToolsInterestActionInterestCategoryReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
}

type ToolsInterestActionInterestCategoryRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ToolsInterestActionInterestKeywordReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	QueryWords   string `json:"query_words"`
}

type ToolsInterestActionInterestKeywordRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ToolsInterestActionActionCategoryReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	ActionScene  []string `json:"action_scene"`
	ActionDays   int64    `json:"action_days"`
}

type ToolsInterestActionActionCategoryRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ToolsInterestActionActionKeywordReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	QueryWords   string   `json:"query_words"`
	ActionScene  []string `json:"action_scene"`
	ActionDays   int64    `json:"action_days"`
}

type ToolsInterestActionActionKeywordRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ToolsAwemeMultiLevelCategoryGetReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	Behaviors    []string `json:"behaviors,omitempty"`
}

type ToolsAwemeMultiLevelCategoryGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ToolsAwemeAuthorInfoGetReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	AwemeIds     []int64 `json:"aweme_ids"`
}

type ToolsAwemeAuthorInfoGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type ToolsCreativeWordSelectReq struct {
	AccessToken     string   `json:"access_token"`
	AdvertiserId    int64    `json:"advertiser_id"`
	CreativeWordIds []string `json:"creative_word_ids,omitempty"`
}

type ToolsCreativeWordSelectRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type DmpAudiencesGetReq struct {
	AccessToken         string `json:"access_token"`
	AdvertiserId        int64  `json:"advertiser_id"`
	RetargetingTagsType int64  `json:"retargeting_tags_type,omitempty"`
	Offset              int64  `json:"offset"`
	Limit               int64  `json:"limit"`
}

type DmpAudiencesGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List       []interface{} `json:"retargeting_tags"`
		TotalCount int64         `json:"total_count"`
	} `json:"data"`
}

// ===== Finance Types =====

type WalletGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
}

type WalletGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		TotalBalance      float64 `json:"total_balance"`
		GrantBalance      float64 `json:"grant_balance"`
		CashBalance       float64 `json:"cash_balance"`
		ValidGrantBalance float64 `json:"valid_grant_balance"`
		ValidCashBalance  float64 `json:"valid_cash_balance"`
	} `json:"data"`
}

type BalanceGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
}

type BalanceGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Balance      float64 `json:"balance"`
		ValidBalance float64 `json:"valid_balance"`
		Cash         float64 `json:"cash"`
		Grant        float64 `json:"grant"`
	} `json:"data"`
}

type DetailGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	StartDate    string `json:"start_date"`
	EndDate      string `json:"end_date"`
	Page         int64  `json:"page"`
	PageSize     int64  `json:"page_size"`
}

type DetailGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type FundTransferSeqCreateReq struct {
	AccessToken        string  `json:"access_token"`
	AdvertiserId       int64   `json:"advertiser_id"`
	TargetAdvertiserId int64   `json:"target_advertiser_id"`
	TransferType       string  `json:"transfer_type"`
	Amount             float64 `json:"amount"`
}

type FundTransferSeqCreateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		TransferSeq string `json:"transfer_seq"`
	} `json:"data"`
}

type FundTransferSeqCommitReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	TransferSeq  string  `json:"transfer_seq"`
	Amount       float64 `json:"amount"`
}

type FundTransferSeqCommitRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		TransferId string `json:"transfer_id"`
	} `json:"data"`
}

type RefundTransferSeqCreateReq struct {
	AccessToken        string  `json:"access_token"`
	AdvertiserId       int64   `json:"advertiser_id"`
	TargetAdvertiserId int64   `json:"target_advertiser_id"`
	TransferType       string  `json:"transfer_type"`
	Amount             float64 `json:"amount"`
}

type RefundTransferSeqCreateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		TransferSeq string `json:"transfer_seq"`
	} `json:"data"`
}

type RefundTransferSeqCommitReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	TransferSeq  string  `json:"transfer_seq"`
	Amount       float64 `json:"amount"`
}

type RefundTransferSeqCommitRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		TransferId string `json:"transfer_id"`
	} `json:"data"`
}

// ===== Live Types =====

type LiveGetReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	AwemeId      int64    `json:"aweme_id"`
	Fields       []string `json:"fields,omitempty"`
}

type LiveGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type LiveRoomGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AwemeId      int64  `json:"aweme_id"`
	Page         int64  `json:"page"`
	PageSize     int64  `json:"page_size"`
}

type LiveRoomGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type LiveRoomDetailGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	RoomId       int64  `json:"room_id"`
}

type LiveRoomDetailGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type LiveRoomFlowPerformanceGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	RoomId       int64  `json:"room_id"`
}

type LiveRoomFlowPerformanceGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type LiveRoomUserGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	RoomId       int64  `json:"room_id"`
}

type LiveRoomUserGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type LiveRoomProductListGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	RoomId       int64  `json:"room_id"`
	Page         int64  `json:"page"`
	PageSize     int64  `json:"page_size"`
}

type LiveRoomProductListGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

// ===== Aweme (随心推) Types =====

type AwemeOrderGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	Page         int64  `json:"page"`
	PageSize     int64  `json:"page_size"`
	StartTime    string `json:"start_time,omitempty"`
	EndTime      string `json:"end_time,omitempty"`
}

type AwemeOrderGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type AwemeOrderDetailGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	OrderId      int64  `json:"order_id"`
}

type AwemeOrderDetailGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type AwemeOrderCreateReq struct {
	AccessToken  string      `json:"access_token"`
	AdvertiserId int64       `json:"advertiser_id"`
	Body         interface{} `json:"body"`
}

type AwemeOrderCreateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		OrderId int64 `json:"order_id"`
	} `json:"data"`
}

type AwemeOrderTerminateReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	OrderId      int64  `json:"order_id"`
}

type AwemeOrderTerminateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		OrderId int64 `json:"order_id"`
		Result  bool  `json:"result"`
	} `json:"data"`
}

type AwemeVideoGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AwemeId      int64  `json:"aweme_id"`
	Page         int64  `json:"page"`
	PageSize     int64  `json:"page_size"`
}

type AwemeVideoGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []interface{} `json:"list"`
		PageInfo PageInfo      `json:"page_info"`
	} `json:"data"`
}

type AwemeOrderBudgetAddReq struct {
	AccessToken  string  `json:"access_token"`
	AdvertiserId int64   `json:"advertiser_id"`
	OrderId      int64   `json:"order_id"`
	AddBudget    float64 `json:"add_budget"`
}

type AwemeOrderBudgetAddRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
}

type AwemeSuggestBidReq struct {
	AccessToken    string `json:"access_token"`
	AdvertiserId   int64  `json:"advertiser_id"`
	ExternalAction string `json:"external_action"`
	ProductId      int64  `json:"product_id,omitempty"`
}

type AwemeSuggestBidRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		SuggestBid float64 `json:"suggest_bid"`
	} `json:"data"`
}

type AwemeEstimateProfitReq struct {
	AccessToken   string  `json:"access_token"`
	AdvertiserId  int64   `json:"advertiser_id"`
	Budget        float64 `json:"budget"`
	DeliveryRange string  `json:"delivery_range"`
}

type AwemeEstimateProfitRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type AwemeOrderQuotaGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
}

type AwemeOrderQuotaGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ===== Keywords Types =====

type KeywordPackageGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdId         int64  `json:"ad_id"`
}

type KeywordPackageGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type RecommendKeywordsGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdId         int64  `json:"ad_id"`
}

type RecommendKeywordsGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type KeywordCheckReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	Keywords     []string `json:"keywords"`
}

type KeywordCheckRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type PrivatewordsGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdId         int64  `json:"ad_id"`
}

type PrivatewordsGetRes struct {
	Code    int64       `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type KeywordsUpdateReq struct {
	AccessToken  string              `json:"access_token"`
	AdvertiserId int64               `json:"advertiser_id"`
	AdId         int64               `json:"ad_id"`
	Keywords     []KeywordUpdateInfo `json:"keywords"`
}

type KeywordUpdateInfo struct {
	ID         int64  `json:"id,omitempty"`
	Word       string `json:"word"`
	MatchType  string `json:"match_type,omitempty"`
	StatusType string `json:"status_type,omitempty"`
}

type KeywordsUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
}

type KeywordsGetReq struct {
	AccessToken  string `json:"access_token"`
	AdvertiserId int64  `json:"advertiser_id"`
	AdId         int64  `json:"ad_id"`
}

type KeywordsGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List []interface{} `json:"list"`
	} `json:"data"`
}

type PrivatewordsUpdateReq struct {
	AccessToken  string   `json:"access_token"`
	AdvertiserId int64    `json:"advertiser_id"`
	AdId         int64    `json:"ad_id"`
	PhraseWords  []string `json:"phrase_words,omitempty"`
	PreciseWords []string `json:"precise_words,omitempty"`
}

type PrivatewordsUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
}

// ===== UniPromotion (全域推广) Types =====

type UniPromotion struct {
	AdId          uint64  `json:"ad_id"`
	AdName        string  `json:"ad_name"`
	AdvertiserId  uint64  `json:"advertiser_id"`
	MarketingGoal string  `json:"marketing_goal"`
	Status        string  `json:"status"`
	OptStatus     string  `json:"opt_status"`
	Budget        float64 `json:"budget"`
	Roi2Goal      float64 `json:"roi2_goal"`
	DeepBidType   string  `json:"deep_bid_type"`
	AwemeId       uint64  `json:"aweme_id"`
	AwemeName     string  `json:"aweme_name"`
	ProductId     uint64  `json:"product_id"`
	ProductName   string  `json:"product_name"`
	StartTime     string  `json:"start_time"`
	EndTime       string  `json:"end_time"`
	CreateTime    string  `json:"create_time"`
	ModifyTime    string  `json:"modify_time"`
}

type UniPromotionListReq struct {
	AccessToken  string                     `json:"-"`
	AdvertiserId uint64                     `json:"advertiser_id"`
	Page         int                        `json:"page,omitempty"`
	PageSize     int                        `json:"page_size,omitempty"`
	Filtering    *UniPromotionListFiltering `json:"filtering,omitempty"`
}

type UniPromotionListFiltering struct {
	Status        string   `json:"status,omitempty"`
	MarketingGoal string   `json:"marketing_goal,omitempty"`
	AdIds         []uint64 `json:"ad_ids,omitempty"`
}

type UniPromotionListRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []UniPromotion `json:"list"`
		PageInfo PageInfo       `json:"page_info"`
	} `json:"data"`
}

type UniPromotionDetailReq struct {
	AccessToken  string `json:"-"`
	AdvertiserId uint64 `json:"advertiser_id"`
	AdId         uint64 `json:"ad_id"`
}

type UniPromotionDetailRes struct {
	Code    int64               `json:"code"`
	Message string              `json:"message"`
	Data    *UniPromotionDetail `json:"data"`
}

type UniPromotionDetail struct {
	UniPromotion
	LabAdType         string   `json:"lab_ad_type"`
	AutoExtendEnabled int      `json:"auto_extend_enabled"`
	VideoMaterial     []string `json:"video_material"`
	ImageMaterial     []string `json:"image_material"`
}

type UniPromotionCreateReq struct {
	AccessToken   string                 `json:"-"`
	AdvertiserId  uint64                 `json:"advertiser_id"`
	MarketingGoal string                 `json:"marketing_goal"`
	AwemeId       uint64                 `json:"aweme_id"`
	ProductId     uint64                 `json:"product_id,omitempty"`
	Budget        float64                `json:"budget"`
	Roi2Goal      float64                `json:"roi2_goal,omitempty"`
	DeepBidType   string                 `json:"deep_bid_type,omitempty"`
	StartTime     string                 `json:"start_time,omitempty"`
	EndTime       string                 `json:"end_time,omitempty"`
	VideoMaterial []UniPromotionMaterial `json:"video_material,omitempty"`
}

type UniPromotionMaterial struct {
	VideoId   string `json:"video_id,omitempty"`
	ImageId   string `json:"image_id,omitempty"`
	ImageMode string `json:"image_mode,omitempty"`
}

type UniPromotionCreateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdId uint64 `json:"ad_id"`
	} `json:"data"`
}

type UniPromotionUpdateReq struct {
	AccessToken   string                 `json:"-"`
	AdvertiserId  uint64                 `json:"advertiser_id"`
	AdId          uint64                 `json:"ad_id"`
	Budget        float64                `json:"budget,omitempty"`
	Roi2Goal      float64                `json:"roi2_goal,omitempty"`
	StartTime     string                 `json:"start_time,omitempty"`
	EndTime       string                 `json:"end_time,omitempty"`
	VideoMaterial []UniPromotionMaterial `json:"video_material,omitempty"`
}

type UniPromotionUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdId uint64 `json:"ad_id"`
	} `json:"data"`
}

type UniPromotionStatusUpdateReq struct {
	AccessToken  string   `json:"-"`
	AdvertiserId uint64   `json:"advertiser_id"`
	AdIds        []uint64 `json:"ad_ids"`
	OptStatus    string   `json:"opt_status"`
}

type UniPromotionStatusUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		AdIds  []uint64              `json:"ad_ids"`
		Errors []UniPromotionOpError `json:"errors,omitempty"`
	} `json:"data"`
}

type UniPromotionOpError struct {
	AdId         uint64 `json:"ad_id"`
	ErrorCode    int64  `json:"error_code"`
	ErrorMessage string `json:"error_message"`
}

type UniPromotionBudgetUpdateReq struct {
	AccessToken  string                         `json:"-"`
	AdvertiserId uint64                         `json:"advertiser_id"`
	Data         []UniPromotionBudgetUpdateItem `json:"data"`
}

type UniPromotionBudgetUpdateItem struct {
	AdId   uint64  `json:"ad_id"`
	Budget float64 `json:"budget"`
}

type UniPromotionBudgetUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Results []UniPromotionOpResult `json:"results"`
	} `json:"data"`
}

type UniPromotionOpResult struct {
	AdId         uint64 `json:"ad_id"`
	Success      bool   `json:"success"`
	ErrorCode    int64  `json:"error_code,omitempty"`
	ErrorMessage string `json:"error_message,omitempty"`
}

type UniPromotionRoiGoalUpdateReq struct {
	AccessToken  string                          `json:"-"`
	AdvertiserId uint64                          `json:"advertiser_id"`
	Data         []UniPromotionRoiGoalUpdateItem `json:"data"`
}

type UniPromotionRoiGoalUpdateItem struct {
	AdId     uint64  `json:"ad_id"`
	Roi2Goal float64 `json:"roi2_goal"`
}

type UniPromotionRoiGoalUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Results []UniPromotionOpResult `json:"results"`
	} `json:"data"`
}

type UniPromotionScheduleUpdateReq struct {
	AccessToken  string                           `json:"-"`
	AdvertiserId uint64                           `json:"advertiser_id"`
	Data         []UniPromotionScheduleUpdateItem `json:"data"`
}

type UniPromotionScheduleUpdateItem struct {
	AdId      uint64 `json:"ad_id"`
	StartTime string `json:"start_time,omitempty"`
	EndTime   string `json:"end_time,omitempty"`
}

type UniPromotionScheduleUpdateRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Results []UniPromotionOpResult `json:"results"`
	} `json:"data"`
}

type UniPromotionMaterialGetReq struct {
	AccessToken  string `json:"-"`
	AdvertiserId uint64 `json:"advertiser_id"`
	AdId         uint64 `json:"ad_id"`
}

type UniPromotionMaterialGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Materials []interface{} `json:"materials"`
	} `json:"data"`
}

type UniPromotionMaterialDeleteReq struct {
	AccessToken  string   `json:"-"`
	AdvertiserId uint64   `json:"advertiser_id"`
	AdId         uint64   `json:"ad_id"`
	MaterialIds  []uint64 `json:"material_ids,omitempty"`
	Titles       []string `json:"titles,omitempty"`
}

type UniPromotionMaterialDeleteRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
}

type UniPromotionAuthorizedGetReq struct {
	AccessToken  string `json:"-"`
	AdvertiserId uint64 `json:"advertiser_id"`
	Page         int    `json:"page,omitempty"`
	PageSize     int    `json:"page_size,omitempty"`
}

type UniPromotionAuthorizedGetRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		List     []UniPromotionAweme `json:"list"`
		PageInfo PageInfo            `json:"page_info"`
	} `json:"data"`
}

type UniPromotionAweme struct {
	AwemeId     uint64 `json:"aweme_id"`
	AwemeName   string `json:"aweme_name"`
	AwemeAvatar string `json:"aweme_avatar"`
}

type UniPromotionAuthInitReq struct {
	AccessToken  string `json:"-"`
	AdvertiserId uint64 `json:"advertiser_id"`
	AwemeId      uint64 `json:"aweme_id"`
}

type UniPromotionAuthInitRes struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
}

// ===== Common Types =====

type PageInfo struct {
	Page        int   `json:"page"`
	PageSize    int   `json:"page_size"`
	TotalNumber int64 `json:"total_number"`
	TotalPage   int   `json:"total_page"`
}
