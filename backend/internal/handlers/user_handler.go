package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/middleware"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type UserHandler struct {
	userSvc *service.UserService
	rl      *middleware.RateLimiter
}

func NewUserHandler(userSvc *service.UserService, rl *middleware.RateLimiter) *UserHandler {
	return &UserHandler{
		userSvc: userSvc,
		rl:      rl,
	}
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	clientIP := middleware.GetClientIP(r)
	allowed, _, retrySec := h.rl.Check("user_register", clientIP, 5, 10*time.Minute, 15*time.Minute)
	if !allowed {
		response.Error(w, http.StatusTooManyRequests, fmt.Sprintf("অনেকবার চেষ্টা করা হয়েছে। %d মিনিট পর আবার চেষ্টা করুন।", (retrySec/60)+1))
		return
	}

	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "রিকোয়েস্ট ফরম্যাট সঠিক নয়।")
		return
	}

	user, token, err := h.userSvc.RegisterManual(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":    true,
		"user":  user,
		"token": token,
	})
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	clientIP := middleware.GetClientIP(r)
	allowed, _, retrySec := h.rl.Check("user_login", clientIP, 8, 10*time.Minute, 15*time.Minute)
	if !allowed {
		response.Error(w, http.StatusTooManyRequests, fmt.Sprintf("নিরাপত্তার স্বার্থে সাময়িকভাবে লগইন স্থগিত রয়েছে। %d মিনিট পর চেষ্টা করুন।", (retrySec/60)+1))
		return
	}

	var req models.UserLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "রিকোয়েস্ট ফরম্যাট সঠিক নয়।")
		return
	}

	user, token, err := h.userSvc.LoginManual(req)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"user":  user,
		"token": token,
	})
}

func (h *UserHandler) GoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req models.GoogleAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "রিকোয়েস্ট ফরম্যাট সঠিক নয়।")
		return
	}

	user, token, err := h.userSvc.LoginWithGoogle(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"user":  user,
		"token": token,
	})
}

func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	tokenStr := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer"))
	if tokenStr == "" {
		tokenStr = r.URL.Query().Get("token")
	}

	userID, valid := h.userSvc.VerifyUserToken(tokenStr)
	if !valid {
		response.Error(w, http.StatusUnauthorized, "লগইন সেশন পাওয়া যায়নি।")
		return
	}

	user, stories := h.userSvc.GetUserProfileAndStories(userID)
	if user == nil {
		response.Error(w, http.StatusNotFound, "ইউজার প্রোফাইল পাওয়া যায়নি।")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"user":    user,
		"stories": stories,
	})
}

