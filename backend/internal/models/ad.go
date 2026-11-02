package models

import "time"

type AdBanner struct {
	Slot      string    `json:"slot"`
	Title     string    `json:"title"`
	ImageURL  string    `json:"imageUrl"`
	LinkURL   string    `json:"linkUrl"`
	IsActive  bool      `json:"isActive"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UpdateAdRequest struct {
	Title    string `json:"title"`
	ImageURL string `json:"imageUrl"`
	LinkURL  string `json:"linkUrl"`
	IsActive bool   `json:"isActive"`
}

