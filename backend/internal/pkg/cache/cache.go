package cache

import (
	"strings"
	"sync"
	"time"
)

type cacheItem struct {
	value     any
	expiresAt time.Time
}

// TTLCache is an ultra-fast, thread-safe in-memory cache that prevents database/disk load on AWS t3.micro.
type TTLCache struct {
	mu    sync.RWMutex
	items map[string]cacheItem
}

func NewTTLCache() *TTLCache {
	c := &TTLCache{
		items: make(map[string]cacheItem),
	}
	go c.evictExpiredLoop()
	return c
}

func (c *TTLCache) Get(key string) (any, bool) {
	c.mu.RLock()
	item, ok := c.items[key]
	c.mu.RUnlock()

	if !ok || time.Now().After(item.expiresAt) {
		return nil, false
	}
	return item.value, true
}

func (c *TTLCache) Set(key string, value any, ttl time.Duration) {
	c.mu.Lock()
	c.items[key] = cacheItem{
		value:     value,
		expiresAt: time.Now().Add(ttl),
	}
	c.mu.Unlock()
}

// InvalidatePrefix removes all cached entries matching a prefix (e.g. "stories:" when a new story is published).
func (c *TTLCache) InvalidatePrefix(prefix string) {
	c.mu.Lock()
	for k := range c.items {
		if strings.HasPrefix(k, prefix) {
			delete(c.items, k)
		}
	}
	c.mu.Unlock()
}

func (c *TTLCache) ClearAll() {
	c.mu.Lock()
	c.items = make(map[string]cacheItem)
	c.mu.Unlock()
}

func (c *TTLCache) evictExpiredLoop() {
	ticker := time.NewTicker(2 * time.Minute)
	for range ticker.C {
		now := time.Now()
		c.mu.Lock()
		for k, item := range c.items {
			if now.After(item.expiresAt) {
				delete(c.items, k)
			}
		}
		c.mu.Unlock()
	}
}

