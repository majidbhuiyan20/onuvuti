package models

import "time"

type Comment struct {
	ID          string    `json:"id"`
	StoryID     string    `json:"storyId"`
	Author      string    `json:"author"`
	IsAnonymous bool      `json:"isAnonymous,omitempty"`
	Text        string    `json:"text"`
	TimeBn      string    `json:"timeBn"`
	CreatedAt   time.Time `json:"createdAt"`
}

type AddCommentRequest struct {
	Author      string `json:"author"`
	IsAnonymous bool   `json:"isAnonymous"`
	Text        string `json:"text"`
	WebsiteURL  string `json:"websiteUrl,omitempty"` // Honeypot anti-bot field
}

