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

type PollService struct {
	repo  *repository.Repository
	cache *cache.TTLCache
}

func NewPollService(repo *repository.Repository, cache *cache.TTLCache) *PollService {
	return &PollService{repo: repo, cache: cache}
}

func (s *PollService) GetActivePoll() (*models.Poll, error) {
	const cacheKey = "active_poll"
	if s.cache != nil {
		if val, ok := s.cache.Get(cacheKey); ok {
			if p, ok := val.(*models.Poll); ok {
				return p, nil
			}
		}
	}

	p, err := s.repo.GetActivePoll()
	if err != nil {
		return nil, err
	}

	if s.cache != nil && p != nil {
		s.cache.Set(cacheKey, p, 30*time.Second)
	}

	return p, nil
}

func (s *PollService) GetAllPollsForAdmin() []models.Poll {
	return s.repo.ListAllPollsForAdmin()
}

func (s *PollService) CreatePoll(req models.CreatePollRequest) (*models.Poll, error) {
	q := strings.TrimSpace(req.Question)
	if q == "" {
		return nil, errors.New("প্রশ্নের বিবরণ আবশ্যক")
	}

	if len(req.Options) < 2 {
		return nil, errors.New("কমপক্ষে ২টি উত্তরের অপশন দিতে হবে")
	}

	var pollOptions []models.PollOption
	for i, optText := range req.Options {
		clean := strings.TrimSpace(optText)
		if clean != "" {
			pollOptions = append(pollOptions, models.PollOption{
				ID:    fmt.Sprintf("opt-%d", i+1),
				Label: clean,
				Votes: 0,
			})
		}
	}

	if len(pollOptions) < 2 {
		return nil, errors.New("সঠিক উত্তরের অপশন দিন")
	}

	randBytes := make([]byte, 4)
	_, _ = rand.Read(randBytes)
	id := fmt.Sprintf("poll-%s", hex.EncodeToString(randBytes))

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	newPoll := models.Poll{
		ID:       id,
		Question: q,
		Options:  pollOptions,
		IsActive: isActive,
	}

	created, err := s.repo.CreatePoll(newPoll)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.Delete("active_poll")
	}

	return created, nil
}

func (s *PollService) UpdatePoll(id string, req models.UpdatePollRequest) (*models.Poll, error) {
	updated, err := s.repo.UpdatePoll(id, req)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.Delete("active_poll")
	}

	return updated, nil
}

func (s *PollService) DeletePoll(id string) error {
	err := s.repo.DeletePoll(id)
	if err == nil && s.cache != nil {
		s.cache.Delete("active_poll")
	}
	return err
}

func (s *PollService) VotePoll(pollID string, optionID string) (*models.Poll, error) {
	updated, err := s.repo.VotePoll(pollID, optionID)
	if err != nil {
		return nil, err
	}

	if s.cache != nil {
		s.cache.Delete("active_poll")
	}

	return updated, nil
}
