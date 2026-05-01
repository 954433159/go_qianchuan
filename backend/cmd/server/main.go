package main

import (
	"encoding/gob"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/CriarBrand/qianchuan-backend/internal/handler"
	"github.com/CriarBrand/qianchuan-backend/internal/middleware"
	"github.com/CriarBrand/qianchuan-backend/internal/sdk"
	"github.com/CriarBrand/qianchuan-backend/internal/service"
	"github.com/CriarBrand/qianchuan-backend/pkg/session"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("[WARN] .env file not found, using environment variables")
	}

	appID := mustParseInt64(getEnv("APP_ID", "0"))
	appSecret := getEnv("APP_SECRET", "")
	port := getEnv("PORT", "8080")
	ginMode := getEnv("GIN_MODE", "debug")
	_ = os.Getenv("CORS_ORIGIN") // used by middleware.CORS() directly
	cookieSecret := getEnv("COOKIE_SECRET", "change-me-32-byte-secret-key!!")
	sessionName := getEnv("SESSION_NAME", "qianchuan_session")
	cookieDomain := getEnv("COOKIE_DOMAIN", "localhost")
	cookieSecure := getEnv("COOKIE_SECURE", "false") == "true"

	gob.Register(&session.UserSession{})

	gin.SetMode(ginMode)

	oceanClient := sdk.NewOceanengineClient(appID, appSecret)
	qianchuanService := service.NewQianchuanService(oceanClient, appID, appSecret)

	authHandler := handler.NewAuthHandler(qianchuanService)
	adHandler := handler.NewAdHandler(qianchuanService)
	advertiserHandler := handler.NewAdvertiserHandler(qianchuanService)
	campaignHandler := handler.NewCampaignHandler(qianchuanService)
	creativeHandler := handler.NewCreativeHandler(qianchuanService)
	reportHandler := handler.NewReportHandler(qianchuanService)
	financeHandler := handler.NewFinanceHandler(qianchuanService)
	toolsHandler := handler.NewToolsHandler(qianchuanService)
	awemeHandler := handler.NewAwemeHandler(qianchuanService)
	liveHandler := handler.NewLiveHandler(qianchuanService)
	keywordHandler := handler.NewKeywordHandler(qianchuanService)
	fileHandler := handler.NewFileHandler(qianchuanService)
	uniPromotionHandler := handler.NewUniPromotionHandler(qianchuanService)
	dashboardHandler := handler.NewDashboardHandler(qianchuanService)
	diagnoseHandler := handler.NewDiagnoseHandler(qianchuanService)
	activityHandler := handler.NewActivityHandler()
	webhookHandler := handler.NewWebhookHandler()

	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())
	r.Use(middleware.Trace())

	store := cookie.NewStore([]byte(cookieSecret))
	store.Options(sessions.Options{
		Path:     "/",
		Domain:   cookieDomain,
		MaxAge:   86400,
		Secure:   cookieSecure,
		HttpOnly: true,
		SameSite: 3, // lax
	})
	r.Use(sessions.Sessions(sessionName, store))

	r.Use(middleware.AutoRefreshToken(qianchuanService))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "version": "1.0.0"})
	})

	api := r.Group("/api")

	{
		api.POST("/oauth/exchange", authHandler.OAuthExchange)
		api.POST("/auth/logout", authHandler.Logout)
		api.GET("/user/info", authHandler.GetUserInfo)
		api.POST("/auth/refresh", authHandler.RefreshSession)
	}

	api.GET("/webhook/event", webhookHandler.HandleChallenge)
	api.POST("/webhook/event", webhookHandler.HandleWebhookEvent)

	apiAuth := api.Group("")
	apiAuth.Use(middleware.AuthRequired())
	apiAuth.Use(middleware.CSRFProtection())

	{
		a := apiAuth.Group("/qianchuan/advertiser")
		a.GET("/list", advertiserHandler.List)
		a.GET("/info", advertiserHandler.Info)
		a.PUT("/update", advertiserHandler.Update)
		a.GET("/budget", advertiserHandler.GetBudget)
		a.PUT("/budget", advertiserHandler.UpdateBudget)
		a.GET("/aweme/authorized", advertiserHandler.GetAuthorizedAwemeList)
		a.GET("/aweme/auth_list", advertiserHandler.GetAwemeAuthList)
		a.GET("/shop", advertiserHandler.GetShopAdvertiserList)
		a.GET("/agent", advertiserHandler.GetAgentAdvertiserList)
		a.GET("/lookup_batch", advertiserHandler.LookupBatch)
	}

	{
		c := apiAuth.Group("/qianchuan/campaign")
		c.GET("/list", campaignHandler.List)
		c.GET("/get", campaignHandler.Get)
		c.POST("/create", campaignHandler.Create)
		c.PUT("/update", campaignHandler.Update)
		c.PUT("/status", campaignHandler.UpdateStatus)
	}

	{
		ad := apiAuth.Group("/qianchuan/ad")
		ad.GET("/list", adHandler.List)
		ad.GET("/get", adHandler.Get)
		ad.POST("/create", adHandler.Create)
		ad.PUT("/update", adHandler.Update)
		ad.PUT("/status", adHandler.UpdateStatus)
		ad.PUT("/budget", adHandler.UpdateBudget)
		ad.PUT("/bid", adHandler.UpdateBid)
		ad.PUT("/region", adHandler.UpdateRegion)
		ad.PUT("/schedule/date", adHandler.UpdateScheduleDate)
		ad.PUT("/schedule/time", adHandler.UpdateScheduleTime)
		ad.PUT("/schedule/fixed_range", adHandler.UpdateScheduleFixedRange)
		ad.GET("/low_quality", adHandler.GetLowQualityAds)
		ad.GET("/suggest_bid", adHandler.SuggestBid)
		ad.GET("/suggest_budget", adHandler.SuggestBudget)
		ad.GET("/suggest_roi", adHandler.SuggestRoiGoal)
		ad.POST("/estimate", adHandler.EstimateEffect)
		ad.POST("/reject_reason", adHandler.RejectReason)
		ad.GET("/compensate_status", adHandler.GetCompensateStatus)
		ad.GET("/learning_status", adHandler.GetLearningStatus)
		ad.PUT("/roi_goal", adHandler.RoiGoalUpdate)
	}

	{
		cr := apiAuth.Group("/qianchuan/creative")
		cr.GET("/list", creativeHandler.List)
		cr.GET("/get", creativeHandler.Get)
		cr.POST("/create", creativeHandler.Create)
		cr.GET("/reject_reason", creativeHandler.RejectReason)
		cr.PUT("/status", creativeHandler.UpdateStatus)
	}

	{
		rpt := apiAuth.Group("/qianchuan/report")
		rpt.GET("/advertiser", reportHandler.GetAdvertiserReport)
		rpt.GET("/campaign", reportHandler.GetCampaignReport)
		rpt.GET("/ad", reportHandler.GetAdReport)
		rpt.GET("/creative", reportHandler.GetCreativeReport)
		rpt.GET("/material", reportHandler.GetMaterialReport)
		rpt.GET("/search_word", reportHandler.GetSearchWordReport)
		rpt.GET("/video_user_lose", reportHandler.GetVideoUserLoseReport)
		rpt.GET("/custom", reportHandler.GetCustomReport)
		rpt.GET("/custom_config", reportHandler.GetCustomReportConfig)
		rpt.POST("/export", reportHandler.ExportReport)
	}

	{
		f := apiAuth.Group("/qianchuan/finance")
		f.GET("/wallet", financeHandler.GetWallet)
		f.GET("/balance", financeHandler.GetBalance)
		f.GET("/detail", financeHandler.GetFinanceDetail)
		f.POST("/transfer/create", financeHandler.CreateTransferSeq)
		f.POST("/transfer/commit", financeHandler.CommitTransferSeq)
		f.POST("/refund/create", financeHandler.CreateRefundSeq)
		f.POST("/refund/commit", financeHandler.CommitRefundSeq)
	}

	{
		t := apiAuth.Group("/qianchuan/tools")
		t.GET("/industry", toolsHandler.GetIndustry)
		t.GET("/interest_category", toolsHandler.GetInterestCategory)
		t.GET("/interest_keyword", toolsHandler.GetInterestKeyword)
		t.GET("/action_category", toolsHandler.GetActionCategory)
		t.GET("/action_keyword", toolsHandler.GetActionKeyword)
		t.GET("/aweme_category", toolsHandler.GetAwemeCategory)
		t.GET("/aweme_author", toolsHandler.GetAwemeAuthorInfo)
		t.GET("/creative_word", toolsHandler.GetCreativeWord)
		t.GET("/audience", toolsHandler.GetAudienceList)
	}

	{
		aw := apiAuth.Group("/qianchuan/aweme")
		aw.GET("/order/list", awemeHandler.GetOrderList)
		aw.GET("/order/detail", awemeHandler.GetOrderDetail)
		aw.POST("/order/create", awemeHandler.CreateOrder)
		aw.POST("/order/terminate", awemeHandler.TerminateOrder)
		aw.GET("/video/list", awemeHandler.GetVideoList)
		aw.POST("/budget/add", awemeHandler.AddBudget)
		aw.GET("/suggest_bid", awemeHandler.GetSuggestBid)
		aw.GET("/estimate", awemeHandler.GetEstimate)
		aw.GET("/quota", awemeHandler.GetQuota)
	}

	{
		l := apiAuth.Group("/qianchuan/live")
		l.GET("/stats", liveHandler.GetLiveStats)
		l.GET("/rooms", liveHandler.GetLiveRooms)
		l.GET("/room/detail", liveHandler.GetLiveRoomDetail)
		l.GET("/room/flow", liveHandler.GetLiveRoomFlowPerformance)
		l.GET("/room/user", liveHandler.GetLiveRoomUserInsight)
		l.GET("/room/products", liveHandler.GetLiveRoomProducts)
	}

	{
		k := apiAuth.Group("/qianchuan/keyword")
		k.GET("/package", keywordHandler.GetKeywordPackage)
		k.GET("/recommend", keywordHandler.GetRecommendKeywords)
		k.POST("/check", keywordHandler.CheckKeywords)
		k.GET("/negative", keywordHandler.GetNegativeKeywords)
		k.PUT("/update", keywordHandler.UpdateKeywords)
		k.GET("/list", keywordHandler.GetKeywords)
		k.PUT("/negative_update", keywordHandler.UpdateNegativeKeywords)
	}

	{
		f := apiAuth.Group("/qianchuan/file")
		f.POST("/image/upload", fileHandler.UploadImage)
		f.POST("/video/upload", fileHandler.UploadVideo)
		f.GET("/image/list", fileHandler.GetImageList)
		f.GET("/video/list", fileHandler.GetVideoList)
	}

	{
		up := apiAuth.Group("/qianchuan/uni_promotion")
		up.GET("/list", uniPromotionHandler.List)
		up.GET("/detail", uniPromotionHandler.GetDetail)
		up.POST("/create", uniPromotionHandler.Create)
		up.PUT("/update", uniPromotionHandler.Update)
		up.PUT("/status", uniPromotionHandler.UpdateStatus)
		up.PUT("/material", uniPromotionHandler.UpdateMaterial)
		up.POST("/auth", uniPromotionHandler.UpdateAuth)
		up.PUT("/budget", uniPromotionHandler.UpdateBudget)
		up.PUT("/roi_goal", uniPromotionHandler.UpdateROIGoal)
		up.PUT("/schedule", uniPromotionHandler.UpdateScheduleTime)
		up.GET("/budget_schedule", uniPromotionHandler.GetBudgetSchedule)
		up.PUT("/budget_schedule", uniPromotionHandler.UpdateBudgetSchedule)
	}

	{
		apiAuth.GET("/qianchuan/activity/list", activityHandler.List)
	}

	{
		d := apiAuth.Group("/dashboard")
		d.GET("/summary", dashboardHandler.Summary)
	}

	{
		diag := apiAuth.Group("/diagnose")
			diag.GET("/ad", diagnoseHandler.DiagnoseAd)
		diag.GET("/account", diagnoseHandler.DiagnoseAccount)
	}

	log.Printf("Server starting on port %s (mode: %s)", port, ginMode)
	if err := r.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func mustParseInt64(s string) int64 {
	val, _ := strconv.ParseInt(s, 10, 64)
	return val
}
