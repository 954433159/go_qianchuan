// DMP人群管理相关API
// 数据管理平台(DMP)人群包的创建、查询、推送和删除

package qianchuanSDK

import (
	"context"
	"fmt"
	"github.com/CriarBrand/qianchuanSDK/conf"
	"net/http"
)

// AudiencesGetReq 查询人群包列表-请求
type AudiencesGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	Page         int64  `json:"page,omitempty"`      // 页码，默认1
	PageSize     int64  `json:"page_size,omitempty"` // 页面大小，默认10
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AudienceInfo 人群包信息
type AudienceInfo struct {
	AudienceId     int64  `json:"audience_id"`     // 人群包ID
	AudienceName   string `json:"audience_name"`   // 人群包名称
	Status         string `json:"status"`          // 状态：INVALID无效、VALID有效、CALCULATING计算中
	CoverNum       int64  `json:"cover_num"`       // 覆盖人数
	ExpireTime     string `json:"expire_time"`     // 过期时间
	CreateTime     string `json:"create_time"`     // 创建时间
	ModifyTime     string `json:"modify_time"`     // 修改时间
	AudienceType   string `json:"audience_type"`   // 类型：UPLOAD上传、RULE规则
	DeliveryStatus string `json:"delivery_status"` // 投放状态：DELIVERABLE可投放、UNDELIVERABLE不可投放
}

// AudiencesGetResData 人群包列表响应数据
type AudiencesGetResData struct {
	List     []AudienceInfo `json:"list"`
	PageInfo PageInfo       `json:"page_info"`
}

// AudiencesGetRes 人群包列表响应
type AudiencesGetRes struct {
	QCError
	Data AudiencesGetResData `json:"data"`
}

// AudiencesGet 查询人群包列表
func (m *Manager) AudiencesGet(req AudiencesGetReq) (res *AudiencesGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s%s?advertiser_id=%d", conf.API_HTTP_SCHEME, conf.API_HOST, conf.API_DMP_AUDIENCES_GET, req.AdvertiserId)
	if req.Page > 0 {
		reqUrl += fmt.Sprintf("&page=%d", req.Page)
	}
	if req.PageSize > 0 {
		reqUrl += fmt.Sprintf("&page_size=%d", req.PageSize)
	}

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// OrientationPackageGetReq 获取定向包列表-请求
type OrientationPackageGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"`       // 千川广告主账户id
	Cursor       int64  `json:"cursor,omitempty"`    // 页码游标
	Count        int64  `json:"count,omitempty"`     // 页面大小
	AccessToken  string `json:"access_token"`        // 调用/oauth/access_token/生成的token
}

// OrientationPackage 定向包信息
type OrientationPackage struct {
	PackageId   int64  `json:"package_id"`   // 定向包ID
	PackageName string `json:"package_name"` // 定向包名称
	Status      string `json:"status"`       // 状态
	CreateTime  string `json:"create_time"`  // 创建时间
	ModifyTime  string `json:"modify_time"`  // 修改时间
}

// OrientationPackageGetResData 定向包列表响应数据
type OrientationPackageGetResData struct {
	List     []OrientationPackage `json:"list"`
	PageInfo PageInfo             `json:"page_info"`
}

// OrientationPackageGetRes 定向包列表响应
type OrientationPackageGetRes struct {
	QCError
	Data OrientationPackageGetResData `json:"data"`
}

// OrientationPackageGet 获取定向包列表
func (m *Manager) OrientationPackageGet(req OrientationPackageGetReq) (res *OrientationPackageGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/dmp/orientation_package/get/?advertiser_id=%d",
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

// AudienceListGetReq 获取人群管理列表-请求
type AudienceListGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"`       // 千川广告主账户id
	Cursor       int64  `json:"cursor,omitempty"`    // 页码游标
	Count        int64  `json:"count,omitempty"`     // 页面大小
	AccessToken  string `json:"access_token"`        // 调用/oauth/access_token/生成的token
}

// AudienceDetail 人群详情
type AudienceDetail struct {
	AudienceId   int64  `json:"audience_id"`   // 人群ID
	AudienceName string `json:"audience_name"` // 人群名称
	CoverNum     int64  `json:"cover_num"`     // 覆盖人数
	Status       string `json:"status"`        // 状态
	ExpireTime   string `json:"expire_time"`   // 过期时间
	CreateTime   string `json:"create_time"`   // 创建时间
}

// AudienceListGetResData 人群列表响应数据
type AudienceListGetResData struct {
	List     []AudienceDetail `json:"list"`
	PageInfo PageInfo         `json:"page_info"`
}

// AudienceListGetRes 人群列表响应
type AudienceListGetRes struct {
	QCError
	Data AudienceListGetResData `json:"data"`
}

// AudienceListGet 获取人群管理列表
func (m *Manager) AudienceListGet(req AudienceListGetReq) (res *AudienceListGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/dmp/audience/list/get/?advertiser_id=%d",
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

// AudienceGroupGetReq 获取人群分组-请求
type AudienceGroupGetReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AudienceGroupGetResData 人群分组响应数据
type AudienceGroupGetResData struct {
	GroupNames []string `json:"group_names"` // 分组名称列表
}

// AudienceGroupGetRes 人群分组响应
type AudienceGroupGetRes struct {
	QCError
	Data AudienceGroupGetResData `json:"data"`
}

// AudienceGroupGet 获取人群分组
func (m *Manager) AudienceGroupGet(req AudienceGroupGetReq) (res *AudienceGroupGetRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/dmp/audience/group/get/?advertiser_id=%d",
		conf.API_HTTP_SCHEME, conf.API_HOST, req.AdvertiserId)

	err = m.client.CallWithJson(context.Background(), &res, "GET", reqUrl, header, nil)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AudienceCreateByFileReq 上传人群-请求
type AudienceCreateByFileReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AudienceName string `json:"audience_name"` // 人群包名称
	DataPath     string `json:"data_path"`     // 文件路径
	DataType     string `json:"data_type"`     // 数据类型：IMEI、IDFA、OAID等
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AudienceCreateByFileResData 创建人群响应数据
type AudienceCreateByFileResData struct {
	AudienceId int64 `json:"audience_id"` // 人群包ID
}

// AudienceCreateByFileRes 创建人群响应
type AudienceCreateByFileRes struct {
	QCError
	Data AudienceCreateByFileResData `json:"data"`
}

// AudienceCreateByFile 上传人群
func (m *Manager) AudienceCreateByFile(req AudienceCreateByFileReq) (res *AudienceCreateByFileRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/dmp/audience/create_by_file/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"audience_name": req.AudienceName,
		"data_path":     req.DataPath,
		"data_type":     req.DataType,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AudiencePushReq 推送人群-请求
type AudiencePushReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AudienceId   int64  `json:"audience_id"`   // 人群包ID
	TargetIds    []int64 `json:"target_ids"`   // 目标广告主ID列表
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AudiencePushResData 推送人群响应数据
type AudiencePushResData struct {
	TaskId int64 `json:"task_id"` // 任务ID
}

// AudiencePushRes 推送人群响应
type AudiencePushRes struct {
	QCError
	Data AudiencePushResData `json:"data"`
}

// AudiencePush 推送人群
func (m *Manager) AudiencePush(req AudiencePushReq) (res *AudiencePushRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/dmp/audience/push/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"audience_id":   req.AudienceId,
		"target_ids":    req.TargetIds,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AudienceDeleteReq 删除人群-请求
type AudienceDeleteReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	AudienceId   int64  `json:"audience_id"`   // 人群包ID
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AudienceDeleteRes 删除人群响应
type AudienceDeleteRes struct {
	QCError
}

// AudienceDelete 删除人群
func (m *Manager) AudienceDelete(req AudienceDeleteReq) (res *AudienceDeleteRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/dmp/audience/delete/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"audience_id":   req.AudienceId,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}

// ---------------------------------------------------------------------------------------------------------------------

// AudienceFileUploadReq 小文件直接上传-请求
type AudienceFileUploadReq struct {
	AdvertiserId int64  `json:"advertiser_id"` // 千川广告主账户id
	FileName     string `json:"file_name"`     // 文件名
	FileContent  string `json:"file_content"`  // 文件内容(base64)
	AccessToken  string `json:"access_token"`  // 调用/oauth/access_token/生成的token
}

// AudienceFileUploadResData 文件上传响应数据
type AudienceFileUploadResData struct {
	FilePath string `json:"file_path"` // 文件路径
}

// AudienceFileUploadRes 文件上传响应
type AudienceFileUploadRes struct {
	QCError
	Data AudienceFileUploadResData `json:"data"`
}

// AudienceFileUpload 小文件直接上传
func (m *Manager) AudienceFileUpload(req AudienceFileUploadReq) (res *AudienceFileUploadRes, err error) {
	header := http.Header{}
	header.Add("Access-Token", req.AccessToken)

	reqUrl := fmt.Sprintf("%s%s/open_api/v1.0/qianchuan/dmp/audience/file/upload/",
		conf.API_HTTP_SCHEME, conf.API_HOST)

	body := map[string]interface{}{
		"advertiser_id": req.AdvertiserId,
		"file_name":     req.FileName,
		"file_content":  req.FileContent,
	}

	err = m.client.CallWithJson(context.Background(), &res, "POST", reqUrl, header, body)
	return res, err
}
