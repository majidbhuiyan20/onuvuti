package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/onuvuti/backend/internal/config"
	"github.com/onuvuti/backend/internal/database"
	"github.com/onuvuti/backend/internal/handlers"
	"github.com/onuvuti/backend/internal/middleware"
	"github.com/onuvuti/backend/internal/pkg/cache"
	"github.com/onuvuti/backend/internal/repository"
	"github.com/onuvuti/backend/internal/routes"
	"github.com/onuvuti/backend/internal/service"
)

func main() {
	// 1. Load Configuration
	cfg := config.Load()

	// 2. Connect Database (PostgreSQL when DATABASE_URL is set, with local persistence)
	pgDB := database.ConnectPostgres(cfg.DatabaseURL)
	repo, err := repository.NewRepository(cfg.DataFilePath, pgDB)
	if err != nil {
		log.Fatalf("Failed to initialize repository: %v", err)
	}

	// 3. Initialize High-Speed RAM TTL Cache & Services
	memCache := cache.NewTTLCache()
	storySvc := service.NewStoryService(repo, memCache)
	commentSvc := service.NewCommentService(repo, memCache)
	adminSvc := service.NewAdminService(cfg, repo, memCache)
	orderSvc := service.NewOrderService(repo)
	analyticsSvc := service.NewAnalyticsService(repo)
	userSvc := service.NewUserService(repo, cfg)

	// 4. Initialize Middleware & HTTP Handlers
	rl := middleware.NewRateLimiter()
	router := routes.NewRouter(routes.RouterDeps{
		Config:           cfg,
		RateLimiter:      rl,
		HealthHandler:    handlers.NewHealthHandler(repo),
		StoryHandler:     handlers.NewStoryHandler(storySvc, analyticsSvc, rl),
		CommentHandler:   handlers.NewCommentHandler(commentSvc, rl),
		AdminHandler:     handlers.NewAdminHandler(adminSvc, analyticsSvc, rl),
		OrderHandler:     handlers.NewOrderHandler(orderSvc),
		AnalyticsHandler: handlers.NewAnalyticsHandler(analyticsSvc),
		UserHandler:      handlers.NewUserHandler(userSvc, rl),
	})

	// 5. Start Hardened HTTP Server
	addr := ":" + cfg.Port
	srv := &http.Server{
		Addr:              addr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	fmt.Printf("🚀 Onuvuti Go Backend (Modular + RAM Cache + Pagination) running on http://localhost%s\n", addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
