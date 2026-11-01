package handlers

import (
	"net/http"
	"time"

	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/repository"
)

type HealthHandler struct {
	repo *repository.Repository
}

func NewHealthHandler(repo *repository.Repository) *HealthHandler {
	return &HealthHandler{repo: repo}
}

func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	dbMode := "local-persistent-store (set DATABASE_URL for PostgreSQL)"
	if h.repo.IsPostgresConnected() {
		dbMode = "postgresql (auto-migrated)"
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":           true,
		"service":      "onuvuti-go-backend",
		"architecture": "modular-clean-architecture",
		"database":     dbMode,
		"security":     "rate-limit + xss-sanitizer + sql-prepared-statements + hmac-auth active",
		"timestamp":    time.Now().Format(time.RFC3339),
	})
}

