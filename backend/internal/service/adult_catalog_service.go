package service

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/pkg/cache"
)

const adultEmbedBaseURL = "https://adultembed.com/api/v1"

type AdultCatalogService struct {
	client *http.Client
	cache  *cache.TTLCache
}

func NewAdultCatalogService(c *cache.TTLCache) *AdultCatalogService {
	return &AdultCatalogService{
		client: &http.Client{Timeout: 8 * time.Second},
		cache:  c,
	}
}

// Search returns the upstream JSON response as-is; the API key is not required
// for public catalogue endpoints, and the browser never calls the provider.
func (s *AdultCatalogService) Search(ctx context.Context, query url.Values) ([]byte, error) {
	clean := url.Values{}
	clean.Set("quality", "complete")
	clean.Set("per_page", "24")
	for key, allowed := range map[string]map[string]bool{
		"query":    nil,
		"page":     nil,
		"per_page": nil,
		"sort":     {"newest": true, "oldest": true, "popular": true, "longest": true, "shortest": true, "updated": true},
	} {
		value := strings.TrimSpace(query.Get(key))
		if value == "" || len(value) > 120 {
			continue
		}
		if allowed != nil && !allowed[value] {
			continue
		}
		if key == "page" || key == "per_page" {
			n, err := strconv.Atoi(value)
			if err != nil || n < 1 {
				continue
			}
			if key == "page" && n > 500 {
				n = 500
			}
			if key == "per_page" && n > 48 {
				n = 48
			}
			value = strconv.Itoa(n)
		}
		clean.Set(key, value)
	}
	clean.Set("quality", "complete")
	return s.fetch(ctx, "/search?"+clean.Encode())
}

func (s *AdultCatalogService) Categories(ctx context.Context) ([]byte, error) {
	return s.fetch(ctx, "/categories?per_page=100&sort=popular")
}

func (s *AdultCatalogService) fetch(ctx context.Context, path string) ([]byte, error) {
	key := "adult-catalog:" + path
	if s.cache != nil {
		if value, ok := s.cache.Get(key); ok {
			if body, ok := value.([]byte); ok {
				return body, nil
			}
		}
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, adultEmbedBaseURL+path, nil)
	if err != nil {
		return nil, fmt.Errorf("create catalogue request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("catalogue provider unavailable: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("catalogue provider returned status %d", resp.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return nil, fmt.Errorf("read catalogue response: %w", err)
	}
	if s.cache != nil {
		s.cache.Set(key, body, 10*time.Minute)
	}
	return body, nil
}
