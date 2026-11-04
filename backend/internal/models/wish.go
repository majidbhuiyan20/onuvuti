package models

import "time"

// BirthdayWish is the owner/admin view of a letter (never includes media blobs or secrets).
type BirthdayWish struct {
	ID            string     `json:"id"`
	RecipientName string     `json:"recipientName"`
	SenderName    string     `json:"senderName"`
	Relationship  string     `json:"relationship"`
	Message       string     `json:"message"`
	Theme         string     `json:"theme"`
	FontStyle     string     `json:"fontStyle"`
	Music         string     `json:"music"`
	UnlockAt      *time.Time `json:"unlockAt,omitempty"`
	HasPasscode   bool       `json:"hasPasscode"`
	SelfDestruct  bool       `json:"selfDestruct"`
	Destroyed     bool       `json:"destroyed"`
	HasPhoto      bool       `json:"hasPhoto"`
	HasVoice      bool       `json:"hasVoice"`
	ViewsCount    int        `json:"viewsCount"`
	ReplyCount    int        `json:"replyCount"`
	CreatedAt     time.Time  `json:"createdAt"`
}

// WishPublic is what anyone holding the link may see BEFORE the letter is opened.
// It never contains the message, photo, voice note or passcode data.
type WishPublic struct {
	ID            string     `json:"id"`
	RecipientName string     `json:"recipientName"`
	SenderName    string     `json:"senderName"`
	Relationship  string     `json:"relationship"`
	Theme         string     `json:"theme"`
	FontStyle     string     `json:"fontStyle"`
	Music         string     `json:"music"`
	UnlockAt      *time.Time `json:"unlockAt,omitempty"`
	Locked        bool       `json:"locked"`
	HasPasscode   bool       `json:"hasPasscode"`
	SelfDestruct  bool       `json:"selfDestruct"`
	Destroyed     bool       `json:"destroyed"`
	HasPhoto      bool       `json:"hasPhoto"`
	HasVoice      bool       `json:"hasVoice"`
	ViewsCount    int        `json:"viewsCount"`
	CreatedAt     time.Time  `json:"createdAt"`
	ServerNow     time.Time  `json:"serverNow"`
}

// WishContent is the protected payload released only by a successful "open".
type WishContent struct {
	Message  string `json:"message"`
	PhotoURL string `json:"photoUrl,omitempty"`
	VoiceURL string `json:"voiceUrl,omitempty"`
}

// WishRecord is the full database row including secrets. Internal use only.
type WishRecord struct {
	BirthdayWish
	PhotoURL       string
	VoiceURL       string
	PasscodeSalt   string
	PasscodeHash   string
	ManageKeyHash  string
	FailedAttempts int
	LastFailedAt   *time.Time
}

type CreateWishRequest struct {
	RecipientName string `json:"recipientName"`
	SenderName    string `json:"senderName"`
	Relationship  string `json:"relationship"`
	Message       string `json:"message"`
	Theme         string `json:"theme"`
	FontStyle     string `json:"fontStyle"`
	Music         string `json:"music"`
	PhotoURL      string `json:"photoUrl"`
	VoiceURL      string `json:"voiceUrl"`
	UnlockAt      string `json:"unlockAt"` // RFC3339, optional
	Passcode      string `json:"passcode"` // optional
	SelfDestruct  bool   `json:"selfDestruct"`
}

type OpenWishRequest struct {
	Passcode string `json:"passcode"`
}

type WishReply struct {
	ID        string    `json:"id"`
	Emoji     string    `json:"emoji"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateWishReplyRequest struct {
	Emoji string `json:"emoji"`
	Text  string `json:"text"`
}

// WishStats powers the admin dashboard header.
type WishStats struct {
	Total        int            `json:"total"`
	TotalViews   int            `json:"totalViews"`
	TotalReplies int            `json:"totalReplies"`
	Scheduled    int            `json:"scheduled"`
	Protected    int            `json:"protected"`
	SelfDestruct int            `json:"selfDestruct"`
	ByTheme      map[string]int `json:"byTheme"`
}
