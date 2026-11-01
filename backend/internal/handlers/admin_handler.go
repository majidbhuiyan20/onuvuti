package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/onuvuti/backend/internal/middleware"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type AdminHandler struct {
	adminSvc     *service.AdminService
	analyticsSvc *service.AnalyticsService
	rl           *middleware.RateLimiter
}

func NewAdminHandler(
	adminSvc *service.AdminService,
	analyticsSvc *service.AnalyticsService,
	rl *middleware.RateLimiter,
) *AdminHandler {
	return &AdminHandler{
		adminSvc:     adminSvc,
		analyticsSvc: analyticsSvc,
		rl:           rl,
	}
}

func (h *AdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	clientIP := middleware.GetClientIP(r)

	allowed, rem, retrySec := h.rl.Check("admin_login", clientIP, 5, 15*time.Minute, 30*time.Minute)
	if !allowed {
		response.Error(
			w,
			http.StatusTooManyRequests,
			fmt.Sprintf("অতিরিক্তবার ভুল পাসওয়ার্ড দেওয়ার কারণে আপনার আইপি লক করা হয়েছে। %d মিনিট পর চেষ্টা করুন।", (retrySec/60)+1),
		)
		return
	}

	var req models.AdminLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "রিকোয়েস্ট সঠিক নয়।")
		return
	}

	tkn, ok := h.adminSvc.AuthenticatePassword(req.Password)
	if !ok {
		response.Error(
			w,
			http.StatusUnauthorized,
			fmt.Sprintf("ভুল অ্যাডমিন পাসওয়ার্ড! (বাকি চেষ্টা: %d বার)", rem),
		)
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"token":   tkn,
		"message": "অ্যাডমিন প্যানেলে স্বাগতম!",
	})
}

func (h *AdminHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	pending, published, orders := h.adminSvc.GetDashboardLists()
	analytics := h.analyticsSvc.GetSummary("7d", "", "")

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":               true,
		"pendingStories":   pending,
		"publishedStories": published,
		"orders":           orders,
		"analytics":        analytics,
	})
}

func (h *AdminHandler) ApproveOrUpdateStory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.ApproveOrUpdateStoryRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	updated, err := h.adminSvc.ApproveAndUpdateStory(id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"story": updated,
	})
}

func (h *AdminHandler) CreateStory(w http.ResponseWriter, r *http.Request) {
	var req models.AdminCreateStoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ফরম্যাট সঠিক নয়।")
		return
	}

	created, err := h.adminSvc.CreateAdminStory(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":    true,
		"story": created,
	})
}

func (h *AdminHandler) DeleteStory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !h.adminSvc.DeleteStory(id) {
		response.Error(w, http.StatusNotFound, "লেখাটি পাওয়া যায়নি।")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok": true,
	})
}

