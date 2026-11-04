package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) GetActivePoll() (*models.Poll, error) {
	if r.db != nil {
		var p models.Poll
		var optionsJSON []byte
		err := r.db.QueryRow(`
			SELECT id, question, options_json, is_active, created_at, updated_at
			FROM daily_polls
			WHERE is_active = TRUE
			ORDER BY created_at DESC
			LIMIT 1
		`).Scan(
			&p.ID, &p.Question, &optionsJSON, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				// No active poll in database — return nil so frontend displays clean empty state
				return nil, nil
			}
			log.Printf("⚠️ PostgreSQL GetActivePoll error: %v", err)
			return nil, err
		}

		_ = json.Unmarshal(optionsJSON, &p.Options)
		return &p, nil
	}

	return nil, nil
}

func (r *Repository) ListAllPollsForAdmin() []models.Poll {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT id, question, options_json, is_active, created_at, updated_at
			FROM daily_polls
			ORDER BY created_at DESC
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListAllPollsForAdmin error: %v", err)
			return []models.Poll{}
		}
		defer rows.Close()

		var list []models.Poll
		for rows.Next() {
			var p models.Poll
			var optionsJSON []byte
			if err := rows.Scan(
				&p.ID, &p.Question, &optionsJSON, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
			); err == nil {
				_ = json.Unmarshal(optionsJSON, &p.Options)
				list = append(list, p)
			}
		}
		return list
	}

	return []models.Poll{}
}

func (r *Repository) GetPollByID(id string) (*models.Poll, error) {
	if r.db != nil {
		var p models.Poll
		var optionsJSON []byte
		err := r.db.QueryRow(`
			SELECT id, question, options_json, is_active, created_at, updated_at
			FROM daily_polls
			WHERE id = $1
		`, id).Scan(
			&p.ID, &p.Question, &optionsJSON, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("প্রশ্ন পাওয়া যায়নি")
		}
		_ = json.Unmarshal(optionsJSON, &p.Options)
		return &p, nil
	}

	return nil, fmt.Errorf("ডাটাবেজ সংযোগ নেই")
}

func (r *Repository) CreatePoll(p models.Poll) (*models.Poll, error) {
	optionsJSON, _ := json.Marshal(p.Options)
	now := time.Now()

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO daily_polls (id, question, options_json, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, p.ID, p.Question, optionsJSON, p.IsActive, now, now)
		if err != nil {
			return nil, fmt.Errorf("ডাটাবেজে প্রশ্ন সংরক্ষণ করা যায়নি: %w", err)
		}
	}

	p.CreatedAt = now
	p.UpdatedAt = now
	return &p, nil
}

func (r *Repository) UpdatePoll(id string, req models.UpdatePollRequest) (*models.Poll, error) {
	existing, err := r.GetPollByID(id)
	if err != nil {
		return nil, err
	}

	if req.Question != "" {
		existing.Question = req.Question
	}
	if len(req.Options) > 0 {
		existing.Options = req.Options
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}

	now := time.Now()
	existing.UpdatedAt = now
	optionsJSON, _ := json.Marshal(existing.Options)

	if r.db != nil {
		_, err := r.db.Exec(`
			UPDATE daily_polls SET
				question = $1, options_json = $2, is_active = $3, updated_at = $4
			WHERE id = $5
		`, existing.Question, optionsJSON, existing.IsActive, now, id)
		if err != nil {
			return nil, fmt.Errorf("আপডেট ত্রুটি: %w", err)
		}
	}

	return existing, nil
}

func (r *Repository) DeletePoll(id string) error {
	if r.db != nil {
		_, err := r.db.Exec(`DELETE FROM daily_polls WHERE id = $1`, id)
		return err
	}
	return nil
}

func (r *Repository) VotePoll(pollID string, optionID string) (*models.Poll, error) {
	if r.db == nil {
		return nil, fmt.Errorf("ডাটাবেজ সংযোগ নেই")
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("ট্রানজেকশন শুরু করা যায়নি: %w", err)
	}
	defer tx.Rollback()

	var p models.Poll
	var optionsJSON []byte
	err = tx.QueryRow(`
		SELECT id, question, options_json, is_active, created_at, updated_at
		FROM daily_polls
		WHERE id = $1
		FOR UPDATE
	`, pollID).Scan(
		&p.ID, &p.Question, &optionsJSON, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("জরিপ প্রশ্ন পাওয়া যায়নি")
	}

	var options []models.PollOption
	if err := json.Unmarshal(optionsJSON, &options); err != nil {
		return nil, fmt.Errorf("অপশন ফরম্যাট সঠিক নয়")
	}

	found := false
	for i := range options {
		if options[i].ID == optionID {
			options[i].Votes++
			found = true
			break
		}
	}

	if !found {
		return nil, fmt.Errorf("নির্বাচিত অপশনটি পাওয়া যায়নি")
	}

	p.Options = options
	now := time.Now()
	p.UpdatedAt = now
	updatedJSON, _ := json.Marshal(options)

	_, err = tx.Exec(`
		UPDATE daily_polls SET options_json = $1, updated_at = $2 WHERE id = $3
	`, updatedJSON, now, pollID)
	if err != nil {
		return nil, fmt.Errorf("ভোট সংরক্ষণ করা যায়নি: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("ট্রানজেকশন সম্পন্ন করা যায়নি: %w", err)
	}

	return &p, nil
}
