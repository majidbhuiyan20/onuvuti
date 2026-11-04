package repository

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) GetActiveQuote() (*models.DailyQuote, error) {
	if r.db != nil {
		var q models.DailyQuote
		var storyID sql.NullString
		err := r.db.QueryRow(`
			SELECT id, quote, author, react_count, story_id, is_active, created_at, updated_at
			FROM daily_quotes
			WHERE is_active = TRUE
			ORDER BY created_at DESC
			LIMIT 1
		`).Scan(
			&q.ID, &q.Quote, &q.Author, &q.ReactCount, &storyID, &q.IsActive, &q.CreatedAt, &q.UpdatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				// No active quote in database — return nil so frontend displays clean empty state
				return nil, nil
			}
			log.Printf("⚠️ PostgreSQL GetActiveQuote error: %v", err)
			return nil, err
		}

		if storyID.Valid {
			q.StoryID = storyID.String
		}
		return &q, nil
	}

	return nil, nil
}

func (r *Repository) ListAllQuotesForAdmin() []models.DailyQuote {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT id, quote, author, react_count, story_id, is_active, created_at, updated_at
			FROM daily_quotes
			ORDER BY created_at DESC
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListAllQuotesForAdmin error: %v", err)
			return []models.DailyQuote{}
		}
		defer rows.Close()

		var list []models.DailyQuote
		for rows.Next() {
			var q models.DailyQuote
			var storyID sql.NullString
			if err := rows.Scan(
				&q.ID, &q.Quote, &q.Author, &q.ReactCount, &storyID, &q.IsActive, &q.CreatedAt, &q.UpdatedAt,
			); err == nil {
				if storyID.Valid {
					q.StoryID = storyID.String
				}
				list = append(list, q)
			}
		}
		return list
	}

	return []models.DailyQuote{}
}

func (r *Repository) GetQuoteByID(id string) (*models.DailyQuote, error) {
	if r.db != nil {
		var q models.DailyQuote
		var storyID sql.NullString
		err := r.db.QueryRow(`
			SELECT id, quote, author, react_count, story_id, is_active, created_at, updated_at
			FROM daily_quotes
			WHERE id = $1
		`, id).Scan(
			&q.ID, &q.Quote, &q.Author, &q.ReactCount, &storyID, &q.IsActive, &q.CreatedAt, &q.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("উদ্ধৃতি বা না বলা কথা পাওয়া যায়নি")
		}
		if storyID.Valid {
			q.StoryID = storyID.String
		}
		return &q, nil
	}

	return nil, fmt.Errorf("ডাটাবেজ সংযোগ নেই")
}

func (r *Repository) CreateQuote(q models.DailyQuote) (*models.DailyQuote, error) {
	now := time.Now()

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO daily_quotes (id, quote, author, react_count, story_id, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`, q.ID, q.Quote, q.Author, q.ReactCount, q.StoryID, q.IsActive, now, now)
		if err != nil {
			return nil, fmt.Errorf("ডাটাবেজে উদ্ধৃতি সংরক্ষণ করা যায়নি: %w", err)
		}
	}

	q.CreatedAt = now
	q.UpdatedAt = now
	return &q, nil
}

func (r *Repository) UpdateQuote(id string, req models.UpdateQuoteRequest) (*models.DailyQuote, error) {
	existing, err := r.GetQuoteByID(id)
	if err != nil {
		return nil, err
	}

	if req.Quote != "" {
		existing.Quote = req.Quote
	}
	if req.Author != "" {
		existing.Author = req.Author
	}
	if req.StoryID != "" {
		existing.StoryID = req.StoryID
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}

	now := time.Now()
	existing.UpdatedAt = now

	if r.db != nil {
		_, err := r.db.Exec(`
			UPDATE daily_quotes SET
				quote = $1, author = $2, story_id = $3, is_active = $4, updated_at = $5
			WHERE id = $6
		`, existing.Quote, existing.Author, existing.StoryID, existing.IsActive, now, id)
		if err != nil {
			return nil, fmt.Errorf("আপডেট ত্রুটি: %w", err)
		}
	}

	return existing, nil
}

func (r *Repository) DeleteQuote(id string) error {
	if r.db != nil {
		_, err := r.db.Exec(`DELETE FROM daily_quotes WHERE id = $1`, id)
		return err
	}
	return nil
}

func (r *Repository) ReactQuote(id string) (int, error) {
	if r.db == nil {
		return 0, fmt.Errorf("ডাটাবেজ সংযোগ নেই")
	}

	var newCount int
	err := r.db.QueryRow(`
		UPDATE daily_quotes
		SET react_count = react_count + 1, updated_at = NOW()
		WHERE id = $1
		RETURNING react_count
	`, id).Scan(&newCount)
	if err != nil {
		return 0, fmt.Errorf("প্রতিক্রিয়া গ্রহণ করা যায়নি: %w", err)
	}

	return newCount, nil
}
