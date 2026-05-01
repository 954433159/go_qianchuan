package sdk

import (
	"context"
	"fmt"
	"log"
	"time"

	oecore "github.com/bububa/oceanengine/marketing-api/core"

	// Enum types
	"github.com/bububa/oceanengine/marketing-api/enum"
	"github.com/bububa/oceanengine/marketing-api/enum/qianchuan"

	// OAuth
	oauthAPI "github.com/bububa/oceanengine/marketing-api/api/oauth"
	oauthModel "github.com/bububa/oceanengine/marketing-api/model/oauth"

	// Global Advertiser API (for PublicInfo)
	globalAdvertiserAPI "github.com/bububa/oceanengine/marketing-api/api/advertiser"
	globalAdvertiserModel "github.com/bububa/oceanengine/marketing-api/model/advertiser"

	// Global File API (for image/video upload)
	globalFileAPI "github.com/bububa/oceanengine/marketing-api/api/file"
	globalFileModel "github.com/bububa/oceanengine/marketing-api/model/file"

	// Agent API (for agent/advertiser/select)
	agentAPI "github.com/bububa/oceanengine/marketing-api/api/agent"
	agentModel "github.com/bububa/oceanengine/marketing-api/model/agent"

	// Tools APIs
	toolsAPI "github.com/bububa/oceanengine/marketing-api/api/tools"
	toolsModel "github.com/bububa/oceanengine/marketing-api/model/tools"
	toolsAwemeAPI "github.com/bububa/oceanengine/marketing-api/api/tools/aweme"
	toolsAwemeModel "github.com/bububa/oceanengine/marketing-api/model/tools/aweme"
	interestactionAPI "github.com/bububa/oceanengine/marketing-api/api/tools/interestaction"
	interestactionModel "github.com/bububa/oceanengine/marketing-api/model/tools/interestaction"
	creativewordAPI "github.com/bububa/oceanengine/marketing-api/api/tools/creativeword"
	creativewordModel "github.com/bububa/oceanengine/marketing-api/model/tools/creativeword"

	// Qianchuan APIs
	adAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/ad"
	advertiserAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/advertiser"
	awemeAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/aweme"
	campaignAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/campaign"
	creativeAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/creative"
	qianchuanDmpAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/dmp"
	fileAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/file"
	financeAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/finance"
	liveAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/live"
	productAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/product"
	reportAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/report"
	shopAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/shop"
	uniPromotionAPI "github.com/bububa/oceanengine/marketing-api/api/qianchuan/uni_promotion"

	// Root model
	"github.com/bububa/oceanengine/marketing-api/model"

	// Qianchuan Models
	adModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/ad"
	advertiserModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/advertiser"
	awemeModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/aweme"
	campaignModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/campaign"
	creativeModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/creative"
	qianchuanDmpModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/dmp"
	fileModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/file"
	financeModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/finance"
	liveModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/live"
	productModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/product"
	reportModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/report"
	shopModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/shop"
	uniPromotionModel "github.com/bububa/oceanengine/marketing-api/model/qianchuan/uni_promotion"
)

// OceanengineClient 基于 bububa/oceanengine SDK 的千川客户端实现
type OceanengineClient struct {
	client    *oecore.SDKClient
	appId     uint64
	appSecret string
}

// NewOceanengineClient 创建基于 oceanengineSDK 的客户端
func NewOceanengineClient(appId int64, appSecret string) *OceanengineClient {
	return &OceanengineClient{
		client:    oecore.NewSDKClient(uint64(appId), appSecret),
		appId:     uint64(appId),
		appSecret: appSecret,
	}
}

// NewClientForProvider 创建客户端（兼容旧接口，忽略 provider 参数）
func NewClientForProvider(provider string, manager interface{}, appId int64, appSecret string) QianchuanClient {
	return NewOceanengineClient(appId, appSecret)
}

// ===== Auth & Session 实现 =====

func (c *OceanengineClient) OauthAccessToken(ctx context.Context, req OauthAccessTokenReq) (*OauthAccessTokenRes, error) {
	data, err := oauthAPI.AccessToken(ctx, c.client, req.AuthCode)
	if err != nil {
		// 返回错误，让调用方能够正确处理
		return &OauthAccessTokenRes{
			Code:    500,
			Message: err.Error(),
		}, err // 改为返回实际错误
	}

	// 检查 data 是否为 nil
	if data == nil {
		return &OauthAccessTokenRes{
			Code:    500,
			Message: "OAuth API 返回空数据",
		}, fmt.Errorf("OAuth API 返回空数据")
	}

	// 检查 AccessToken 是否为空
	if data.AccessToken == "" {
		return &OauthAccessTokenRes{
			Code:    500,
			Message: "OAuth API 未返回 AccessToken",
		}, fmt.Errorf("OAuth API 未返回 AccessToken")
	}

	// 转换 advertiser_ids
	advertiserIds := make([]int64, len(data.AdvertiserIDs))
	for i, id := range data.AdvertiserIDs {
		advertiserIds[i] = int64(id)
	}

	return &OauthAccessTokenRes{
		Code:    0,
		Message: "success",
		Data: &OauthAccessTokenResData{
			AccessToken:           data.AccessToken,
			RefreshToken:          data.RefreshToken,
			ExpiresIn:             data.ExpiresIn,
			RefreshTokenExpiresIn: data.RefreshTokenExpiresIn,
			AdvertiserId:          int64(data.AdvertiserID),
			AdvertiserIds:         advertiserIds,
		},
	}, nil
}

func (c *OceanengineClient) OauthRefreshToken(ctx context.Context, req OauthRefreshTokenReq) (*OauthRefreshTokenRes, error) {
	data, err := oauthAPI.RefreshToken(ctx, c.client, req.RefreshToken)
	if err != nil {
		return &OauthRefreshTokenRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	advertiserIds := make([]int64, len(data.AdvertiserIDs))
	for i, id := range data.AdvertiserIDs {
		advertiserIds[i] = int64(id)
	}

	return &OauthRefreshTokenRes{
		Code:    0,
		Message: "success",
		Data: &OauthAccessTokenResData{
			AccessToken:           data.AccessToken,
			RefreshToken:          data.RefreshToken,
			ExpiresIn:             data.ExpiresIn,
			RefreshTokenExpiresIn: data.RefreshTokenExpiresIn,
			AdvertiserId:          int64(data.AdvertiserID),
			AdvertiserIds:         advertiserIds,
		},
	}, nil
}

func (c *OceanengineClient) UserInfo(ctx context.Context, req UserInfoReq) (*UserInfoRes, error) {
	data, err := oauthAPI.UserInfo(ctx, c.client, req.AccessToken)
	if err != nil {
		return &UserInfoRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &UserInfoRes{
		Code:    0,
		Message: "success",
		Data: &UserInfoData{
			Id:          int64(data.ID),
			Email:       data.Email,
			DisplayName: data.DisplayName,
		},
	}, nil
}

// ===== Advertiser 实现 =====

func (c *OceanengineClient) AdvertiserList(ctx context.Context, req AdvertiserListReq) (*AdvertiserListRes, error) {
	// 自定义响应结构以捕获完整的 company_list（SDK 的 Company 结构不完整）
	type fullCompany struct {
		CustomerCompanyID   uint64 `json:"customer_company_id"`
		CustomerCompanyName string `json:"customer_company_name"`
		AdvertiserID        uint64 `json:"advertiser_id"`
		AdvertiserName      string `json:"advertiser_name"`
		AdvertiserRole      int    `json:"advertiser_role"`
	}
	type fullAdvertiser struct {
		AdvertiserID    uint64        `json:"advertiser_id"`
		AdvertiserName  string        `json:"advertiser_name"`
		AdvertiserRole  int           `json:"advertiser_role"`
		IsValid         bool          `json:"is_valid"`
		AccountRole     string        `json:"account_role"`
		CompanyList     []fullCompany `json:"company_list"`
	}
	type fullResponseData struct {
		List []fullAdvertiser `json:"list"`
	}
	type fullResponse struct {
		model.BaseResponse
		Data *fullResponseData `json:"data"`
	}

	oeReq := &oauthModel.AdvertiserGetRequest{
		AppId:       c.appId,
		Secret:      c.appSecret,
		AccessToken: req.AccessToken,
	}

	var resp fullResponse
	if err := c.client.Get(ctx, "oauth2/advertiser/get", oeReq, &resp, req.AccessToken); err != nil {
		return &AdvertiserListRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdvertiserListRes{
		Code:    0,
		Message: "success",
	}

	if resp.Data != nil {
		for _, item := range resp.Data.List {
			// 调试：记录 company_list 详情
			if len(item.CompanyList) > 0 {
				log.Printf("[AdvertiserList] Account %d (%s) has %d companies: %+v",
					item.AdvertiserID, item.AdvertiserName, len(item.CompanyList), item.CompanyList)
			}
			res.Data.List = append(res.Data.List, AdvertiserListItem{
				AdvertiserId:   int64(item.AdvertiserID),
				AdvertiserName: item.AdvertiserName,
				IsValid:        item.IsValid,
				AccountRole:    item.AccountRole,
			})
			// 展开 company_list 中的子广告主
			for _, comp := range item.CompanyList {
				if comp.AdvertiserID > 0 {
					res.Data.List = append(res.Data.List, AdvertiserListItem{
						AdvertiserId:   int64(comp.AdvertiserID),
						AdvertiserName: comp.AdvertiserName,
						IsValid:        true,
						AccountRole:    "ADVERTISER",
					})
				}
			}
		}
	}
	return res, nil
}

func (c *OceanengineClient) AdvertiserInfo(ctx context.Context, req AdvertiserInfoReq) (*AdvertiserInfoRes, error) {
	advertiserIds := make([]uint64, len(req.AdvertiserIds))
	for i, id := range req.AdvertiserIds {
		advertiserIds[i] = uint64(id)
	}

	// 使用全局 advertiser API（非 qianchuan/advertiser）
	oeReq := &globalAdvertiserModel.PublicInfoRequest{
		AdvertiserIDs: advertiserIds,
	}

	data, err := globalAdvertiserAPI.PublicInfo(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdvertiserInfoRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	list := make([]AdvertiserInfoResData, len(data))
	for i, item := range data {
		list[i] = AdvertiserInfoResData{
			AdvertiserId:   int64(item.ID),
			AdvertiserName: item.Name,
			Company:        item.Company,
		}
	}

	return &AdvertiserInfoRes{
		Code:    0,
		Message: "success",
		Data:    list,
	}, nil
}

func (c *OceanengineClient) ShopAdvertiserList(ctx context.Context, req ShopAdvertiserListReq) (*ShopAdvertiserListRes, error) {
	oeReq := &shopModel.AdvertiserListRequest{
		ShopID:   uint64(req.ShopId),
		Page:     int(req.Page),
		PageSize: int(req.PageSize),
	}

	data, err := shopAPI.AdvertiserList(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ShopAdvertiserListRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ShopAdvertiserListRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]ShopAdvertiserItem, len(data.List))
		for i, id := range data.List {
			list[i] = ShopAdvertiserItem{
				AdvertiserId: int64(id),
			}
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

func (c *OceanengineClient) AgentAdvertiserList(ctx context.Context, req AgentAdvertiserListReq) (*AgentAdvertiserListRes, error) {
	// 调用 agent/advertiser/select 接口获取代理商下的广告主列表
	oeReq := &agentModel.AdvertiserSelectRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := agentAPI.AdvertiserSelect(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AgentAdvertiserListRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AgentAdvertiserListRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		// data.List 返回的是 uint64 列表（广告主 ID）
		list := make([]AgentAdvertiserItem, len(data.List))
		for i, id := range data.List {
			list[i] = AgentAdvertiserItem{
				AdvertiserId: int64(id),
				// 广告主名称需要单独调用 AdvertiserInfo 接口获取
			}
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

func (c *OceanengineClient) AwemeAuthorizedGet(ctx context.Context, req AwemeAuthorizedGetReq) (*AwemeAuthorizedGetRes, error) {
	oeReq := &awemeModel.AuthorizedGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := awemeAPI.AuthorizedGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeAuthorizedGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AwemeAuthorizedGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		// SDK 使用 AwemeList 而非 List
		list := make([]AwemeAuthorizedGetResDetail, len(data.AwemeList))
		for i, item := range data.AwemeList {
			bindType := make([]string, len(item.BindType))
			for j, bt := range item.BindType {
				bindType[j] = string(bt)
			}
			list[i] = AwemeAuthorizedGetResDetail{
				AwemeId:     int64(item.ID),
				AwemeName:   item.Name,
				AwemeShowId: item.ShowID,
				AwemeAvatar: item.Avatar,
				BindType:    bindType,
			}
		}
		res.Data.List = list
		// SDK 中 PageInfo 不是指针类型
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

func (c *OceanengineClient) ProductAvailableGet(ctx context.Context, req ProductAvailableGetReq) (*ProductAvailableGetRes, error) {
	oeReq := &productModel.AvailableGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	if req.Filtering != nil {
		productIds := make([]uint64, len(req.Filtering.ProductIds))
		for i, id := range req.Filtering.ProductIds {
			productIds[i] = uint64(id)
		}
		oeReq.Filtering = &productModel.GetFiltering{
			ProductIDs:  productIds,
			ProductName: req.Filtering.ProductName,
		}
	}

	data, err := productAPI.AvailableGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ProductAvailableGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ProductAvailableGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]ProductAvailableGetResDetail, len(data.ProductList))
		for i, item := range data.ProductList {
			list[i] = ProductAvailableGetResDetail{
				ProductId:     int64(item.ID),
				ProductName:   item.Name,
				DiscountPrice: item.DiscountPrice,
				MarketPrice:   item.MarketPrice,
				Img:           item.Img,
				ProductRate:   item.ProductRate,
				CategoryName:  item.CategoryName,
			}
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

// ===== Advertiser Budget 实现 =====

func (c *OceanengineClient) AdvertiserBudgetGet(ctx context.Context, req AdvertiserBudgetGetReq) (*AdvertiserBudgetGetRes, error) {
	oeReq := &advertiserModel.AccountBudgetGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := advertiserAPI.AccountBudgetGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdvertiserBudgetGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdvertiserBudgetGetRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.Budget = int64(data.Budget * 100) // 转换为分
		res.Data.BudgetMode = string(data.BudgetMode)
	}
	return res, nil
}

func (c *OceanengineClient) AdvertiserBudgetUpdate(ctx context.Context, req AdvertiserBudgetUpdateReq) (*AdvertiserBudgetUpdateRes, error) {
	oeReq := &advertiserModel.AccountBudgetUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Budget:       float64(req.Budget) / 100, // 从分转换为元
	}

	err := advertiserAPI.AccountBudgetUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdvertiserBudgetUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &AdvertiserBudgetUpdateRes{
		Code:    0,
		Message: "success",
	}, nil
}

// ===== Campaign 实现 =====

func (c *OceanengineClient) CampaignListGet(ctx context.Context, req CampaignListGetReq) (*CampaignListGetRes, error) {
	oeReq := &campaignModel.ListGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	marketingGoal := enum.MarketingGoal(req.Filter.MarketingGoal)
	if marketingGoal == "" {
		marketingGoal = enum.MarketingGoal_LIVE_PROM_GOODS // 默认直播带货
	}
	oeReq.Filtering = &campaignModel.ListGetFiltering{
		Name:          req.Filter.Name,
		Status:        req.Filter.Status,
		MarketingGoal: marketingGoal,
	}
	if len(req.Filter.Ids) > 0 {
		ids := make([]uint64, len(req.Filter.Ids))
		for i, id := range req.Filter.Ids {
			ids[i] = uint64(id)
		}
		oeReq.Filtering.IDs = ids
	}

	data, err := campaignAPI.ListGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &CampaignListGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &CampaignListGetRes{
		Code:    0,
		Message: "success",
		Data:    &CampaignListData{},
	}

	if data != nil {
		list := make([]Campaign, len(data.List))
		for i, item := range data.List {
			list[i] = Campaign{
				Id:            int64(item.ID),
				Name:          item.Name,
				Budget:        item.Budget,
				BudgetMode:    string(item.BudgetMode),
				MarketingGoal: string(item.MarketingGoal),
				Status:        item.Status,
				CreateDate:    item.CreateDate,
			}
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

func (c *OceanengineClient) CampaignCreate(ctx context.Context, req CampaignCreateReq) (*CampaignCreateRes, error) {
	oeReq := &campaignModel.CreateRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		CampaignName: req.Body.CampaignName,
		Budget:       req.Body.Budget,
	}

	campaignId, err := campaignAPI.Create(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &CampaignCreateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &CampaignCreateRes{
		Code:    0,
		Message: "success",
	}
	res.Data.CampaignId = int64(campaignId)
	return res, nil
}

func (c *OceanengineClient) CampaignUpdate(ctx context.Context, req CampaignUpdateReq) (*CampaignUpdateRes, error) {
	oeReq := &campaignModel.UpdateRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		CampaignID:   uint64(req.Body.CampaignId),
		CampaignName: req.Body.CampaignName,
		Budget:       req.Body.Budget,
	}

	campaignId, err := campaignAPI.Update(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &CampaignUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &CampaignUpdateRes{
		Code:    0,
		Message: "success",
	}
	res.Data.CampaignId = int64(campaignId)
	return res, nil
}

func (c *OceanengineClient) BatchCampaignStatusUpdate(ctx context.Context, req BatchCampaignStatusUpdateReq) (*BatchCampaignStatusUpdateRes, error) {
	campaignIds := make([]uint64, len(req.Body.CampaignIds))
	for i, id := range req.Body.CampaignIds {
		campaignIds[i] = uint64(id)
	}

	oeReq := &campaignModel.UpdateStatusRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		CampaignIDs:  campaignIds,
		OptStatus:    req.Body.OptStatus,
	}

	data, err := campaignAPI.UpdateStatus(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &BatchCampaignStatusUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &BatchCampaignStatusUpdateRes{
		Code:    0,
		Message: "success",
	}

	// SDK 返回的是 Success 列表，不是 CampaignIDs
	if data != nil {
		res.Data.CampaignIds = make([]int64, len(data.Success))
		for i, id := range data.Success {
			res.Data.CampaignIds[i] = int64(id)
		}
	}

	return res, nil
}

// ===== Ad 实现 =====

func (c *OceanengineClient) AdListGet(ctx context.Context, req AdListGetReq) (*AdListGetRes, error) {
	oeReq := &adModel.GetRequest{
		AdvertiserID:     uint64(req.AdvertiserId),
		RequestAwemeInfo: int(req.RequestAwemeInfo),
		Page:             int(req.Page),
		PageSize:         int(req.PageSize),
	}

	mg := enum.MarketingGoal(req.Filtering.MarketingGoal)
	if mg == "" {
		mg = enum.MarketingGoal_LIVE_PROM_GOODS
	}
	oeReq.Filtering = &adModel.GetFiltering{
		AdName:        req.Filtering.AdName,
		CampaignID:    uint64(req.Filtering.CampaignId),
		MarketingGoal: mg,
	}

	data, err := adAPI.Get(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdListGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdListGetRes{
		Code:    0,
		Message: "success",
		Data:    &AdListData{},
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

func (c *OceanengineClient) AdDetailGet(ctx context.Context, req AdDetailGetReq) (*AdDetailGetRes, error) {
	oeReq := &adModel.DetailGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdID:         uint64(req.AdId),
	}

	data, err := adAPI.DetailGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdDetailGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &AdDetailGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) AdCreate(ctx context.Context, req AdCreateReq) (*AdCreateRes, error) {
	oeReq := &adModel.CreateRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		Name:         req.Body.Name,
		CampaignID:   uint64(req.Body.CampaignId),
	}

	// 解析 DeliverySetting
	if req.Body.DeliverySetting != nil {
		if ds, ok := req.Body.DeliverySetting.(map[string]interface{}); ok {
			oeReq.DeliverySetting = adModel.DeliverySetting{}
			if v, ok := ds["budget"].(float64); ok {
				oeReq.DeliverySetting.Budget = v
			}
			if v, ok := ds["budget_mode"].(string); ok {
				oeReq.DeliverySetting.BudgetMode = enum.BudgetMode(v)
			}
			if v, ok := ds["cpa_bid"].(float64); ok {
				oeReq.DeliverySetting.CpaBid = v
			}
			if v, ok := ds["roi_goal"].(float64); ok {
				oeReq.DeliverySetting.RoiGoal = v
			}
			if v, ok := ds["deep_bid_type"].(string); ok {
				oeReq.DeliverySetting.DeepBidType = qianchuan.DeepBidType(v)
			}
			if v, ok := ds["external_action"].(string); ok {
				oeReq.DeliverySetting.ExternalAction = qianchuan.ExternalAction(v)
			}
		}
	}

	data, err := adAPI.Create(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdCreateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdCreateRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		res.Data.AdId = int64(data.AdID)
	}

	return res, nil
}

func (c *OceanengineClient) AdUpdate(ctx context.Context, req AdUpdateReq) (*AdUpdateRes, error) {
	oeReq := &adModel.UpdateRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		AdID:         uint64(req.Body.AdId),
		Name:         req.Body.Name,
	}

	// 解析 DeliverySetting
	if req.Body.DeliverySetting != nil {
		if ds, ok := req.Body.DeliverySetting.(map[string]interface{}); ok {
			oeReq.DeliverySetting = &adModel.DeliverySetting{}
			if v, ok := ds["budget"].(float64); ok {
				oeReq.DeliverySetting.Budget = v
			}
			if v, ok := ds["budget_mode"].(string); ok {
				oeReq.DeliverySetting.BudgetMode = enum.BudgetMode(v)
			}
			if v, ok := ds["cpa_bid"].(float64); ok {
				oeReq.DeliverySetting.CpaBid = v
			}
			if v, ok := ds["roi_goal"].(float64); ok {
				oeReq.DeliverySetting.RoiGoal = v
			}
			if v, ok := ds["deep_bid_type"].(string); ok {
				oeReq.DeliverySetting.DeepBidType = qianchuan.DeepBidType(v)
			}
			if v, ok := ds["external_action"].(string); ok {
				oeReq.DeliverySetting.ExternalAction = qianchuan.ExternalAction(v)
			}
		}
	}

	data, err := adAPI.Update(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdUpdateRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		res.Data.AdId = int64(data.AdID)
	}

	return res, nil
}

func (c *OceanengineClient) AdStatusUpdate(ctx context.Context, req AdStatusUpdateReq) (*AdStatusUpdateRes, error) {
	adIds := make([]uint64, len(req.Body.AdIds))
	for i, id := range req.Body.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.UpdateStatusRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		AdIDs:        adIds,
		OptStatus:    qianchuan.AdOptStatus(req.Body.OptStatus), // 类型转换
	}

	data, err := adAPI.UpdateStatus(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdStatusUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdStatusUpdateRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		res.Data.AdIds = make([]int64, len(data.AdIDs))
		for i, id := range data.AdIDs {
			res.Data.AdIds[i] = int64(id)
		}
	}

	return res, nil
}

func (c *OceanengineClient) AdBudgetUpdate(ctx context.Context, req AdBudgetUpdateReq) (*AdBudgetUpdateRes, error) {
	var data []adModel.UpdateBudgetRequestData
	for _, item := range req.Body.Data {
		data = append(data, adModel.UpdateBudgetRequestData{
			AdID:   uint64(item.AdId),
			Budget: item.Budget,
		})
	}

	oeReq := &adModel.UpdateBudgetRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		Data:         data,
	}

	result, err := adAPI.UpdateBudget(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdBudgetUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdBudgetUpdateRes{
		Code:    0,
		Message: "success",
	}

	if result != nil {
		res.Data.AdIds = make([]int64, len(result.AdIDs))
		for i, id := range result.AdIDs {
			res.Data.AdIds[i] = int64(id)
		}
	}

	return res, nil
}

func (c *OceanengineClient) AdBidUpdate(ctx context.Context, req AdBidUpdateReq) (*AdBidUpdateRes, error) {
	var data []adModel.UpdateBidRequestData
	for _, item := range req.Body.Data {
		data = append(data, adModel.UpdateBidRequestData{
			AdID: uint64(item.AdId),
			Bid:  item.Bid,
		})
	}

	oeReq := &adModel.UpdateBidRequest{
		AdvertiserID: uint64(req.Body.AdvertiserId),
		Data:         data,
	}

	result, err := adAPI.UpdateBid(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdBidUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdBidUpdateRes{
		Code:    0,
		Message: "success",
	}

	if result != nil {
		res.Data.AdIds = make([]int64, len(result.AdIDs))
		for i, id := range result.AdIDs {
			res.Data.AdIds[i] = int64(id)
		}
	}

	return res, nil
}

func (c *OceanengineClient) AdRoiGoalUpdate(ctx context.Context, req AdRoiGoalUpdateReq) (*AdRoiGoalUpdateRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.RoiGoalUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		RoiGoalUpdates: []adModel.RoiGoalUpdate{
			{AdID: uint64(req.AdIds[0]), RoiGoal: req.RoiGoal},
		},
	}

	results, err := adAPI.RoiGoalUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdRoiGoalUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdRoiGoalUpdateRes{
		Code:    0,
		Message: "success",
	}
	for _, r := range results {
		res.Data.Results = append(res.Data.Results, AdOpResult{
			AdId:    int64(r.AdID),
			Success: r.Flat == 1,
		})
	}
	return res, nil
}

func (c *OceanengineClient) AdScheduleDateUpdate(ctx context.Context, req AdScheduleDateUpdateReq) (*AdScheduleDateUpdateRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.ScheduleDateUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdIDs:        adIds,
		ScheduleType: enum.ScheduleType("SCHEDULE_START_END"),
		EndTime:      req.EndDate,
	}

	data, err := adAPI.ScheduleDateUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdScheduleDateUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdScheduleDateUpdateRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.AdIds = make([]int64, len(data.AdIDs))
		for i, id := range data.AdIDs {
			res.Data.AdIds[i] = int64(id)
		}
		for _, e := range data.Errors {
			res.Data.Errors = append(res.Data.Errors, AdStatusError{
				AdId:      int64(e.AdID),
				ErrorCode: int64(e.ErrorCode),
				ErrorMsg:  e.ErrorMessage,
			})
		}
	}
	return res, nil
}

func (c *OceanengineClient) AdScheduleTimeUpdate(ctx context.Context, req AdScheduleTimeUpdateReq) (*AdScheduleTimeUpdateRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.ScheduleTimeUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdIDs:        adIds,
		ScheduleTime: req.ScheduleTime,
	}

	data, err := adAPI.ScheduleTimeUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdScheduleTimeUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdScheduleTimeUpdateRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.AdIds = make([]int64, len(data.AdIDs))
		for i, id := range data.AdIDs {
			res.Data.AdIds[i] = int64(id)
		}
	}
	return res, nil
}

func (c *OceanengineClient) AdScheduleFixedRangeUpdate(ctx context.Context, req AdScheduleFixedRangeUpdateReq) (*AdScheduleFixedRangeUpdateRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.ScheduleFixedRangeUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdIDs:        adIds,
		ScheduleFixedRange: int64(req.FixedRange),
	}

	data, err := adAPI.ScheduleFixedRangeUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdScheduleFixedRangeUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdScheduleFixedRangeUpdateRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.AdIds = make([]int64, len(data.AdIDs))
		for i, id := range data.AdIDs {
			res.Data.AdIds[i] = int64(id)
		}
	}
	return res, nil
}

func (c *OceanengineClient) AdRegionUpdate(ctx context.Context, req AdRegionUpdateReq) (*AdRegionUpdateRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	cityIds := make([]uint64, len(req.City))
	for i, id := range req.City {
		cityIds[i] = uint64(id)
	}

	oeReq := &adModel.RegionUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdIDs:        adIds,
		District:     enum.District(req.District),
		City:         cityIds,
		LocationType: enum.LocationType(req.LocationType),
	}

	data, err := adAPI.RegionUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdRegionUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdRegionUpdateRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.AdIds = make([]int64, len(data.AdIDs))
		for i, id := range data.AdIDs {
			res.Data.AdIds[i] = int64(id)
		}
	}
	return res, nil
}

func (c *OceanengineClient) AdRejectReason(ctx context.Context, req AdRejectReasonReq) (*AdRejectReasonRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.RejectReasonRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdIDs:        adIds,
	}

	data, err := adAPI.RejectReason(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdRejectReasonRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdRejectReasonRes{
		Code:    0,
		Message: "success",
	}
	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list
	return res, nil
}

func (c *OceanengineClient) AdLqAdGet(ctx context.Context, req AdLqAdGetReq) (*AdLqAdGetRes, error) {
	oeReq := &adModel.LqAdGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := adAPI.LqAdGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdLqAdGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdLqAdGetRes{
		Code:    0,
		Message: "success",
	}
	res.Data.AdIds = make([]int64, len(data))
	for i, id := range data {
		res.Data.AdIds[i] = int64(id)
	}
	return res, nil
}

func (c *OceanengineClient) AdSuggestRoiGoal(ctx context.Context, req AdSuggestRoiGoalReq) (*AdSuggestRoiGoalRes, error) {
	oeReq := &adModel.SuggestRoiGoalRequest{
		AdvertiserID:   uint64(req.AdvertiserId),
		MarketingGoal:  enum.MarketingGoal(req.MarketingGoal),
		AwemeID:        uint64(req.AwemeId),
		ProductID:      uint64(req.ProductId),
		ExternalAction: qianchuan.ExternalAction(req.ExternalAction),
	}

	data, err := adAPI.SuggestRoiGoal(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdSuggestRoiGoalRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdSuggestRoiGoalRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.EcpRoiGoal = data.EcpRoiGoal
		res.Data.RoiLowerBound = data.RoiLowerBound
		res.Data.RoiUpperBound = data.RoiUpperBound
	}
	return res, nil
}

func (c *OceanengineClient) AdSuggestBid(ctx context.Context, req AdSuggestBidReq) (*AdSuggestBidRes, error) {
	oeReq := &adModel.SuggestBidRequest{
		AdvertiserID:   uint64(req.AdvertiserId),
		MarketingGoal:  enum.MarketingGoal(req.MarketingGoal),
		AwemeID:        uint64(req.AwemeId),
		ProductID:      uint64(req.ProductId),
		ExternalAction: qianchuan.ExternalAction(req.ExternalAction),
	}

	data, err := adAPI.SuggestBid(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdSuggestBidRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdSuggestBidRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.SuggestBidLow = data.SuggestBidLow
		res.Data.SuggestBidHigh = data.SuggestBidHigh
	}
	return res, nil
}

func (c *OceanengineClient) AdSuggestBudget(ctx context.Context, req AdSuggestBudgetReq) (*AdSuggestBudgetRes, error) {
	oeReq := &adModel.SuggestBudgetRequest{
		AdvertiserID:       uint64(req.AdvertiserId),
		AwemeID:            uint64(req.AwemeId),
		LiveScheduleType:   enum.LiveScheduleType(req.LiveScheduleType),
		StartTime:          req.StartTime,
		EndTime:            req.EndTime,
		ScheduleTime:       req.ScheduleTime,
		ScheduleFixedRange: req.ScheduleFixedRange,
	}

	data, err := adAPI.SuggestBudget(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdSuggestBudgetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdSuggestBudgetRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.SuggestBudgetLow = data.SuggestBudgetLow
		res.Data.SuggestBudgetHigh = data.SuggestBudgetHigh
	}
	return res, nil
}

func (c *OceanengineClient) AdEstimateEffect(ctx context.Context, req AdEstimateEffectReq) (*AdEstimateEffectRes, error) {
	oeReq := &adModel.EstimateEffectRequest{
		AdvertiserID:       uint64(req.AdvertiserId),
		AwemeID:            uint64(req.AwemeId),
		ExternalAction:     qianchuan.ExternalAction(req.ExternalAction),
		BudgetMode:         enum.BudgetMode(req.BudgetMode),
		Budget:             req.Budget,
		LiveScheduleType:   enum.LiveScheduleType(req.LiveScheduleType),
		DeepExternalAction: qianchuan.ExternalAction(req.DeepExternalAction),
		DeepBidType:        qianchuan.DeepBidType(req.DeepBidType),
	}

	data, err := adAPI.EstimateEffect(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdEstimateEffectRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdEstimateEffectRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		res.Data.EstimateEffectLow = data.EstimateEffectLow
		res.Data.EstimateEffectHigh = data.EstimateEffectHigh
	}
	return res, nil
}

func (c *OceanengineClient) AdCompensateStatusGet(ctx context.Context, req AdCompensateStatusGetReq) (*AdCompensateStatusGetRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.CompensateStatusGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdIDs:        adIds,
	}

	data, err := adAPI.CompensateStatusGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdCompensateStatusGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdCompensateStatusGetRes{
		Code:    0,
		Message: "success",
	}
	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list
	return res, nil
}

func (c *OceanengineClient) AdLearningStatusGet(ctx context.Context, req AdLearningStatusGetReq) (*AdLearningStatusGetRes, error) {
	adIds := make([]uint64, len(req.AdIds))
	for i, id := range req.AdIds {
		adIds[i] = uint64(id)
	}

	oeReq := &adModel.LearningStatusGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdIDs:        adIds,
	}

	data, err := adAPI.LearningStatusGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdLearningStatusGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdLearningStatusGetRes{
		Code:    0,
		Message: "success",
	}
	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list
	return res, nil
}

// ===== Creative 实现 =====

func (c *OceanengineClient) CreativeGet(ctx context.Context, req CreativeGetReq) (*CreativeGetRes, error) {
	oeReq := &creativeModel.GetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := creativeAPI.Get(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &CreativeGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &CreativeGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

func (c *OceanengineClient) CreativeRejectReason(ctx context.Context, req CreativeRejectReasonReq) (*CreativeRejectReasonRes, error) {
	creativeIds := make([]uint64, len(req.CreativeIds))
	for i, id := range req.CreativeIds {
		creativeIds[i] = uint64(id)
	}

	oeReq := &creativeModel.RejectReasonRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		CreativeIDs:  creativeIds,
	}

	data, err := creativeAPI.RejectReason(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &CreativeRejectReasonRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &CreativeRejectReasonRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) CreativeUpdateStatus(ctx context.Context, req CreativeUpdateStatusReq) (*CreativeUpdateStatusRes, error) {
	creativeIds := make([]uint64, len(req.CreativeIds))
	for i, id := range req.CreativeIds {
		creativeIds[i] = uint64(id)
	}

	oeReq := &creativeModel.UpdateStatusRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		CreativeIDs:  creativeIds,
		OptStatus:    qianchuan.CreativeOptStatus(req.OptStatus),
	}

	data, err := creativeAPI.UpdateStatus(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &CreativeUpdateStatusRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &CreativeUpdateStatusRes{
		Code:    0,
		Message: "success",
	}
	if data != nil && data.CreativeIDs != nil {
		res.Data.CreativeIds = make([]int64, len(data.CreativeIDs))
		for i, id := range data.CreativeIDs {
			res.Data.CreativeIds[i] = int64(id)
		}
	}
	return res, nil
}

// ===== File / Material 实现 =====

func (c *OceanengineClient) FileImageAd(ctx context.Context, req FileImageAdReq) (*FileImageAdRes, error) {
	oeReq := &globalFileModel.ImageAdRequest{
		AdvertiserID:   uint64(req.Body.AdvertiserId),
		ImageSignature: req.Body.ImageSignature,
		ImageUrl:       req.Body.ImageUrl,
		Filename:       req.Body.Filename,
	}

	// 根据上传类型设置
	if req.Body.UploadType == "UPLOAD_BY_URL" {
		oeReq.UploadType = "UPLOAD_BY_URL"
	}

	data, err := globalFileAPI.ImageAd(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &FileImageAdRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &FileImageAdRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		res.Data.ImageId = data.ID
		res.Data.ImageUrl = data.URL
		res.Data.Size = int64(data.Size)
		res.Data.Width = int64(data.Width)
		res.Data.Height = int64(data.Height)
		res.Data.Format = data.Format
		res.Data.Signature = data.Signature
	}

	return res, nil
}

func (c *OceanengineClient) FileVideoAd(ctx context.Context, req FileVideoAdReq) (*FileVideoAdRes, error) {
	oeReq := &globalFileModel.VideoAdRequest{
		AdvertiserID:   uint64(req.Body.AdvertiserId),
		VideoSignature: req.Body.VideoSignature,
		VideoUrl:       req.Body.VideoUrl,
		Filename:       req.Body.Filename,
	}

	data, err := globalFileAPI.VideoAd(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &FileVideoAdRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &FileVideoAdRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		res.Data.VideoId = data.VideoID
		res.Data.Size = int64(data.Size)
		res.Data.Width = int64(data.Width)
		res.Data.Height = int64(data.Height)
		res.Data.Duration = data.Duration
	}

	return res, nil
}

func (c *OceanengineClient) FileImageGet(ctx context.Context, req FileImageGetReq) (*FileImageGetRes, error) {
	oeReq := &fileModel.ImageGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	if req.Filtering != nil {
		oeReq.Filtering = &fileModel.ImageGetFilter{
			ImageIDs:    req.Filtering.ImageIds,
			Sigatures:   req.Filtering.Signatures,
			StartTIme:   req.Filtering.StartTime,
			EndTime:     req.Filtering.EndTime,
		}
	}

	data, err := fileAPI.ImageGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &FileImageGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &FileImageGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

func (c *OceanengineClient) FileVideoGet(ctx context.Context, req FileVideoGetReq) (*FileVideoGetRes, error) {
	oeReq := &fileModel.VideoGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	if req.Filtering != nil {
		oeReq.Filtering = &fileModel.ImageGetFilter{
			Sigatures: req.Filtering.Signatures,
			StartTIme: req.Filtering.StartTime,
			EndTime:   req.Filtering.EndTime,
		}
	}

	data, err := fileAPI.VideoGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &FileVideoGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &FileVideoGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

// ===== Report 实现 =====

// parseDate 解析日期字符串为 time.Time
func parseDate(dateStr string) time.Time {
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Time{}
	}
	return t
}

func (c *OceanengineClient) AdvertiserReport(ctx context.Context, req AdvertiserReportReq) (*AdvertiserReportRes, error) {
	mg := enum.MarketingGoal_LIVE_PROM_GOODS
	if req.Filtering != nil && req.Filtering.MarketingGoal != "" {
		mg = enum.MarketingGoal(req.Filtering.MarketingGoal)
	}
	oeReq := &reportModel.GetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    parseDate(req.StartDate),
		EndDate:      parseDate(req.EndDate),
		Fields:       req.Fields,
		Filtering: &reportModel.StatFiltering{
			MarketingGoal: mg,
		},
	}

	data, err := reportAPI.AdvertiserGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AdvertiserReportRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AdvertiserReportRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
	}

	return res, nil
}

func (c *OceanengineClient) ReportAdGet(ctx context.Context, req ReportAdGetReq) (*ReportAdGetRes, error) {
	oeReq := &reportModel.GetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    parseDate(req.StartDate),
		EndDate:      parseDate(req.EndDate),
		Fields:       req.Fields,
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
		Filtering:    &reportModel.StatFiltering{},
	}

	data, err := reportAPI.AdGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportAdGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ReportAdGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

func (c *OceanengineClient) ReportCreativeGet(ctx context.Context, req ReportCreativeGetReq) (*ReportCreativeGetRes, error) {
	oeReq := &reportModel.GetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    parseDate(req.StartDate),
		EndDate:      parseDate(req.EndDate),
		Fields:       req.Fields,
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := reportAPI.CreativeGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportCreativeGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ReportCreativeGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}

	return res, nil
}

func (c *OceanengineClient) ReportMaterialGet(ctx context.Context, req ReportMaterialGetReq) (*ReportMaterialGetRes, error) {
	oeReq := &reportModel.GetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    parseDate(req.StartDate),
		EndDate:      parseDate(req.EndDate),
		Fields:       req.Fields,
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := reportAPI.MaterialGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportMaterialGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ReportMaterialGetRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}
	return res, nil
}

func (c *OceanengineClient) ReportSearchWordGet(ctx context.Context, req ReportSearchWordGetReq) (*ReportSearchWordGetRes, error) {
	oeReq := &reportModel.GetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    parseDate(req.StartDate),
		EndDate:      parseDate(req.EndDate),
		Fields:       req.Fields,
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := reportAPI.SearchWordGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportSearchWordGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ReportSearchWordGetRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}
	return res, nil
}

func (c *OceanengineClient) ReportVideoUserLoseGet(ctx context.Context, req ReportVideoUserLoseGetReq) (*ReportVideoUserLoseGetRes, error) {
	oeReq := &reportModel.GetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    parseDate(req.StartDate),
		EndDate:      parseDate(req.EndDate),
		Fields:       req.Fields,
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := reportAPI.VideoUserLoseGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportVideoUserLoseGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ReportVideoUserLoseGetRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		res.Data.PageInfo = PageInfo{
			Page:        data.PageInfo.Page,
			PageSize:    data.PageInfo.PageSize,
			TotalNumber: int64(data.PageInfo.TotalNumber),
			TotalPage:   data.PageInfo.TotalPage,
		}
	}
	return res, nil
}

func (c *OceanengineClient) ReportUniPromotionGet(ctx context.Context, req ReportUniPromotionGetReq) (*ReportUniPromotionGetRes, error) {
	oeReq := &reportModel.UniPromotionGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Fields:       req.Fields,
	}

	data, err := reportAPI.UniPromotionGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportUniPromotionGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &ReportUniPromotionGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) ReportCustomGet(ctx context.Context, req ReportCustomGetReq) (*ReportCustomGetRes, error) {
	var filters []reportModel.CustomGetFilter
	for _, f := range req.Filters {
		filters = append(filters, reportModel.CustomGetFilter{
			Field:    f.Field,
			Values:   f.Values,
			Type:     f.Type,
			Operator: f.Operator,
		})
	}
	var orderBy []reportModel.CustomGetOrderBy
	for _, o := range req.OrderBy {
		orderBy = append(orderBy, reportModel.CustomGetOrderBy{
			Field: o.Field,
			Type:  o.Type,
		})
	}

	oeReq := &reportModel.CustomGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartTime:    req.StartDate + " 00:00:00",
		EndTime:      req.EndDate + " 23:59:59",
		DataTopic:    qianchuan.DataTopic(req.DataTopic),
		Dimensions:   req.Dimensions,
		Metrics:      req.Metrics,
		Filters:      filters,
		OrderBy:      orderBy,
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := reportAPI.CustomGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportCustomGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ReportCustomGetRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		for _, row := range data.Rows {
			res.Data.List = append(res.Data.List, row)
		}
		if data.Pagination != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.Pagination.Page,
				PageSize:    data.Pagination.PageSize,
				TotalNumber: int64(data.Pagination.TotalNumber),
				TotalPage:   data.Pagination.TotalPage,
			}
		}
	}
	return res, nil
}

func (c *OceanengineClient) ReportCustomConfigGet(ctx context.Context, req ReportCustomConfigGetReq) (*ReportCustomConfigGetRes, error) {
	oeReq := &reportModel.CustomConfigGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := reportAPI.CustomConfigGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ReportCustomConfigGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ReportCustomConfigGetRes{
		Code:    0,
		Message: "success",
	}
	if data != nil {
		list := make([]interface{}, len(data.CustomConfigDatas))
		for i, item := range data.CustomConfigDatas {
			list[i] = item
		}
		res.Data.List = list
	}
	return res, nil
}

// ===== Tools 实现 =====

func (c *OceanengineClient) ToolsIndustryGet(ctx context.Context, req ToolsIndustryGetReq) (*ToolsIndustryGetRes, error) {
	oeReq := &toolsModel.IndustryGetRequest{
		Level: int(req.Level),
		Type:  req.Type,
	}

	data, err := toolsAPI.IndustryGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsIndustryGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsIndustryGetRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) ToolsInterestActionInterestCategory(ctx context.Context, req ToolsInterestActionInterestCategoryReq) (*ToolsInterestActionInterestCategoryRes, error) {
	oeReq := &interestactionModel.InterestCategoryRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := interestactionAPI.InterestCategory(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsInterestActionInterestCategoryRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsInterestActionInterestCategoryRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) ToolsInterestActionInterestKeyword(ctx context.Context, req ToolsInterestActionInterestKeywordReq) (*ToolsInterestActionInterestKeywordRes, error) {
	oeReq := &interestactionModel.InterestKeywordRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		QueryWords:   req.QueryWords,
	}

	data, err := interestactionAPI.InterestKeyword(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsInterestActionInterestKeywordRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsInterestActionInterestKeywordRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) ToolsInterestActionActionCategory(ctx context.Context, req ToolsInterestActionActionCategoryReq) (*ToolsInterestActionActionCategoryRes, error) {
	// 转换ActionScene类型
	actionScenes := make([]enum.ActionScene, len(req.ActionScene))
	for i, s := range req.ActionScene {
		actionScenes[i] = enum.ActionScene(s)
	}

	oeReq := &interestactionModel.ActionCategoryRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		ActionScene:  actionScenes,
		ActionDays:   int(req.ActionDays),
	}

	data, err := interestactionAPI.ActionCategory(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsInterestActionActionCategoryRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsInterestActionActionCategoryRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) ToolsInterestActionActionKeyword(ctx context.Context, req ToolsInterestActionActionKeywordReq) (*ToolsInterestActionActionKeywordRes, error) {
	// 转换ActionScene类型
	actionScenes := make([]enum.ActionScene, len(req.ActionScene))
	for i, s := range req.ActionScene {
		actionScenes[i] = enum.ActionScene(s)
	}

	oeReq := &interestactionModel.ActionKeywordRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		QueryWords:   req.QueryWords,
		ActionScene:  actionScenes,
		ActionDays:   int(req.ActionDays),
	}

	data, err := interestactionAPI.ActionKeyword(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsInterestActionActionKeywordRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsInterestActionActionKeywordRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) ToolsAwemeMultiLevelCategoryGet(ctx context.Context, req ToolsAwemeMultiLevelCategoryGetReq) (*ToolsAwemeMultiLevelCategoryGetRes, error) {
	// 转换Behaviors类型
	behaviors := make([]enum.Behavior, len(req.Behaviors))
	for i, b := range req.Behaviors {
		behaviors[i] = enum.Behavior(b)
	}

	oeReq := &toolsAwemeModel.AwemeMultiLevelCategoryGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Behaviors:    behaviors,
	}

	data, err := toolsAwemeAPI.AwemeMultiLevelCategoryGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsAwemeMultiLevelCategoryGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsAwemeMultiLevelCategoryGetRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) ToolsAwemeAuthorInfoGet(ctx context.Context, req ToolsAwemeAuthorInfoGetReq) (*ToolsAwemeAuthorInfoGetRes, error) {
	// 转换AwemeIds类型 (SDK中使用LabelIDs)
	labelIds := make([]uint64, len(req.AwemeIds))
	for i, id := range req.AwemeIds {
		labelIds[i] = uint64(id)
	}

	oeReq := &toolsAwemeModel.AwemeAuthorInfoGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		LabelIDs:     labelIds,
	}

	data, err := toolsAwemeAPI.AwemeAuthorInfoGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsAwemeAuthorInfoGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsAwemeAuthorInfoGetRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) ToolsCreativeWordSelect(ctx context.Context, req ToolsCreativeWordSelectReq) (*ToolsCreativeWordSelectRes, error) {
	oeReq := &creativewordModel.SelectRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := creativewordAPI.Select(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &ToolsCreativeWordSelectRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &ToolsCreativeWordSelectRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) DmpAudiencesGet(ctx context.Context, req DmpAudiencesGetReq) (*DmpAudiencesGetRes, error) {
	oeReq := &qianchuanDmpModel.AudiencesGetRequest{
		AdvertiserID:        uint64(req.AdvertiserId),
		RetargetingTagsType: int(req.RetargetingTagsType),
		Offset:              int(req.Offset),
		Limit:               int(req.Limit),
	}

	data, err := qianchuanDmpAPI.AudiencesGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &DmpAudiencesGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &DmpAudiencesGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.RetargetingTags))
		for i, item := range data.RetargetingTags {
			list[i] = item
		}
		res.Data.List = list
		res.Data.TotalCount = int64(data.TotalNum)
	}

	return res, nil
}

// ===== Finance 实现 =====

func (c *OceanengineClient) WalletGet(ctx context.Context, req WalletGetReq) (*WalletGetRes, error) {
	// 使用自定义结构体解析，避免 SDK 的 Wallet struct 有 JSON 类型不匹配 bug
	type walletData struct {
		TotalBalanceAbs            float64 `json:"total_balance_abs"`
		GrantBalance               float64 `json:"grant_balance"`
		GeneralBalanceValidNonGrant float64 `json:"general_balance_valid_non_grant"`
		DefaultValidGrantBalance   float64 `json:"default_valid_grant_balance"`
		GeneralBalanceValid        float64 `json:"general_balance_valid"`
	}

	type walletResponse struct {
		model.BaseResponse
		Data *walletData `json:"data"`
	}

	oeReq := &financeModel.WalletGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	var resp walletResponse
	if err := c.client.Get(ctx, "v1.0/qianchuan/finance/wallet/get/", oeReq, &resp, req.AccessToken); err != nil {
		return &WalletGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &WalletGetRes{
		Code:    0,
		Message: "success",
	}
	if resp.Data != nil {
		res.Data.TotalBalance = resp.Data.TotalBalanceAbs
		res.Data.GrantBalance = resp.Data.GrantBalance
		res.Data.CashBalance = resp.Data.GeneralBalanceValidNonGrant
		res.Data.ValidGrantBalance = resp.Data.DefaultValidGrantBalance
		res.Data.ValidCashBalance = resp.Data.GeneralBalanceValid
	}
	return res, nil
}

func (c *OceanengineClient) BalanceGet(ctx context.Context, req BalanceGetReq) (*BalanceGetRes, error) {
	oeReq := &advertiserModel.BalanceGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := advertiserAPI.BalanceGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &BalanceGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &BalanceGetRes{
		Code:    0,
		Message: "success",
	}

	// SDK Balance 字段名与响应不同
	if data != nil {
		res.Data.Balance = data.AccountTotal
		res.Data.ValidBalance = data.AccountValid
		res.Data.Cash = data.AccountGeneralTotal
		res.Data.Grant = data.ShareGrantTotal
	}

	return res, nil
}

func (c *OceanengineClient) DetailGet(ctx context.Context, req DetailGetReq) (*DetailGetRes, error) {
	oeReq := &financeModel.DetailGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := financeAPI.DetailGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &DetailGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &DetailGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

func (c *OceanengineClient) FundTransferSeqCreate(ctx context.Context, req FundTransferSeqCreateReq) (*FundTransferSeqCreateRes, error) {
	oeReq := &agentModel.FundTransferSeqCreateRequest{
		AccountID:    uint64(req.AdvertiserId),
		TransferType: agentModel.FundTransferType(req.TransferType),
		Amount:       req.Amount,
	}
	if req.TargetAdvertiserId > 0 {
		oeReq.AgentID = uint64(req.TargetAdvertiserId)
	}

	transferSeq, err := agentAPI.FundTransferSeqCreate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &FundTransferSeqCreateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &FundTransferSeqCreateRes{
		Code:    0,
		Message: "success",
		Data: struct {
			TransferSeq string `json:"transfer_seq"`
		}{
			TransferSeq: transferSeq,
		},
	}, nil
}

func (c *OceanengineClient) FundTransferSeqCommit(ctx context.Context, req FundTransferSeqCommitReq) (*FundTransferSeqCommitRes, error) {
	oeReq := &agentModel.FundTransferSeqCommitRequest{
		TransferSeq: req.TransferSeq,
	}
	if req.AdvertiserId > 0 {
		oeReq.AgentID = uint64(req.AdvertiserId)
	}

	transferSeq, err := agentAPI.FundTransferSeqCommit(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &FundTransferSeqCommitRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &FundTransferSeqCommitRes{
		Code:    0,
		Message: "success",
		Data: struct {
			TransferId string `json:"transfer_id"`
		}{
			TransferId: transferSeq,
		},
	}, nil
}

func (c *OceanengineClient) RefundTransferSeqCreate(ctx context.Context, req RefundTransferSeqCreateReq) (*RefundTransferSeqCreateRes, error) {
	oeReq := &agentModel.FundTransferSeqCreateRequest{
		AccountID:    uint64(req.AdvertiserId),
		TransferType: agentModel.FundTransferType(req.TransferType),
		Amount:       req.Amount,
	}
	if req.TargetAdvertiserId > 0 {
		oeReq.AgentID = uint64(req.TargetAdvertiserId)
	}

	transferSeq, err := agentAPI.RefundTransferSeqCreate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &RefundTransferSeqCreateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &RefundTransferSeqCreateRes{
		Code:    0,
		Message: "success",
		Data: struct {
			TransferSeq string `json:"transfer_seq"`
		}{
			TransferSeq: transferSeq,
		},
	}, nil
}

func (c *OceanengineClient) RefundTransferSeqCommit(ctx context.Context, req RefundTransferSeqCommitReq) (*RefundTransferSeqCommitRes, error) {
	oeReq := &agentModel.FundTransferSeqCommitRequest{
		TransferSeq: req.TransferSeq,
	}
	if req.AdvertiserId > 0 {
		oeReq.AgentID = uint64(req.AdvertiserId)
	}

	transferSeq, err := agentAPI.RefundTransferSeqCommit(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &RefundTransferSeqCommitRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &RefundTransferSeqCommitRes{
		Code:    0,
		Message: "success",
		Data: struct {
			TransferId string `json:"transfer_id"`
		}{
			TransferId: transferSeq,
		},
	}, nil
}

// ===== Live 实现 =====

func (c *OceanengineClient) LiveGet(ctx context.Context, req LiveGetReq) (*LiveGetRes, error) {
	oeReq := &reportModel.LiveGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AwemeID:      uint64(req.AwemeId),
		Fields:       req.Fields,
	}

	data, err := reportAPI.LiveGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &LiveGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &LiveGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) LiveRoomGet(ctx context.Context, req LiveRoomGetReq) (*LiveRoomGetRes, error) {
	oeReq := &liveModel.RoomGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AwemeID:      uint64(req.AwemeId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := liveAPI.RoomGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &LiveRoomGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &LiveRoomGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.RoomList))
		for i, item := range data.RoomList {
			list[i] = item
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

func (c *OceanengineClient) LiveRoomDetailGet(ctx context.Context, req LiveRoomDetailGetReq) (*LiveRoomDetailGetRes, error) {
	oeReq := &liveModel.RoomDetailGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		RoomID:       uint64(req.RoomId),
	}

	data, err := liveAPI.RoomDetailGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &LiveRoomDetailGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &LiveRoomDetailGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) LiveRoomFlowPerformanceGet(ctx context.Context, req LiveRoomFlowPerformanceGetReq) (*LiveRoomFlowPerformanceGetRes, error) {
	oeReq := &liveModel.RoomFlowPerformanceGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		RoomID:       uint64(req.RoomId),
	}

	data, err := liveAPI.RoomFlowPerformanceGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &LiveRoomFlowPerformanceGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &LiveRoomFlowPerformanceGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) LiveRoomUserGet(ctx context.Context, req LiveRoomUserGetReq) (*LiveRoomUserGetRes, error) {
	oeReq := &liveModel.RoomUserGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		RoomID:       uint64(req.RoomId),
	}

	data, err := liveAPI.RoomUserGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &LiveRoomUserGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &LiveRoomUserGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) LiveRoomProductListGet(ctx context.Context, req LiveRoomProductListGetReq) (*LiveRoomProductListGetRes, error) {
	oeReq := &liveModel.RoomProductListGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		RoomID:       uint64(req.RoomId),
		Page:         int(req.Page),
		PageSize:     int(req.PageSize),
	}

	data, err := liveAPI.RoomProductListGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &LiveRoomProductListGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &LiveRoomProductListGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

// ===== Aweme (随心推) 实现 =====

func (c *OceanengineClient) AwemeOrderGet(ctx context.Context, req AwemeOrderGetReq) (*AwemeOrderGetRes, error) {
	oeReq := &awemeModel.OrderGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Cursor:       int(req.Page),
		Count:        int(req.PageSize),
	}

	data, err := awemeAPI.OrderGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeOrderGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AwemeOrderGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

func (c *OceanengineClient) AwemeOrderDetailGet(ctx context.Context, req AwemeOrderDetailGetReq) (*AwemeOrderDetailGetRes, error) {
	oeReq := &awemeModel.OrderDetailGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		OrderID:      uint64(req.OrderId),
	}

	data, err := awemeAPI.OrderDetailGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeOrderDetailGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &AwemeOrderDetailGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) AwemeOrderCreate(ctx context.Context, req AwemeOrderCreateReq) (*AwemeOrderCreateRes, error) {
	// 尝试将Body转换为map类型读取
	bodyMap, ok := req.Body.(map[string]interface{})
	if !ok {
		return &AwemeOrderCreateRes{
			Code:    400,
			Message: "Invalid request body format",
		}, nil
	}

	oeReq := &awemeModel.OrderCreateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	// 解析body中的字段
	if v, ok := bodyMap["marketing_goal"].(string); ok {
		oeReq.MarketingGoal = enum.MarketingGoal(v)
	}
	if v, ok := bodyMap["aweme_id"].(float64); ok {
		oeReq.AwemeID = uint64(v)
	}
	if v, ok := bodyMap["aweme_item_id"].(float64); ok {
		oeReq.AwemeItemID = uint64(v)
	}

	// 解析 delivery_setting
	if ds, ok := bodyMap["delivery_setting"].(map[string]interface{}); ok {
		oeReq.DeliverySetting = &awemeModel.DeliverySetting{}
		if v, ok := ds["amount"].(float64); ok {
			oeReq.DeliverySetting.Amount = int64(v)
		}
		if v, ok := ds["delivery_time"].(float64); ok {
			oeReq.DeliverySetting.DeliveryTime = v
		}
		if v, ok := ds["external_action"].(string); ok {
			oeReq.DeliverySetting.ExternalAction = qianchuan.ExternalAction(v)
		}
		if v, ok := ds["bid_mode"].(string); ok {
			oeReq.DeliverySetting.BidMode = qianchuan.BidMode(v)
		}
		if v, ok := ds["bid_type"].(string); ok {
			oeReq.DeliverySetting.BidType = qianchuan.BidType(v)
		}
		if v, ok := ds["cpa_bid"].(float64); ok {
			oeReq.DeliverySetting.CpaBid = v
		}
		if v, ok := ds["roi_goal"].(float64); ok {
			oeReq.DeliverySetting.RoiGoal = v
		}
		if v, ok := ds["liveroom_heat_mode"].(string); ok {
			oeReq.DeliverySetting.LiveroomHeatMode = qianchuan.LiveroomHeatMode(v)
		}
	}

	data, err := awemeAPI.OrderCreate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeOrderCreateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AwemeOrderCreateRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		res.Data.OrderId = int64(data.OrderID)
	}

	return res, nil
}

func (c *OceanengineClient) AwemeOrderTerminate(ctx context.Context, req AwemeOrderTerminateReq) (*AwemeOrderTerminateRes, error) {
	oeReq := &awemeModel.OrderTerminateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		OrderIDs:     []uint64{uint64(req.OrderId)},
	}

	data, err := awemeAPI.OrderTerminate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeOrderTerminateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AwemeOrderTerminateRes{
		Code:    0,
		Message: "success",
	}

	if data != nil && len(data.OrderIDs) > 0 {
		res.Data.OrderId = int64(data.OrderIDs[0])
		res.Data.Result = true
	}

	return res, nil
}

func (c *OceanengineClient) AwemeVideoGet(ctx context.Context, req AwemeVideoGetReq) (*AwemeVideoGetRes, error) {
	oeReq := &awemeModel.VideoGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AwemeID:      uint64(req.AwemeId),
		Cursor:       int(req.Page),
		Count:        int(req.PageSize),
	}

	data, err := awemeAPI.VideoGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeVideoGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &AwemeVideoGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.VideoList))
		for i, item := range data.VideoList {
			list[i] = item
		}
		res.Data.List = list
		if data.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        data.PageInfo.Page,
				PageSize:    data.PageInfo.PageSize,
				TotalNumber: int64(data.PageInfo.TotalNumber),
				TotalPage:   data.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

func (c *OceanengineClient) AwemeOrderBudgetAdd(ctx context.Context, req AwemeOrderBudgetAddReq) (*AwemeOrderBudgetAddRes, error) {
	oeReq := &awemeModel.OrderBudgetAddRequest{
		AdvertiserID:  uint64(req.AdvertiserId),
		OrderID:       uint64(req.OrderId),
		RenewalBudget: req.AddBudget,
	}

	err := awemeAPI.OrderBudgetAdd(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeOrderBudgetAddRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &AwemeOrderBudgetAddRes{
		Code:    0,
		Message: "success",
	}, nil
}

func (c *OceanengineClient) AwemeSuggestBid(ctx context.Context, req AwemeSuggestBidReq) (*AwemeSuggestBidRes, error) {
	oeReq := &awemeModel.SuggestBidRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	// 设置投放设置
	if req.ExternalAction != "" {
		oeReq.DeliverySetting = &awemeModel.DeliverySetting{
			ExternalAction: qianchuan.ExternalAction(req.ExternalAction),
		}
	}

	data, err := awemeAPI.SuggestBid(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeSuggestBidRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &AwemeSuggestBidRes{
		Code:    0,
		Message: "success",
		Data: struct {
			SuggestBid float64 `json:"suggest_bid"`
		}{
			SuggestBid: data,
		},
	}, nil
}

func (c *OceanengineClient) AwemeEstimateProfit(ctx context.Context, req AwemeEstimateProfitReq) (*AwemeEstimateProfitRes, error) {
	oeReq := &awemeModel.EstimateProfitRequest{
		AdvertiserID:  uint64(req.AdvertiserId),
		MarketingGoal: enum.MarketingGoal(req.DeliveryRange), // 使用DeliveryRange传递MarketingGoal
	}

	// 设置投放设置
	if req.Budget > 0 {
		oeReq.DeliverySetting = &awemeModel.DeliverySetting{
			Amount: int64(req.Budget),
		}
	}

	data, err := awemeAPI.EstimateProfit(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &AwemeEstimateProfitRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &AwemeEstimateProfitRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) AwemeOrderQuotaGet(ctx context.Context, req AwemeOrderQuotaGetReq) (*AwemeOrderQuotaGetRes, error) {
	data, err := awemeAPI.OrderQuotaGet(ctx, c.client, req.AccessToken, uint64(req.AdvertiserId))
	if err != nil {
		return &AwemeOrderQuotaGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &AwemeOrderQuotaGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

// ===== Keywords 实现 =====

func (c *OceanengineClient) KeywordPackageGet(ctx context.Context, req KeywordPackageGetReq) (*KeywordPackageGetRes, error) {
	oeReq := &adModel.KeywordPackageGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := adAPI.KeywordPackageGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &KeywordPackageGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &KeywordPackageGetRes{
		Code:    0,
		Message: "success",
	}

	list := make([]interface{}, len(data))
	for i, item := range data {
		list[i] = item
	}
	res.Data.List = list

	return res, nil
}

func (c *OceanengineClient) RecommendKeywordsGet(ctx context.Context, req RecommendKeywordsGetReq) (*RecommendKeywordsGetRes, error) {
	oeReq := &adModel.RecommendKeywordsGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
	}

	data, err := adAPI.RecommendKeywordsGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &RecommendKeywordsGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &RecommendKeywordsGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
	}

	return res, nil
}

func (c *OceanengineClient) KeywordCheck(ctx context.Context, req KeywordCheckReq) (*KeywordCheckRes, error) {
	oeReq := &adModel.KeywordCheckRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Keywords:     req.Keywords,
	}

	data, err := adAPI.KeywordCheck(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &KeywordCheckRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &KeywordCheckRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		// 合并成功和失败的关键词到一个列表
		var list []interface{}
		for _, item := range data.SuccessList {
			list = append(list, map[string]interface{}{
				"keyword": item.Keyword,
				"valid":   true,
			})
		}
		for _, item := range data.FailList {
			list = append(list, map[string]interface{}{
				"keyword":     item.Keyword,
				"valid":       false,
				"fail_reason": item.FailReason,
			})
		}
		res.Data.List = list
	}

	return res, nil
}

func (c *OceanengineClient) PrivatewordsGet(ctx context.Context, req PrivatewordsGetReq) (*PrivatewordsGetRes, error) {
	oeReq := &adModel.PrivatewordsGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Filtering: &adModel.PrivatewordsGetFilter{
			AdID: uint64(req.AdId),
		},
	}

	data, err := adAPI.PrivatewordsGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &PrivatewordsGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &PrivatewordsGetRes{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}

func (c *OceanengineClient) KeywordsUpdate(ctx context.Context, req KeywordsUpdateReq) (*KeywordsUpdateRes, error) {
	keywords := make([]adModel.UpdateKeyword, len(req.Keywords))
	for i, kw := range req.Keywords {
		keywords[i] = adModel.UpdateKeyword{
			ID:         uint64(kw.ID),
			MatchType:  enum.KeywordMatchType(kw.MatchType),
			StatusType: qianchuan.KeywordStatus(kw.StatusType),
		}
	}

	oeReq := &adModel.KeywordsUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdID:         uint64(req.AdId),
		Keywords:     keywords,
	}

	err := adAPI.KeywordsUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &KeywordsUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &KeywordsUpdateRes{
		Code:    0,
		Message: "success",
	}, nil
}

func (c *OceanengineClient) KeywordsGet(ctx context.Context, req KeywordsGetReq) (*KeywordsGetRes, error) {
	oeReq := &adModel.KeywordsGetRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		Filtering: &adModel.KeywordsGetFilter{
			AdID: uint64(req.AdId),
		},
	}

	data, err := adAPI.KeywordsGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &KeywordsGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &KeywordsGetRes{
		Code:    0,
		Message: "success",
	}

	if data != nil {
		list := make([]interface{}, len(data.List))
		for i, item := range data.List {
			list[i] = item
		}
		res.Data.List = list
	}

	return res, nil
}

func (c *OceanengineClient) PrivatewordsUpdate(ctx context.Context, req PrivatewordsUpdateReq) (*PrivatewordsUpdateRes, error) {
	oeReq := &adModel.PrivatewordsUpdateRequest{
		AdvertiserID: uint64(req.AdvertiserId),
		AdID:         uint64(req.AdId),
	}

	_, err := adAPI.PrivatewordsUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &PrivatewordsUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &PrivatewordsUpdateRes{
		Code:    0,
		Message: "success",
	}, nil
}

// ===== UniPromotion (全域推广) 实现 =====

func (c *OceanengineClient) UniPromotionList(ctx context.Context, req UniPromotionListReq) (*UniPromotionListRes, error) {
	oeReq := &uniPromotionModel.ListRequest{
		AdvertiserID: req.AdvertiserId,
		Page:         req.Page,
		PageSize:     req.PageSize,
	}
	if req.Filtering != nil {
		oeReq.Filtering = &uniPromotionModel.ListFilter{}
	}

	result, err := uniPromotionAPI.List(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionListRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionListRes{
		Code:    0,
		Message: "success",
	}
	if result != nil {
		for _, ad := range result.AdList {
			res.Data.List = append(res.Data.List, convertOeAdToUniPromotion(&ad))
		}
		if result.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        result.PageInfo.Page,
				PageSize:    result.PageInfo.PageSize,
				TotalNumber: int64(result.PageInfo.TotalNumber),
				TotalPage:   result.PageInfo.TotalPage,
			}
		}
	}
	return res, nil
}

func (c *OceanengineClient) UniPromotionDetail(ctx context.Context, req UniPromotionDetailReq) (*UniPromotionDetailRes, error) {
	oeReq := &uniPromotionModel.DetailRequest{
		AdvertiserID: req.AdvertiserId,
		AdID:         req.AdId,
	}

	result, err := uniPromotionAPI.Detail(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionDetailRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionDetailRes{
		Code:    0,
		Message: "success",
	}
	if result != nil {
		detail := &UniPromotionDetail{
			UniPromotion: convertOeAdDetailToUniPromotion(result),
		}
		res.Data = detail
	}
	return res, nil
}

func (c *OceanengineClient) UniPromotionCreate(ctx context.Context, req UniPromotionCreateReq) (*UniPromotionCreateRes, error) {
	oeReq := &uniPromotionModel.CreateRequest{
		AdvertiserID:  req.AdvertiserId,
		AwemeID:       req.AwemeId,
		MarketingGoal: "LIVE_PROM_GOODS",
	}

	adId, err := uniPromotionAPI.Create(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionCreateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionCreateRes{
		Code:    0,
		Message: "success",
	}
	res.Data.AdId = adId
	return res, nil
}

func (c *OceanengineClient) UniPromotionUpdate(ctx context.Context, req UniPromotionUpdateReq) (*UniPromotionUpdateRes, error) {
	oeReq := &uniPromotionModel.UpdateRequest{
		AdvertiserID: req.AdvertiserId,
		AdID:         req.AdId,
	}

	result, err := uniPromotionAPI.Update(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionUpdateRes{
		Code:    0,
		Message: "success",
	}
	if result != nil {
		res.Data.AdId = result.AdID
	}
	return res, nil
}

func (c *OceanengineClient) UniPromotionStatusUpdate(ctx context.Context, req UniPromotionStatusUpdateReq) (*UniPromotionStatusUpdateRes, error) {
	oeReq := &uniPromotionModel.StatusUpdateRequest{
		AdvertiserID: req.AdvertiserId,
		AdIDs:        req.AdIds,
		OptStatus:    qianchuan.AdOptStatus(req.OptStatus),
	}

	results, err := uniPromotionAPI.StatusUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionStatusUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionStatusUpdateRes{
		Code:    0,
		Message: "success",
	}

	for _, r := range results {
		res.Data.AdIds = append(res.Data.AdIds, r.AdID)
	}

	return res, nil
}

func (c *OceanengineClient) UniPromotionBudgetUpdate(ctx context.Context, req UniPromotionBudgetUpdateReq) (*UniPromotionBudgetUpdateRes, error) {
	var updateInfos []uniPromotionModel.UpdateBudgetInfo
	for _, item := range req.Data {
		updateInfos = append(updateInfos, uniPromotionModel.UpdateBudgetInfo{
			AdID:   item.AdId,
			Budget: item.Budget,
		})
	}

	oeReq := &uniPromotionModel.AdBudgetUpdateRequest{
		AdvertiserID:      req.AdvertiserId,
		UpdateBudgetInfos: updateInfos,
	}

	results, err := uniPromotionAPI.AdBudgetUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionBudgetUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionBudgetUpdateRes{
		Code:    0,
		Message: "success",
	}

	for _, r := range results {
		res.Data.Results = append(res.Data.Results, UniPromotionOpResult{
			AdId:    r.AdID,
			Success: !r.IsError(),
		})
	}

	return res, nil
}

func (c *OceanengineClient) UniPromotionRoiGoalUpdate(ctx context.Context, req UniPromotionRoiGoalUpdateReq) (*UniPromotionRoiGoalUpdateRes, error) {
	var updateInfos []uniPromotionModel.UpdateRoi2Info
	for _, item := range req.Data {
		updateInfos = append(updateInfos, uniPromotionModel.UpdateRoi2Info{
			AdID:     item.AdId,
			Roi2Goal: item.Roi2Goal,
		})
	}

	oeReq := &uniPromotionModel.AdRoi2GoalUpdateRequest{
		AdvertiserID:    req.AdvertiserId,
		UpdateRoi2Infos: updateInfos,
	}

	results, err := uniPromotionAPI.AdRoi2GoalUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionRoiGoalUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionRoiGoalUpdateRes{
		Code:    0,
		Message: "success",
	}

	for _, r := range results {
		res.Data.Results = append(res.Data.Results, UniPromotionOpResult{
			AdId:    r.AdID,
			Success: !r.IsError(),
		})
	}

	return res, nil
}

func (c *OceanengineClient) UniPromotionScheduleUpdate(ctx context.Context, req UniPromotionScheduleUpdateReq) (*UniPromotionScheduleUpdateRes, error) {
	var updateInfos []uniPromotionModel.UpdateScheduleInfo
	for _, item := range req.Data {
		updateInfos = append(updateInfos, uniPromotionModel.UpdateScheduleInfo{
			AdID:    item.AdId,
			EndTime: item.EndTime,
		})
	}

	oeReq := &uniPromotionModel.AdScheduleDateUpdateRequest{
		AdvertiserID:        req.AdvertiserId,
		UpdateScheduleInfos: updateInfos,
	}

	results, err := uniPromotionAPI.AdScheduleDateUpdate(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionScheduleUpdateRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionScheduleUpdateRes{
		Code:    0,
		Message: "success",
	}

	for _, r := range results {
		res.Data.Results = append(res.Data.Results, UniPromotionOpResult{
			AdId:    r.AdID,
			Success: !r.IsError(),
		})
	}

	return res, nil
}

func (c *OceanengineClient) UniPromotionMaterialGet(ctx context.Context, req UniPromotionMaterialGetReq) (*UniPromotionMaterialGetRes, error) {
	oeReq := &uniPromotionModel.MaterialGetRequest{
		AdvertiserID: req.AdvertiserId,
		AdID:         req.AdId,
	}

	result, err := uniPromotionAPI.MaterialGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionMaterialGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionMaterialGetRes{
		Code:    0,
		Message: "success",
	}

	if result != nil {
		// SDK returns AdMaterialInfos - parse based on material type
		for _, m := range result.AdMaterialInfos {
			// Store as generic interface since SDK uses unified Material type
			res.Data.Materials = append(res.Data.Materials, m)
		}
	}

	return res, nil
}

func (c *OceanengineClient) UniPromotionMaterialDelete(ctx context.Context, req UniPromotionMaterialDeleteReq) (*UniPromotionMaterialDeleteRes, error) {
	oeReq := &uniPromotionModel.MaterialDeleteRequest{
		AdvertiserID: req.AdvertiserId,
		AdID:         req.AdId,
		MaterialIDs:  req.MaterialIds,
		Titles:       req.Titles,
	}

	err := uniPromotionAPI.MaterialDelete(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionMaterialDeleteRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &UniPromotionMaterialDeleteRes{
		Code:    0,
		Message: "success",
	}, nil
}

func (c *OceanengineClient) UniPromotionAuthorizedGet(ctx context.Context, req UniPromotionAuthorizedGetReq) (*UniPromotionAuthorizedGetRes, error) {
	oeReq := &uniPromotionModel.AuthorizedGetRequest{
		AdvertiserID: req.AdvertiserId,
		Page:         req.Page,
		PageSize:     req.PageSize,
	}

	result, err := uniPromotionAPI.AuthorizedGet(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionAuthorizedGetRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	res := &UniPromotionAuthorizedGetRes{
		Code:    0,
		Message: "success",
	}

	if result != nil {
		for _, item := range result.AwemeIDList {
			res.Data.List = append(res.Data.List, UniPromotionAweme{
				AwemeId:     item.ID,
				AwemeName:   item.Name,
				AwemeAvatar: item.Avatar,
			})
		}
		if result.PageInfo != nil {
			res.Data.PageInfo = PageInfo{
				Page:        result.PageInfo.Page,
				PageSize:    result.PageInfo.PageSize,
				TotalNumber: int64(result.PageInfo.TotalNumber),
				TotalPage:   result.PageInfo.TotalPage,
			}
		}
	}

	return res, nil
}

func (c *OceanengineClient) UniPromotionAuthInit(ctx context.Context, req UniPromotionAuthInitReq) (*UniPromotionAuthInitRes, error) {
	// Note: SDK AuthInitRequest only has AdvertiserID, AwemeID is not supported
	oeReq := &uniPromotionModel.AuthInitRequest{
		AdvertiserID: req.AdvertiserId,
	}

	err := uniPromotionAPI.AuthInit(ctx, c.client, req.AccessToken, oeReq)
	if err != nil {
		return &UniPromotionAuthInitRes{
			Code:    500,
			Message: err.Error(),
		}, nil
	}

	return &UniPromotionAuthInitRes{
		Code:    0,
		Message: "success",
	}, nil
}

// ===== Helper Functions =====

func convertOeAdToUniPromotion(ad *uniPromotionModel.Ad) UniPromotion {
	result := UniPromotion{}
	if ad.AdInfo != nil {
		result.AdId = ad.AdInfo.ID
		result.MarketingGoal = string(ad.AdInfo.MarketingGoal)
		result.Status = string(ad.AdInfo.Status)
		result.OptStatus = string(ad.AdInfo.OptStatus)
		result.Budget = ad.AdInfo.Budget
		result.Roi2Goal = ad.AdInfo.Roi2Goal
		result.StartTime = ad.AdInfo.StartTime
		result.EndTime = ad.AdInfo.EndTime
		result.CreateTime = ad.AdInfo.CreateTime
		result.ModifyTime = ad.AdInfo.ModifyTime
	}
	return result
}

func convertOeAdDetailToUniPromotion(detail *uniPromotionModel.AdDetail) UniPromotion {
	return UniPromotion{
		AdId:          detail.AdID,
		AdName:        detail.Name,
		MarketingGoal: string(detail.MarketingGoal),
		Status:        string(detail.Status),
		OptStatus:     string(detail.OptStatus),
		CreateTime:    detail.CreateTime,
		ModifyTime:    detail.ModifyTime,
	}
}
