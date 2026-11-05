package repository

import (
	"database/sql"
	"log"
	"strings"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) FindUserByEmail(email string) *models.User {
	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	if cleanEmail == "" {
		return nil
	}

	if r.db != nil {
		var u models.User
		err := r.db.QueryRow(`
			SELECT id, name, email, password_hash, provider, avatar_url, created_at
			FROM users
			WHERE LOWER(email) = LOWER($1)
			LIMIT 1
		`, cleanEmail).Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Provider, &u.AvatarURL, &u.CreatedAt)
		if err == sql.ErrNoRows || err != nil {
			return nil
		}
		return &u
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.mem.Users {
		if strings.ToLower(u.Email) == cleanEmail {
			copyU := u
			return &copyU
		}
	}
	return nil
}

func (r *Repository) FindUserByID(id string) *models.User {
	if strings.TrimSpace(id) == "" {
		return nil
	}

	if r.db != nil {
		var u models.User
		err := r.db.QueryRow(`
			SELECT id, name, email, password_hash, provider, avatar_url, created_at
			FROM users
			WHERE id = $1
			LIMIT 1
		`, id).Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Provider, &u.AvatarURL, &u.CreatedAt)
		if err == sql.ErrNoRows || err != nil {
			return nil
		}
		return &u
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.mem.Users {
		if u.ID == id {
			copyU := u
			return &copyU
		}
	}
	return nil
}

func (r *Repository) CreateOrUpdateUser(u models.User) models.User {
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO users (id, name, email, password_hash, provider, avatar_url, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (email) DO UPDATE SET
				name = EXCLUDED.name,
				avatar_url = EXCLUDED.avatar_url,
				provider = EXCLUDED.provider
		`, u.ID, u.Name, u.Email, u.PasswordHash, u.Provider, u.AvatarURL, u.CreatedAt)
		if err != nil {
			log.Printf("⚠️ PostgreSQL CreateOrUpdateUser error: %v", err)
		}
		return u
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	found := false
	for i, existing := range r.mem.Users {
		if strings.ToLower(existing.Email) == u.Email || existing.ID == u.ID {
			r.mem.Users[i] = u
			found = true
			break
		}
	}
	if !found {
		r.mem.Users = append([]models.User{u}, r.mem.Users...)
	}
	return u
}

func (r *Repository) ListUsers() []models.User {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT id, name, email, provider, avatar_url, created_at
			FROM users
			ORDER BY created_at DESC
			LIMIT 300
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListUsers error: %v", err)
			return []models.User{}
		}
		defer rows.Close()

		var list []models.User
		for rows.Next() {
			var u models.User
			if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Provider, &u.AvatarURL, &u.CreatedAt); err == nil {
				list = append(list, u)
			}
		}
		if list == nil {
			list = []models.User{}
		}
		return list
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []models.User
	for _, u := range r.mem.Users {
		copyU := u
		copyU.PasswordHash = ""
		list = append(list, copyU)
	}
	return list
}

func (r *Repository) ListStoriesByUserID(userID string) []models.Story {
	if strings.TrimSpace(userID) == "" {
		return []models.Story{}
	}

	if r.db != nil {
		query := `
			SELECT id, slug, title, excerpt, category, read_time_bn, date_bn, author,
			       is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
			       views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
			       featured, content_json, raw_content, status, user_id, submitted_at, created_at
			FROM stories
			WHERE user_id = $1
			ORDER BY created_at DESC
		`
		rows, err := r.db.Query(query, userID)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListStoriesByUserID error: %v", err)
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
		if st.UserID == userID {
			out = append(out, st)
		}
	}
	if out == nil {
		out = []models.Story{}
	}
	return out
}
