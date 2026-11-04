package models

import "time"

type BirthdayWish struct {
	ID            string    `json:"id"`
	RecipientName string    `json:"recipientName"`
	SenderName    string    `json:"senderName"`
	Relationship  string    `json:"relationship"`
	Message       string    `json:"message"`
	Theme         string    `json:"theme"`
	ViewsCount    int       `json:"viewsCount"`
	CreatedAt     time.Time `json:"createdAt"`
}

type CreateWishRequest struct {
	RecipientName string `json:"recipientName"`
	SenderName    string `json:"senderName"`
	Relationship  string `json:"relationship"`
	Message       string `json:"message"`
	Theme         string `json:"theme"`
}

