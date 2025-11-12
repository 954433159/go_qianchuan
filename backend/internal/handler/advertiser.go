package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuanSDK"
	"github.com/gin-gonic/gin"
)

// AdvertiserHandler 广告主处理器
type AdvertiserHandler struct {
	service *service.QianchuanService
}

// NewAdvertiserHandler 创建广告主处理器
func NewAdvertiserHandler(service *service.QianchuanService) *AdvertiserHandler {
	return &AdvertiserHandler{
		service: service,
	}
}

// List 获取广告主列表
func (h *AdvertiserHandler) List(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)

	resp, err := h.service.Manager.AdvertiserList(qianchuanSDK.AdvertiserListReq{
		AccessToken: userSession.AccessToken,
		AppId:       h.service.Manager.Credentials.AppId,
		Secret:      h.service.Manager.Credentials.AppSecret,
	})

	if err != nil {
		log.Printf("Get advertiser list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告主列表失败: " + err.Error(),
		})
		return
	}

	// 提取所有 advertiser_id
	ids := make([]int64, 0, len(resp.Data.List))
	for _, item := range resp.Data.List {
		ids = append(ids, item.AdvertiserId)
	}

	// 批量获取详细信息
	infoResp, err := h.service.Manager.AdvertiserInfo(qianchuanSDK.AdvertiserInfoReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserIds: ids,
		Fields:        []string{"id", "name", "company", "role", "status", "first_industry_name", "second_industry_name", "create_time"},
	})

	if err != nil {
		log.Printf("Get advertiser info failed: %v", err)
		// 如果获取详细信息失败，使用基本信息
		list := make([]gin.H, 0, len(resp.Data.List))
		for _, item := range resp.Data.List {
			status := "DISABLE"
			if item.IsValid {
				status = "ENABLE"
			}
			list = append(list, gin.H{
				"id":          item.AdvertiserId,
				"name":        item.AdvertiserName,
				"company":     "",
				"role":        item.AccountRole,
				"status":      status,
				"balance":     0,
				"create_time": "",
			})
		}
		c.JSON(http.StatusOK, gin.H{
			"code":    0,
			"message": "success",
			"data": gin.H{
				"list": list,
			},
		})
		return
	}

	// 使用详细信息
	list := make([]gin.H, 0, len(infoResp.Data))
	for _, info := range infoResp.Data {
		list = append(list, gin.H{
			"id":          info.ID,
			"name":        info.Name,
			"company":     info.Company,
			"role":        info.Role,
			"status":      info.Status,
			"balance":     0, // SDK 不提供余额字段
			"create_time": info.CreateTime,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"list": list,
		},
	})
}

// Info 获取广告主详情
func (h *AdvertiserHandler) Info(c *gin.Context) {
	userSession, _ := middleware.GetUserSession(c)
	advertiserId, _ := strconv.ParseInt(c.Query("advertiser_id"), 10, 64)

	if advertiserId == 0 {
		advertiserId = userSession.AdvertiserID
	}

	resp, err := h.service.Manager.AdvertiserInfo(qianchuanSDK.AdvertiserInfoReq{
		AccessToken:   userSession.AccessToken,
		AdvertiserIds: []int64{advertiserId},
		Fields:        []string{"id", "name", "company", "first_industry_name", "second_industry_name"},
	})

	if err != nil {
		log.Printf("Get advertiser info failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取广告主详情失败: " + err.Error(),
		})
		return
	}

	var data interface{}
	if len(resp.Data) > 0 {
		data = resp.Data[0]
	} else {
		data = nil
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    data,
	})
}
