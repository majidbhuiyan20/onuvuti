package models

import "time"

// SecretInbox represents an anonymous inbox account/profile.
type SecretInbox struct {
	ID            string    `json:"id"`
	Username      string    `json:"username"`
	DisplayName   string    `json:"displayName"`
	PromptText    string    `json:"promptText"`
	Theme         string    `json:"theme"`
	IsActive      bool      `json:"isActive"`
	MessagesCount int       `json:"messagesCount"`
	CreatedAt     time.Time `json:"createdAt"`
}

// SecretInboxRecord is the internal DB representation including the private hashed manage key.
type SecretInboxRecord struct {
	SecretInbox
	ManageKeyHash string
}

// SecretInboxPublic is what visitors see when opening someone's anonymous link.
type SecretInboxPublic struct {
	Username      string    `json:"username"`
	DisplayName   string    `json:"displayName"`
	PromptText    string    `json:"promptText"`
	Theme         string    `json:"theme"`
	MessagesCount int       `json:"messagesCount"`
	CreatedAt     time.Time `json:"createdAt"`
}

// SecretMessage represents an anonymous submission received by an inbox.
type SecretMessage struct {
	ID         string    `json:"id"`
	InboxID    string    `json:"inboxId"`
	Content    string    `json:"content"`
	MoodEmoji  string    `json:"moodEmoji"`
	CardTheme  string    `json:"cardTheme"`
	ReplyText  string    `json:"replyText"`
	IsRead     bool      `json:"isRead"`
	IsFavorite bool      `json:"isFavorite"`
	CreatedAt  time.Time `json:"createdAt"`
}

// CreateInboxRequest is the payload to generate a new anonymous link.
type CreateInboxRequest struct {
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	PromptText  string `json:"promptText"`
	Theme       string `json:"theme"`
}

// CreateInboxResponse returns the newly created link and the one-time private key.
type CreateInboxResponse struct {
	Inbox     SecretInboxPublic `json:"inbox"`
	ManageKey string            `json:"manageKey"`
	PublicURL string            `json:"publicUrl"`
	InboxURL  string            `json:"inboxUrl"`
}

// SendMessageRequest is what friends submit anonymously.
type SendMessageRequest struct {
	Content   string `json:"content"`
	MoodEmoji string `json:"moodEmoji"`
	CardTheme string `json:"cardTheme"`
}

// ReplyMessageRequest is used by the inbox owner to answer a message.
type ReplyMessageRequest struct {
	ReplyText string `json:"replyText"`
}

// PrivateInboxView returns the full inbox details and all messages for the owner.
type PrivateInboxView struct {
	Inbox    SecretInboxPublic `json:"inbox"`
	Messages []SecretMessage   `json:"messages"`
}
