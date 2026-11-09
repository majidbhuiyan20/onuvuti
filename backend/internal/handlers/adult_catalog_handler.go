package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"time"

	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type AdultCatalogHandler struct {
	service *service.AdultCatalogService
}

func NewAdultCatalogHandler(s *service.AdultCatalogService) *AdultCatalogHandler {
	return &AdultCatalogHandler{service: s}
}

func (h *AdultCatalogHandler) Search(w http.ResponseWriter, r *http.Request) {
	h.respond(w, r, func(ctx context.Context, query url.Values) ([]byte, error) {
		return h.service.Search(ctx, query)
	})
}

func (h *AdultCatalogHandler) Categories(w http.ResponseWriter, r *http.Request) {
	h.respond(w, r, func(ctx context.Context, _ url.Values) ([]byte, error) {
		return h.service.Categories(ctx)
	})
}

func (h *AdultCatalogHandler) Trending(w http.ResponseWriter, r *http.Request) {
	h.respond(w, r, func(ctx context.Context, query url.Values) ([]byte, error) { return h.service.Trending(ctx, query) })
}

func (h *AdultCatalogHandler) Tags(w http.ResponseWriter, r *http.Request) {
	h.respond(w, r, func(ctx context.Context, _ url.Values) ([]byte, error) { return h.service.Tags(ctx) })
}

func (h *AdultCatalogHandler) Video(w http.ResponseWriter, r *http.Request) {
	h.respond(w, r, func(ctx context.Context, _ url.Values) ([]byte, error) {
		return h.service.Video(ctx, r.PathValue("id"))
	})
}

func (h *AdultCatalogHandler) Related(w http.ResponseWriter, r *http.Request) {
	h.respond(w, r, func(ctx context.Context, query url.Values) ([]byte, error) {
		return h.service.Related(ctx, r.PathValue("id"), query)
	})
}

func (h *AdultCatalogHandler) respond(w http.ResponseWriter, r *http.Request, fetch func(context.Context, url.Values) ([]byte, error)) {
	ctx, cancel := context.WithTimeout(r.Context(), 9*time.Second)
	defer cancel()
	body, err := fetch(ctx, r.URL.Query())
	if err != nil {
		response.JSON(w, http.StatusBadGateway, map[string]any{"ok": false, "error": "ভিডিও তালিকা এখন পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।"})
		return
	}
	var payload json.RawMessage
	if err := json.Unmarshal(body, &payload); err != nil || len(payload) == 0 {
		response.JSON(w, http.StatusBadGateway, map[string]any{"ok": false, "error": "ভিডিও সেবার উত্তর সঠিক নয়।"})
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(payload)
}
