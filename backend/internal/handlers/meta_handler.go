package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/onuvuti/backend/internal/middleware"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type MetaHandler struct {
	metaSvc *service.MetaService
}

func NewMetaHandler(metaSvc *service.MetaService) *MetaHandler {
	return &MetaHandler{metaSvc: metaSvc}
}

// GetPublicConfig serves client-safe configuration for frontend Pixel initialization.
func (h *MetaHandler) GetPublicConfig(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.metaSvc.GetPublicConfig()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "পিক্সেল কনফিগারেশন লোড করা সম্ভব হয়নি।")
		return
	}
	response.JSON(w, http.StatusOK, cfg)
}

// LogBrowserEvent handles client-side event tracking logs.
func (h *MetaHandler) LogBrowserEvent(w http.ResponseWriter, r *http.Request) {
	// Skip logging if the event is submitted from a developer or admin browser
	if middleware.IsDeveloperOrAdmin(r) {
		response.JSON(w, http.StatusOK, map[string]any{"ok": true, "skipped": true, "reason": "developer_or_admin"})
		return
	}

	var event models.MetaEventLog
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		response.Error(w, http.StatusBadRequest, "ইভেন্ট ডেটা সঠিক নয়।")
		return
	}

	event.EventName = strings.TrimSpace(event.EventName)
	if event.EventName == "" {
		response.Error(w, http.StatusBadRequest, "ইভেন্টের নাম আবশ্যক।")
		return
	}

	event.Source = "browser"
	if event.Status == "" {
		event.Status = "received"
	}

	if err := h.metaSvc.RecordBrowserEvent(event); err != nil {
		response.Error(w, http.StatusInternalServerError, "ইভেন্ট সংরক্ষণ করা যায়নি।")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{"ok": true})
}

// GetAdminConfig returns full configuration for the admin panel.
func (h *MetaHandler) GetAdminConfig(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.metaSvc.GetAdminConfig()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":     true,
		"config": cfg,
	})
}

type UpdateAdminConfigRequest struct {
	PixelID                string `json:"pixelId"`
	IsEnabled              bool   `json:"isEnabled"`
	BrowserTrackingEnabled bool   `json:"browserTrackingEnabled"`
	CAPIEnabled            bool   `json:"capiEnabled"`
	TestEventCode          string `json:"testEventCode"`
	AccessToken            string `json:"accessToken,omitempty"`
}

// UpdateAdminConfig updates tracking configuration.
func (h *MetaHandler) UpdateAdminConfig(w http.ResponseWriter, r *http.Request) {
	var req UpdateAdminConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "কনফিগারেশন ফরম্যাট সঠিক নয়।")
		return
	}

	settings := models.MetaPixelSettings{
		PixelID:                strings.TrimSpace(req.PixelID),
		IsEnabled:              req.IsEnabled,
		BrowserTrackingEnabled: req.BrowserTrackingEnabled,
		CAPIEnabled:            req.CAPIEnabled,
		TestEventCode:          strings.TrimSpace(req.TestEventCode),
	}

	if err := h.metaSvc.UpdateAdminConfig(settings, req.AccessToken); err != nil {
		response.Error(w, http.StatusInternalServerError, "কনফিগারেশন সংরক্ষণ ব্যর্থ হয়েছে: "+err.Error())
		return
	}

	updated, _ := h.metaSvc.GetAdminConfig()
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"message": "মেটা পিক্সেল কনফিগারেশন সফলভাবে আপডেট করা হয়েছে।",
		"config":  updated,
	})
}

// GetEventsDashboard returns aggregated summary metrics and recent event logs.
func (h *MetaHandler) GetEventsDashboard(w http.ResponseWriter, r *http.Request) {
	summaries, logs, err := h.metaSvc.GetEventsDashboardData()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"summaries": summaries,
		"logs":      logs,
	})
}

// GetPurchaseAnalytics returns verified purchase analytics and delivery status.
func (h *MetaHandler) GetPurchaseAnalytics(w http.ResponseWriter, r *http.Request) {
	analytics, err := h.metaSvc.GetPurchaseAnalytics()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"analytics": analytics,
	})
}

type TestCAPIRequest struct {
	TestEventCode string `json:"testEventCode"`
}

// SendTestCAPI tests connectivity to Meta Events Manager.
func (h *MetaHandler) SendTestCAPI(w http.ResponseWriter, r *http.Request) {
	var req TestCAPIRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	result, err := h.metaSvc.SendTestCAPIEvent(req.TestEventCode)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"message":  "Meta Events Manager-এ সফলভাবে টেস্ট ইভেন্ট পাঠানো হয়েছে।",
		"metaResp": result,
	})
}

