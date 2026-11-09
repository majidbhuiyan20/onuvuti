package service

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"github.com/onuvuti/backend/internal/pkg/cache"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func response(status int, body string) *http.Response {
	return &http.Response{StatusCode: status, Body: io.NopCloser(strings.NewReader(body)), Header: make(http.Header)}
}

func TestSearchValidatesAndNormalizesProviderQuery(t *testing.T) {
	var got url.Values
	svc := NewAdultCatalogService(nil)
	svc.baseURL = "https://provider.test/api/v1"
	svc.client = &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		got = r.URL.Query()
		return response(http.StatusOK, `{"total":0,"pages":0,"next_page":null,"results":[]}`), nil
	})}

	_, err := svc.Search(context.Background(), url.Values{
		"query": {"  calm story  "}, "sort": {"random"}, "page": {"900"},
		"per_page": {"100"}, "categories": {"Romance,quiet-night"},
	})
	if err != nil {
		t.Fatalf("Search() error = %v", err)
	}
	if got.Get("query") != "calm story" || got.Get("page") != "500" || got.Get("per_page") != "48" {
		t.Fatalf("unexpected validated query: %v", got)
	}
	if got.Get("sort") != "" {
		t.Fatalf("invalid sort should be omitted, got %q", got.Get("sort"))
	}
	if got.Get("categories") != "romance,quiet-night" || got.Get("quality") != "complete" {
		t.Fatalf("unexpected category/quality: %v", got)
	}
}

func TestSearchDropsInvalidCategorySlug(t *testing.T) {
	var got url.Values
	svc := NewAdultCatalogService(nil)
	svc.baseURL = "https://provider.test/api/v1"
	svc.client = &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		got = r.URL.Query()
		return response(http.StatusOK, `{"results":[]}`), nil
	})}
	_, err := svc.Search(context.Background(), url.Values{"categories": {"../private"}})
	if err != nil {
		t.Fatalf("Search() error = %v", err)
	}
	if got.Has("categories") {
		t.Fatalf("invalid category slug was forwarded: %q", got.Get("categories"))
	}
}

func TestCategoriesUsesProviderTaxonomyEndpointAndCache(t *testing.T) {
	calls := 0
	svc := NewAdultCatalogService(cache.NewTTLCache())
	svc.baseURL = "https://provider.test/api/v1"
	svc.client = &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		calls++
		if r.URL.Path != "/api/v1/categories" || r.URL.Query().Get("per_page") != "100" {
			return response(http.StatusBadRequest, `{}`), nil
		}
		return response(http.StatusOK, `{"results":[{"slug":"romance"}]}`), nil
	})}
	for range 2 {
		if _, err := svc.Categories(context.Background()); err != nil {
			t.Fatalf("Categories() error = %v", err)
		}
	}
	if calls != 1 {
		t.Fatalf("provider called %d times, want cached single call", calls)
	}
}

func TestSearchRetriesTransientProviderStatus(t *testing.T) {
	calls := 0
	svc := NewAdultCatalogService(nil)
	svc.baseURL = "https://provider.test/api/v1"
	svc.client = &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		calls++
		if calls == 1 {
			return response(http.StatusServiceUnavailable, "unavailable"), nil
		}
		return response(http.StatusOK, `{"results":[]}`), nil
	})}
	if _, err := svc.Search(context.Background(), url.Values{}); err != nil {
		t.Fatalf("Search() error = %v", err)
	}
	if calls != 2 {
		t.Fatalf("provider called %d times, want one retry", calls)
	}
}

func TestSearchReturnsProviderError(t *testing.T) {
	svc := NewAdultCatalogService(nil)
	svc.baseURL = "https://provider.test/api/v1"
	svc.client = &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		return response(http.StatusNotFound, "not found"), nil
	})}
	if _, err := svc.Search(context.Background(), url.Values{}); err == nil || !strings.Contains(err.Error(), "status 404") {
		t.Fatalf("Search() error = %v, want provider 404", err)
	}
}

func TestSearchHonorsCanceledContext(t *testing.T) {
	svc := NewAdultCatalogService(nil)
	svc.baseURL = "https://provider.test/api/v1"
	svc.client = &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		<-r.Context().Done()
		return nil, fmt.Errorf("%w", r.Context().Err())
	})}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := svc.Search(ctx, url.Values{}); err == nil {
		t.Fatal("Search() error = nil, want canceled context")
	}
}
