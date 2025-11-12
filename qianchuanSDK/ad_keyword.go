// 关键词管理相关API
// 包含搜索关键词和否定词管理

package qianchuanSDK

import (
	"context"
	"fmt"
	"github.com/CriarBrand/qianchuanSDK/conf"
	"net/http"
)

// KeywordsGetReq 获取计划的搜索关键词-请求
type KeywordsGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AdId         int64  `json:"ad_id"`         // 广告计划id
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// KeywordInfo 关键词信息
type KeywordInfo struct {
	Word       string  `json:"word"`        // 关键词
	MatchType  string  `json:"match_type"`  // 匹配类型：PHRASE精确匹配、EXTENSIVE广泛匹配
	Status     string  `json:"status"`      // 状态：ENABLE启用、DISABLE暂停
	BidAmount  float64 `json:"bid_amount"`  // 出价（单位：元）
	WordId     int64   `json:"word_id"`     // 关键词ID
	CreateTime string  `json:"create_time"` // 创建时间
	ModifyTime string  `json:"modify_time"` // 修改时间
}

// KeywordsGetResData 获取关键词响应数据
type KeywordsGetResData struct {
	List []KeywordInfo `json:"list"`
}

// KeywordsGetRes 获取关键词响应
type KeywordsGetRes struct {
	QCError
	Data KeywordsGetResData `json:"data"`
}

// KeywordsGet 获取计划的搜索关键词
func (m *Manager) KeywordsGet(req KeywordsGetReq) (res *KeywordsGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/ad/keywords/get/?advertiser_id=%d&ad_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.AdId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// KeywordUpdateInfo 关键词更新信息
type KeywordUpdateInfo struct {
	Word      string  `json:"word"`                // 关键词
	MatchType string  `json:"match_type"`          // 匹配类型
	Status    string  `json:"status,omitempty"`    // 状态
	BidAmount float64 `json:"bid_amount,omitempty"` // 出价（单位：元）
}

// KeywordsUpdateReq 更新关键词-请求
type KeywordsUpdateReq struct {
	AdvertiserId int64               `json:"advertiser_id"` // 千川广告主账户id
	AdId         int64               `json:"ad_id"`         // 广告计划id
	Keywords     []KeywordUpdateInfo `json:"keywords"`      // 关键词列表
	AccessToken  string              `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// KeywordsUpdateRes 更新关键词响应
type KeywordsUpdateRes struct {
	QCError
}

// KeywordsUpdate 更新关键词
func (m *Manager) KeywordsUpdate(req KeywordsUpdateReq) (res *KeywordsUpdateRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/ad/keywords/update/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"ad_id":         req.AdId,
		"keywords":      req.Keywords,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// KeywordPackageGetReq 获取词包推荐关键词-请求
type KeywordPackageGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	Name         string `json:"name"`          // 词包名称
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// WordPackage 词包信息
type WordPackage struct {
	Name  string   `json:"name"`  // 词包名称
	Words []string `json:"words"` // 关键词列表
}

// KeywordPackageGetResData 词包响应数据
type KeywordPackageGetResData struct {
	List []WordPackage `json:"list"`
}

// KeywordPackageGetRes 词包响应
type KeywordPackageGetRes struct {
	QCError
	Data KeywordPackageGetResData `json:"data"`
}

// KeywordPackageGet 获取词包推荐关键词
func (m *Manager) KeywordPackageGet(req KeywordPackageGetReq) (res *KeywordPackageGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/ad/keywords/package/?advertiser_id=%d&name=%s",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId, req.Name)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// RecommendKeywordsGetReq 获取系统推荐的搜索关键词-请求
type RecommendKeywordsGetReq struct {
	AdvertiserId int64    `json:"advertiser_id"`        // 千川广告主账户id
	AdId         int64    `json:"ad_id,omitempty"`      // 广告计划id（可选）
	QueryWords   []string `json:"query_words"`          // 查询词列表
	Cursor       int64    `json:"cursor,omitempty"`     // 页码游标
	Count        int64    `json:"count,omitempty"`      // 页面大小，默认20
	AccessToken  string   `json:"access_token"`         // 调用/oauth/access_token/生成的token
}

// RecommendKeyword 推荐关键词
type RecommendKeyword struct {
	Word          string  `json:"word"`           // 关键词
	SearchVolume  int64   `json:"search_volume"`  // 搜索量
	Competition   string  `json:"competition"`    // 竞争度：LOW低、MEDIUM中、HIGH高
	SuggestBid    float64 `json:"suggest_bid"`    // 建议出价（单位：元）
	RelevanceRate float64 `json:"relevance_rate"` // 相关度
}

// RecommendKeywordsGetResData 推荐关键词响应数据
type RecommendKeywordsGetResData struct {
	List     []RecommendKeyword `json:"list"`
	PageInfo PageInfo           `json:"page_info"`
}

// RecommendKeywordsGetRes 推荐关键词响应
type RecommendKeywordsGetRes struct {
	QCError
	Data RecommendKeywordsGetResData `json:"data"`
}

// RecommendKeywordsGet 获取系统推荐的搜索关键词
func (m *Manager) RecommendKeywordsGet(req RecommendKeywordsGetReq) (res *RecommendKeywordsGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/ad/keywords/recommend/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"query_words":   req.QueryWords,
	}
	if req.AdId > 0 {
		body["ad_id"] = req.AdId
	}
	if req.Cursor > 0 {
		body["cursor"] = req.Cursor
	}
	if req.Count > 0 {
		body["count"] = req.Count
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// KeywordCheckReq 关键词合规校验-请求
type KeywordCheckReq struct {
	AdvertiserId int64    `json:"advertiser_id"` // 千川广告主账户id
	Keywords     []string `json:"keywords"`      // 关键词列表
	AccessToken  string   `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// KeywordCheckResult 关键词校验结果
type KeywordCheckResult struct {
	Word    string `json:"word"`    // 关键词
	IsValid bool   `json:"is_valid"` // 是否合规
	Reason  string `json:"reason"`  // 不合规原因
}

// KeywordCheckResData 关键词校验响应数据
type KeywordCheckResData struct {
	List []KeywordCheckResult `json:"list"`
}

// KeywordCheckRes 关键词校验响应
type KeywordCheckRes struct {
	QCError
	Data KeywordCheckResData `json:"data"`
}

// KeywordCheck 关键词合规校验
func (m *Manager) KeywordCheck(req KeywordCheckReq) (res *KeywordCheckRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/ad/keywords/check/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"keywords":      req.Keywords,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// PrivatewordsGetReq 获取否定词列表-请求
type PrivatewordsGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// PrivateWords 否定词信息
type PrivateWords struct {
	PhraseWords     []string `json:"phrase_words"`     // 精确否定词
	ExtensiveWords  []string `json:"extensive_words"`  // 广泛否定词
}

// PrivatewordsGetResData 否定词响应数据
type PrivatewordsGetResData struct {
	PrivateWords PrivateWords `json:"private_words"`
}

// PrivatewordsGetRes 否定词响应
type PrivatewordsGetRes struct {
	QCError
	Data PrivatewordsGetResData `json:"data"`
}

// PrivatewordsGet 获取否定词列表
func (m *Manager) PrivatewordsGet(req PrivatewordsGetReq) (res *PrivatewordsGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/ad/privatewords/get/?advertiser_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// PrivatewordsUpdateReq 全量更新否定词-请求
type PrivatewordsUpdateReq struct {
	AdvertiserId   int64    `json:"advertiser_id"`    // 千川广告主账户id
	PhraseWords    []string `json:"phrase_words"`     // 精确否定词列表
	ExtensiveWords []string `json:"extensive_words"`  // 广泛否定词列表
	AccessToken    string   `json:"access_token"`     // 调用/oauth/access_token/生成的token
}

// PrivatewordsUpdateRes 更新否定词响应
type PrivatewordsUpdateRes struct {
	QCError
}

// PrivatewordsUpdate 全量更新否定词
func (m *Manager) PrivatewordsUpdate(req PrivatewordsUpdateReq) (res *PrivatewordsUpdateRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/ad/privatewords/update/", conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id":   req.AdvertiserId,
		"phrase_words":    req.PhraseWords,
		"extensive_words": req.ExtensiveWords,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}
