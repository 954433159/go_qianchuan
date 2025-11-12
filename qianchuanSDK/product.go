// 商品管理相关API - 品牌和店铺管理
// 注意：商品列表API已在ad_other.go中实现

package qianchuanSDK

import (
	"context"
	"fmt"
	"github.com/CriarBrand/qianchuanSDK/conf"
	"net/http"
)

// BrandAuthorizedGetReq 获取广告主绑定的品牌列表-请求
type BrandAuthorizedGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// BrandInfo 品牌信息
type BrandInfo struct {
	BrandId   int64  `json:"brand_id"`   // 品牌ID
	BrandName string `json:"brand_name"` // 品牌名称
	BrandLogo string `json:"brand_logo"` // 品牌Logo
}

// BrandAuthorizedGetResData 品牌列表响应数据
type BrandAuthorizedGetResData struct {
	List []BrandInfo `json:"list"`
}

// BrandAuthorizedGetRes 品牌列表响应
type BrandAuthorizedGetRes struct {
	QCError
	Data BrandAuthorizedGetResData `json:"data"`
}

// BrandAuthorizedGet 获取广告主绑定的品牌列表
func (m *Manager) BrandAuthorizedGet(req BrandAuthorizedGetReq) (res *BrandAuthorizedGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/brand/authorized/get/?advertiser_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// ShopAuthorizedGetReq 获取广告主绑定的店铺列表-请求
type ShopAuthorizedGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// ShopInfo 店铺信息
type ShopInfo struct {
	ShopId   int64  `json:"shop_id"`   // 店铺ID
	ShopName string `json:"shop_name"` // 店铺名称
	ShopLogo string `json:"shop_logo"` // 店铺Logo
	ShopType string `json:"shop_type"` // 店铺类型
}

// ShopAuthorizedGetResData 店铺列表响应数据
type ShopAuthorizedGetResData struct {
	List []ShopInfo `json:"list"`
}

// ShopAuthorizedGetRes 店铺列表响应
type ShopAuthorizedGetRes struct {
	QCError
	Data ShopAuthorizedGetResData `json:"data"`
}

// ShopAuthorizedGet 获取广告主绑定的店铺列表
func (m *Manager) ShopAuthorizedGet(req ShopAuthorizedGetReq) (res *ShopAuthorizedGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/shop/authorized/get/?advertiser_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}
