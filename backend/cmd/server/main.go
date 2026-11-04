package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
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
	// 1. Load Configuration (from .env or AWS environment variables)
	cfg := config.Load()

	if cfg.Environment == "production" {
		if cfg.DatabaseURL == "" ||
			len(cfg.AdminPassword) < 16 ||
			len(cfg.AdminTokenSecret) < 32 ||
			len(cfg.InternalSecret) < 32 {
			log.Fatal("Production configuration invalid: DATABASE_URL and strong admin/internal secrets are required")
		}
	}

	// 2. Connect Database (Pure PostgreSQL — AWS RDS / Cloud Postgres)
	pgDB := database.ConnectPostgres(cfg.DatabaseURL)
	if pgDB == nil {
		log.Fatal("PostgreSQL connection or migration failed; refusing to start production backend")
	}

	repo, err := repository.NewRepository(pgDB)
	if err != nil {
		_ = pgDB.Close()
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
	adSvc := service.NewAdService(repo, memCache)
	wellnessSvc := service.NewWellnessService(repo, memCache)
	pollSvc := service.NewPollService(repo, memCache)
	quoteSvc := service.NewQuoteService(repo, memCache)
	wishSvc := service.NewWishService(repo)

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
		AdHandler:        handlers.NewAdHandler(adSvc),
		WellnessHandler:  handlers.NewWellnessHandler(wellnessSvc),
		PollHandler:      handlers.NewPollHandler(pollSvc),
		QuoteHandler:     handlers.NewQuoteHandler(quoteSvc),
		WishHandler:      handlers.NewWishHandler(wishSvc),
	})

	// 5. Hardened HTTP Server for Production
	addr := ":" + cfg.Port
	srv := &http.Server{
		Addr:              addr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      20 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// Graceful shutdown channel (handling AWS container stopping / SIGTERM)
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		dbStatus := "Standalone / Local"
		if repo.IsPostgresConnected() {
			dbStatus = "PostgreSQL (Production Active)"
		}
		fmt.Printf("🚀 Onuvuti Go Backend running on port %s [%s]\n", cfg.Port, dbStatus)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	sig := <-stop
	log.Printf("🛑 Received shutdown signal: %v. Draining active connections...", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("⚠️ Server shutdown error: %v", err)
	}

	if pgDB != nil {
		_ = pgDB.Close()
		log.Printf("✅ PostgreSQL connection pool closed cleanly.")
	}

	log.Printf("👋 Backend server gracefully stopped.")
}
