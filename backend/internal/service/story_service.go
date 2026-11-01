package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/sanitizer"
	"github.com/onuvuti/backend/internal/repository"
)

type StoryService struct {
	repo *repository.Repository
}

func NewStoryService(repo *repository.Repository) *StoryService {
	return &StoryService{repo: repo}
}

func (s *StoryService) ListPublished(category, search string) []models.Story {
	list := s.repo.ListPublishedStories(category, search)
	if list == nil {
		return []models.Story{}
	}
	return list
}

func (s *StoryService) GetBySlugOrID(slugOrID string) (*models.Story, []models.Comment) {
	st := s.repo.FindStoryBySlugOrID(slugOrID)
	if st == nil {
		return nil, nil
	}
	comments := s.repo.ListCommentsByStoryID(st.ID)
	return st, comments
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
	return s.repo.AddReaction(idOrSlug, rType)
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

