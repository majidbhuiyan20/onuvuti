package repository

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) ListPublishedStories(category, search string) []models.Story {
	r.mu.RLock()
	defer r.mu.RUnlock()

	cat := strings.TrimSpace(category)
	q := strings.ToLower(strings.TrimSpace(search))

	var out []models.Story
	for _, st := range r.state.Stories {
		if st.Status != "published" {
			continue
		}
		if cat != "" && cat != "সকল গল্প" && st.Category != cat {
			continue
		}
		if q != "" &&
			!strings.Contains(strings.ToLower(st.Title), q) &&
			!strings.Contains(strings.ToLower(st.Excerpt), q) {
			continue
		}
		out = append(out, st)
	}
	return out
}

func (r *Repository) ListPendingStories() []models.Story {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var out []models.Story
	for _, st := range r.state.Stories {
		if st.Status == "pending" {
			out = append(out, st)
		}
	}
	return out
}

func (r *Repository) FindStoryBySlugOrID(slugOrID string) *models.Story {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, st := range r.state.Stories {
		if (st.Slug == slugOrID || st.ID == slugOrID) && st.Status == "published" {
			copySt := st
			return &copySt
		}
	}
	return nil
}

func (r *Repository) FindAnyStoryByID(id string) *models.Story {
	r.mu.RLock()
	defer r.mu.RUnlock()

	cleanID := strings.TrimPrefix(strings.TrimSpace(id), "#")
	for _, st := range r.state.Stories {
		if strings.EqualFold(st.ID, cleanID) || strings.EqualFold(st.Slug, cleanID) {
			copySt := st
			return &copySt
		}
	}
	return nil
}

func (r *Repository) NextConfessionBadgeLocked() string {
	r.state.ConfessionCounter++
	bnDigits := []rune{'০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'}
	s := fmt.Sprintf("%d", r.state.ConfessionCounter)
	var out strings.Builder
	for _, ch := range s {
		if ch >= '0' && ch <= '9' {
			out.WriteRune(bnDigits[ch-'0'])
		} else {
			out.WriteRune(ch)
		}
	}
	return "#কনফেশন_" + out.String()
}

func (r *Repository) CreateStory(st models.Story) models.Story {
	r.mu.Lock()
	defer r.mu.Unlock()

	if st.Status == "published" && st.Category == "ক্রাশ ও কনফেশন" && st.ConfessionIdBn == "" {
		st.ConfessionIdBn = r.NextConfessionBadgeLocked()
	}

	r.state.Stories = append([]models.Story{st}, r.state.Stories...)
	_ = r.saveLocked()
	r.upsertStoryPostgres(st)
	return st
}

func (r *Repository) UpdateAndApproveStory(id string, updater func(*models.Story)) (*models.Story, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i, st := range r.state.Stories {
		if st.ID == id {
			updater(&st)
			if st.Category == "ক্রাশ ও কনফেশন" && st.ConfessionIdBn == "" {
				st.ConfessionIdBn = r.NextConfessionBadgeLocked()
			}
			st.Status = "published"
			r.state.Stories[i] = st
			_ = r.saveLocked()
			r.upsertStoryPostgres(st)
			return &st, true
		}
	}
	return nil, false
}

func (r *Repository) TogglePinStory(id string) (*models.Story, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i, st := range r.state.Stories {
		if st.ID == id {
			st.Featured = !st.Featured
			r.state.Stories[i] = st
			_ = r.saveLocked()
			r.upsertStoryPostgres(st)
			return &st, true
		}
	}
	return nil, false
}

func (r *Repository) DeleteStory(id string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i, st := range r.state.Stories {
		if st.ID == id {
			r.state.Stories = append(r.state.Stories[:i], r.state.Stories[i+1:]...)
			_ = r.saveLocked()
			if r.pg != nil {
				_, _ = r.pg.Exec(`DELETE FROM stories WHERE id = $1`, id)
			}
			return true
		}
	}
	return false
}

func (r *Repository) AddReaction(idOrSlug, reactionType string) (*models.Story, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i, st := range r.state.Stories {
		if st.ID == idOrSlug || st.Slug == idOrSlug {
			switch reactionType {
			case "touched":
				st.Reactions.Touched++
			case "relatable":
				st.Reactions.Relatable++
			default:
				st.Reactions.Love++
				st.LikesCount++
			}
			r.state.Stories[i] = st
			_ = r.saveLocked()
			r.upsertStoryPostgres(st)
			return &st, true
		}
	}
	return nil, false
}

func (r *Repository) upsertStoryPostgres(st models.Story) {
	if r.pg == nil {
		return
	}
	contentBytes, _ := json.Marshal(st.Content)
	_, err := r.pg.Exec(`
		INSERT INTO stories (
			id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			is_anonymous, is_admin_post, confession_id_bn, image_url, views_count,
			likes_count, reaction_love, reaction_touched, reaction_relatable,
			featured, content_json, raw_content, status, submitted_at, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13,
			$14, $15, $16, $17,
			$18, $19, $20, $21, $22, $23
		)
		ON CONFLICT (id) DO UPDATE SET
			title = EXCLUDED.title,
			excerpt = EXCLUDED.excerpt,
			category = EXCLUDED.category,
			author = EXCLUDED.author,
			is_admin_post = EXCLUDED.is_admin_post,
			confession_id_bn = EXCLUDED.confession_id_bn,
			image_url = EXCLUDED.image_url,
			views_count = EXCLUDED.views_count,
			likes_count = EXCLUDED.likes_count,
			reaction_love = EXCLUDED.reaction_love,
			reaction_touched = EXCLUDED.reaction_touched,
			reaction_relatable = EXCLUDED.reaction_relatable,
			content_json = EXCLUDED.content_json,
			raw_content = EXCLUDED.raw_content,
			status = EXCLUDED.status
	`,
		st.ID, st.Slug, st.Title, st.Excerpt, st.Category, st.ReadTimeBn, st.DateBn, st.Author,
		st.IsAnonymous, st.IsAdminPost, st.ConfessionIdBn, st.ImageURL, st.ViewsCount,
		st.LikesCount, st.Reactions.Love, st.Reactions.Touched, st.Reactions.Relatable,
		st.Featured, string(contentBytes), st.RawContent, st.Status, st.SubmittedAt, st.CreatedAt,
	)
	if err != nil {
		log.Printf("[PostgreSQL] upsert story error: %v", err)
	}
}

