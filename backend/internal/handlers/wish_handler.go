package handlers

import (
	"encoding/json"
	"errors"
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

// wishErrorStatus maps typed service errors to an HTTP status and a stable machine code.
func wishErrorStatus(err error) (int, string) {
	switch {
	case errors.Is(err, service.ErrWishNotFound):
		return http.StatusNotFound, "not_found"
	case errors.Is(err, service.ErrWishLocked):
		return http.StatusLocked, "locked"
	case errors.Is(err, service.ErrWishDestroyed):
		return http.StatusGone, "destroyed"
	case errors.Is(err, service.ErrBadPasscode):
		return http.StatusUnauthorized, "bad_passcode"
	case errors.Is(err, service.ErrTooManyAttempts):
		return http.StatusTooManyRequests, "too_many_attempts"
	case errors.Is(err, service.ErrBadManageKey):
		return http.StatusForbidden, "forbidden"
	}
	return http.StatusBadRequest, "invalid"
}

func writeWishError(w http.ResponseWriter, err error) {
	status, code := wishErrorStatus(err)
	response.JSON(w, status, map[string]any{"ok": false, "error": err.Error(), "code": code})
}

func (h *WishHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateWishRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "তথ্য ফরম্যাট সঠিক নয় বা ফাইল অনেক বড়")
		return
	}

	created, manageKey, err := h.wishSvc.CreateWish(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":        true,
		"wish":      created,
		"id":        created.ID,
		"shareUrl":  "/wish/" + created.ID,
		"manageKey": manageKey,
		"msg":       "জন্মদিনের জাদুকরী চিঠি সফলভাবে তৈরি হয়েছে!",
	})
}

// GetSingle returns public metadata only (no content, no view count increment).
func (h *WishHandler) GetSingle(w http.ResponseWriter, r *http.Request) {
	wish, err := h.wishSvc.GetWishPublic(r.PathValue("id"))
	if err != nil {
		writeWishError(w, err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	response.JSON(w, http.StatusOK, map[string]any{"ok": true, "wish": wish})
}

// Open releases the protected content after lock/passcode/self-destruct checks.
func (h *WishHandler) Open(w http.ResponseWriter, r *http.Request) {
	var req models.OpenWishRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	content, err := h.wishSvc.OpenWish(r.PathValue("id"), req.Passcode)
	if err != nil {
		writeWishError(w, err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	response.JSON(w, http.StatusOK, map[string]any{"ok": true, "content": content})
}

func (h *WishHandler) AddReply(w http.ResponseWriter, r *http.Request) {
	var req models.CreateWishReplyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "তথ্য ফরম্যাট সঠিক নয়")
		return
	}
	if err := h.wishSvc.AddReply(r.PathValue("id"), req); err != nil {
		writeWishError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"ok": true, "msg": "তোমার রিঅ্যাকশন পাঠানো হয়েছে 💌"})
}

func (h *WishHandler) ListReplies(w http.ResponseWriter, r *http.Request) {
	wish, replies, err := h.wishSvc.ListReplies(r.PathValue("id"), r.URL.Query().Get("key"))
	if err != nil {
		writeWishError(w, err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	response.JSON(w, http.StatusOK, map[string]any{"ok": true, "wish": wish, "replies": replies})
}

func (h *WishHandler) ListAdmin(w http.ResponseWriter, r *http.Request) {
	wishes, err := h.wishSvc.ListWishesAdmin()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "চিঠির তালিকা লোড করা যায়নি")
		return
	}
	stats, err := h.wishSvc.Stats()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "চিঠির পরিসংখ্যান লোড করা যায়নি")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":     true,
		"wishes": wishes,
		"count":  len(wishes),
		"stats":  stats,
	})
}

func (h *WishHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		response.Error(w, http.StatusBadRequest, "চিঠির আইডি দেওয়া হয়নি")
		return
	}
	if err := h.wishSvc.DeleteWish(id); err != nil {
		response.Error(w, http.StatusInternalServerError, "চিঠি মোছা যায়নি")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"msg": "চিঠি সফলভাবে মুছে ফেলা হয়েছে",
	})
}
