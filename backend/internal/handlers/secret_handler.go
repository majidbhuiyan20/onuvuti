package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/repository"
	"github.com/onuvuti/backend/internal/service"
)

type SecretHandler struct {
	secretSvc *service.SecretService
}

func NewSecretHandler(secretSvc *service.SecretService) *SecretHandler {
	return &SecretHandler{secretSvc: secretSvc}
}

func secretErrorStatus(err error) (int, string) {
	switch {
	case errors.Is(err, repository.ErrInboxNotFound):
		return http.StatusNotFound, "inbox_not_found"
	case errors.Is(err, repository.ErrMessageNotFound):
		return http.StatusNotFound, "message_not_found"
	case errors.Is(err, service.ErrInvalidManageKey):
		return http.StatusForbidden, "invalid_manage_key"
	case errors.Is(err, service.ErrUsernameTaken):
		return http.StatusConflict, "username_taken"
	case errors.Is(err, service.ErrUsernameReserved):
		return http.StatusBadRequest, "username_reserved"
	case errors.Is(err, service.ErrInvalidUsername):
		return http.StatusBadRequest, "invalid_username"
	case errors.Is(err, service.ErrRateLimitExceeded):
		return http.StatusTooManyRequests, "rate_limit_exceeded"
	case errors.Is(err, service.ErrInvalidContent):
		return http.StatusBadRequest, "invalid_content"
	}
	return http.StatusBadRequest, "bad_request"
}

func writeSecretError(w http.ResponseWriter, err error) {
	status, code := secretErrorStatus(err)
	response.JSON(w, status, map[string]any{"ok": false, "error": err.Error(), "code": code})
}

func getClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	return r.RemoteAddr
}

func getManageKey(r *http.Request) string {
	if key := r.URL.Query().Get("key"); key != "" {
		return key
	}
	return r.Header.Get("X-Manage-Key")
}

// CreateInbox handles creation of a new anonymous link.
func (h *SecretHandler) CreateInbox(w http.ResponseWriter, r *http.Request) {
	var req models.CreateInboxRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডাটা ফরম্যাট সঠিক নয়")
		return
	}

	created, err := h.secretSvc.CreateInbox(req)
	if err != nil {
		writeSecretError(w, err)
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":        true,
		"inbox":     created.Inbox,
		"manageKey": created.ManageKey,
		"publicUrl": created.PublicURL,
		"inboxUrl":  created.InboxURL,
		"msg":       "আপনার বেনামী বার্তার লিংক তৈরি হয়েছে!",
	})
}

// GetPublicInbox returns public profile and prompt.
func (h *SecretHandler) GetPublicInbox(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	inbox, err := h.secretSvc.GetPublicInbox(username)
	if err != nil {
		writeSecretError(w, err)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"inbox": inbox,
	})
}

// SendMessage handles submission of an anonymous message.
func (h *SecretHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	var req models.SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডাটা ফরম্যাট সঠিক নয়")
		return
	}

	msg, err := h.secretSvc.SendMessage(username, req, getClientIP(r))
	if err != nil {
		writeSecretError(w, err)
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":  true,
		"msg": "আপনার বেনামী বার্তা পৌঁছে গেছে!",
		"id":  msg.ID,
	})
}

// GetPrivateInbox loads the owner's messages.
func (h *SecretHandler) GetPrivateInbox(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	key := getManageKey(r)
	if key == "" {
		response.JSON(w, http.StatusUnauthorized, map[string]any{
			"ok":    false,
			"error": "ইনবক্স অ্যাক্সেস করার জন্য সিক্রেট কী প্রয়োজন",
			"code":  "missing_key",
		})
		return
	}

	inboxView, err := h.secretSvc.GetPrivateInbox(username, key)
	if err != nil {
		writeSecretError(w, err)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"inbox":    inboxView.Inbox,
		"messages": inboxView.Messages,
	})
}

// ReplyMessage updates reply text.
func (h *SecretHandler) ReplyMessage(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	msgID := r.PathValue("id")
	key := getManageKey(r)
	if key == "" {
		response.JSON(w, http.StatusUnauthorized, map[string]any{
			"ok":    false,
			"error": "উত্তর দেওয়ার জন্য সিক্রেট কী প্রয়োজন",
			"code":  "missing_key",
		})
		return
	}

	var req models.ReplyMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "ডাটা ফরম্যাট সঠিক নয়")
		return
	}

	if err := h.secretSvc.ReplyMessage(username, msgID, key, req.ReplyText); err != nil {
		writeSecretError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"msg": "উত্তর সফলভাবে সংরক্ষিত হয়েছে!",
	})
}

// DeleteMessage deletes a message from the owner's inbox.
func (h *SecretHandler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	msgID := r.PathValue("id")
	key := getManageKey(r)
	if key == "" {
		response.JSON(w, http.StatusUnauthorized, map[string]any{
			"ok":    false,
			"error": "ডিলিট করার জন্য সিক্রেট কী প্রয়োজন",
			"code":  "missing_key",
		})
		return
	}

	if err := h.secretSvc.DeleteMessage(username, msgID, key); err != nil {
		writeSecretError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"msg": "বার্তাটি মুছে ফেলা হয়েছে",
	})
}

// AdminStats returns total counts.
func (h *SecretHandler) AdminStats(w http.ResponseWriter, r *http.Request) {
	inboxes, messages, err := h.secretSvc.GetStats()
	if err != nil {
		writeSecretError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":            true,
		"totalInboxes":  inboxes,
		"totalMessages": messages,
	})
}
