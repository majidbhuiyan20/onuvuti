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

type CommentHandler struct {
	commentSvc *service.CommentService
	rl         *middleware.RateLimiter
}

func NewCommentHandler(commentSvc *service.CommentService, rl *middleware.RateLimiter) *CommentHandler {
	return &CommentHandler{
		commentSvc: commentSvc,
		rl:         rl,
	}
}

func (h *CommentHandler) Add(w http.ResponseWriter, r *http.Request) {
	clientIP := middleware.GetClientIP(r)

	allowed, _, retrySec := h.rl.Check("story_comment", clientIP, 5, time.Minute, 2*time.Minute)
	if !allowed {
		response.Error(
			w,
			http.StatusTooManyRequests,
			fmt.Sprintf("অতিরিক্ত কমেন্ট করা হয়েছে। অনুগ্রহ করে %d সেকেন্ড অপেক্ষা করুন।", retrySec),
		)
		return
	}

	id := r.PathValue("id")
	var req models.AddCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "কমেন্ট ফরম্যাট সঠিক নয়।")
		return
	}

	comment, err := h.commentSvc.AddComment(id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":      true,
		"comment": comment,
	})
}

