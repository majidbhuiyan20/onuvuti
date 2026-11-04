package middleware

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/pkg/response"
)

var blockedScannerUA = regexp.MustCompile(`(?i)(sqlmap|nikto|acunetix|nmap|masscan|dirbuster|gobuster|nuclei|nessus|zgrab)`)

func Firewall(next http.Handler, rl *RateLimiter) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.ToLower(r.URL.Path)
		ua := r.Header.Get("User-Agent")

		// 1. Block vulnerability scanners and path traversal probes
		if blockedScannerUA.MatchString(ua) ||
			strings.Contains(path, "..") ||
			strings.Contains(path, ".env") ||
			strings.Contains(path, ".git") ||
			strings.Contains(path, "wp-admin") ||
			strings.Contains(path, "phpmyadmin") {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		// 2. Strict HTTP Security Headers
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")

		// 3. Global API flood limit (100 req / minute per IP)
		clientIP := GetClientIP(r)
		allowed, _, retryAfter := rl.Check("global_api", clientIP, 100, time.Minute, time.Minute)
		if !allowed {
			w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
			response.Error(
				w,
				http.StatusTooManyRequests,
				fmt.Sprintf("অতিরিক্ত রিকোয়েস্ট পাঠানো হয়েছে। অনুগ্রহ করে %d সেকেন্ড পর আবার চেষ্টা করুন।", retryAfter),
			)
			return
		}

		// 4. Cap request body at 10 MB to allow high-resolution admin story images
		r.Body = http.MaxBytesReader(w, r.Body, 10_485_760)

		next.ServeHTTP(w, r)
	})
}

