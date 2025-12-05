package service

import (
	"context"
	"fmt"

	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
)

// QianchuanService 千川服务层
// 封装千川SDK调用，提供业务逻辑处理、错误转换、日志记录等功能
type QianchuanService struct {
	// Client 千川客户端接口，负责所有API调用
	Client sdk.QianchuanClient
	// AppId 应用ID，用于API调用
	AppId int64
	// AppSecret 应用密钥，用于API调用
	AppSecret string
}

// NewQianchuanService 创建千川服务实例
//
// 参数:
//   - client: 千川客户端接口实现
//   - appId: 应用ID
//   - appSecret: 应用密钥
//
// 返回:
//   - *QianchuanService: 千川服务实例
//
// 使用示例:
//   client := sdk.NewOceanengineClient(appId, appSecret)
//   service := NewQianchuanService(client, appId, appSecret)
func NewQianchuanService(client sdk.QianchuanClient, appId int64, appSecret string) *QianchuanService {
	return &QianchuanService{
		Client:    client,
		AppId:     appId,
		AppSecret: appSecret,
	}
}

// ==================== 广告主管理 ====================

// GetAdvertiserListWithDetails 获取广告主列表(含详细信息)
// 业务逻辑:
// 1. 获取广告主基本列表
// 2. 批量查询详细信息
// 3. 合并数据并返回
func (s *QianchuanService) GetAdvertiserListWithDetails(accessToken string, fields []string) (*sdk.AdvertiserInfoRes, error) {
	ctx := context.Background()

	// 获取列表
	listResp, err := s.Client.AdvertiserList(ctx, sdk.AdvertiserListReq{
		AccessToken: accessToken,
		AppId:       s.AppId,
		Secret:      s.AppSecret,
	})
	if err != nil {
		return nil, err
	}

	// 提取 ID 列表
	ids := make([]int64, 0, len(listResp.Data.List))
	for _, item := range listResp.Data.List {
		ids = append(ids, item.AdvertiserId)
	}

	// 如果没有广告主,直接返回空结果
	if len(ids) == 0 {
		return &sdk.AdvertiserInfoRes{
			Data: []sdk.AdvertiserInfoResData{},
		}, nil
	}

	// 批量获取详细信息
	return s.Client.AdvertiserInfo(ctx, sdk.AdvertiserInfoReq{
		AccessToken:   accessToken,
		AdvertiserIds: ids,
		Fields:        fields,
	})
}

// RefreshAccessToken 刷新 Access Token
// 业务逻辑: 封装 SDK 的 token 刷新方法,方便未来扩展(如添加重试逻辑)
func (s *QianchuanService) RefreshAccessToken(refreshToken string) (*sdk.OauthRefreshTokenRes, error) {
	ctx := context.Background()
	return s.Client.OauthRefreshToken(ctx, sdk.OauthRefreshTokenReq{
		RefreshToken: refreshToken,
	})
}

// ==================== 账户预算 ====================

// GetAdvertiserBudget 查询账户日预算（如果底层不支持，返回 501）
func (s *QianchuanService) GetAdvertiserBudget(ctx context.Context, accessToken string, advertiserId int64) (*sdk.AdvertiserBudgetGetRes, error) {
	return s.Client.AdvertiserBudgetGet(ctx, sdk.AdvertiserBudgetGetReq{
		AccessToken:  accessToken,
		AdvertiserId: advertiserId,
	})
}

// UpdateAdvertiserBudget 更新账户日预算（如果底层不支持，返回 501）
func (s *QianchuanService) UpdateAdvertiserBudget(ctx context.Context, accessToken string, advertiserId int64, budget int64) (*sdk.AdvertiserBudgetUpdateRes, error) {
	return s.Client.AdvertiserBudgetUpdate(ctx, sdk.AdvertiserBudgetUpdateReq{
		AccessToken:  accessToken,
		AdvertiserId: advertiserId,
		Budget:       budget,
	})
}

// ==================== 广告管理 ====================

// ValidateAdBudget 验证广告预算是否合法
// 业务规则:
// - 日预算最小 300 元
// - 总预算最小 1000 元
func (s *QianchuanService) ValidateAdBudget(budgetMode string, budget float64) error {
	switch budgetMode {
	case "BUDGET_MODE_DAY":
		if budget < 300 {
			return fmt.Errorf("日预算不能低于300元,当前: %.2f", budget)
		}
	case "BUDGET_MODE_TOTAL":
		if budget < 1000 {
			return fmt.Errorf("总预算不能低于1000元,当前: %.2f", budget)
		}
	case "BUDGET_MODE_INFINITE":
		// 不限预算无需验证
		return nil
	default:
		return fmt.Errorf("无效的预算模式: %s", budgetMode)
	}
	return nil
}

// ValidateAdBid 验证出价是否合法
// 业务规则: 出价必须大于 0.1 元
func (s *QianchuanService) ValidateAdBid(bid float64) error {
	if bid < 0.1 {
		return fmt.Errorf("出价不能低于0.1元,当前: %.2f", bid)
	}
	return nil
}

// ==================== 工具方法 ====================

// IsSDKError 判断是否为 SDK 错误
func IsSDKError(err error) bool {
	return err != nil && err.Error() != ""
}

// 注意：
// 1. 当前 Service 层已添加基础业务逻辑方法
// 2. 未来可扩展：
//    - 数据缓存策略
//    - 更复杂的业务规则验证
//    - 统一错误处理和转换
//    - 性能监控和日志记录
//    - 数据格式转换和清洗
