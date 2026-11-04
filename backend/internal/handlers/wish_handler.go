package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type WishHandler struct {
	wishSvc *service.WishService
}

func NewWishHandler(wishSvc *service.WishService) *WishHandler {
	return &WishHandler{wishSvc: wishSvc}
}

func (h *WishHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateWishRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "তথ্য ফরম্যাট সঠিক নয়")
		return
	}

	created, err := h.wishSvc.CreateWish(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":       true,
		"wish":     created,
		"id":       created.ID,
		"shareUrl": "/wish/" + created.ID,
		"msg":      "জন্মদিনের জাদুকরী চিঠি সফলভাবে তৈরি হয়েছে!",
	})
}

func (h *WishHandler) GetSingle(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	wish, err := h.wishSvc.GetWishByID(id)
	if err != nil {
		response.Error(w, http.StatusNotFound, "জন্মদিনের চিঠিটি খুঁজে পাওয়া যায়নি")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"wish": wish,
	})
}
