package models

import "time"

type Reactions struct {
	Love      int `json:"love"`
	Touched   int `json:"touched"`
	Relatable int `json:"relatable"`
}

type Story struct {
	ID             string    `json:"id"`
	Slug           string    `json:"slug"`
	Title          string    `json:"title"`
	Excerpt        string    `json:"excerpt"`
	Category       string    `json:"category"`
	ReadTimeBn     string    `json:"readTimeBn"`
	DateBn         string    `json:"dateBn"`
	Author         string    `json:"author"`
	IsAnonymous    bool      `json:"isAnonymous,omitempty"`
	IsAdminPost    bool      `json:"isAdminPost,omitempty"`
	ConfessionIdBn string    `json:"confessionIdBn,omitempty"`
	// ImageURL is strictly optional (omitempty). Only present if writer or admin explicitly added one.
	ImageURL    string    `json:"imageUrl,omitempty"`
	// AdminNote is an optional editorial reply/advice ("সম্পাদকের কথা / পরামর্শ") shown below the story.
	AdminNote   string    `json:"adminNote,omitempty"`
	ViewsCount  int       `json:"viewsCount"`
	LikesCount  int       `json:"likesCount"`
	Reactions   Reactions `json:"reactions"`
	Featured    bool      `json:"featured,omitempty"`
	Content     []string  `json:"content"`
	RawContent  string    `json:"rawContent,omitempty"`
	Status      string    `json:"status"` // "published" | "pending"
	SubmittedAt string    `json:"submittedAt,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type SubmitStoryRequest struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	Category    string `json:"category"`
	Author      string `json:"author"`
	IsAnonymous bool   `json:"isAnonymous"`
	ImageURL    string `json:"imageUrl,omitempty"`
	WebsiteURL  string `json:"websiteUrl,omitempty"` // Honeypot anti-bot field
}

type ReactionRequest struct {
	Type string `json:"type"` // "love" | "touched" | "relatable"
}

type PaginationMeta struct {
	Page       int  `json:"page"`
	Limit      int  `json:"limit"`
	TotalItems int  `json:"totalItems"`
	TotalPages int  `json:"totalPages"`
	HasNext    bool `json:"hasNext"`
	HasPrev    bool `json:"hasPrev"`
}

type PaginatedStoriesResult struct {
	Stories    []Story        `json:"stories"`
	Pagination PaginationMeta `json:"pagination"`
}


