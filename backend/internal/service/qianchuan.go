package service

import (
	"github.com/CriarBrand/qianchuanSDK"
)

// QianchuanService 千川服务
type QianchuanService struct {
	Manager *qianchuanSDK.Manager
}

// NewQianchuanService 创建千川服务
func NewQianchuanService(manager *qianchuanSDK.Manager) *QianchuanService {
	return &QianchuanService{
		Manager: manager,
	}
}

// 可以在这里添加业务逻辑封装
// 例如：数据转换、错误处理、日志记录等
