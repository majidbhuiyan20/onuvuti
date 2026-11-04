package service

import (
	"crypto/subtle"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/repository"
)

var (
	ErrInvalidUsername    = errors.New("ইউজারনেম ৩ থেকে ৩০ অক্ষরের মধ্যে (a-z, 0-9, _, -) হতে হবে")
	ErrUsernameReserved   = errors.New("এই ইউজারনেমটি সংরক্ষিত, অন্য একটি নির্বাচন করুন")
	ErrUsernameTaken      = errors.New("এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে, অন্য একটি চেষ্টা করুন")
	ErrInvalidContent     = errors.New("বার্তাটি কমপক্ষে ১ অক্ষর এবং সর্বোচ্চ ৬০০ অক্ষরের মধ্যে হতে হবে")
	ErrInvalidManageKey   = errors.New("ইনবক্স খোলার সিক্রেট কি (Key) সঠিক নয়")
	ErrRateLimitExceeded  = errors.New("অল্প সময়ে অনেকগুলো বার্তা পাঠানো হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন")
)

var (
	usernameRegex = regexp.MustCompile(`^[a-z0-9_\-]{3,30}$`)
	reservedUsernames = map[string]bool{
		"admin": true, "api": true, "app": true, "auth": true, "birthday": true,
		"blog": true, "book": true, "category": true, "dashboard": true, "help": true,
		"home": true, "inbox": true, "login": true, "m": true, "message": true,
		"privacy": true, "secret": true, "settings": true, "signup": true, "terms": true,
		"tips": true, "wish": true, "null": true, "undefined": true,
	}
	allowedMoodEmojis = map[string]bool{
		"❤️": true, "🥺": true, "🤫": true, "🔥": true, "🌹": true,
		"💌": true, "💫": true, "😍": true, "✨": true, "👀": true,
	}
)

type SecretService struct {
	repo       *repository.Repository
	rateLimits sync.Map // ip -> []time.Time
}

func NewSecretService(repo *repository.Repository) *SecretService {
	return &SecretService{repo: repo}
}

// CreateInbox handles registration of a new anonymous profile and returns the private manage key.
func (s *SecretService) CreateInbox(req models.CreateInboxRequest) (*models.CreateInboxResponse, error) {
	username := strings.ToLower(strings.TrimSpace(req.Username))
	if !usernameRegex.MatchString(username) {
		return nil, ErrInvalidUsername
	}
	if reservedUsernames[username] {
		return nil, ErrUsernameReserved
	}

	taken, err := s.repo.IsUsernameTaken(username)
	if err != nil {
		return nil, err
	}
	if taken {
		return nil, ErrUsernameTaken
	}

	displayName := strings.TrimSpace(req.DisplayName)
	if displayName == "" {
		displayName = username
	}
	if utf8.RuneCountInString(displayName) > 60 {
		displayName = string([]rune(displayName)[:60])
	}

	promptText := strings.TrimSpace(req.PromptText)
	if promptText == "" {
		promptText = "আমাকে যা বলতে চাও কিন্তু সামনাসামনি বলতে পারোনি..."
	}
	if utf8.RuneCountInString(promptText) > 150 {
		promptText = string([]rune(promptText)[:150])
	}

	theme := strings.TrimSpace(req.Theme)
	if theme == "" {
		theme = "crimson_love"
	}

	inboxID := "inbox_" + randomHex(8)
	manageKey := randomHex(16) // 32 chars hex secret
	manageKeyHash := sha256Hex(manageKey)

	record := models.SecretInboxRecord{
		SecretInbox: models.SecretInbox{
			ID:            inboxID,
			Username:      username,
			DisplayName:   displayName,
			PromptText:    promptText,
			Theme:         theme,
			IsActive:      true,
			MessagesCount: 0,
		},
		ManageKeyHash: manageKeyHash,
	}

	if err := s.repo.CreateInbox(record); err != nil {
		return nil, err
	}

	publicView := models.SecretInboxPublic{
		Username:      username,
		DisplayName:   displayName,
		PromptText:    promptText,
		Theme:         theme,
		MessagesCount: 0,
		CreatedAt:     time.Now(),
	}

	return &models.CreateInboxResponse{
		Inbox:     publicView,
		ManageKey: manageKey,
		PublicURL: "/m/" + username,
		InboxURL:  "/m/" + username + "/inbox?key=" + manageKey,
	}, nil
}

// GetPublicInbox loads the public profile for someone wanting to send a secret message.
func (s *SecretService) GetPublicInbox(username string) (*models.SecretInboxPublic, error) {
	username = strings.ToLower(strings.TrimSpace(username))
	inbox, err := s.repo.GetInboxByUsername(username)
	if err != nil {
		return nil, err
	}

	return &models.SecretInboxPublic{
		Username:      inbox.Username,
		DisplayName:   inbox.DisplayName,
		PromptText:    inbox.PromptText,
		Theme:         inbox.Theme,
		MessagesCount: inbox.MessagesCount,
		CreatedAt:     inbox.CreatedAt,
	}, nil
}

// CheckRateLimit prevents flooding (max 8 messages per 2 minutes per client).
func (s *SecretService) checkRateLimit(clientKey string) bool {
	if clientKey == "" {
		clientKey = "default"
	}
	now := time.Now()
	cutoff := now.Add(-2 * time.Minute)

	val, _ := s.rateLimits.LoadOrStore(clientKey, []time.Time{})
	timestamps, _ := val.([]time.Time)

	var valid []time.Time
	for _, t := range timestamps {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= 8 {
		s.rateLimits.Store(clientKey, valid)
		return false
	}

	valid = append(valid, now)
	s.rateLimits.Store(clientKey, valid)
	return true
}

// SendMessage allows anyone to anonymously send a secret note.
func (s *SecretService) SendMessage(username string, req models.SendMessageRequest, clientIP string) (*models.SecretMessage, error) {
	if !s.checkRateLimit(clientIP + ":" + username) {
		return nil, ErrRateLimitExceeded
	}

	content := strings.TrimSpace(req.Content)
	runesCount := utf8.RuneCountInString(content)
	if runesCount < 1 || runesCount > 600 {
		return nil, ErrInvalidContent
	}

	username = strings.ToLower(strings.TrimSpace(username))
	inbox, err := s.repo.GetInboxByUsername(username)
	if err != nil {
		return nil, err
	}

	emoji := strings.TrimSpace(req.MoodEmoji)
	if !allowedMoodEmojis[emoji] {
		emoji = "💌"
	}

	cardTheme := strings.TrimSpace(req.CardTheme)
	if cardTheme == "" {
		cardTheme = "crimson"
	}

	msgID := "msg_" + randomHex(8)
	msg := models.SecretMessage{
		ID:         msgID,
		InboxID:    inbox.ID,
		Content:    content,
		MoodEmoji:  emoji,
		CardTheme:  cardTheme,
		ReplyText:  "",
		IsRead:     false,
		IsFavorite: false,
		CreatedAt:  time.Now(),
	}

	if err := s.repo.CreateMessage(msg); err != nil {
		return nil, err
	}

	return &msg, nil
}

// verifyManageKey performs constant-time comparison of the provided manage key hash.
func (s *SecretService) verifyManageKey(inbox *models.SecretInboxRecord, manageKey string) bool {
	if manageKey == "" {
		return false
	}
	hashed := sha256Hex(manageKey)
	return subtle.ConstantTimeCompare([]byte(hashed), []byte(inbox.ManageKeyHash)) == 1
}

// GetPrivateInbox loads the owner's messages list after authenticating with manageKey.
func (s *SecretService) GetPrivateInbox(username, manageKey string) (*models.PrivateInboxView, error) {
	username = strings.ToLower(strings.TrimSpace(username))
	inbox, err := s.repo.GetInboxByUsername(username)
	if err != nil {
		return nil, err
	}

	if !s.verifyManageKey(inbox, manageKey) {
		return nil, ErrInvalidManageKey
	}

	messages, err := s.repo.GetMessagesByInboxID(inbox.ID)
	if err != nil {
		return nil, err
	}

	publicInbox := models.SecretInboxPublic{
		Username:      inbox.Username,
		DisplayName:   inbox.DisplayName,
		PromptText:    inbox.PromptText,
		Theme:         inbox.Theme,
		MessagesCount: inbox.MessagesCount,
		CreatedAt:     inbox.CreatedAt,
	}

	return &models.PrivateInboxView{
		Inbox:    publicInbox,
		Messages: messages,
	}, nil
}

// ReplyMessage updates the reply for a message.
func (s *SecretService) ReplyMessage(username, msgID, manageKey, replyText string) error {
	username = strings.ToLower(strings.TrimSpace(username))
	inbox, err := s.repo.GetInboxByUsername(username)
	if err != nil {
		return err
	}

	if !s.verifyManageKey(inbox, manageKey) {
		return ErrInvalidManageKey
	}

	replyText = strings.TrimSpace(replyText)
	if utf8.RuneCountInString(replyText) > 600 {
		return fmt.Errorf("উত্তর সর্বোচ্চ ৬০০ অক্ষরের মধ্যে হতে হবে")
	}

	msg, err := s.repo.GetMessageByID(msgID)
	if err != nil {
		return err
	}

	if msg.InboxID != inbox.ID {
		return repository.ErrMessageNotFound
	}

	return s.repo.UpdateMessageReply(msgID, replyText)
}

// DeleteMessage removes a message from the owner's inbox.
func (s *SecretService) DeleteMessage(username, msgID, manageKey string) error {
	username = strings.ToLower(strings.TrimSpace(username))
	inbox, err := s.repo.GetInboxByUsername(username)
	if err != nil {
		return err
	}

	if !s.verifyManageKey(inbox, manageKey) {
		return ErrInvalidManageKey
	}

	msg, err := s.repo.GetMessageByID(msgID)
	if err != nil {
		return err
	}

	if msg.InboxID != inbox.ID {
		return repository.ErrMessageNotFound
	}

	return s.repo.DeleteMessage(msgID)
}

// GetStats returns admin analytics counts.
func (s *SecretService) GetStats() (int, int, error) {
	return s.repo.GetSecretStats()
}
