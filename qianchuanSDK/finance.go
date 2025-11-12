// 资金管理相关API
// 包括钱包查询、余额查询、流水查询、转账等功能

package qianchuanSDK

import (
	"context"
	"fmt"
	"github.com/CriarBrand/qianchuanSDK/conf"
	"net/http"
)

// WalletGetReq 获取账户钱包信息-请求
type WalletGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// WalletInfo 钱包信息
type WalletInfo struct {
	AdvertiserId    int64   `json:"advertiser_id"`     // 广告主ID
	WalletBalance   float64 `json:"wallet_balance"`    // 钱包余额
	CashBalance     float64 `json:"cash_balance"`      // 现金余额
	GrantBalance    float64 `json:"grant_balance"`     // 赠款余额
	ValidBalance    float64 `json:"valid_balance"`     // 可用余额
	FrozenBalance   float64 `json:"frozen_balance"`    // 冻结余额
	UnfrozenBalance float64 `json:"unfrozen_balance"`  // 待解冻余额
}

// WalletGetResData 钱包信息响应数据
type WalletGetResData struct {
	Wallet WalletInfo `json:"wallet"`
}

// WalletGetRes 钱包信息响应
type WalletGetRes struct {
	QCError
	Data WalletGetResData `json:"data"`
}

// WalletGet 获取账户钱包信息
func (m *Manager) WalletGet(req WalletGetReq) (res *WalletGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/finance/wallet/get/?advertiser_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// BalanceGetReq 获取账户余额-请求
type BalanceGetReq struct {
	AdvertiserIds []int64 `json:"advertiser_ids"` // 广告主ID列表
	AccessToken   string  `json:"access_token"`   // 调用/oauth/access_token/生成的token
}

// BalanceInfo 余额信息
type BalanceInfo struct {
	AdvertiserId int64   `json:"advertiser_id"` // 广告主ID
	Balance      float64 `json:"balance"`       // 账户余额
	Cash         float64 `json:"cash"`          // 现金余额
	Grant        float64 `json:"grant"`         // 赠款余额
}

// BalanceGetResData 余额响应数据
type BalanceGetResData struct {
	List []BalanceInfo `json:"list"`
}

// BalanceGetRes 余额响应
type BalanceGetRes struct {
	QCError
	Data BalanceGetResData `json:"data"`
}

// BalanceGet 获取账户余额
func (m *Manager) BalanceGet(req BalanceGetReq) (res *BalanceGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/finance/balance/get/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_ids": req.AdvertiserIds,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// DetailGetReq 获取财务流水信息-请求
type DetailGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"`        // 千川广告主账户id
	StartDate    string `json:"start_date"`           // 开始日期
	EndDate      string `json:"end_date"`             // 结束日期
	TradeType    string `json:"trade_type,omitempty"` // 交易类型
	Page         int64  `json:"page,omitempty"`       // 页码
	PageSize     int64  `json:"page_size,omitempty"`  // 页面大小
	AccessToken  string `json:"access_token"`         // 调用/oauth/access_token/生成的token
}

// TradeDetail 交易流水详情
type TradeDetail struct {
	TradeId      string  `json:"trade_id"`      // 交易ID
	TradeType    string  `json:"trade_type"`    // 交易类型
	TradeTime    string  `json:"trade_time"`    // 交易时间
	Amount       float64 `json:"amount"`        // 交易金额
	Balance      float64 `json:"balance"`       // 余额
	CashAmount   float64 `json:"cash_amount"`   // 现金金额
	GrantAmount  float64 `json:"grant_amount"`  // 赠款金额
	Description  string  `json:"description"`   // 描述
}

// DetailGetResData 流水响应数据
type DetailGetResData struct {
	List     []TradeDetail `json:"list"`
	PageInfo PageInfo      `json:"page_info"`
}

// DetailGetRes 流水响应
type DetailGetRes struct {
	QCError
	Data DetailGetResData `json:"data"`
}

// DetailGet 获取财务流水信息
func (m *Manager) DetailGet(req DetailGetReq) (res *DetailGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/finance/detail/get/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"start_date":    req.StartDate,
		"end_date":      req.EndDate,
	}
	if req.TradeType != "" {
		body["trade_type"] = req.TradeType
	}
	if req.Page > 0 {
		body["page"] = req.Page
	}
	if req.PageSize > 0 {
		body["page_size"] = req.PageSize
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// FundTransferSeqCreateReq 创建转账交易号-请求
type FundTransferSeqCreateReq struct {
	AgentId       int64   `json:"agent_id"`        // 代理商ID
	AdvertiserId  int64   `json:"advertiser_id"`   // 广告主ID
	TransferAmount float64 `json:"transfer_amount"` // 转账金额
	AccessToken   string  `json:"access_token"`    // 调用/oauth/access_token/生成的token
}

// FundTransferSeqCreateResData 创建交易号响应数据
type FundTransferSeqCreateResData struct {
	TransferSeq string `json:"transfer_seq"` // 交易号
}

// FundTransferSeqCreateRes 创建交易号响应
type FundTransferSeqCreateRes struct {
	QCError
	Data FundTransferSeqCreateResData `json:"data"`
}

// FundTransferSeqCreate 创建转账交易号（方舟）
func (m *Manager) FundTransferSeqCreate(req FundTransferSeqCreateReq) (res *FundTransferSeqCreateRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/finance/transfer/seq/create/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"agent_id":        req.AgentId,
		"advertiser_id":   req.AdvertiserId,
		"transfer_amount": req.TransferAmount,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// FundTransferSeqCommitReq 提交转账交易号-请求
type FundTransferSeqCommitReq struct {
	AgentId      int64  `json:"agent_id"`       // 代理商ID
	TransferSeq  string `json:"transfer_seq"`   // 交易号
	AccessToken  string `json:"access_token"`   // 调用/oauth/access_token/生成的token
}

// FundTransferSeqCommitRes 提交交易号响应
type FundTransferSeqCommitRes struct {
	QCError
}

// FundTransferSeqCommit 提交转账交易号（方舟）
func (m *Manager) FundTransferSeqCommit(req FundTransferSeqCommitReq) (res *FundTransferSeqCommitRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/finance/transfer/seq/commit/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"agent_id":     req.AgentId,
		"transfer_seq": req.TransferSeq,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// RefundTransferSeqCreateReq 创建退款交易号-请求
type RefundTransferSeqCreateReq struct {
	AgentId       int64   `json:"agent_id"`        // 代理商ID
	AdvertiserId  int64   `json:"advertiser_id"`   // 广告主ID
	RefundAmount  float64 `json:"refund_amount"`   // 退款金额
	AccessToken   string  `json:"access_token"`    // 调用/oauth/access_token/生成的token
}

// RefundTransferSeqCreateResData 创建退款交易号响应数据
type RefundTransferSeqCreateResData struct {
	RefundSeq string `json:"refund_seq"` // 退款交易号
}

// RefundTransferSeqCreateRes 创建退款交易号响应
type RefundTransferSeqCreateRes struct {
	QCError
	Data RefundTransferSeqCreateResData `json:"data"`
}

// RefundTransferSeqCreate 创建退款交易号（方舟）
func (m *Manager) RefundTransferSeqCreate(req RefundTransferSeqCreateReq) (res *RefundTransferSeqCreateRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/finance/refund/seq/create/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"agent_id":       req.AgentId,
		"advertiser_id":  req.AdvertiserId,
		"refund_amount":  req.RefundAmount,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// RefundTransferSeqCommitReq 提交退款交易号-请求
type RefundTransferSeqCommitReq struct {
	AgentId     int64  `json:"agent_id"`     // 代理商ID
	RefundSeq   string `json:"refund_seq"`   // 退款交易号
	AccessToken string `json:"access_token"` // 调用/oauth/access_token/生成的token
}

// RefundTransferSeqCommitRes 提交退款交易号响应
type RefundTransferSeqCommitRes struct {
	QCError
}

// RefundTransferSeqCommit 提交退款交易号（方舟）
func (m *Manager) RefundTransferSeqCommit(req RefundTransferSeqCommitReq) (res *RefundTransferSeqCommitRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/finance/refund/seq/commit/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"agent_id":   req.AgentId,
		"refund_seq": req.RefundSeq,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}
