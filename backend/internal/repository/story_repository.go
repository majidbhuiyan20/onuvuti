package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/onuvuti/backend/internal/models"
)

func scanStoryRow(scanner interface{ Scan(dest ...any) error }) (*models.Story, error) {
	var st models.Story
	var contentRaw string
	err := scanner.Scan(
		&st.ID, &st.Slug, &st.Title, &st.Excerpt, &st.Category, &st.ReadTimeBn, &st.DateBn, &st.Author,
		&st.IsAnonymous, &st.IsAdminPost, &st.ConfessionIdBn, &st.ImageURL, &st.AdminNote,
		&st.ViewsCount, &st.LikesCount, &st.Reactions.Love, &st.Reactions.Touched, &st.Reactions.Relatable,
		&st.Featured, &contentRaw, &st.RawContent, &st.Status, &st.UserID, &st.SubmittedAt, &st.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	if contentRaw != "" {
		_ = json.Unmarshal([]byte(contentRaw), &st.Content)
	}
	if len(st.Content) == 0 && st.RawContent != "" {
		st.Content = []string{st.RawContent}
	}
	return &st, nil
}

func (r *Repository) ListPublishedStories(category, search string) []models.Story {
	if r.db != nil {
		cat := strings.TrimSpace(category)
		q := strings.ToLower(strings.TrimSpace(search))

		baseQuery := `
			SELECT id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			       is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
			       views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
			       featured, content_json, raw_content, status, user_id, submitted_at, created_at
			FROM stories
			WHERE status = 'published'
		`
		var args []any
		var conditions []string

		if cat != "" && cat != "সকল গল্প" {
			args = append(args, cat)
			conditions = append(conditions, fmt.Sprintf("category = $%d", len(args)))
		}
		if q != "" {
			args = append(args, "%"+q+"%")
			conditions = append(conditions, fmt.Sprintf("(LOWER(title) LIKE $%d OR LOWER(excerpt) LIKE $%d)", len(args), len(args)))
		}

		if len(conditions) > 0 {
			baseQuery += " AND " + strings.Join(conditions, " AND ")
		}
		baseQuery += " ORDER BY featured DESC, created_at DESC"

		rows, err := r.db.Query(baseQuery, args...)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListPublishedStories error: %v", err)
			return []models.Story{}
		}
		defer rows.Close()

		var out []models.Story
		for rows.Next() {
			st, err := scanStoryRow(rows)
			if err == nil && st != nil {
				out = append(out, *st)
			}
		}
		if out == nil {
			out = []models.Story{}
		}
		return out
	}

	// Memory fallback (when no DB connected)
	r.mu.RLock()
	defer r.mu.RUnlock()

	cat := strings.TrimSpace(category)
	q := strings.ToLower(strings.TrimSpace(search))

	var out []models.Story
	for _, st := range r.mem.Stories {
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
	if out == nil {
		out = []models.Story{}
	}
	return out
}

func (r *Repository) ListPendingStories() []models.Story {
	if r.db != nil {
		query := `
			SELECT id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			       is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
			       views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
			       featured, content_json, raw_content, status, user_id, submitted_at, created_at
			FROM stories
			WHERE status = 'pending'
			ORDER BY created_at DESC
		`
		rows, err := r.db.Query(query)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListPendingStories error: %v", err)
			return []models.Story{}
		}
		defer rows.Close()

		var out []models.Story
		for rows.Next() {
			st, err := scanStoryRow(rows)
			if err == nil && st != nil {
				out = append(out, *st)
			}
		}
		if out == nil {
			out = []models.Story{}
		}
		return out
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var out []models.Story
	for _, st := range r.mem.Stories {
		if st.Status == "pending" {
			out = append(out, st)
		}
	}
	if out == nil {
		out = []models.Story{}
	}
	return out
}

func (r *Repository) FindStoryBySlugOrID(slugOrID string) *models.Story {
	if r.db != nil {
		query := `
			SELECT id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			       is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
			       views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
			       featured, content_json, raw_content, status, user_id, submitted_at, created_at
			FROM stories
			WHERE (slug = $1 OR id = $1) AND status = 'published'
			LIMIT 1
		`
		row := r.db.QueryRow(query, slugOrID)
		st, err := scanStoryRow(row)
		if err == sql.ErrNoRows || err != nil {
			return nil
		}
		return st
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, st := range r.mem.Stories {
		if (st.Slug == slugOrID || st.ID == slugOrID) && st.Status == "published" {
			copySt := st
			return &copySt
		}
	}
	return nil
}

func (r *Repository) FindAnyStoryByID(id string) *models.Story {
	cleanID := strings.TrimPrefix(strings.TrimSpace(id), "#")
	if r.db != nil {
		query := `
			SELECT id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			       is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
			       views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
			       featured, content_json, raw_content, status, user_id, submitted_at, created_at
			FROM stories
			WHERE id = $1 OR slug = $1
			LIMIT 1
		`
		row := r.db.QueryRow(query, cleanID)
		st, err := scanStoryRow(row)
		if err == sql.ErrNoRows || err != nil {
			return nil
		}
		return st
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, st := range r.mem.Stories {
		if strings.EqualFold(st.ID, cleanID) || strings.EqualFold(st.Slug, cleanID) {
			copySt := st
			return &copySt
		}
	}
	return nil
}

func (r *Repository) NextConfessionBadge() string {
	bnDigits := []rune{'০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'}
	var nextNum int = 105

	if r.db != nil {
		err := r.db.QueryRow(`
			UPDATE system_settings
			SET value = (value::int + 1)::text
			WHERE key = 'confession_counter'
			RETURNING value::int
		`).Scan(&nextNum)
		if err != nil {
			_ = r.db.QueryRow(`
				INSERT INTO system_settings (key, value) VALUES ('confession_counter', '105')
				ON CONFLICT (key) DO UPDATE SET value = (system_settings.value::int + 1)::text
				RETURNING value::int
			`).Scan(&nextNum)
		}
	} else {
		r.mu.Lock()
		r.mem.ConfessionCounter++
		nextNum = r.mem.ConfessionCounter
		r.mu.Unlock()
	}

	s := fmt.Sprintf("%d", nextNum)
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
	if st.Status == "published" && st.Category == "ক্রাশ ও কনফেশন" && st.ConfessionIdBn == "" {
		st.ConfessionIdBn = r.NextConfessionBadge()
	}

	if r.db != nil {
		contentBytes, _ := json.Marshal(st.Content)
		_, err := r.db.Exec(`
			INSERT INTO stories (
				id, slug, title, excerpt, category, read_time_bn, date_bn, author,
				is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
				views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
				featured, content_json, raw_content, status, user_id, submitted_at, created_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8,
				$9, $10, $11, $12, $13,
				$14, $15, $16, $17,
				$18, $19, $20, $21, $22, $23, $24, $25
			)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				content_json = EXCLUDED.content_json,
				raw_content = EXCLUDED.raw_content,
				status = EXCLUDED.status,
				admin_note = EXCLUDED.admin_note,
				image_url = EXCLUDED.image_url
		`,
			st.ID, st.Slug, st.Title, st.Excerpt, st.Category, st.ReadTimeBn, st.DateBn, st.Author,
			st.IsAnonymous, st.IsAdminPost, st.ConfessionIdBn, st.ImageURL, st.AdminNote,
			st.ViewsCount, st.LikesCount, st.Reactions.Love, st.Reactions.Touched, st.Reactions.Relatable,
			st.Featured, string(contentBytes), st.RawContent, st.Status, st.UserID, st.SubmittedAt, st.CreatedAt,
		)
		if err != nil {
			log.Printf("⚠️ PostgreSQL CreateStory error: %v", err)
		}
		return st
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.mem.Stories = append([]models.Story{st}, r.mem.Stories...)
	return st
}

func (r *Repository) UpdateAndApproveStory(id string, updater func(*models.Story)) (*models.Story, bool) {
	st := r.FindAnyStoryByID(id)
	if st == nil {
		return nil, false
	}

	updater(st)
	st.Status = "published"
	if st.Category == "ক্রাশ ও কনফেশন" && st.ConfessionIdBn == "" {
		st.ConfessionIdBn = r.NextConfessionBadge()
	}

	if r.db != nil {
		contentBytes, _ := json.Marshal(st.Content)
		_, err := r.db.Exec(`
			UPDATE stories SET
				title = $1,
				excerpt = $2,
				category = $3,
				author = $4,
				confession_id_bn = $5,
				image_url = $6,
				admin_note = $7,
				content_json = $8,
				raw_content = $9,
				status = 'published'
			WHERE id = $10
		`, st.Title, st.Excerpt, st.Category, st.Author, st.ConfessionIdBn, st.ImageURL, st.AdminNote, string(contentBytes), st.RawContent, id)
		if err != nil {
			log.Printf("⚠️ PostgreSQL UpdateAndApproveStory error: %v", err)
			return nil, false
		}
		return st, true
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i, existing := range r.mem.Stories {
		if existing.ID == id {
			r.mem.Stories[i] = *st
			return st, true
		}
	}
	return nil, false
}

func (r *Repository) TogglePinStory(id string) (*models.Story, bool) {
	if r.db != nil {
		query := `
			UPDATE stories
			SET featured = NOT featured
			WHERE id = $1
			RETURNING id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			          is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
			          views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
			          featured, content_json, raw_content, status, user_id, submitted_at, created_at
		`
		row := r.db.QueryRow(query, id)
		st, err := scanStoryRow(row)
		if err != nil {
			log.Printf("⚠️ PostgreSQL TogglePinStory error: %v", err)
			return nil, false
		}
		return st, true
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i, st := range r.mem.Stories {
		if st.ID == id {
			st.Featured = !st.Featured
			r.mem.Stories[i] = st
			return &st, true
		}
	}
	return nil, false
}

func (r *Repository) DeleteStory(id string) bool {
	if r.db != nil {
		res, err := r.db.Exec(`DELETE FROM stories WHERE id = $1`, id)
		if err != nil {
			log.Printf("⚠️ PostgreSQL DeleteStory error: %v", err)
			return false
		}
		affected, _ := res.RowsAffected()
		return affected > 0
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i, st := range r.mem.Stories {
		if st.ID == id {
			r.mem.Stories = append(r.mem.Stories[:i], r.mem.Stories[i+1:]...)
			return true
		}
	}
	return false
}

func (r *Repository) AddReaction(idOrSlug, reactionType string) (*models.Story, bool) {
	if r.db != nil {
		query := `
			UPDATE stories SET
				reaction_love = reaction_love + CASE WHEN $2 = 'love' THEN 1 ELSE 0 END,
				likes_count = likes_count + CASE WHEN $2 = 'love' THEN 1 ELSE 0 END,
				reaction_touched = reaction_touched + CASE WHEN $2 = 'touched' THEN 1 ELSE 0 END,
				reaction_relatable = reaction_relatable + CASE WHEN $2 = 'relatable' THEN 1 ELSE 0 END
			WHERE (id = $1 OR slug = $1)
			RETURNING id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			          is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
			          views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
			          featured, content_json, raw_content, status, user_id, submitted_at, created_at
		`
		row := r.db.QueryRow(query, idOrSlug, reactionType)
		st, err := scanStoryRow(row)
		if err != nil {
			log.Printf("⚠️ PostgreSQL AddReaction error: %v", err)
			return nil, false
		}
		return st, true
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i, st := range r.mem.Stories {
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
			r.mem.Stories[i] = st
			return &st, true
		}
	}
	return nil, false
}
