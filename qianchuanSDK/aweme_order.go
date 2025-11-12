// 随心推投放相关API
// 随心推是抖音的轻量级广告投放产品

package qianchuanSDK

import (
	"context"
	"fmt"
	"github.com/CriarBrand/qianchuanSDK/conf"
	"net/http"
)

// AwemeOrderCreateReq 创建随心推订单-请求
type AwemeOrderCreateReq struct {
	AdvertiserId      int64                    `json:"advertiser_id"`       // 千川广告主账户id
	AwemeId           string                   `json:"aweme_id"`            // 抖音号ID
	DeliveryMode      string                   `json:"delivery_mode"`       // 投放模式：MANUAL手动、PROCEDURAL程序化
	Budget            float64                  `json:"budget"`              // 预算（元）
	CpaPrice          float64                  `json:"cpa_price,omitempty"` // 出价（元）
	StartTime         string                   `json:"start_time"`          // 开始时间
	EndTime           string                   `json:"end_time"`            // 结束时间
	MarketingGoal     string                   `json:"marketing_goal"`      // 营销目标：VIDEO_PROM_GOODS短视频带货
	ExternalAction    string                   `json:"external_action"`     // 转化目标
	DeliveryRange     *AwemeOrderDeliveryRange `json:"delivery_range"`      // 投放范围
	AudienceInfo      *AwemeOrderAudienceInfo  `json:"audience_info"`       // 定向信息
	AccessToken       string                   `json:"access_token"`        // 调用/oauth/access_token/生成的token
}

// AwemeOrderDeliveryRange 投放范围
type AwemeOrderDeliveryRange struct {
	VideoIds []string `json:"video_ids"` // 视频ID列表
}

// AwemeOrderAudienceInfo 定向信息
type AwemeOrderAudienceInfo struct {
	Age            []string `json:"age,omitempty"`             // 年龄
	Gender         string   `json:"gender,omitempty"`          // 性别：NONE不限、MALE男、FEMALE女
	District       string   `json:"district,omitempty"`        // 地域：CITY城市、COUNTY区县
	City           []int64  `json:"city,omitempty"`            // 城市列表
	InterestTags   []int64  `json:"interest_tags,omitempty"`   // 兴趣标签
	AutoExtend     int      `json:"auto_extend,omitempty"`     // 智能放量：0关闭、1开启
}

// AwemeOrder 随心推订单信息
type AwemeOrder struct {
	OrderId       int64   `json:"order_id"`       // 订单ID
	AdvertiserId  int64   `json:"advertiser_id"`  // 广告主ID
	Budget        float64 `json:"budget"`         // 预算
	Status        string  `json:"status"`         // 状态：DELIVERY投放中、PAUSED暂停、FINISHED完成、TERMINATED终止
	CreateTime    string  `json:"create_time"`    // 创建时间
	StartTime     string  `json:"start_time"`     // 开始时间
	EndTime       string  `json:"end_time"`       // 结束时间
	MarketingGoal string  `json:"marketing_goal"` // 营销目标
}

// AwemeOrderCreateResData 创建订单响应数据
type AwemeOrderCreateResData struct {
	Order AwemeOrder `json:"order"`
}

// AwemeOrderCreateRes 创建订单响应
type AwemeOrderCreateRes struct {
	QCError
	Data AwemeOrderCreateResData `json:"data"`
}

// AwemeOrderCreate 创建随心推订单
func (m *Manager) AwemeOrderCreate(req AwemeOrderCreateReq) (res *AwemeOrderCreateRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/order/create/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id":   req.AdvertiserId,
		"aweme_id":        req.AwemeId,
		"delivery_mode":   req.DeliveryMode,
		"budget":          req.Budget,
		"start_time":      req.StartTime,
		"end_time":        req.EndTime,
		"marketing_goal":  req.MarketingGoal,
		"external_action": req.ExternalAction,
	}
	if req.CpaPrice > 0 {
		body["cpa_price"] = req.CpaPrice
	}
	if req.DeliveryRange != nil {
		body["delivery_range"] = req.DeliveryRange
	}
	if req.AudienceInfo != nil {
		body["audience_info"] = req.AudienceInfo
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeOrderTerminateReq 终止随心推订单-请求
type AwemeOrderTerminateReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	OrderId      int64  `json:"order_id"`      // 订单ID
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AwemeOrderTerminateRes 终止订单响应
type AwemeOrderTerminateRes struct {
	QCError
}

// AwemeOrderTerminate 终止随心推订单
func (m *Manager) AwemeOrderTerminate(req AwemeOrderTerminateReq) (res *AwemeOrderTerminateRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/order/terminate/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"order_id":      req.OrderId,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeOrderGetReq 获取随心推订单列表-请求
type AwemeOrderGetReq struct {
	AdvertiserId  int64    `json:"advertiser_id"`           // 千川广告主账户id
	OrderIds      []int64  `json:"order_ids,omitempty"`     // 订单ID列表
	Status        []string `json:"status,omitempty"`        // 状态列表
	StartTime     string   `json:"start_time,omitempty"`    // 开始时间
	EndTime       string   `json:"end_time,omitempty"`      // 结束时间
	MarketingGoal string   `json:"marketing_goal,omitempty"` // 营销目标
	Page          int64    `json:"page,omitempty"`          // 页码
	PageSize      int64    `json:"page_size,omitempty"`     // 页面大小
	AccessToken   string   `json:"access_token"`            // 调用/oauth/access_token/生成的token
}

// AwemeOrderGetResData 订单列表响应数据
type AwemeOrderGetResData struct {
	List     []AwemeOrder `json:"list"`
	PageInfo PageInfo     `json:"page_info"`
}

// AwemeOrderGetRes 订单列表响应
type AwemeOrderGetRes struct {
	QCError
	Data AwemeOrderGetResData `json:"data"`
}

// AwemeOrderGet 获取随心推订单列表
func (m *Manager) AwemeOrderGet(req AwemeOrderGetReq) (res *AwemeOrderGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/order/get/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
	}
	if len(req.OrderIds) > 0 {
		body["order_ids"] = req.OrderIds
	}
	if len(req.Status) > 0 {
		body["status"] = req.Status
	}
	if req.StartTime != "" {
		body["start_time"] = req.StartTime
	}
	if req.EndTime != "" {
		body["end_time"] = req.EndTime
	}
	if req.MarketingGoal != "" {
		body["marketing_goal"] = req.MarketingGoal
	}
	if req.Page > 0 {
		body["page"] = req.Page
	}
	if req.PageSize > 0 {
		body["page_size"] = req.PageSize
	}

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeOrderDetailGetReq 获取随心推订单详情-请求
type AwemeOrderDetailGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	OrderId      int64  `json:"order_id"`      // 订单ID
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AwemeOrderDetailGetResData 订单详情响应数据
type AwemeOrderDetailGetResData struct {
	Order AwemeOrder `json:"order"`
}

// AwemeOrderDetailGetRes 订单详情响应
type AwemeOrderDetailGetRes struct {
	QCError
	Data AwemeOrderDetailGetResData `json:"data"`
}

// AwemeOrderDetailGet 获取随心推订单详情
func (m *Manager) AwemeOrderDetailGet(req AwemeOrderDetailGetReq) (res *AwemeOrderDetailGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/order/detail/get/?advertiser_id=%d&order_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.OrderId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeVideoGetReq 获取随心推可投视频列表-请求
type AwemeVideoGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"`      // 千川广告主账户id
	AwemeId      string `json:"aweme_id"`           // 抖音号ID
	Cursor       int64  `json:"cursor,omitempty"`   // 页码游标
	Count        int64  `json:"count,omitempty"`    // 页面大小
	AccessToken  string `json:"access_token"`       // 调用/oauth/access_token/生成的token
}

// AwemeVideoInfo 视频信息
type AwemeVideoInfo struct {
	VideoId     string `json:"video_id"`     // 视频ID
	VideoTitle  string `json:"video_title"`  // 视频标题
	VideoCover  string `json:"video_cover"`  // 视频封面
	Duration    int64  `json:"duration"`     // 时长（秒）
	CreateTime  string `json:"create_time"`  // 创建时间
	PublishTime string `json:"publish_time"` // 发布时间
}

// AwemeVideoGetResData 视频列表响应数据
type AwemeVideoGetResData struct {
	List     []AwemeVideoInfo `json:"list"`
	PageInfo PageInfo         `json:"page_info"`
}

// AwemeVideoGetRes 视频列表响应
type AwemeVideoGetRes struct {
	QCError
	Data AwemeVideoGetResData `json:"data"`
}

// AwemeVideoGet 获取随心推可投视频列表
func (m *Manager) AwemeVideoGet(req AwemeVideoGetReq) (res *AwemeVideoGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/video/get/?advertiser_id=%d&aweme_id=%s",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.AwemeId)

	if req.Cursor > 0 {
		reqUrl += fmt.Sprintf("&cursor=%d", req.Cursor)
	}
	if req.Count > 0 {
		reqUrl += fmt.Sprintf("&count=%d", req.Count)
	}

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeEstimateProfitReq 获取随心推投放效果预估-请求
type AwemeEstimateProfitReq struct {
	AdvertiserId   int64   `json:"advertiser_id"`   // 千川广告主账户id
	AwemeId        string  `json:"aweme_id"`        // 抖音号ID
	VideoId        string  `json:"video_id"`        // 视频ID
	Budget         float64 `json:"budget"`          // 预算（元）
	ExternalAction string  `json:"external_action"` // 转化目标
	AccessToken    string  `json:"access_token"`    // 调用/oauth/access_token/生成的token
}

// AwemeEstimateProfit 效果预估
type AwemeEstimateProfit struct {
	ShowCount       int64   `json:"show_count"`       // 预估曝光量
	ClickCount      int64   `json:"click_count"`      // 预估点击量
	ConversionCount int64   `json:"conversion_count"` // 预估转化量
	ConversionCost  float64 `json:"conversion_cost"`  // 预估转化成本
}

// AwemeEstimateProfitResData 效果预估响应数据
type AwemeEstimateProfitResData struct {
	Estimate AwemeEstimateProfit `json:"estimate"`
}

// AwemeEstimateProfitRes 效果预估响应
type AwemeEstimateProfitRes struct {
	QCError
	Data AwemeEstimateProfitResData `json:"data"`
}

// AwemeEstimateProfit 获取随心推投放效果预估
func (m *Manager) AwemeEstimateProfit(req AwemeEstimateProfitReq) (res *AwemeEstimateProfitRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/estimate_profit/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id":   req.AdvertiserId,
		"aweme_id":        req.AwemeId,
		"video_id":        req.VideoId,
		"budget":          req.Budget,
		"external_action": req.ExternalAction,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeSuggestBidReq 获取随心推短视频建议出价-请求
type AwemeSuggestBidReq struct {
	AdvertiserId   int64  `json:"advertiser_id"`   // 千川广告主账户id
	AwemeId        string `json:"aweme_id"`        // 抖音号ID
	VideoId        string `json:"video_id"`        // 视频ID
	ExternalAction string `json:"external_action"` // 转化目标
	AccessToken    string `json:"access_token"`    // 调用/oauth/access_token/生成的token
}

// AwemeSuggestBidResData 建议出价响应数据
type AwemeSuggestBidResData struct {
	SuggestBid float64 `json:"suggest_bid"` // 建议出价（元）
}

// AwemeSuggestBidRes 建议出价响应
type AwemeSuggestBidRes struct {
	QCError
	Data AwemeSuggestBidResData `json:"data"`
}

// AwemeSuggestBid 获取随心推短视频建议出价
func (m *Manager) AwemeSuggestBid(req AwemeSuggestBidReq) (res *AwemeSuggestBidRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/suggest_bid/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id":   req.AdvertiserId,
		"aweme_id":        req.AwemeId,
		"video_id":        req.VideoId,
		"external_action": req.ExternalAction,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeSuggestRoiGoalReq 获取随心推ROI建议出价-请求
type AwemeSuggestRoiGoalReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AwemeId      string `json:"aweme_id"`      // 抖音号ID
	VideoId      string `json:"video_id"`      // 视频ID
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AwemeSuggestRoiGoalResData ROI建议响应数据
type AwemeSuggestRoiGoalResData struct {
	SuggestRoiGoal float64 `json:"suggest_roi_goal"` // 建议ROI目标
}

// AwemeSuggestRoiGoalRes ROI建议响应
type AwemeSuggestRoiGoalRes struct {
	QCError
	Data AwemeSuggestRoiGoalResData `json:"data"`
}

// AwemeSuggestRoiGoal 获取随心推ROI建议出价
func (m *Manager) AwemeSuggestRoiGoal(req AwemeSuggestRoiGoalReq) (res *AwemeSuggestRoiGoalRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/suggest_roi_goal/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"aweme_id":      req.AwemeId,
		"video_id":      req.VideoId,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeOrderQuotaGetReq 查询随心推使用中订单配额信息-请求
type AwemeOrderQuotaGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AwemeOrderQuota 订单配额信息
type AwemeOrderQuota struct {
	TotalQuota int64 `json:"total_quota"` // 总配额
	UsedQuota  int64 `json:"used_quota"`  // 已使用配额
	LeftQuota  int64 `json:"left_quota"`  // 剩余配额
}

// AwemeOrderQuotaGetResData 配额响应数据
type AwemeOrderQuotaGetResData struct {
	Quota AwemeOrderQuota `json:"quota"`
}

// AwemeOrderQuotaGetRes 配额响应
type AwemeOrderQuotaGetRes struct {
	QCError
	Data AwemeOrderQuotaGetResData `json:"data"`
}

// AwemeOrderQuotaGet 查询随心推使用中订单配额信息
func (m *Manager) AwemeOrderQuotaGet(req AwemeOrderQuotaGetReq) (res *AwemeOrderQuotaGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/order/quota/get/?advertiser_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AwemeOrderBudgetAddReq 追加随心推订单预算-请求
type AwemeOrderBudgetAddReq struct {
	AdvertiserId int64   `json:"advertiser_id"` // 千川广告主账户id
	OrderId      int64   `json:"order_id"`      // 订单ID
	Budget       float64 `json:"budget"`        // 追加预算（元）
	AccessToken  string  `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AwemeOrderBudgetAddRes 追加预算响应
type AwemeOrderBudgetAddRes struct {
	QCError
}

// AwemeOrderBudgetAdd 追加随心推订单预算
func (m *Manager) AwemeOrderBudgetAdd(req AwemeOrderBudgetAddReq) (res *AwemeOrderBudgetAddRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/aweme/order/budget/add/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"order_id":      req.OrderId,
		"budget":        req.Budget,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}
