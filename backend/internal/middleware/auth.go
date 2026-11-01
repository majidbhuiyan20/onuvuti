package middleware

import (
	"crypto/sha256"
	"crypto/subtle"
	"net/http"
	"strings"

	"github.com/onuvuti/backend/internal/config"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/pkg/token"
)

func RequireAdmin(cfg *config.Config, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !isAuthorizedAdmin(r, cfg) {
			response.Error(w, http.StatusUnauthorized, "অ্যাডমিন অনুমোদন প্রয়োজন।")
			return
		}
		next(w, r)
	}
}

func RequireInternalOrAdmin(cfg *config.Config, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		internalHeader := strings.TrimSpace(r.Header.Get("X-Internal-Secret"))
		if internalHeader != "" && cfg.InternalSecret != "" {
			h1 := sha256.Sum256([]byte(internalHeader))
			h2 := sha256.Sum256([]byte(cfg.InternalSecret))
			if subtle.ConstantTimeCompare(h1[:], h2[:]) == 1 {
				next(w, r)
				return
			}
		}

		if isAuthorizedAdmin(r, cfg) {
			next(w, r)
			return
		}

		response.Error(w, http.StatusUnauthorized, "অভ্যন্তরীণ সার্ভিস অথেন্টিকেশন প্রয়োজন।")
	}
}

func isAuthorizedAdmin(r *http.Request, cfg *config.Config) bool {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if strings.HasPrefix(authHeader, "Bearer ") {
		rawToken := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		if token.VerifyAdminToken(rawToken, cfg.AdminTokenSecret) {
			return true
		}
	}

	if adminPwd := r.Header.Get("X-Admin-Password"); adminPwd != "" {
		h1 := sha256.Sum256([]byte(adminPwd))
		h2 := sha256.Sum256([]byte(cfg.AdminPassword))
		return subtle.ConstantTimeCompare(h1[:], h2[:]) == 1
	}

	return false
}

