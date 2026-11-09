package routes

import (
	"net/http"

	"github.com/onuvuti/backend/internal/config"
	"github.com/onuvuti/backend/internal/handlers"
	"github.com/onuvuti/backend/internal/middleware"
)

type RouterDeps struct {
	Config              *config.Config
	RateLimiter         *middleware.RateLimiter
	HealthHandler       *handlers.HealthHandler
	StoryHandler        *handlers.StoryHandler
	CommentHandler      *handlers.CommentHandler
	AdminHandler        *handlers.AdminHandler
	OrderHandler        *handlers.OrderHandler
	AnalyticsHandler    *handlers.AnalyticsHandler
	UserHandler         *handlers.UserHandler
	AdHandler           *handlers.AdHandler
	WellnessHandler     *handlers.WellnessHandler
	PollHandler         *handlers.PollHandler
	QuoteHandler        *handlers.QuoteHandler
	WishHandler         *handlers.WishHandler
	SecretHandler       *handlers.SecretHandler
	MetaHandler         *handlers.MetaHandler
	AdultCatalogHandler *handlers.AdultCatalogHandler
}

func NewRouter(deps RouterDeps) http.Handler {
	mux := http.NewServeMux()
	cfg := deps.Config

	// 1. Health & Security Status
	mux.HandleFunc("GET /api/v1/health", deps.HealthHandler.Check)

	// 1b. User Authentication & Profile Routes (Manual Register/Login + Sign in with Google)
	if deps.UserHandler != nil {
		mux.HandleFunc("POST /api/v1/auth/register", deps.UserHandler.Register)
		mux.HandleFunc("POST /api/v1/auth/login", deps.UserHandler.Login)
		mux.HandleFunc("POST /api/v1/auth/google", deps.UserHandler.GoogleAuth)
		mux.HandleFunc("GET /api/v1/auth/me", deps.UserHandler.Me)
	}

	// 2. Public Story & Confession Routes
	mux.HandleFunc("GET /api/v1/stories", deps.StoryHandler.ListPublished)
	mux.HandleFunc("GET /api/v1/stories/track/{id}", deps.StoryHandler.TrackStory)
	mux.HandleFunc("GET /api/v1/stories/{slug}", deps.StoryHandler.GetSingle)
	mux.HandleFunc("POST /api/v1/stories", deps.StoryHandler.Submit)
	mux.HandleFunc("POST /api/v1/stories/{id}/react", deps.StoryHandler.React)
	mux.HandleFunc("POST /api/v1/stories/{id}/comments", deps.CommentHandler.Add)

	// 3. Public Visitor Traffic Tracking Route
	mux.HandleFunc("POST /api/v1/analytics/track", deps.AnalyticsHandler.TrackVisit)

	// 4. Book Order Recording & Verification Routes (Protected by Internal Service Secret or Admin)
	mux.HandleFunc("POST /api/v1/orders", middleware.RequireInternalOrAdmin(cfg, deps.OrderHandler.RecordOrder))
	mux.HandleFunc("GET /api/v1/orders/trx/{trx}", middleware.RequireInternalOrAdmin(cfg, deps.OrderHandler.CheckTransaction))
	mux.HandleFunc("GET /api/v1/orders/{id}", middleware.RequireInternalOrAdmin(cfg, deps.OrderHandler.GetOrder))
	mux.HandleFunc("PATCH /api/v1/orders/{id}/paid", middleware.RequireInternalOrAdmin(cfg, deps.OrderHandler.MarkPaid))
	mux.HandleFunc("PATCH /api/v1/orders/{id}/download", middleware.RequireInternalOrAdmin(cfg, deps.OrderHandler.RecordDownload))

	// 5. Admin Authentication & Protected Admin Routes
	mux.HandleFunc("POST /api/v1/admin/login", deps.AdminHandler.Login)
	mux.HandleFunc("GET /api/v1/admin/dashboard", middleware.RequireAdmin(cfg, deps.AdminHandler.Dashboard))
	mux.HandleFunc("GET /api/v1/admin/analytics", middleware.RequireAdmin(cfg, deps.AnalyticsHandler.GetAdminAnalytics))
	mux.HandleFunc("GET /api/v1/admin/orders", middleware.RequireAdmin(cfg, deps.OrderHandler.ListAdminOrders))
	if deps.UserHandler != nil {
		mux.HandleFunc("GET /api/v1/admin/users", middleware.RequireAdmin(cfg, deps.UserHandler.ListAdminUsers))
	}
	mux.HandleFunc("PATCH /api/v1/admin/stories/{id}/approve", middleware.RequireAdmin(cfg, deps.AdminHandler.ApproveOrUpdateStory))
	mux.HandleFunc("PATCH /api/v1/admin/stories/{id}/pin", middleware.RequireAdmin(cfg, deps.AdminHandler.TogglePinStory))
	mux.HandleFunc("POST /api/v1/admin/stories", middleware.RequireAdmin(cfg, deps.AdminHandler.CreateStory))
	mux.HandleFunc("DELETE /api/v1/admin/stories/{id}", middleware.RequireAdmin(cfg, deps.AdminHandler.DeleteStory))
	mux.HandleFunc("DELETE /api/v1/admin/comments/{id}", middleware.RequireAdmin(cfg, deps.AdminHandler.DeleteComment))

	// 6. Advertisement & Banner Management Routes
	if deps.AdHandler != nil {
		mux.HandleFunc("GET /api/v1/ads", deps.AdHandler.GetActive)
		mux.HandleFunc("GET /api/v1/admin/ads", middleware.RequireAdmin(cfg, deps.AdHandler.GetAdminAds))
		mux.HandleFunc("PUT /api/v1/admin/ads/{slot}", middleware.RequireAdmin(cfg, deps.AdHandler.UpdateAd))
		mux.HandleFunc("POST /api/v1/admin/ads/{slot}", middleware.RequireAdmin(cfg, deps.AdHandler.UpdateAd))
	}

	// 7. Daily Health & Mental Wellness Guide Routes (PostgreSQL Dynamic Single Source of Truth)
	if deps.WellnessHandler != nil {
		mux.HandleFunc("GET /api/v1/wellness", deps.WellnessHandler.GetActive)
		mux.HandleFunc("GET /api/v1/admin/wellness", middleware.RequireAdmin(cfg, deps.WellnessHandler.GetAdminTips))
		mux.HandleFunc("POST /api/v1/admin/wellness", middleware.RequireAdmin(cfg, deps.WellnessHandler.CreateTip))
		mux.HandleFunc("PUT /api/v1/admin/wellness/{id}", middleware.RequireAdmin(cfg, deps.WellnessHandler.UpdateTip))
		mux.HandleFunc("DELETE /api/v1/admin/wellness/{id}", middleware.RequireAdmin(cfg, deps.WellnessHandler.DeleteTip))
	}

	// 8. Daily Reader Poll / Question Routes ("আজকের প্রশ্ন" — 100% Backend Single Source of Truth)
	if deps.PollHandler != nil {
		mux.HandleFunc("GET /api/v1/polls/active", deps.PollHandler.GetActive)
		mux.HandleFunc("POST /api/v1/polls/{id}/vote", deps.PollHandler.Vote)
		mux.HandleFunc("GET /api/v1/admin/polls", middleware.RequireAdmin(cfg, deps.PollHandler.GetAdminPolls))
		mux.HandleFunc("POST /api/v1/admin/polls", middleware.RequireAdmin(cfg, deps.PollHandler.CreatePoll))
		mux.HandleFunc("PUT /api/v1/admin/polls/{id}", middleware.RequireAdmin(cfg, deps.PollHandler.UpdatePoll))
		mux.HandleFunc("DELETE /api/v1/admin/polls/{id}", middleware.RequireAdmin(cfg, deps.PollHandler.DeletePoll))
	}

	// 9. Daily Quote / Unspoken Words Routes ("আজকের না বলা কথা" — 100% Backend Single Source of Truth)
	if deps.QuoteHandler != nil {
		mux.HandleFunc("GET /api/v1/quotes/active", deps.QuoteHandler.GetActive)
		mux.HandleFunc("POST /api/v1/quotes/{id}/react", deps.QuoteHandler.React)
		mux.HandleFunc("GET /api/v1/admin/quotes", middleware.RequireAdmin(cfg, deps.QuoteHandler.GetAdminQuotes))
		mux.HandleFunc("POST /api/v1/admin/quotes", middleware.RequireAdmin(cfg, deps.QuoteHandler.CreateQuote))
		mux.HandleFunc("PUT /api/v1/admin/quotes/{id}", middleware.RequireAdmin(cfg, deps.QuoteHandler.UpdateQuote))
		mux.HandleFunc("DELETE /api/v1/admin/quotes/{id}", middleware.RequireAdmin(cfg, deps.QuoteHandler.DeleteQuote))
	}

	// 10. Birthday Wish Routes (Interactive 3D Letter & Envelope Wish Generator)
	if deps.WishHandler != nil {
		mux.HandleFunc("POST /api/v1/wishes", deps.WishHandler.Create)
		mux.HandleFunc("GET /api/v1/wishes/{id}", deps.WishHandler.GetSingle)
		mux.HandleFunc("POST /api/v1/wishes/{id}/open", deps.WishHandler.Open)
		mux.HandleFunc("POST /api/v1/wishes/{id}/replies", deps.WishHandler.AddReply)
		mux.HandleFunc("GET /api/v1/wishes/{id}/replies", deps.WishHandler.ListReplies)
		mux.HandleFunc("GET /api/v1/admin/wishes", middleware.RequireInternalOrAdmin(cfg, deps.WishHandler.ListAdmin))
		mux.HandleFunc("DELETE /api/v1/admin/wishes/{id}", middleware.RequireInternalOrAdmin(cfg, deps.WishHandler.Delete))
	}

	// 11. Anonymous Secret Messages & Story Reply Routes (NGL / Ask.fm Style Viral Engine)
	if deps.SecretHandler != nil {
		mux.HandleFunc("POST /api/v1/secret/inboxes", deps.SecretHandler.CreateInbox)
		mux.HandleFunc("GET /api/v1/secret/inboxes/{username}", deps.SecretHandler.GetPublicInbox)
		mux.HandleFunc("POST /api/v1/secret/inboxes/{username}/messages", deps.SecretHandler.SendMessage)
		mux.HandleFunc("GET /api/v1/secret/inboxes/{username}/inbox", deps.SecretHandler.GetPrivateInbox)
		mux.HandleFunc("POST /api/v1/secret/inboxes/{username}/messages/{id}/reply", deps.SecretHandler.ReplyMessage)
		mux.HandleFunc("DELETE /api/v1/secret/inboxes/{username}/messages/{id}", deps.SecretHandler.DeleteMessage)
		mux.HandleFunc("GET /api/v1/admin/secret/stats", middleware.RequireInternalOrAdmin(cfg, deps.SecretHandler.AdminStats))
	}

	// 12. Meta Pixel & Server-Side Conversions API (CAPI) Integration Routes
	if deps.MetaHandler != nil {
		// Client public config & browser tracking ingestion
		mux.HandleFunc("GET /api/v1/meta/config", deps.MetaHandler.GetPublicConfig)
		mux.HandleFunc("POST /api/v1/meta/events", deps.MetaHandler.LogBrowserEvent)

		// Protected Admin Management & Analytics Routes
		mux.HandleFunc("GET /api/v1/admin/meta/config", middleware.RequireAdmin(cfg, deps.MetaHandler.GetAdminConfig))
		mux.HandleFunc("PUT /api/v1/admin/meta/config", middleware.RequireAdmin(cfg, deps.MetaHandler.UpdateAdminConfig))
		mux.HandleFunc("GET /api/v1/admin/meta/events", middleware.RequireAdmin(cfg, deps.MetaHandler.GetEventsDashboard))
		mux.HandleFunc("GET /api/v1/admin/meta/analytics", middleware.RequireAdmin(cfg, deps.MetaHandler.GetPurchaseAnalytics))
		mux.HandleFunc("POST /api/v1/admin/meta/test-capi", middleware.RequireAdmin(cfg, deps.MetaHandler.SendTestCAPI))
	}

	// 13. Adult video catalogue proxy (provider requests stay on the Go server)
	if deps.AdultCatalogHandler != nil {
		mux.HandleFunc("GET /api/v1/adult/videos", deps.AdultCatalogHandler.Search)
		mux.HandleFunc("GET /api/v1/adult/categories", deps.AdultCatalogHandler.Categories)
	}

	// Apply Firewall + Rate Limiter + CORS middleware chain
	handler := middleware.Firewall(mux, deps.RateLimiter)
	handler = middleware.CORS(handler, cfg.CorsAllowedOrigins)

	return handler
}
