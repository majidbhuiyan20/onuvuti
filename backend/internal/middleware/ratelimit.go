package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type rateEntry struct {
	timestamps  []time.Time
	blockedTill time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	entries map[string]*rateEntry
}

func NewRateLimiter() *RateLimiter {
	rl := &RateLimiter{
		entries: make(map[string]*rateEntry),
	}
	go rl.cleanupLoop()
	return rl
}

func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		now := time.Now()
		rl.mu.Lock()
		if len(rl.entries) > 2000 {
			for k, v := range rl.entries {
				if v.blockedTill.Before(now) && len(v.timestamps) == 0 {
					delete(rl.entries, k)
				}
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Check(bucket, ip string, maxReqs int, window, blockDuration time.Duration) (allowed bool, remaining int, retryAfterSec int) {
	now := time.Now()
	key := bucket + ":" + ip

	rl.mu.Lock()
	defer rl.mu.Unlock()

	entry, exists := rl.entries[key]
	if !exists {
		entry = &rateEntry{}
		rl.entries[key] = entry
	}

	if entry.blockedTill.After(now) {
		wait := int(entry.blockedTill.Sub(now).Seconds()) + 1
		return false, 0, wait
	}

	windowStart := now.Add(-window)
	valid := entry.timestamps[:0]
	for _, ts := range entry.timestamps {
		if ts.After(windowStart) {
			valid = append(valid, ts)
		}
	}
	entry.timestamps = valid

	if len(entry.timestamps) >= maxReqs {
		if blockDuration <= 0 {
			blockDuration = window
		}
		entry.blockedTill = now.Add(blockDuration)
		return false, 0, int(blockDuration.Seconds())
	}

	entry.timestamps = append(entry.timestamps, now)
	rem := maxReqs - len(entry.timestamps)
	if rem < 0 {
		rem = 0
	}
	return true, rem, 0
}

func GetClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if ip := strings.TrimSpace(parts[0]); ip != "" {
			return ip
		}
	}
	if xri := strings.TrimSpace(r.Header.Get("X-Real-IP")); xri != "" {
		return xri
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}

