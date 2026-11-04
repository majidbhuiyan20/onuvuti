package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

var (
	ErrInboxNotFound   = errors.New("ইনবক্সটি খুঁজে পাওয়া যায়নি")
	ErrMessageNotFound = errors.New("বার্তাটি খুঁজে পাওয়া যায়নি")
)

// CreateInbox inserts a new anonymous inbox with its hashed manage key.
func (r *Repository) CreateInbox(rec models.SecretInboxRecord) error {
	if err := r.requireDB(); err != nil {
		return err
	}
	rec.CreatedAt = time.Now()

	_, err := r.db.Exec(`
		INSERT INTO secret_inboxes (
			id, username, display_name, prompt_text, theme, manage_key_hash, is_active, messages_count, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, rec.ID, rec.Username, rec.DisplayName, rec.PromptText, rec.Theme, rec.ManageKeyHash, true, 0, rec.CreatedAt)
	if err != nil {
		return fmt.Errorf("ইনবক্স তৈরি করা যায়নি: %w", err)
	}
	return nil
}

// GetInboxByUsername fetches the inbox record including its manage key hash.
func (r *Repository) GetInboxByUsername(username string) (*models.SecretInboxRecord, error) {
	if err := r.requireDB(); err != nil {
		return nil, err
	}
	var in models.SecretInboxRecord
	err := r.db.QueryRow(`
		SELECT id, username, display_name, prompt_text, theme, manage_key_hash, is_active, messages_count, created_at
		FROM secret_inboxes
		WHERE LOWER(username) = LOWER($1)
	`, username).Scan(
		&in.ID, &in.Username, &in.DisplayName, &in.PromptText, &in.Theme,
		&in.ManageKeyHash, &in.IsActive, &in.MessagesCount, &in.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrInboxNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("ইনবক্স লোড করতে ব্যর্থ: %w", err)
	}
	return &in, nil
}

// IsUsernameTaken checks if a username is already registered.
func (r *Repository) IsUsernameTaken(username string) (bool, error) {
	if err := r.requireDB(); err != nil {
		return false, err
	}
	var count int
	err := r.db.QueryRow(`
		SELECT COUNT(1) FROM secret_inboxes WHERE LOWER(username) = LOWER($1)
	`, username).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateMessage saves a secret message and increments the inbox's message counter.
func (r *Repository) CreateMessage(msg models.SecretMessage) error {
	if err := r.requireDB(); err != nil {
		return err
	}
	msg.CreatedAt = time.Now()

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
		INSERT INTO secret_messages (
			id, inbox_id, content, mood_emoji, card_theme, reply_text, is_read, is_favorite, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, msg.ID, msg.InboxID, msg.Content, msg.MoodEmoji, msg.CardTheme, "", false, false, msg.CreatedAt)
	if err != nil {
		return fmt.Errorf("বার্তা পাঠানো যায়নি: %w", err)
	}

	_, err = tx.Exec(`
		UPDATE secret_inboxes
		SET messages_count = messages_count + 1
		WHERE id = $1
	`, msg.InboxID)
	if err != nil {
		return fmt.Errorf("ইনবক্স আপডেট করা যায়নি: %w", err)
	}

	return tx.Commit()
}

// GetMessagesByInboxID returns all messages for an inbox, latest first.
func (r *Repository) GetMessagesByInboxID(inboxID string) ([]models.SecretMessage, error) {
	if err := r.requireDB(); err != nil {
		return nil, err
	}
	rows, err := r.db.Query(`
		SELECT id, inbox_id, content, mood_emoji, card_theme, reply_text, is_read, is_favorite, created_at
		FROM secret_messages
		WHERE inbox_id = $1
		ORDER BY created_at DESC
	`, inboxID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.SecretMessage
	for rows.Next() {
		var m models.SecretMessage
		if err := rows.Scan(
			&m.ID, &m.InboxID, &m.Content, &m.MoodEmoji, &m.CardTheme,
			&m.ReplyText, &m.IsRead, &m.IsFavorite, &m.CreatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	if list == nil {
		list = []models.SecretMessage{}
	}
	return list, nil
}

// GetMessageByID retrieves a single message by ID.
func (r *Repository) GetMessageByID(msgID string) (*models.SecretMessage, error) {
	if err := r.requireDB(); err != nil {
		return nil, err
	}
	var m models.SecretMessage
	err := r.db.QueryRow(`
		SELECT id, inbox_id, content, mood_emoji, card_theme, reply_text, is_read, is_favorite, created_at
		FROM secret_messages
		WHERE id = $1
	`, msgID).Scan(
		&m.ID, &m.InboxID, &m.Content, &m.MoodEmoji, &m.CardTheme,
		&m.ReplyText, &m.IsRead, &m.IsFavorite, &m.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrMessageNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// UpdateMessageReply saves the owner's reply.
func (r *Repository) UpdateMessageReply(msgID string, replyText string) error {
	if err := r.requireDB(); err != nil {
		return err
	}
	res, err := r.db.Exec(`
		UPDATE secret_messages
		SET reply_text = $1, is_read = TRUE
		WHERE id = $2
	`, replyText, msgID)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return ErrMessageNotFound
	}
	return nil
}

// DeleteMessage deletes a secret message.
func (r *Repository) DeleteMessage(msgID string) error {
	if err := r.requireDB(); err != nil {
		return err
	}
	res, err := r.db.Exec(`DELETE FROM secret_messages WHERE id = $1`, msgID)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return ErrMessageNotFound
	}
	return nil
}

// GetSecretStats returns counts for admin dashboard.
func (r *Repository) GetSecretStats() (int, int, error) {
	if err := r.requireDB(); err != nil {
		return 0, 0, err
	}
	var inboxes, messages int
	_ = r.db.QueryRow(`SELECT COUNT(1) FROM secret_inboxes`).Scan(&inboxes)
	_ = r.db.QueryRow(`SELECT COUNT(1) FROM secret_messages`).Scan(&messages)
	return inboxes, messages, nil
}
