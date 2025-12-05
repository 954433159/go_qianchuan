package handler

import (
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// FileHandler 文件处理器
type FileHandler struct {
	service *service.QianchuanService
}

// NewFileHandler 创建文件处理器
func NewFileHandler(service *service.QianchuanService) *FileHandler {
	return &FileHandler{
		service: service,
	}
}

// UploadImage 上传图片
func (h *FileHandler) UploadImage(c *gin.Context) {
	// 获取Session
	sess := sessions.Default(c)
	sessionData := sess.Get("user")
	if sessionData == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "会话数据格式错误",
		})
		return
	}

	// 从表单获取上传类型
	uploadType := c.PostForm("upload_type")
	if uploadType == "" {
		uploadType = "UPLOAD_BY_FILE"
	}

	var reqBody sdk.FileImageAdReqBody
	reqBody.AdvertiserId = userSession.AdvertiserID
	reqBody.UploadType = uploadType

	if uploadType == "UPLOAD_BY_URL" {
		// URL上传
		imageUrl := c.PostForm("image_url")
		if imageUrl == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "缺少图片URL",
			})
			return
		}
		reqBody.ImageUrl = imageUrl
		reqBody.ImageSignature = c.PostForm("image_signature")
	} else {
		// 文件上传
		file, header, err := c.Request.FormFile("image_file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "获取上传文件失败: " + err.Error(),
			})
			return
		}
		defer file.Close()

		// 读取文件内容到[]byte
		fileBytes, err := io.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code":    500,
				"message": "读取文件内容失败: " + err.Error(),
			})
			return
		}

		reqBody.ImageFile = fileBytes
		reqBody.Filename = header.Filename
		reqBody.ImageSignature = c.PostForm("image_signature")
	}

	// 调用SDK
	resp, err := h.service.Client.FileImageAd(c.Request.Context(), sdk.FileImageAdReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Upload image failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "上传图片失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "上传成功",
		"data":    resp.Data,
	})
}

// UploadVideo 上传视频
func (h *FileHandler) UploadVideo(c *gin.Context) {
	// 获取Session
	sess := sessions.Default(c)
	sessionData := sess.Get("user")
	if sessionData == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "会话数据格式错误",
		})
		return
	}

	// 获取上传的文件
	file, header, err := c.Request.FormFile("video_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "获取上传文件失败: " + err.Error(),
		})
		return
	}
	defer file.Close()

	// 读取文件内容到[]byte
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "读取文件内容失败: " + err.Error(),
		})
		return
	}

	reqBody := sdk.FileVideoAdReqBody{
		AdvertiserId:   userSession.AdvertiserID,
		VideoFile:      fileBytes,
		Filename:       header.Filename,
		VideoSignature: c.PostForm("video_signature"),
	}

	// 调用SDK
	resp, err := h.service.Client.FileVideoAd(c.Request.Context(), sdk.FileVideoAdReq{
		AccessToken: userSession.AccessToken,
		Body:        reqBody,
	})

	if err != nil {
		log.Printf("Upload video failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "上传视频失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "上传成功",
		"data":    resp.Data,
	})
}

// GetImageList 获取图片列表
func (h *FileHandler) GetImageList(c *gin.Context) {
	// 获取Session
	sess := sessions.Default(c)
	sessionData := sess.Get("user")
	if sessionData == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "会话数据格式错误",
		})
		return
	}

	// 解析分页参数
	pageStr := c.Query("page")
	pageSizeStr := c.Query("page_size")

	page, _ := strconv.ParseInt(pageStr, 10, 64)
	pageSize, _ := strconv.ParseInt(pageSizeStr, 10, 64)

	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}

	// 调用SDK
	resp, err := h.service.Client.FileImageGet(c.Request.Context(), sdk.FileImageGetReq{
		AdvertiserId: userSession.AdvertiserID,
		AccessToken:  userSession.AccessToken,
		Page:         page,
		PageSize:     pageSize,
		Filtering:    nil,
	})

	if err != nil {
		log.Printf("Get image list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取图片列表失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data,
	})
}

// GetVideoList 获取视频列表
func (h *FileHandler) GetVideoList(c *gin.Context) {
	// 获取Session
	sess := sessions.Default(c)
	sessionData := sess.Get("user")
	if sessionData == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	userSession, ok := sessionData.(*session.UserSession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "会话数据格式错误",
		})
		return
	}

	// 解析分页参数
	pageStr := c.Query("page")
	pageSizeStr := c.Query("page_size")

	page, _ := strconv.ParseInt(pageStr, 10, 64)
	pageSize, _ := strconv.ParseInt(pageSizeStr, 10, 64)

	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}

	// 调用SDK
	resp, err := h.service.Client.FileVideoGet(c.Request.Context(), sdk.FileVideoGetReq{
		AdvertiserId: userSession.AdvertiserID,
		AccessToken:  userSession.AccessToken,
		Page:         page,
		PageSize:     pageSize,
		Filtering:    nil,
	})

	if err != nil {
		log.Printf("Get video list failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取视频列表失败: " + err.Error(),
		})
		return
	}

	if resp.Code != 0 {
		c.JSON(http.StatusOK, gin.H{
			"code":    resp.Code,
			"message": resp.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    resp.Data,
	})
}

// GetMaterialTitleList 获取程序化创意标题推荐
// 注意: 此功能需要SDK支持FileMaterialGet方法
func (h *FileHandler) GetMaterialTitleList(c *gin.Context) {
	sess := sessions.Default(c)
	sessionData := sess.Get("user")
	if sessionData == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "未登录",
		})
		return
	}

	_, ok := sessionData.(*session.UserSession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "会话数据格式错误",
		})
		return
	}

	// SDK暂不支持程序化创意标题推荐
	// 需要等待SDK更新
	c.JSON(http.StatusNotImplemented, gin.H{
		"code":    501,
		"message": "AI标题推荐功能暂未实现，SDK待支持",
		"hint":    "请自己编写创意标题或等待SDK更新",
	})
}
