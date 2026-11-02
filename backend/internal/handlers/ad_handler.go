package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type AdHandler struct {
	adSvc *service.AdService
}

func NewAdHandler(adSvc *service.AdService) *AdHandler {
	return &AdHandler{adSvc: adSvc}
}

func (h *AdHandler) GetActive(w http.ResponseWriter, r *http.Request) {
	ads := h.adSvc.GetActiveAds()
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=120")
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"ads": ads,
	})
}

func (h *AdHandler) GetAdminAds(w http.ResponseWriter, r *http.Request) {
	ads := h.adSvc.GetAllAdsForAdmin()
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"ads": ads,
	})
}

func (h *AdHandler) UpdateAd(w http.ResponseWriter, r *http.Request) {
	slot := r.PathValue("slot")
	var req models.UpdateAdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "বিজ্ঞাপন ডেটা ফরম্যাট সঠিক নয়")
		return
	}

	updated, err := h.adSvc.UpdateAd(slot, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"ad":  updated,
		"msg": "বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে",
	})
}
