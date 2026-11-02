package service

import (
	"errors"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/cache"
	"github.com/onuvuti/backend/internal/pkg/sanitizer"
	"github.com/onuvuti/backend/internal/repository"
)

type AdService struct {
	repo  *repository.Repository
	cache *cache.TTLCache
}

func NewAdService(repo *repository.Repository, c *cache.TTLCache) *AdService {
	return &AdService{repo: repo, cache: c}
}

func (s *AdService) GetActiveAds() []models.AdBanner {
	cacheKey := "ads:active"
	if s.cache != nil {
		if val, hit := s.cache.Get(cacheKey); hit {
			if cached, ok := val.([]models.AdBanner); ok {
				return cached
			}
		}
	}

	ads := s.repo.ListActiveAds()
	if s.cache != nil {
		s.cache.Set(cacheKey, ads, 60*time.Second)
	}
	return ads
}

func (s *AdService) GetAllAdsForAdmin() []models.AdBanner {
	return s.repo.ListAllAds()
}

func (s *AdService) UpdateAd(slot string, req models.UpdateAdRequest) (*models.AdBanner, error) {
	cleanSlot := strings.TrimSpace(strings.ToLower(slot))
	if cleanSlot == "" {
		return nil, errors.New("বিজ্ঞাপনের স্লট নাম আবশ্যক")
	}

	req.Title = sanitizer.Text(req.Title, 160)
	req.ImageURL = strings.TrimSpace(req.ImageURL)
	req.LinkURL = strings.TrimSpace(req.LinkURL)

	if req.IsActive && req.ImageURL == "" {
		return nil, errors.New("বিজ্ঞাপন সক্রিয় করতে ব্যানারের ছবির লিংক দিন")
	}

	updated, err := s.repo.UpdateAd(cleanSlot, req)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.InvalidatePrefix("ads:")
	}

	return updated, nil
}
