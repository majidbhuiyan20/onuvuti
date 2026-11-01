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

type StoryService struct {
	repo  *repository.Repository
	cache *cache.TTLCache
}

func NewStoryService(repo *repository.Repository, c *cache.TTLCache) *StoryService {
	return &StoryService{
		repo:  repo,
		cache: c,
	}
}

type cachedSingleStory struct {
	Story    *models.Story
	Comments []models.Comment
}

// ListPublishedPaginated returns paginated stories + pagination metadata, plus a boolean indicating if served from RAM cache.
func (s *StoryService) ListPublishedPaginated(category, search string, page, limit int) (models.PaginatedStoriesResult, bool) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 6
	}

	cacheKey := fmt.Sprintf("stories:list:cat=%s:q=%s:p=%d:l=%d", strings.TrimSpace(category), strings.ToLower(strings.TrimSpace(search)), page, limit)
	if s.cache != nil {
		if val, hit := s.cache.Get(cacheKey); hit {
			if cachedRes, ok := val.(models.PaginatedStoriesResult); ok {
				return cachedRes, true
			}
		}
	}

	allFiltered := s.repo.ListPublishedStories(category, search)
	totalItems := len(allFiltered)
	totalPages := (totalItems + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}
	if page > totalPages {
		page = totalPages
	}

	start := (page - 1) * limit
	end := start + limit
	if start > totalItems {
		start = totalItems
	}
	if end > totalItems {
		end = totalItems
	}

	slice := allFiltered[start:end]
	if slice == nil {
		slice = []models.Story{}
	}

	result := models.PaginatedStoriesResult{
		Stories: slice,
		Pagination: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			TotalItems: totalItems,
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}

	if s.cache != nil {
		s.cache.Set(cacheKey, result, 60*time.Second)
	}

	return result, false
}

func (s *StoryService) GetBySlugOrID(slugOrID string) (*models.Story, []models.Comment, bool) {
	cacheKey := "stories:single:" + slugOrID
	if s.cache != nil {
		if val, hit := s.cache.Get(cacheKey); hit {
			if cached, ok := val.(cachedSingleStory); ok {
				return cached.Story, cached.Comments, true
			}
		}
	}

	st := s.repo.FindStoryBySlugOrID(slugOrID)
	if st == nil {
		return nil, nil, false
	}
	comments := s.repo.ListCommentsByStoryID(st.ID)

	if s.cache != nil {
		s.cache.Set(cacheKey, cachedSingleStory{Story: st, Comments: comments}, 90*time.Second)
	}

	return st, comments, false
}

func (s *StoryService) SubmitPending(req models.SubmitStoryRequest) (*models.Story, error) {
	if strings.TrimSpace(req.WebsiteURL) != "" {
		return nil, errors.New("বট বা স্প্যাম রিকোয়েস্ট শনাক্ত হয়েছে।")
	}

	title := sanitizer.Text(req.Title, 180)
	content := sanitizer.Text(req.Content, 8000)
	category := sanitizer.Text(req.Category, 60)
	if category == "" {
		category = "না বলা কথা"
	}

	if len([]rune(title)) < 4 {
		return nil, errors.New("অনুগ্রহ করে অন্তত ৪ অক্ষরের একটি সুন্দর শিরোনাম লিখুন।")
	}
	if len([]rune(content)) < 20 {
		return nil, errors.New("অনুগ্রহ করে আপনার গল্প বা কনফেশনটি আরেকটু বিস্তারিত লিখুন (অন্তত ২০ অক্ষর)।")
	}

	imageURL := strings.TrimSpace(req.ImageURL)
	if imageURL != "" && !sanitizer.ValidateOptionalImage(imageURL) {
		return nil, errors.New("ছবিটি বৈধ নয় বা ২ মেগাবাইটের বেশি। শুধুমাত্র JPG, PNG বা WEBP ছবি অনুমোদিত।")
	}

	author := "নাম প্রকাশে অনিচ্ছুক"
	if !req.IsAnonymous {
		if cleanAuthor := sanitizer.Text(req.Author, 80); cleanAuthor != "" {
			author = cleanAuthor
		}
	}

	now := time.Now()
	st := models.Story{
		ID:          fmt.Sprintf("p-%d", now.UnixMilli()),
		Slug:        fmt.Sprintf("story-%d", now.UnixMilli()),
		Title:       title,
		Excerpt:     MakeExcerpt(content, 125),
		Category:    category,
		ReadTimeBn:  "৩ মিনিট পাঠ",
		DateBn:      "আজ",
		Author:      author,
		IsAnonymous: req.IsAnonymous,
		ImageURL:    imageURL, // Empty if writer didn't upload an image
		ViewsCount:  1,
		LikesCount:  1,
		Reactions:   models.Reactions{Love: 1, Touched: 0, Relatable: 0},
		Content:     SplitParagraphs(content),
		RawContent:  content,
		Status:      "pending",
		SubmittedAt: "এইমাত্র",
		CreatedAt:   now,
	}

	saved := s.repo.CreateStory(st)
	return &saved, nil
}

func (s *StoryService) AddReaction(idOrSlug, reactionType string) (*models.Story, bool) {
	rType := strings.ToLower(strings.TrimSpace(reactionType))
	if rType != "love" && rType != "touched" && rType != "relatable" {
		rType = "love"
	}
	updated, ok := s.repo.AddReaction(idOrSlug, rType)
	if ok && s.cache != nil {
		s.cache.InvalidatePrefix("stories:")
	}
	return updated, ok
}

func SplitParagraphs(text string) []string {
	lines := strings.Split(text, "\n")
	var out []string
	for _, line := range lines {
		if trimmed := strings.TrimSpace(line); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	if len(out) == 0 && strings.TrimSpace(text) != "" {
		return []string{strings.TrimSpace(text)}
	}
	return out
}

func MakeExcerpt(text string, maxRunes int) string {
	flat := strings.ReplaceAll(strings.TrimSpace(text), "\n", " ")
	runes := []rune(flat)
	if len(runes) <= maxRunes {
		return flat
	}
	return string(runes[:maxRunes]) + "..."
}
