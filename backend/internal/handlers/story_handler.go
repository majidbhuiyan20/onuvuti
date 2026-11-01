package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/onuvuti/backend/internal/middleware"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type StoryHandler struct {
	storySvc     *service.StoryService
	analyticsSvc *service.AnalyticsService
	rl           *middleware.RateLimiter
}

func NewStoryHandler(
	storySvc *service.StoryService,
	analyticsSvc *service.AnalyticsService,
	rl *middleware.RateLimiter,
) *StoryHandler {
	return &StoryHandler{
		storySvc:     storySvc,
		analyticsSvc: analyticsSvc,
		rl:           rl,
	}
}

func (h *StoryHandler) ListPublished(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 6
	}

	result, cacheHit := h.storySvc.ListPublishedPaginated(category, search, page, limit)
	if cacheHit {
		w.Header().Set("X-Cache", "HIT")
	} else {
		w.Header().Set("X-Cache", "MISS")
	}
	w.Header().Set("Cache-Control", "public, max-age=30, stale-while-revalidate=60")

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":         true,
		"cached":     cacheHit,
		"stories":    result.Stories,
		"pagination": result.Pagination,
	})
}

func (h *StoryHandler) GetSingle(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	story, comments, cacheHit := h.storySvc.GetBySlugOrID(slug)
	if story == nil {
		response.Error(w, http.StatusNotFound, "গল্পটি খুঁজে পাওয়া যায়নি।")
		return
	}

	if cacheHit {
		w.Header().Set("X-Cache", "HIT")
	} else {
		w.Header().Set("X-Cache", "MISS")
	}
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=120")

	// Track story view in analytics
	clientIP := middleware.GetClientIP(r)
	h.analyticsSvc.TrackVisit(clientIP, "/blog/"+slug, story.ID)

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"cached":   cacheHit,
		"story":    story,
		"comments": comments,
	})
}

func (h *StoryHandler) TrackStory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	st := h.storySvc.TrackByID(id)
	if st == nil {
		response.Error(w, http.StatusNotFound, "এই ট্র্যাকিং আইডিতে কোনো লেখা পাওয়া যায়নি।")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"story": st,
	})
}

func (h *StoryHandler) Submit(w http.ResponseWriter, r *http.Request) {
	clientIP := middleware.GetClientIP(r)

	allowed, rem, retrySec := h.rl.Check("story_submit", clientIP, 3, 10*time.Minute, 15*time.Minute)
	if !allowed {
		response.Error(
			w,
			http.StatusTooManyRequests,
			fmt.Sprintf("স্প্যাম প্রতিরোধের জন্য প্রতি ১০ মিনিটে সর্বোচ্চ ৩টি লেখা পাঠানো যায়। অনুগ্রহ করে %d মিনিট পর আবার চেষ্টা করুন।", (retrySec/60)+1),
		)
		return
	}

	var req models.SubmitStoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "রিকোয়েস্ট ফরম্যাট সঠিক নয়।")
		return
	}

	created, err := h.storySvc.SubmitPending(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":             true,
		"remainingQuota": rem,
		"story":          created,
	})
}

func (h *StoryHandler) React(w http.ResponseWriter, r *http.Request) {
	clientIP := middleware.GetClientIP(r)
	allowed, _, _ := h.rl.Check("story_react", clientIP, 25, time.Minute, time.Minute)
	if !allowed {
		response.Error(w, http.StatusTooManyRequests, "একটু ধীরে রিঅ্যাকশন দিন।")
		return
	}

	id := r.PathValue("id")
	var req models.ReactionRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	updated, ok := h.storySvc.AddReaction(id, req.Type)
	if !ok {
		response.Error(w, http.StatusNotFound, "গল্পটি খুঁজে পাওয়া যায়নি।")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"reactions": updated.Reactions,
		"likes":     updated.LikesCount,
	})
}
