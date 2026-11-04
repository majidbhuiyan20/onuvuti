package models

import "time"

type DailyQuote struct {
	ID         string    `json:"id"`
	Quote      string    `json:"quote"`
	Author     string    `json:"author"`
	ReactCount int       `json:"reactCount"`
	StoryID    string    `json:"storyId,omitempty"`
	IsActive   bool      `json:"isActive"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateQuoteRequest struct {
	Quote    string `json:"quote"`
	Author   string `json:"author"`
	StoryID  string `json:"storyId,omitempty"`
	IsActive *bool  `json:"isActive,omitempty"`
}

type UpdateQuoteRequest struct {
	Quote    string `json:"quote,omitempty"`
	Author   string `json:"author,omitempty"`
	StoryID  string `json:"storyId,omitempty"`
	IsActive *bool  `json:"isActive,omitempty"`
}

