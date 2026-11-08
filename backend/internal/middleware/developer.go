package middleware

import (
	"net/http"
	"os"
	"strings"
)

// IsDeveloperOrAdmin checks if a request is from a developer or site administrator.
// It detects:
// 1. Localhost / Loopback IPs (127.0.0.1, ::1, localhost)
// 2. Known developer IPs (user's Mac IP 118.179.207.90 or comma-separated DEVELOPER_IPS env)
// 3. Admin session cookie (onuvuti_is_admin=true)
// 4. Admin header (X-Onuvuti-Admin=true or Authorization Bearer)
// 5. Query parameter (?dev_mode=true or ?exclude_analytics=true)
func IsDeveloperOrAdmin(r *http.Request) bool {
	if r == nil {
		return false
	}

	// 1. Query parameter override
	q := r.URL.Query()
	if q.Get("force_pixel_test") == "true" {
		return false
	}
	if q.Get("dev_mode") == "true" || q.Get("exclude_analytics") == "true" {
		return true
	}

	// 2. Admin cookie
	if cookie, err := r.Cookie("onuvuti_is_admin"); err == nil && cookie.Value == "true" {
		return true
	}

	// 3. Admin Headers
	if r.Header.Get("X-Onuvuti-Admin") == "true" {
		return true
	}
	if auth := r.Header.Get("Authorization"); strings.HasPrefix(auth, "Bearer ") && len(auth) > 15 {
		return true
	}

	// 4. Client IP check
	clientIP := GetClientIP(r)
	return IsDeveloperIP(clientIP)
}

// IsDeveloperIP checks whether an IP belongs to localhost or registered developer IPs.
func IsDeveloperIP(ip string) bool {
	ip = strings.TrimSpace(ip)
	if ip == "" || ip == "127.0.0.1" || ip == "::1" || ip == "localhost" {
		return true
	}

	// Known developer Mac IP
	if ip == "118.179.207.90" {
		return true
	}

	// Dynamic environment variable support: DEVELOPER_IPS="118.179.207.90,..."
	if envDev := os.Getenv("DEVELOPER_IPS"); envDev != "" {
		for _, devIP := range strings.Split(envDev, ",") {
			if strings.TrimSpace(devIP) == ip {
				return true
			}
		}
	}

	return false
}
