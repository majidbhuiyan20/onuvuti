package repository

import (
	"log"
	"strings"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) FindUserByEmail(email string) *models.User {
	r.mu.RLock()
	defer r.mu.RUnlock()

	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	for _, u := range r.state.Users {
		if strings.ToLower(u.Email) == cleanEmail {
			copyU := u
			return &copyU
		}
	}
	return nil
}

func (r *Repository) FindUserByID(id string) *models.User {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.state.Users {
		if u.ID == id {
			copyU := u
			return &copyU
		}
	}
	return nil
}

func (r *Repository) CreateOrUpdateUser(u models.User) models.User {
	r.mu.Lock()
	defer r.mu.Unlock()

	cleanEmail := strings.ToLower(strings.TrimSpace(u.Email))
	u.Email = cleanEmail

	found := false
	for i, existing := range r.state.Users {
		if strings.ToLower(existing.Email) == cleanEmail || existing.ID == u.ID {
			r.state.Users[i] = u
			found = true
			break
		}
	}
	if !found {
		r.state.Users = append([]models.User{u}, r.state.Users...)
	}

	_ = r.saveLocked()
	r.upsertUserPostgres(u)
	return u
}

func (r *Repository) ListStoriesByUserID(userID string) []models.Story {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var out []models.Story
	for _, st := range r.state.Stories {
		if st.UserID == userID {
			out = append(out, st)
		}
	}
	return out
}

func (r *Repository) upsertUserPostgres(u models.User) {
	if r.pg == nil {
		return
	}
	_, err := r.pg.Exec(`
		INSERT INTO users (id, name, email, password_hash, provider, avatar_url, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			avatar_url = EXCLUDED.avatar_url
	`, u.ID, u.Name, u.Email, u.PasswordHash, u.Provider, u.AvatarURL, u.CreatedAt)
	if err != nil {
		log.Printf("⚠️ Postgres user upsert error: %v", err)
	}
}

