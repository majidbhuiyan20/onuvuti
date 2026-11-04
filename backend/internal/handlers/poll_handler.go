package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type PollHandler struct {
	pollSvc *service.PollService
}

func NewPollHandler(pollSvc *service.PollService) *PollHandler {
	return &PollHandler{pollSvc: pollSvc}
}

func (h *PollHandler) GetActive(w http.ResponseWriter, r *http.Request) {
	p, err := h.pollSvc.GetActivePoll()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "সার্ভার ত্রুটি হয়েছে")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=15, stale-while-revalidate=60")
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"poll": p,
	})
}

func (h *PollHandler) Vote(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.VotePollRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.OptionID == "" {
		response.Error(w, http.StatusBadRequest, "সঠিক অপশন নির্বাচন করুন")
		return
	}

	updated, err := h.pollSvc.VotePoll(id, req.OptionID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"poll": updated,
		"msg":  "আপনার ভোট গ্রহণ করা হয়েছে",
	})
}

func (h *PollHandler) GetAdminPolls(w http.ResponseWriter, r *http.Request) {
	polls := h.pollSvc.GetAllPollsForAdmin()
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"polls": polls,
	})
}

func (h *PollHandler) CreatePoll(w http.ResponseWriter, r *http.Request) {
	var req models.CreatePollRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডেটা ফরম্যাট সঠিক নয়")
		return
	}

	created, err := h.pollSvc.CreatePoll(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":   true,
		"poll": created,
		"msg":  "জরিপ প্রশ্ন সফলভাবে তৈরি হয়েছে",
	})
}

func (h *PollHandler) UpdatePoll(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.UpdatePollRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডেটা ফরম্যাট সঠিক নয়")
		return
	}

	updated, err := h.pollSvc.UpdatePoll(id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"poll": updated,
		"msg":  "জরিপ প্রশ্ন আপডেট করা হয়েছে",
	})
}

func (h *PollHandler) DeletePoll(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.pollSvc.DeletePoll(id); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"msg": "জরিপ প্রশ্ন মুছে ফেলা হয়েছে",
	})
}
