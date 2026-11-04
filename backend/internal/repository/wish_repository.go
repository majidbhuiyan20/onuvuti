package repository

import (
	"fmt"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) CreateWish(wish models.BirthdayWish) (*models.BirthdayWish, error) {
	now := time.Now()
	wish.CreatedAt = now

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO birthday_wishes (id, recipient_name, sender_name, relationship, message, theme, views_count, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`, wish.ID, wish.RecipientName, wish.SenderName, wish.Relationship, wish.Message, wish.Theme, wish.ViewsCount, now)
		if err != nil {
			return nil, fmt.Errorf("ডাটাবেজে জন্মদিনের চিঠি তৈরি করা যায়নি: %w", err)
		}
	}

	return &wish, nil
}

func (r *Repository) GetWishByID(id string) (*models.BirthdayWish, error) {
	if r.db == nil {
		return nil, fmt.Errorf("ডাটাবেজ সংযোগ নেই")
	}

	var w models.BirthdayWish
	err := r.db.QueryRow(`
		UPDATE birthday_wishes
		SET views_count = views_count + 1
		WHERE id = $1
		RETURNING id, recipient_name, sender_name, relationship, message, theme, views_count, created_at
	`, id).Scan(
		&w.ID, &w.RecipientName, &w.SenderName, &w.Relationship, &w.Message, &w.Theme, &w.ViewsCount, &w.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("চিঠিটি পাওয়া যায়নি বা মেয়াদোত্তীর্ণ হয়েছে")
	}

	return &w, nil
}

func (r *Repository) ListWishesAdmin(limit int) ([]models.BirthdayWish, error) {
	if r.db == nil {
		return []models.BirthdayWish{}, nil
	}
	if limit <= 0 || limit > 300 {
		limit = 100
	}
	rows, err := r.db.Query(`
		SELECT id, recipient_name, sender_name, relationship, message, theme, views_count, created_at
		FROM birthday_wishes
		ORDER BY created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.BirthdayWish
	for rows.Next() {
		var w models.BirthdayWish
		if err := rows.Scan(
			&w.ID, &w.RecipientName, &w.SenderName, &w.Relationship, &w.Message, &w.Theme, &w.ViewsCount, &w.CreatedAt,
		); err != nil {
			continue
		}
		list = append(list, w)
	}
	if list == nil {
		list = []models.BirthdayWish{}
	}
	return list, nil
}

func (r *Repository) DeleteWish(id string) error {
	if r.db == nil {
		return fmt.Errorf("ডাটাবেজ সংযোগ নেই")
	}
	_, err := r.db.Exec(`DELETE FROM birthday_wishes WHERE id = $1`, id)
	return err
}

