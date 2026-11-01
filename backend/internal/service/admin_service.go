package service

import (
	"crypto/sha256"
	"crypto/subtle"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/config"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/cache"
	"github.com/onuvuti/backend/internal/pkg/sanitizer"
	"github.com/onuvuti/backend/internal/pkg/token"
	"github.com/onuvuti/backend/internal/repository"
)

type AdminService struct {
	cfg   *config.Config
	repo  *repository.Repository
	cache *cache.TTLCache
}

func NewAdminService(cfg *config.Config, repo *repository.Repository, c *cache.TTLCache) *AdminService {
	return &AdminService{cfg: cfg, repo: repo, cache: c}
}

func (s *AdminService) AuthenticatePassword(password string) (string, bool) {
	inputHash := sha256.Sum256([]byte(password))
	expectedHash := sha256.Sum256([]byte(s.cfg.AdminPassword))
	if subtle.ConstantTimeCompare(inputHash[:], expectedHash[:]) != 1 {
		return "", false
	}
	return token.SignAdminToken(s.cfg.AdminTokenSecret), true
}

func (s *AdminService) GetDashboardLists() (pending []models.Story, published []models.Story, orders []models.BookOrder) {
	pending = s.repo.ListPendingStories()
	if pending == nil {
		pending = []models.Story{}
	}
	published = s.repo.ListPublishedStories("", "")
	if published == nil {
		published = []models.Story{}
	}
	orders = s.repo.ListOrders()
	if orders == nil {
		orders = []models.BookOrder{}
	}
	return pending, published, orders
}

func (s *AdminService) ApproveAndUpdateStory(id string, req models.ApproveOrUpdateStoryRequest) (*models.Story, error) {
	title := sanitizer.Text(req.Title, 180)
	content := sanitizer.Text(req.Content, 10000)
	category := sanitizer.Text(req.Category, 60)
	author := sanitizer.Text(req.Author, 80)

	if req.ImageURL != nil && *req.ImageURL != "" {
		if !sanitizer.ValidateOptionalImage(*req.ImageURL) {
			return nil, errors.New("ছবিটি বৈধ নয় বা ২ মেগাবাইটের বেশি।")
		}
	}

	updated, ok := s.repo.UpdateAndApproveStory(id, func(st *models.Story) {
		if title != "" {
			st.Title = title
		}
		if category != "" {
			st.Category = category
		}
		if author != "" {
			st.Author = author
		}
		if content != "" {
			st.RawContent = content
			st.Content = SplitParagraphs(content)
			st.Excerpt = MakeExcerpt(content, 125)
		}
		if req.IsAdminPost != nil {
			st.IsAdminPost = *req.IsAdminPost
		}
		if req.ImageURL != nil {
			st.ImageURL = strings.TrimSpace(*req.ImageURL)
		}
		if st.DateBn == "" {
			st.DateBn = "আজ"
		}
	})

	if !ok {
		return nil, errors.New("লেখাটি খুঁজে পাওয়া যায়নি।")
	}

	if s.cache != nil {
		s.cache.InvalidatePrefix("stories:")
	}

	return updated, nil
}

func (s *AdminService) CreateAdminStory(req models.AdminCreateStoryRequest) (*models.Story, error) {
	title := sanitizer.Text(req.Title, 180)
	content := sanitizer.Text(req.Content, 10000)
	category := sanitizer.Text(req.Category, 60)
	author := sanitizer.Text(req.Author, 80)
	if author == "" {
		author = "অনুভূতি সম্পাদনা পর্ষদ"
	}

	if title == "" || content == "" {
		return nil, errors.New("শিরোনাম ও মূল লেখা আবশ্যক।")
	}

	imageURL := strings.TrimSpace(req.ImageURL)
	if imageURL != "" && !sanitizer.ValidateOptionalImage(imageURL) {
		return nil, errors.New("ছবিটি বৈধ নয় বা ২ মেগাবাইটের বেশি।")
	}

	now := time.Now()
	st := models.Story{
		ID:          fmt.Sprintf("%d", now.UnixMilli()),
		Slug:        fmt.Sprintf("story-%d", now.UnixMilli()),
		Title:       title,
		Excerpt:     MakeExcerpt(content, 125),
		Category:    category,
		ReadTimeBn:  "৪ মিনিট পাঠ",
		DateBn:      "আজ",
		Author:      author,
		IsAdminPost: req.IsAdminPost,
		ImageURL:    imageURL, // Empty if admin didn't add an image
		ViewsCount:  1,
		LikesCount:  1,
		Reactions:   models.Reactions{Love: 1, Touched: 0, Relatable: 0},
		Content:     SplitParagraphs(content),
		RawContent:  content,
		Status:      "published",
		CreatedAt:   now,
	}

	created := s.repo.CreateStory(st)
	if s.cache != nil {
		s.cache.InvalidatePrefix("stories:")
	}
	return &created, nil
}

func (s *AdminService) DeleteStory(id string) bool {
	ok := s.repo.DeleteStory(id)
	if ok && s.cache != nil {
		s.cache.InvalidatePrefix("stories:")
	}
	return ok
}
