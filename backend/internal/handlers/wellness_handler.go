package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type WellnessHandler struct {
	wellnessSvc *service.WellnessService
}

func NewWellnessHandler(wellnessSvc *service.WellnessService) *WellnessHandler {
	return &WellnessHandler{wellnessSvc: wellnessSvc}
}

func (h *WellnessHandler) GetActive(w http.ResponseWriter, r *http.Request) {
	tips := h.wellnessSvc.GetActiveTips()
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=120")
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"tips": tips,
	})
}

func (h *WellnessHandler) GetAdminTips(w http.ResponseWriter, r *http.Request) {
	tips := h.wellnessSvc.GetAllTipsForAdmin()
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"tips": tips,
	})
}

func (h *WellnessHandler) CreateTip(w http.ResponseWriter, r *http.Request) {
	var req models.CreateWellnessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডেটা ফরম্যাট সঠিক নয়")
		return
	}

	created, err := h.wellnessSvc.CreateTip(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":  true,
		"tip": created,
		"msg": "সুস্থতা গাইড সফলভাবে তৈরি করা হয়েছে",
	})
}

func (h *WellnessHandler) UpdateTip(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.UpdateWellnessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডেটা ফরম্যাট সঠিক নয়")
		return
	}

	updated, err := h.wellnessSvc.UpdateTip(id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"tip": updated,
		"msg": "সুস্থতা গাইড সফলভাবে আপডেট করা হয়েছে",
	})
}

func (h *WellnessHandler) DeleteTip(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.wellnessSvc.DeleteTip(id); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"msg": "সুস্থতা গাইড সফলভাবে মুছে ফেলা হয়েছে",
	})
}

