package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/cache"
	"github.com/onuvuti/backend/internal/pkg/sanitizer"
	"github.com/onuvuti/backend/internal/repository"
)

type WellnessService struct {
	repo  *repository.Repository
	cache *cache.TTLCache
}

func NewWellnessService(repo *repository.Repository, c *cache.TTLCache) *WellnessService {
	return &WellnessService{repo: repo, cache: c}
}

func (s *WellnessService) GetActiveTips() []models.WellnessTip {
	cacheKey := "wellness:active"
	if s.cache != nil {
		if val, hit := s.cache.Get(cacheKey); hit {
			if cached, ok := val.([]models.WellnessTip); ok {
				return cached
			}
		}
	}

	tips := s.repo.ListActiveWellnessTips()
	if s.cache != nil {
		s.cache.Set(cacheKey, tips, 60*time.Second)
	}
	return tips
}

func (s *WellnessService) GetAllTipsForAdmin() []models.WellnessTip {
	return s.repo.ListAllWellnessTips()
}

func (s *WellnessService) CreateTip(req models.CreateWellnessRequest) (*models.WellnessTip, error) {
	title := sanitizer.Text(req.Title, 200)
	if title == "" {
		return nil, errors.New("পরামর্শের শিরোনাম আবশ্যক")
	}
	category := strings.TrimSpace(req.Category)
	if category == "" {
		category = "মানসিক স্বাস্থ্য"
	}
	summary := sanitizer.Text(req.Summary, 600)
	if summary == "" {
		return nil, errors.New("সংক্ষিপ্ত সারসংক্ষেপ আবশ্যক")
	}

	var cleanSteps []string
	for _, step := range req.ActionSteps {
		if c := sanitizer.Text(step, 400); c != "" {
			cleanSteps = append(cleanSteps, c)
		}
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	readTime := strings.TrimSpace(req.ReadTime)
	if readTime == "" {
		readTime = "৩ মিনিট পাঠ"
	}

	tip := models.WellnessTip{
		ID:                   fmt.Sprintf("tip-%d", time.Now().UnixMilli()),
		Category:             category,
		Title:                title,
		Summary:              summary,
		ReadTime:             readTime,
		Symptoms:             sanitizer.Text(req.Symptoms, 600),
		WhyItHappens:         sanitizer.Text(req.WhyItHappens, 800),
		ActionSteps:          cleanSteps,
		PsychologicalInsight: sanitizer.Text(req.PsychologicalInsight, 800),
		DailyHabit:           sanitizer.Text(req.DailyHabit, 600),
		ExpertAdvice:         sanitizer.Text(req.ExpertAdvice, 600),
		IsActive:             isActive,
	}

	created, err := s.repo.CreateWellnessTip(tip)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.InvalidatePrefix("wellness:")
	}
	return created, nil
}

func (s *WellnessService) UpdateTip(id string, req models.UpdateWellnessRequest) (*models.WellnessTip, error) {
	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("আইডি আবশ্যক")
	}

	if req.Title != "" {
		req.Title = sanitizer.Text(req.Title, 200)
	}
	if req.Summary != "" {
		req.Summary = sanitizer.Text(req.Summary, 600)
	}
	if req.Symptoms != "" {
		req.Symptoms = sanitizer.Text(req.Symptoms, 600)
	}
	if req.WhyItHappens != "" {
		req.WhyItHappens = sanitizer.Text(req.WhyItHappens, 800)
	}
	if req.PsychologicalInsight != "" {
		req.PsychologicalInsight = sanitizer.Text(req.PsychologicalInsight, 800)
	}
	if req.DailyHabit != "" {
		req.DailyHabit = sanitizer.Text(req.DailyHabit, 600)
	}
	if req.ExpertAdvice != "" {
		req.ExpertAdvice = sanitizer.Text(req.ExpertAdvice, 600)
	}

	var cleanSteps []string
	for _, step := range req.ActionSteps {
		if c := sanitizer.Text(step, 400); c != "" {
			cleanSteps = append(cleanSteps, c)
		}
	}
	req.ActionSteps = cleanSteps

	updated, err := s.repo.UpdateWellnessTip(cleanID, req)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.InvalidatePrefix("wellness:")
	}
	return updated, nil
}

func (s *WellnessService) DeleteTip(id string) error {
	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return errors.New("আইডি আবশ্যক")
	}

	err := s.repo.DeleteWellnessTip(cleanID)
	if err != nil {
		return err
	}

	if s.cache != nil {
		s.cache.InvalidatePrefix("wellness:")
	}
	return nil
}
