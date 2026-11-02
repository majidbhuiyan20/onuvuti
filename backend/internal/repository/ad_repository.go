package repository

import (
	"fmt"
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) ListAllAds() []models.AdBanner {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT slot, title, image_url, link_url, is_active, updated_at
			FROM ads
			ORDER BY slot ASC
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListAllAds error: %v", err)
			return r.defaultAds()
		}
		defer rows.Close()

		var list []models.AdBanner
		for rows.Next() {
			var ad models.AdBanner
			if err := rows.Scan(&ad.Slot, &ad.Title, &ad.ImageURL, &ad.LinkURL, &ad.IsActive, &ad.UpdatedAt); err == nil {
				list = append(list, ad)
			}
		}
		if len(list) == 0 {
			return r.defaultAds()
		}
		return list
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var list []models.AdBanner
	for _, ad := range r.mem.Ads {
		list = append(list, ad)
	}
	if len(list) == 0 {
		return r.defaultAds()
	}
	return list
}

func (r *Repository) ListActiveAds() []models.AdBanner {
	all := r.ListAllAds()
	var active []models.AdBanner
	for _, ad := range all {
		if ad.IsActive {
			active = append(active, ad)
		}
	}
	if active == nil {
		active = []models.AdBanner{}
	}
	return active
}

func (r *Repository) GetAdBySlot(slot string) (*models.AdBanner, error) {
	if r.db != nil {
		row := r.db.QueryRow(`
			SELECT slot, title, image_url, link_url, is_active, updated_at
			FROM ads
			WHERE slot = $1
		`, slot)

		var ad models.AdBanner
		if err := row.Scan(&ad.Slot, &ad.Title, &ad.ImageURL, &ad.LinkURL, &ad.IsActive, &ad.UpdatedAt); err != nil {
			return nil, fmt.Errorf("বিজ্ঞাপন পাওয়া যায়নি")
		}
		return &ad, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	if ad, ok := r.mem.Ads[slot]; ok {
		return &ad, nil
	}
	return nil, fmt.Errorf("বিজ্ঞাপন পাওয়া যায়নি")
}

func (r *Repository) UpdateAd(slot string, req models.UpdateAdRequest) (*models.AdBanner, error) {
	now := time.Now()

	if r.db != nil {
		query := `
			INSERT INTO ads (slot, title, image_url, link_url, is_active, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (slot) DO UPDATE SET
				title = EXCLUDED.title,
				image_url = EXCLUDED.image_url,
				link_url = EXCLUDED.link_url,
				is_active = EXCLUDED.is_active,
				updated_at = EXCLUDED.updated_at
			RETURNING slot, title, image_url, link_url, is_active, updated_at
		`
		row := r.db.QueryRow(query, slot, req.Title, req.ImageURL, req.LinkURL, req.IsActive, now)
		var ad models.AdBanner
		if err := row.Scan(&ad.Slot, &ad.Title, &ad.ImageURL, &ad.LinkURL, &ad.IsActive, &ad.UpdatedAt); err != nil {
			log.Printf("⚠️ PostgreSQL UpdateAd error: %v", err)
			return nil, fmt.Errorf("বিজ্ঞাপন সংরক্ষণ করা যায়নি: %w", err)
		}
		return &ad, nil
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	ad := models.AdBanner{
		Slot:      slot,
		Title:     req.Title,
		ImageURL:  req.ImageURL,
		LinkURL:   req.LinkURL,
		IsActive:  req.IsActive,
		UpdatedAt: now,
	}
	r.mem.Ads[slot] = ad
	return &ad, nil
}

func (r *Repository) defaultAds() []models.AdBanner {
	now := time.Now()
	return []models.AdBanner{
		{
			Slot:      "left_sidebar",
			Title:     "স্পর্শের ব্যাকরণ - অনুভূতি পাবলিকেশন্স",
			ImageURL:  "/images/book-cover.png",
			LinkURL:   "/sporsher-byakoron",
			IsActive:  true,
			UpdatedAt: now,
		},
		{
			Slot:      "right_sidebar",
			Title:     "স্পর্শের ব্যাকরণ - ই-বুক সংগ্রহ করুন",
			ImageURL:  "/images/book-back.png",
			LinkURL:   "/sporsher-byakoron",
			IsActive:  true,
			UpdatedAt: now,
		},
	}
}
