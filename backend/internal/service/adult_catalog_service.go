package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/pkg/cache"
)

const adultEmbedBaseURL = "https://adultembed.com/api/v1"

var adultSlugList = regexp.MustCompile(`^[a-z0-9-]+(?:,[a-z0-9-]+){0,5}$`)

type AdultCatalogService struct {
	client  *http.Client
	cache   *cache.TTLCache
	baseURL string
}

func NewAdultCatalogService(c *cache.TTLCache) *AdultCatalogService {
	return &AdultCatalogService{
		client:  &http.Client{Timeout: 4 * time.Second},
		cache:   c,
		baseURL: adultEmbedBaseURL,
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
		if value == "" || len(value) > 100 {
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
	if categories := strings.ToLower(strings.TrimSpace(query.Get("categories"))); len(categories) <= 180 && adultSlugList.MatchString(categories) {
		clean.Set("categories", categories)
	}
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
	var body []byte
	var lastErr error
	for attempt := 0; attempt < 2; attempt++ {
		body, lastErr = s.fetchOnce(ctx, path)
		if lastErr == nil || ctx.Err() != nil || attempt == 1 {
			break
		}
		var retryable interface{ Temporary() bool }
		if !strings.Contains(lastErr.Error(), "returned status 502") && !strings.Contains(lastErr.Error(), "returned status 503") && !strings.Contains(lastErr.Error(), "returned status 504") {
			if !errors.As(lastErr, &retryable) {
				break
			}
		}
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(100 * time.Millisecond):
		}
	}
	if lastErr != nil {
		return nil, lastErr
	}
	if s.cache != nil {
		s.cache.Set(key, body, 10*time.Minute)
	}
	return body, nil
}

func (s *AdultCatalogService) fetchOnce(ctx context.Context, path string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.baseURL+path, nil)
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
	return body, nil
}
