package repository

import (
	"fmt"
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func toBengaliDigits(n int) string {
	bnDigits := []rune{'০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'}
	s := fmt.Sprintf("%d", n)
	var out []rune
	for _, ch := range s {
		if ch >= '0' && ch <= '9' {
			out = append(out, bnDigits[ch-'0'])
		} else {
			out = append(out, ch)
		}
	}
	return string(out)
}

func FormatTimeBn(t time.Time) string {
	diff := time.Since(t)
	if diff < time.Minute {
		return "এইমাত্র"
	}
	mins := int(diff.Minutes())
	if mins < 60 {
		return fmt.Sprintf("%s মিনিট আগে", toBengaliDigits(mins))
	}
	hrs := int(diff.Hours())
	if hrs < 24 {
		return fmt.Sprintf("%s ঘণ্টা আগে", toBengaliDigits(hrs))
	}
	days := hrs / 24
	if days < 30 {
		return fmt.Sprintf("%s দিন আগে", toBengaliDigits(days))
	}
	months := days / 30
	return fmt.Sprintf("%s মাস আগে", toBengaliDigits(months))
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
			return []models.Comment{}
		}
		defer rows.Close()

		out := make([]models.Comment, 0)
		for rows.Next() {
			var c models.Comment
			if err := rows.Scan(&c.ID, &c.StoryID, &c.Author, &c.IsAnonymous, &c.Text, &c.TimeBn, &c.CreatedAt); err == nil {
				c.TimeBn = FormatTimeBn(c.CreatedAt)
				out = append(out, c)
			}
		}
		return out
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	comments := r.mem.Comments[storyID]
	if comments == nil {
		return []models.Comment{}
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
				c.TimeBn = FormatTimeBn(c.CreatedAt)
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
		for _, c := range list {
			c.StoryID = st.ID
			c.StoryTitle = st.Title
			c.TimeBn = FormatTimeBn(c.CreatedAt)
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
