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

type CommentService struct {
	repo  *repository.Repository
	cache *cache.TTLCache
}

func NewCommentService(repo *repository.Repository, c *cache.TTLCache) *CommentService {
	return &CommentService{repo: repo, cache: c}
}

func (s *CommentService) AddComment(storyIDOrSlug string, req models.AddCommentRequest) (*models.Comment, error) {
	if strings.TrimSpace(req.WebsiteURL) != "" {
		return nil, errors.New("বট রিকোয়েস্ট ব্লক করা হয়েছে।")
	}

	text := sanitizer.Text(req.Text, 800)
	if len([]rune(text)) < 2 {
		return nil, errors.New("অনুগ্রহ করে আপনার মন্তব্য লিখুন।")
	}

	author := "নাম প্রকাশে অনিচ্ছুক"
	if !req.IsAnonymous {
		if cleanAuthor := sanitizer.Text(req.Author, 60); cleanAuthor != "" {
			author = cleanAuthor
		} else {
			author = "পাঠক"
		}
	}

	now := time.Now()
	c := models.Comment{
		ID:          fmt.Sprintf("c-%d", now.UnixMilli()),
		Author:      author,
		IsAnonymous: req.IsAnonymous,
		Text:        text,
		TimeBn:      "এইমাত্র",
		CreatedAt:   now,
	}

	saved, ok := s.repo.CreateComment(storyIDOrSlug, c)
	if !ok {
		return nil, errors.New("গল্পটি খুঁজে পাওয়া যায়নি।")
	}

	if s.cache != nil {
		s.cache.InvalidatePrefix("stories:single:")
	}

	return saved, nil
}
