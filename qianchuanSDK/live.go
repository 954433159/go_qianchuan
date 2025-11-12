// 直播数据相关API
// 获取直播间数据、商品、用户洞察等

package qianchuanSDK

import (
	"context"
	"fmt"
	"github.com/CriarBrand/qianchuanSDK/conf"
	"net/http"
)

// LiveGetReq 获取今日直播数据-请求
type LiveGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	Fields       []string `json:"fields"`      // 查询指标列表
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// LiveStats 今日直播统计数据
type LiveStats struct {
	LiveTime            int64   `json:"live_time"`             // 直播时长（秒）
	WatchCount          int64   `json:"watch_count"`           // 观看人次
	AvgWatchDuration    float64 `json:"avg_watch_duration"`    // 平均观看时长（秒）
	NewFollowerCount    int64   `json:"new_follower_count"`    // 新增粉丝数
	TotalUserCount      int64   `json:"total_user_count"`      // 累计观看人数
	MaxUserCount        int64   `json:"max_user_count"`        // 峰值在线人数
	CommentCount        int64   `json:"comment_count"`         // 评论数
	ShareCount          int64   `json:"share_count"`           // 分享次数
	GiftIncome          float64 `json:"gift_income"`           // 音浪收入
	GmvTotal            float64 `json:"gmv_total"`             // GMV
	OrderCount          int64   `json:"order_count"`           // 订单数
	PayOrderCount       int64   `json:"pay_order_count"`       // 成交订单数
	PayAmount           float64 `json:"pay_amount"`            // 成交金额
	ProductClickCount   int64   `json:"product_click_count"`   // 商品点击次数
}

// LiveGetResData 今日直播数据响应
type LiveGetResData struct {
	Stats LiveStats `json:"stats"`
}

// LiveGetRes 今日直播数据响应
type LiveGetRes struct {
	QCError
	Data LiveGetResData `json:"data"`
}

// LiveGet 获取今日直播数据
func (m *Manager) LiveGet(req LiveGetReq) (res *LiveGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/report/live/get/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"fields":        req.Fields,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// LiveRoomGetReq 获取今日直播间列表-请求
type LiveRoomGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"`      // 千川广告主账户id
	Cursor       int64  `json:"cursor,omitempty"`   // 页码游标
	Count        int64  `json:"count,omitempty"`    // 页面大小，默认10
	AccessToken  string `json:"access_token"`       // 调用/oauth/access_token/生成的token
}

// LiveRoomInfo 直播间信息
type LiveRoomInfo struct {
	RoomId       int64  `json:"room_id"`       // 直播间ID
	RoomTitle    string `json:"room_title"`    // 直播间标题
	RoomStatus   string `json:"room_status"`   // 状态：LIVING直播中、FINISHED已结束
	StartTime    string `json:"start_time"`    // 开始时间
	EndTime      string `json:"end_time"`      // 结束时间
	LiveDuration int64  `json:"live_duration"` // 直播时长（秒）
	AwemeId      string `json:"aweme_id"`      // 抖音号ID
	AwemeName    string `json:"aweme_name"`    // 抖音号名称
}

// LiveRoomGetResData 直播间列表响应数据
type LiveRoomGetResData struct {
	List     []LiveRoomInfo `json:"list"`
	PageInfo PageInfo       `json:"page_info"`
}

// LiveRoomGetRes 直播间列表响应
type LiveRoomGetRes struct {
	QCError
	Data LiveRoomGetResData `json:"data"`
}

// LiveRoomGet 获取今日直播间列表
func (m *Manager) LiveRoomGet(req LiveRoomGetReq) (res *LiveRoomGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/live/room/get/?advertiser_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId)

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

// LiveRoomDetailGetReq 获取直播间详情-请求
type LiveRoomDetailGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	RoomId       int64  `json:"room_id"`       // 直播间ID
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// LiveRoomDetail 直播间详情
type LiveRoomDetail struct {
	RoomId           int64   `json:"room_id"`            // 直播间ID
	RoomTitle        string  `json:"room_title"`         // 直播间标题
	RoomStatus       string  `json:"room_status"`        // 状态
	StartTime        string  `json:"start_time"`         // 开始时间
	EndTime          string  `json:"end_time"`           // 结束时间
	LiveDuration     int64   `json:"live_duration"`      // 直播时长（秒）
	WatchCount       int64   `json:"watch_count"`        // 观看人次
	TotalUserCount   int64   `json:"total_user_count"`   // 累计观看人数
	MaxUserCount     int64   `json:"max_user_count"`     // 峰值在线人数
	NewFollowerCount int64   `json:"new_follower_count"` // 新增粉丝数
	CommentCount     int64   `json:"comment_count"`      // 评论数
	ShareCount       int64   `json:"share_count"`        // 分享次数
	GiftIncome       float64 `json:"gift_income"`        // 音浪收入
	GmvTotal         float64 `json:"gmv_total"`          // GMV
	PayOrderCount    int64   `json:"pay_order_count"`    // 成交订单数
	PayAmount        float64 `json:"pay_amount"`         // 成交金额
}

// LiveRoomDetailGetResData 直播间详情响应数据
type LiveRoomDetailGetResData struct {
	Room LiveRoomDetail `json:"room"`
}

// LiveRoomDetailGetRes 直播间详情响应
type LiveRoomDetailGetRes struct {
	QCError
	Data LiveRoomDetailGetResData `json:"data"`
}

// LiveRoomDetailGet 获取直播间详情
func (m *Manager) LiveRoomDetailGet(req LiveRoomDetailGetReq) (res *LiveRoomDetailGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/live/room/detail/get/?advertiser_id=%d&room_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.RoomId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// LiveRoomFlowPerformanceGetReq 获取直播间流量表现-请求
type LiveRoomFlowPerformanceGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	RoomId       int64  `json:"room_id"`       // 直播间ID
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// LiveFlowPerformance 流量表现
type LiveFlowPerformance struct {
	RecommendFlowCount int64   `json:"recommend_flow_count"` // 推荐流量人次
	RecommendFlowRate  float64 `json:"recommend_flow_rate"`  // 推荐流量占比
	SearchFlowCount    int64   `json:"search_flow_count"`    // 搜索流量人次
	SearchFlowRate     float64 `json:"search_flow_rate"`     // 搜索流量占比
	FollowFlowCount    int64   `json:"follow_flow_count"`    // 粉丝流量人次
	FollowFlowRate     float64 `json:"follow_flow_rate"`     // 粉丝流量占比
	OtherFlowCount     int64   `json:"other_flow_count"`     // 其他流量人次
	OtherFlowRate      float64 `json:"other_flow_rate"`      // 其他流量占比
	AdFlowCount        int64   `json:"ad_flow_count"`        // 广告流量人次
	AdFlowRate         float64 `json:"ad_flow_rate"`         // 广告流量占比
}

// LiveRoomFlowPerformanceGetResData 流量表现响应数据
type LiveRoomFlowPerformanceGetResData struct {
	FlowPerformance LiveFlowPerformance `json:"flow_performance"`
}

// LiveRoomFlowPerformanceGetRes 流量表现响应
type LiveRoomFlowPerformanceGetRes struct {
	QCError
	Data LiveRoomFlowPerformanceGetResData `json:"data"`
}

// LiveRoomFlowPerformanceGet 获取直播间流量表现
func (m *Manager) LiveRoomFlowPerformanceGet(req LiveRoomFlowPerformanceGetReq) (res *LiveRoomFlowPerformanceGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/live/room/flow_performance/get/?advertiser_id=%d&room_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.RoomId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// LiveRoomUserGetReq 获取直播间用户洞察-请求
type LiveRoomUserGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	RoomId       int64  `json:"room_id"`       // 直播间ID
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// LiveUserInsight 用户洞察
type LiveUserInsight struct {
	GenderDistribution map[string]float64 `json:"gender_distribution"` // 性别分布
	AgeDistribution    map[string]float64 `json:"age_distribution"`    // 年龄分布
	CityDistribution   []CityDistribution `json:"city_distribution"`   // 城市分布
}

// CityDistribution 城市分布
type CityDistribution struct {
	CityName string  `json:"city_name"` // 城市名称
	Rate     float64 `json:"rate"`      // 占比
}

// LiveRoomUserGetResData 用户洞察响应数据
type LiveRoomUserGetResData struct {
	UserInsight LiveUserInsight `json:"user_insight"`
}

// LiveRoomUserGetRes 用户洞察响应
type LiveRoomUserGetRes struct {
	QCError
	Data LiveRoomUserGetResData `json:"data"`
}

// LiveRoomUserGet 获取直播间用户洞察
func (m *Manager) LiveRoomUserGet(req LiveRoomUserGetReq) (res *LiveRoomUserGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/live/room/user/get/?advertiser_id=%d&room_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.RoomId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// LiveRoomProductListGetReq 获取直播间商品列表-请求
type LiveRoomProductListGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"`      // 千川广告主账户id
	RoomId       int64  `json:"room_id"`            // 直播间ID
	Cursor       int64  `json:"cursor,omitempty"`   // 页码游标
	Count        int64  `json:"count,omitempty"`    // 页面大小
	AccessToken  string `json:"access_token"`       // 调用/oauth/access_token/生成的token
}

// LiveRoomProduct 直播间商品
type LiveRoomProduct struct {
	ProductId     int64   `json:"product_id"`     // 商品ID
	ProductName   string  `json:"product_name"`   // 商品名称
	ProductImage  string  `json:"product_image"`  // 商品图片
	Price         float64 `json:"price"`          // 价格
	SaleCount     int64   `json:"sale_count"`     // 销量
	ClickCount    int64   `json:"click_count"`    // 点击次数
	PayOrderCount int64   `json:"pay_order_count"` // 成交订单数
	PayAmount     float64 `json:"pay_amount"`     // 成交金额
}

// LiveRoomProductListGetResData 商品列表响应数据
type LiveRoomProductListGetResData struct {
	List     []LiveRoomProduct `json:"list"`
	PageInfo PageInfo          `json:"page_info"`
}

// LiveRoomProductListGetRes 商品列表响应
type LiveRoomProductListGetRes struct {
	QCError
	Data LiveRoomProductListGetResData `json:"data"`
}

// LiveRoomProductListGet 获取直播间商品列表
func (m *Manager) LiveRoomProductListGet(req LiveRoomProductListGetReq) (res *LiveRoomProductListGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/live/room/product/list/get/?advertiser_id=%d&room_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.RoomId)

	if req.Cursor > 0 {
		reqUrl += fmt.Sprintf("&cursor=%d", req.Cursor)
	}
	if req.Count > 0 {
		reqUrl += fmt.Sprintf("&count=%d", req.Count)
	}

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}
