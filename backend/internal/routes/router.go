package routes

import (
	"net/http"

	"github.com/onuvuti/backend/internal/config"
	"github.com/onuvuti/backend/internal/handlers"
	"github.com/onuvuti/backend/internal/middleware"
)

type RouterDeps struct {
	Config           *config.Config
	RateLimiter      *middleware.RateLimiter
	HealthHandler    *handlers.HealthHandler
	StoryHandler     *handlers.StoryHandler
	CommentHandler   *handlers.CommentHandler
	AdminHandler     *handlers.AdminHandler
	OrderHandler     *handlers.OrderHandler
	AnalyticsHandler *handlers.AnalyticsHandler
	UserHandler      *handlers.UserHandler
	AdHandler        *handlers.AdHandler
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

	// Apply Firewall + Rate Limiter + CORS middleware chain
	handler := middleware.Firewall(mux, deps.RateLimiter)
	handler = middleware.CORS(handler, cfg.CorsAllowedOrigins)

	return handler
}

