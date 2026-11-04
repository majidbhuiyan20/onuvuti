package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

var (
	ErrWishNotFound  = errors.New("wish not found")
	ErrWishDestroyed = errors.New("wish destroyed")
)

func (r *Repository) requireDB() error {
	if r.db == nil {
		return fmt.Errorf("ডাটাবেজ সংযোগ নেই")
	}
	return nil
}

// CreateWish persists a fully validated record (media + hashed secrets included).
func (r *Repository) CreateWish(rec models.WishRecord) (*models.BirthdayWish, error) {
	if err := r.requireDB(); err != nil {
		return nil, err
	}
	rec.CreatedAt = time.Now()

	_, err := r.db.Exec(`
		INSERT INTO birthday_wishes (
			id, recipient_name, sender_name, relationship, message, theme, font_style, music,
			photo_url, voice_url, unlock_at, passcode_salt, passcode_hash, self_destruct,
			manage_key_hash, views_count, created_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,0,$16)
	`, rec.ID, rec.RecipientName, rec.SenderName, rec.Relationship, rec.Message, rec.Theme,
		rec.FontStyle, rec.Music, rec.PhotoURL, rec.VoiceURL, rec.UnlockAt, rec.PasscodeSalt,
		rec.PasscodeHash, rec.SelfDestruct, rec.ManageKeyHash, rec.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("ডাটাবেজে জন্মদিনের চিঠি তৈরি করা যায়নি: %w", err)
	}

	rec.HasPasscode = rec.PasscodeHash != ""
	rec.HasPhoto = rec.PhotoURL != ""
	rec.HasVoice = rec.VoiceURL != ""
	return &rec.BirthdayWish, nil
}

// GetWishRecord loads the full row (no side effects, no view increment).
func (r *Repository) GetWishRecord(id string) (*models.WishRecord, error) {
	if err := r.requireDB(); err != nil {
		return nil, err
	}
	var w models.WishRecord
	err := r.db.QueryRow(`
		SELECT id, recipient_name, sender_name, relationship, message, theme, font_style, music,
		       photo_url, voice_url, unlock_at, passcode_salt, passcode_hash, self_destruct,
		       (destroyed_at IS NOT NULL), manage_key_hash, failed_attempts, last_failed_at,
		       views_count, created_at
		FROM birthday_wishes WHERE id = $1
	`, id).Scan(
		&w.ID, &w.RecipientName, &w.SenderName, &w.Relationship, &w.Message, &w.Theme, &w.FontStyle, &w.Music,
		&w.PhotoURL, &w.VoiceURL, &w.UnlockAt, &w.PasscodeSalt, &w.PasscodeHash, &w.SelfDestruct,
		&w.Destroyed, &w.ManageKeyHash, &w.FailedAttempts, &w.LastFailedAt,
		&w.ViewsCount, &w.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrWishNotFound
	}
	if err != nil {
		return nil, err
	}
	w.HasPasscode = w.PasscodeHash != ""
	w.HasPhoto = w.PhotoURL != ""
	w.HasVoice = w.VoiceURL != ""
	return &w, nil
}

func (r *Repository) RegisterWishFailedAttempt(id string) error {
	_, err := r.db.Exec(`
		UPDATE birthday_wishes SET failed_attempts = failed_attempts + 1, last_failed_at = NOW() WHERE id = $1
	`, id)
	return err
}

// ClaimWishOpen atomically counts a view and, for self-destructing letters, marks the letter
// destroyed and wipes its content so it can be read exactly once.
func (r *Repository) ClaimWishOpen(id string) (*models.WishContent, int, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, 0, err
	}
	defer func() { _ = tx.Rollback() }()

	var (
		content models.WishContent
		views   int
		selfDes bool
	)
	err = tx.QueryRow(`
		UPDATE birthday_wishes
		SET views_count = views_count + 1,
		    failed_attempts = 0,
		    destroyed_at = CASE WHEN self_destruct THEN NOW() ELSE NULL END
		WHERE id = $1 AND destroyed_at IS NULL
		RETURNING message, photo_url, voice_url, views_count, self_destruct
	`, id).Scan(&content.Message, &content.PhotoURL, &content.VoiceURL, &views, &selfDes)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, 0, ErrWishDestroyed
	}
	if err != nil {
		return nil, 0, err
	}

	if selfDes {
		if _, err := tx.Exec(`
			UPDATE birthday_wishes
			SET message = '[এই চিঠিটি পড়ার পর স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়েছে]', photo_url = '', voice_url = ''
			WHERE id = $1
		`, id); err != nil {
			return nil, 0, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, 0, err
	}
	return &content, views, nil
}

func (r *Repository) ListWishesAdmin(limit int) ([]models.BirthdayWish, error) {
	if r.db == nil {
		return []models.BirthdayWish{}, nil
	}
	if limit <= 0 || limit > 300 {
		limit = 100
	}
	rows, err := r.db.Query(`
		SELECT w.id, w.recipient_name, w.sender_name, w.relationship, w.message, w.theme, w.font_style, w.music,
		       w.unlock_at, (w.passcode_hash <> ''), w.self_destruct, (w.destroyed_at IS NOT NULL),
		       (w.photo_url <> ''), (w.voice_url <> ''), w.views_count,
		       (SELECT COUNT(*) FROM wish_replies rp WHERE rp.wish_id = w.id), w.created_at
		FROM birthday_wishes w
		ORDER BY w.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []models.BirthdayWish{}
	for rows.Next() {
		var w models.BirthdayWish
		if err := rows.Scan(
			&w.ID, &w.RecipientName, &w.SenderName, &w.Relationship, &w.Message, &w.Theme, &w.FontStyle, &w.Music,
			&w.UnlockAt, &w.HasPasscode, &w.SelfDestruct, &w.Destroyed,
			&w.HasPhoto, &w.HasVoice, &w.ViewsCount, &w.ReplyCount, &w.CreatedAt,
		); err != nil {
			continue
		}
		list = append(list, w)
	}
	return list, nil
}

func (r *Repository) WishStats() (*models.WishStats, error) {
	stats := &models.WishStats{ByTheme: map[string]int{}}
	if r.db == nil {
		return stats, nil
	}
	err := r.db.QueryRow(`
		SELECT COUNT(*), COALESCE(SUM(views_count),0),
		       COUNT(*) FILTER (WHERE unlock_at IS NOT NULL),
		       COUNT(*) FILTER (WHERE passcode_hash <> ''),
		       COUNT(*) FILTER (WHERE self_destruct)
		FROM birthday_wishes
	`).Scan(&stats.Total, &stats.TotalViews, &stats.Scheduled, &stats.Protected, &stats.SelfDestruct)
	if err != nil {
		return nil, err
	}
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM wish_replies`).Scan(&stats.TotalReplies); err != nil {
		return nil, err
	}

	rows, err := r.db.Query(`SELECT theme, COUNT(*) FROM birthday_wishes GROUP BY theme`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var theme string
		var n int
		if rows.Scan(&theme, &n) == nil {
			stats.ByTheme[theme] = n
		}
	}
	return stats, nil
}

func (r *Repository) DeleteWish(id string) error {
	if err := r.requireDB(); err != nil {
		return err
	}
	_, err := r.db.Exec(`DELETE FROM birthday_wishes WHERE id = $1`, id)
	return err
}

// ---- Replies / reactions ----

const maxRepliesPerWish = 50

func (r *Repository) AddWishReply(wishID string, rep models.WishReply) error {
	if err := r.requireDB(); err != nil {
		return err
	}
	res, err := r.db.Exec(`
		INSERT INTO wish_replies (id, wish_id, emoji, text)
		SELECT $1::text, $2::text, $3::text, $4::text
		WHERE (SELECT COUNT(*) FROM wish_replies WHERE wish_id = $2::text) < $5::int
	`, rep.ID, wishID, rep.Emoji, rep.Text, maxRepliesPerWish)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("এই চিঠিতে আর নতুন রিঅ্যাকশন নেওয়া যাচ্ছে না")
	}
	return nil
}

func (r *Repository) ListWishReplies(wishID string) ([]models.WishReply, error) {
	if err := r.requireDB(); err != nil {
		return nil, err
	}
	rows, err := r.db.Query(`
		SELECT id, emoji, text, created_at FROM wish_replies WHERE wish_id = $1 ORDER BY created_at DESC
	`, wishID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []models.WishReply{}
	for rows.Next() {
		var rp models.WishReply
		if rows.Scan(&rp.ID, &rp.Emoji, &rp.Text, &rp.CreatedAt) == nil {
			list = append(list, rp)
		}
	}
	return list, nil
}
