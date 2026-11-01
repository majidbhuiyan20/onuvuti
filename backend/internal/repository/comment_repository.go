package repository

import (
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func defaultComments(storyID string) []models.Comment {
	return []models.Comment{
		{
			ID:          "c-1",
			StoryID:     storyID,
			Author:      "তাসনিম জাহান",
			IsAnonymous: false,
			Text:        "গল্পটা পড়ে নিজের জীবনের একটি অধ্যায়ের কথা মনে পড়ে গেল। সত্যিই অসাধারণ অনুভূতি!",
			TimeBn:      "২ ঘণ্টা আগে",
			CreatedAt:   time.Now().Add(-2 * time.Hour),
		},
		{
			ID:          "c-2",
			StoryID:     storyID,
			Author:      "নাম প্রকাশে অনিচ্ছুক",
			IsAnonymous: true,
			Text:        "কিছু না বলা কথা আসলেই চিরকাল বুকের ভেতরেই থেকে যায়। খুব স্পর্শ করল লেখাটি।",
			TimeBn:      "৪ ঘণ্টা আগে",
			CreatedAt:   time.Now().Add(-4 * time.Hour),
		},
	}
}

func (r *Repository) ListCommentsByStoryID(storyID string) []models.Comment {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT id, story_id, author, is_anonymous, text, time_bn, created_at
			FROM comments
			WHERE story_id = $1
			ORDER BY created_at DESC
		`, storyID)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListCommentsByStoryID error: %v", err)
			return defaultComments(storyID)
		}
		defer rows.Close()

		var out []models.Comment
		for rows.Next() {
			var c models.Comment
			if err := rows.Scan(&c.ID, &c.StoryID, &c.Author, &c.IsAnonymous, &c.Text, &c.TimeBn, &c.CreatedAt); err == nil {
				out = append(out, c)
			}
		}
		if len(out) == 0 {
			return defaultComments(storyID)
		}
		return out
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	comments := r.mem.Comments[storyID]
	if len(comments) == 0 {
		return defaultComments(storyID)
	}
	return comments
}

func (r *Repository) CreateComment(storyIDOrSlug string, c models.Comment) (*models.Comment, bool) {
	st := r.FindAnyStoryByID(storyIDOrSlug)
	if st == nil {
		return nil, false
	}
	c.StoryID = st.ID
	if c.CreatedAt.IsZero() {
		c.CreatedAt = time.Now()
	}

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO comments (id, story_id, author, is_anonymous, text, time_bn, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (id) DO NOTHING
		`, c.ID, c.StoryID, c.Author, c.IsAnonymous, c.Text, c.TimeBn, c.CreatedAt)
		if err != nil {
			log.Printf("⚠️ PostgreSQL CreateComment error: %v", err)
			return nil, false
		}
		return &c, true
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.mem.Comments[st.ID] = append([]models.Comment{c}, r.mem.Comments[st.ID]...)
	return &c, true
}

func (r *Repository) ListAllCommentsForAdmin() []models.Comment {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT c.id, c.story_id, c.author, c.is_anonymous, c.text, c.time_bn, c.created_at, COALESCE(s.title, '')
			FROM comments c
			LEFT JOIN stories s ON c.story_id = s.id
			ORDER BY c.created_at DESC
			LIMIT 150
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListAllCommentsForAdmin error: %v", err)
			return []models.Comment{}
		}
		defer rows.Close()

		var all []models.Comment
		for rows.Next() {
			var c models.Comment
			if err := rows.Scan(&c.ID, &c.StoryID, &c.Author, &c.IsAnonymous, &c.Text, &c.TimeBn, &c.CreatedAt, &c.StoryTitle); err == nil {
				all = append(all, c)
			}
		}
		if all == nil {
			all = []models.Comment{}
		}
		return all
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var all []models.Comment
	for _, st := range r.mem.Stories {
		if st.Status != "published" {
			continue
		}
		list := r.mem.Comments[st.ID]
		if len(list) == 0 {
			list = defaultComments(st.ID)
		}
		for _, c := range list {
			c.StoryID = st.ID
			c.StoryTitle = st.Title
			all = append(all, c)
		}
	}
	if all == nil {
		all = []models.Comment{}
	}
	return all
}

func (r *Repository) DeleteCommentByID(commentID string) bool {
	if r.db != nil {
		res, err := r.db.Exec(`DELETE FROM comments WHERE id = $1`, commentID)
		if err != nil {
			log.Printf("⚠️ PostgreSQL DeleteCommentByID error: %v", err)
			return false
		}
		affected, _ := res.RowsAffected()
		return affected > 0
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	for storyID, list := range r.mem.Comments {
		for idx, c := range list {
			if c.ID == commentID {
				r.mem.Comments[storyID] = append(list[:idx], list[idx+1:]...)
				return true
			}
		}
	}
	return false
}
