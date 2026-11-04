package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type QuoteHandler struct {
	quoteSvc *service.QuoteService
}

func NewQuoteHandler(quoteSvc *service.QuoteService) *QuoteHandler {
	return &QuoteHandler{quoteSvc: quoteSvc}
}

func (h *QuoteHandler) GetActive(w http.ResponseWriter, r *http.Request) {
	q, err := h.quoteSvc.GetActiveQuote()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "সার্ভার ত্রুটি হয়েছে")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=15, stale-while-revalidate=60")
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"quote": q,
	})
}

func (h *QuoteHandler) React(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	newCount, err := h.quoteSvc.ReactQuote(id)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":         true,
		"reactCount": newCount,
		"msg":        "অনুভূতি জানানোর জন্য ধন্যবাদ",
	})
}

func (h *QuoteHandler) GetAdminQuotes(w http.ResponseWriter, r *http.Request) {
	quotes := h.quoteSvc.GetAllQuotesForAdmin()
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":     true,
		"quotes": quotes,
	})
}

func (h *QuoteHandler) CreateQuote(w http.ResponseWriter, r *http.Request) {
	var req models.CreateQuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডেটা ফরম্যাট সঠিক নয়")
		return
	}

	created, err := h.quoteSvc.CreateQuote(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":    true,
		"quote": created,
		"msg":   "না বলা কথা সফলভাবে তৈরি হয়েছে",
	})
}

func (h *QuoteHandler) UpdateQuote(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.UpdateQuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডেটা ফরম্যাট সঠিক নয়")
		return
	}

	updated, err := h.quoteSvc.UpdateQuote(id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"quote": updated,
		"msg":   "না বলা কথা আপডেট করা হয়েছে",
	})
}

func (h *QuoteHandler) DeleteQuote(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.quoteSvc.DeleteQuote(id); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"msg": "না বলা কথা মুছে ফেলা হয়েছে",
	})
}

