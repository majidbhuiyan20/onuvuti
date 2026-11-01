package repository

import (
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) ListCommentsByStoryID(storyID string) []models.Comment {
	r.mu.RLock()
	defer r.mu.RUnlock()

	comments := r.state.Comments[storyID]
	if len(comments) == 0 {
		return defaultComments(storyID)
	}
	return comments
}

func (r *Repository) CreateComment(storyIDOrSlug string, c models.Comment) (*models.Comment, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	var targetID string
	for _, st := range r.state.Stories {
		if st.ID == storyIDOrSlug || st.Slug == storyIDOrSlug {
			targetID = st.ID
			break
		}
	}
	if targetID == "" {
		return nil, false
	}

	c.StoryID = targetID
	existing := r.state.Comments[targetID]
	if len(existing) == 0 {
		existing = defaultComments(targetID)
	}
	r.state.Comments[targetID] = append([]models.Comment{c}, existing...)
	_ = r.saveLocked()

	if r.pg != nil {
		_, err := r.pg.Exec(`
			INSERT INTO comments (id, story_id, author, is_anonymous, text, time_bn, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (id) DO NOTHING
		`, c.ID, c.StoryID, c.Author, c.IsAnonymous, c.Text, c.TimeBn, c.CreatedAt)
		if err != nil {
			log.Printf("[PostgreSQL] insert comment error: %v", err)
		}
	}

	return &c, true
}

func defaultComments(storyID string) []models.Comment {
	return []models.Comment{
		{
			ID:        "c1",
			StoryID:   storyID,
			Author:    "তাসনিম জাহান",
			Text:      "গল্পটা পড়ে মনটা ভীষণ ছুঁয়ে গেল। আমাদের সবার জীবনেই এমন কিছু না বলা অনুভূতি থাকে।",
			TimeBn:    "২ ঘণ্টা আগে",
			CreatedAt: time.Now().Add(-2 * time.Hour),
		},
		{
			ID:          "c2",
			StoryID:     storyID,
			Author:      "নাম প্রকাশে অনিচ্ছুক",
			IsAnonymous: true,
			Text:        "একদম আমার জীবনের সাথে মিলে গেছে। লেখকের জন্য অনেক শুভকামনা ও ভালোবাসা রইল।",
			TimeBn:      "৫ ঘণ্টা আগে",
			CreatedAt:   time.Now().Add(-5 * time.Hour),
		},
	}
}

