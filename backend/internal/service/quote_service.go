package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/cache"
	"github.com/onuvuti/backend/internal/repository"
)

type QuoteService struct {
	repo  *repository.Repository
	cache *cache.TTLCache
}

func NewQuoteService(repo *repository.Repository, cache *cache.TTLCache) *QuoteService {
	return &QuoteService{repo: repo, cache: cache}
}

func (s *QuoteService) GetActiveQuote() (*models.DailyQuote, error) {
	const cacheKey = "active_quote"
	if s.cache != nil {
		if val, ok := s.cache.Get(cacheKey); ok {
			if q, ok := val.(*models.DailyQuote); ok {
				return q, nil
			}
		}
	}

	q, err := s.repo.GetActiveQuote()
	if err != nil {
		return nil, err
	}

	if s.cache != nil && q != nil {
		s.cache.Set(cacheKey, q, 30*time.Second)
	}

	return q, nil
}

func (s *QuoteService) GetAllQuotesForAdmin() []models.DailyQuote {
	return s.repo.ListAllQuotesForAdmin()
}

func (s *QuoteService) CreateQuote(req models.CreateQuoteRequest) (*models.DailyQuote, error) {
	quoteText := strings.TrimSpace(req.Quote)
	if quoteText == "" {
		return nil, errors.New("না বলা কথার মূল বার্তা আবশ্যক")
	}

	author := strings.TrimSpace(req.Author)
	if author == "" {
		author = "একজন অজ্ঞাত পাঠক"
	}

	randBytes := make([]byte, 4)
	_, _ = rand.Read(randBytes)
	id := fmt.Sprintf("quote-%s", hex.EncodeToString(randBytes))

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	newQuote := models.DailyQuote{
		ID:         id,
		Quote:      quoteText,
		Author:     author,
		ReactCount: 1,
		StoryID:    strings.TrimSpace(req.StoryID),
		IsActive:   isActive,
	}

	created, err := s.repo.CreateQuote(newQuote)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.Delete("active_quote")
	}

	return created, nil
}

func (s *QuoteService) UpdateQuote(id string, req models.UpdateQuoteRequest) (*models.DailyQuote, error) {
	updated, err := s.repo.UpdateQuote(id, req)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.Delete("active_quote")
	}

	return updated, nil
}

func (s *QuoteService) DeleteQuote(id string) error {
	err := s.repo.DeleteQuote(id)
	if err == nil && s.cache != nil {
		s.cache.Delete("active_quote")
	}
	return err
}

func (s *QuoteService) ReactQuote(id string) (int, error) {
	newCount, err := s.repo.ReactQuote(id)
	if err != nil {
		return 0, err
	}

	if s.cache != nil {
		s.cache.Delete("active_quote")
	}

	return newCount, nil
}
