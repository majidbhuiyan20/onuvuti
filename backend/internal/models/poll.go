package models

import "time"

type PollOption struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Votes int    `json:"votes"`
}

type Poll struct {
	ID        string       `json:"id"`
	Question  string       `json:"question"`
	Options   []PollOption `json:"options"`
	IsActive  bool         `json:"isActive"`
	CreatedAt time.Time    `json:"createdAt"`
	UpdatedAt time.Time    `json:"updatedAt"`
}

type CreatePollRequest struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
	IsActive *bool    `json:"isActive,omitempty"`
}

type UpdatePollRequest struct {
	Question string       `json:"question,omitempty"`
	Options  []PollOption `json:"options,omitempty"`
	IsActive *bool        `json:"isActive,omitempty"`
}

type VotePollRequest struct {
	OptionID string `json:"optionId"`
}

