package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onuvuti/backend/internal/middleware"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/pkg/sanitizer"
	"github.com/onuvuti/backend/internal/service"
)

type AnalyticsHandler struct {
	analyticsSvc *service.AnalyticsService
}

func NewAnalyticsHandler(analyticsSvc *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsSvc: analyticsSvc}
}

// TrackVisit — POST /api/v1/analytics/track
func (h *AnalyticsHandler) TrackVisit(w http.ResponseWriter, r *http.Request) {
	clientIP := middleware.GetClientIP(r)
	var req models.TrackVisitRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	path := sanitizer.Text(req.Path, 200)
	if path == "" {
		path = "/"
	}
	storyID := sanitizer.Text(req.StoryID, 120)

	h.analyticsSvc.TrackVisit(clientIP, path, storyID)
	response.JSON(w, http.StatusOK, map[string]any{"ok": true})
}

// GetAdminAnalytics — GET /api/v1/admin/analytics?period=daily|7d|monthly|yearly|custom&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
func (h *AnalyticsHandler) GetAdminAnalytics(w http.ResponseWriter, r *http.Request) {
	period := r.URL.Query().Get("period")
	startDate := r.URL.Query().Get("startDate")
	endDate := r.URL.Query().Get("endDate")

	summary := h.analyticsSvc.GetSummary(period, startDate, endDate)
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"analytics": summary,
	})
}

