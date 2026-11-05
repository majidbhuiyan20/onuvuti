package service

import (
	"crypto/pbkdf2"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/repository"
)

// Typed errors let the HTTP layer pick the right status code without string matching.
var (
	ErrWishNotFound    = errors.New("জন্মদিনের চিঠিটি খুঁজে পাওয়া যায়নি")
	ErrWishLocked      = errors.New("চিঠিটি এখনো খোলার সময় হয়নি")
	ErrWishDestroyed   = errors.New("এই চিঠিটি একবার পড়ার পর মুছে ফেলা হয়েছে")
	ErrBadPasscode     = errors.New("সিক্রেট কোডটি সঠিক নয়")
	ErrTooManyAttempts = errors.New("অনেকবার ভুল কোড দেওয়া হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন")
	ErrBadManageKey    = errors.New("রিঅ্যাকশন দেখার অনুমতি নেই")
)

const (
	maxNameRunes    = 80
	maxMessageRunes = 5000
	maxReplyRunes   = 300
	maxPhotoBytes   = 900_000
	maxVoiceBytes   = 1_500_000
	maxFailedTries  = 8
	lockoutWindow   = 15 * time.Minute
	pbkdf2Rounds    = 100_000
)

var (
	allowedThemes = map[string]bool{
		"rose": true, "vintage": true, "midnight": true, "gold": true,
		"blossom": true, "spring": true, "royal": true, "ocean": true,
		"wedding_royal": true, "anniversary_gold": true,
	}
	allowedFonts  = map[string]bool{"classic": true, "handwritten": true}
	allowedMusic  = map[string]bool{"none": true, "happy_birthday": true, "lullaby": true, "romantic": true, "shehnai": true}
	allowedEmojis = map[string]bool{"❤️": true, "😍": true, "🥹": true, "🎉": true, "🥳": true, "🙏": true}

	photoDataURL = regexp.MustCompile(`^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$`)
	voiceDataURL = regexp.MustCompile(`^data:audio/(webm|ogg|mp4|mpeg|x-m4a|aac)(;codecs=[a-zA-Z0-9.,]+)?;base64,[A-Za-z0-9+/=]+$`)
)

type WishService struct {
	repo *repository.Repository
}

func NewWishService(repo *repository.Repository) *WishService {
	return &WishService{repo: repo}
}

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func hashPasscode(passcode, salt string) string {
	key, err := pbkdf2.Key(sha256.New, passcode, []byte(salt), pbkdf2Rounds, 32)
	if err != nil {
		return ""
	}
	return hex.EncodeToString(key)
}

func sha256Hex(s string) string {
	sum := sha256.Sum256([]byte(s))
	return hex.EncodeToString(sum[:])
}

func safeEqual(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

func validateRunes(field, value string, max int) error {
	if utf8.RuneCountInString(value) > max {
		return fmt.Errorf("%s অনেক বড় হয়ে গেছে (সর্বোচ্চ %d অক্ষর)", field, max)
	}
	return nil
}

// CreateWish validates the request and returns the stored wish plus the one-time manage key.
func (s *WishService) CreateWish(req models.CreateWishRequest) (*models.BirthdayWish, string, error) {
	recipient := strings.TrimSpace(req.RecipientName)
	if recipient == "" {
		return nil, "", errors.New("যার জন্মদিন তার নাম আবশ্যক")
	}
	sender := strings.TrimSpace(req.SenderName)
	if sender == "" {
		sender = "তোমার এক প্রিয়জন"
	}
	msg := strings.TrimSpace(req.Message)
	if msg == "" {
		return nil, "", errors.New("জন্মদিনের শুভেচ্ছা বার্তা বা চিঠি আবশ্যক")
	}
	rel := strings.TrimSpace(req.Relationship)
	if rel == "" {
		rel = "বিশেষ কেউ"
	}

	for _, c := range []struct {
		field, value string
		max          int
	}{
		{"প্রাপকের নাম", recipient, maxNameRunes},
		{"প্রেরকের নাম", sender, maxNameRunes},
		{"সম্পর্ক", rel, maxNameRunes},
		{"চিঠির বার্তা", msg, maxMessageRunes},
	} {
		if err := validateRunes(c.field, c.value, c.max); err != nil {
			return nil, "", err
		}
	}

	theme := strings.TrimSpace(req.Theme)
	if !allowedThemes[theme] {
		theme = "rose"
	}
	font := strings.TrimSpace(req.FontStyle)
	if !allowedFonts[font] {
		font = "classic"
	}
	music := strings.TrimSpace(req.Music)
	if !allowedMusic[music] {
		music = "none"
	}

	photo := strings.TrimSpace(req.PhotoURL)
	if photo != "" && (len(photo) > maxPhotoBytes || !photoDataURL.MatchString(photo)) {
		return nil, "", errors.New("ছবিটি সঠিক ফরম্যাটে নেই বা অনেক বড় (JPG/PNG/WebP)")
	}
	voice := strings.TrimSpace(req.VoiceURL)
	if voice != "" && (len(voice) > maxVoiceBytes || !voiceDataURL.MatchString(voice)) {
		return nil, "", errors.New("ভয়েস মেসেজটি সঠিক ফরম্যাটে নেই বা অনেক বড় (সর্বোচ্চ ৩০ সেকেন্ড)")
	}

	var unlockAt *time.Time
	if raw := strings.TrimSpace(req.UnlockAt); raw != "" {
		t, err := time.Parse(time.RFC3339, raw)
		if err != nil {
			return nil, "", errors.New("চিঠি খোলার সময় সঠিক নয়")
		}
		now := time.Now()
		if t.After(now.Add(366 * 24 * time.Hour)) {
			return nil, "", errors.New("চিঠি খোলার সময় সর্বোচ্চ ১ বছরের মধ্যে হতে হবে")
		}
		if t.After(now) {
			utc := t.UTC()
			unlockAt = &utc
		}
	}

	rec := models.WishRecord{
		BirthdayWish: models.BirthdayWish{
			ID:            "bday_" + randomHex(4),
			RecipientName: recipient,
			SenderName:    sender,
			Relationship:  rel,
			Message:       msg,
			Theme:         theme,
			FontStyle:     font,
			Music:         music,
			UnlockAt:      unlockAt,
			SelfDestruct:  req.SelfDestruct,
		},
		PhotoURL: photo,
		VoiceURL: voice,
	}

	if code := strings.TrimSpace(req.Passcode); code != "" {
		if n := utf8.RuneCountInString(code); n < 4 || n > 20 {
			return nil, "", errors.New("সিক্রেট কোড ৪ থেকে ২০ অক্ষরের হতে হবে")
		}
		rec.PasscodeSalt = randomHex(16)
		rec.PasscodeHash = hashPasscode(code, rec.PasscodeSalt)
	}

	manageKey := randomHex(12)
	rec.ManageKeyHash = sha256Hex(manageKey)

	created, err := s.repo.CreateWish(rec)
	if err != nil {
		return nil, "", err
	}
	return created, manageKey, nil
}

func toPublic(rec *models.WishRecord, now time.Time) *models.WishPublic {
	return &models.WishPublic{
		ID:            rec.ID,
		RecipientName: rec.RecipientName,
		SenderName:    rec.SenderName,
		Relationship:  rec.Relationship,
		Theme:         rec.Theme,
		FontStyle:     rec.FontStyle,
		Music:         rec.Music,
		UnlockAt:      rec.UnlockAt,
		Locked:        rec.UnlockAt != nil && now.Before(*rec.UnlockAt),
		HasPasscode:   rec.HasPasscode,
		SelfDestruct:  rec.SelfDestruct,
		Destroyed:     rec.Destroyed,
		HasPhoto:      rec.HasPhoto,
		HasVoice:      rec.HasVoice,
		ViewsCount:    rec.ViewsCount,
		CreatedAt:     rec.CreatedAt,
		ServerNow:     now,
	}
}

func (s *WishService) loadRecord(id string) (*models.WishRecord, error) {
	clean := strings.TrimSpace(id)
	if clean == "" {
		return nil, ErrWishNotFound
	}
	rec, err := s.repo.GetWishRecord(clean)
	if errors.Is(err, repository.ErrWishNotFound) {
		return nil, ErrWishNotFound
	}
	return rec, err
}

// GetWishPublic returns metadata only; it never leaks content and never counts a view.
func (s *WishService) GetWishPublic(id string) (*models.WishPublic, error) {
	rec, err := s.loadRecord(id)
	if err != nil {
		return nil, err
	}
	return toPublic(rec, time.Now()), nil
}

// OpenWish enforces unlock time, passcode, brute-force lockout and one-time reads,
// then releases the protected content.
func (s *WishService) OpenWish(id, passcode string) (*models.WishContent, error) {
	rec, err := s.loadRecord(id)
	if err != nil {
		return nil, err
	}
	now := time.Now()

	if rec.Destroyed {
		return nil, ErrWishDestroyed
	}
	if rec.UnlockAt != nil && now.Before(*rec.UnlockAt) {
		return nil, ErrWishLocked
	}

	if rec.HasPasscode {
		if rec.FailedAttempts >= maxFailedTries && rec.LastFailedAt != nil && now.Sub(*rec.LastFailedAt) < lockoutWindow {
			return nil, ErrTooManyAttempts
		}
		if !safeEqual(hashPasscode(strings.TrimSpace(passcode), rec.PasscodeSalt), rec.PasscodeHash) {
			_ = s.repo.RegisterWishFailedAttempt(rec.ID)
			return nil, ErrBadPasscode
		}
	}

	content, _, err := s.repo.ClaimWishOpen(rec.ID)
	if errors.Is(err, repository.ErrWishDestroyed) {
		return nil, ErrWishDestroyed
	}
	return content, err
}

func (s *WishService) AddReply(id string, req models.CreateWishReplyRequest) error {
	rec, err := s.loadRecord(id)
	if err != nil {
		return err
	}

	emoji := strings.TrimSpace(req.Emoji)
	if !allowedEmojis[emoji] {
		emoji = "❤️"
	}
	text := strings.TrimSpace(req.Text)
	if err := validateRunes("রিপ্লাই", text, maxReplyRunes); err != nil {
		return err
	}

	return s.repo.AddWishReply(rec.ID, models.WishReply{ID: "rp_" + randomHex(6), Emoji: emoji, Text: text})
}

// ListReplies is for the sender: it requires the secret manage key issued at creation.
func (s *WishService) ListReplies(id, manageKey string) (*models.WishPublic, []models.WishReply, error) {
	rec, err := s.loadRecord(id)
	if err != nil {
		return nil, nil, err
	}
	if manageKey == "" || !safeEqual(sha256Hex(manageKey), rec.ManageKeyHash) {
		return nil, nil, ErrBadManageKey
	}
	replies, err := s.repo.ListWishReplies(rec.ID)
	if err != nil {
		return nil, nil, err
	}
	return toPublic(rec, time.Now()), replies, nil
}

func (s *WishService) ListWishesAdmin() ([]models.BirthdayWish, error) {
	return s.repo.ListWishesAdmin(100)
}

func (s *WishService) Stats() (*models.WishStats, error) {
	return s.repo.WishStats()
}

func (s *WishService) DeleteWish(id string) error {
	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return errors.New("চিঠির আইডি দেওয়া হয়নি")
	}
	return s.repo.DeleteWish(cleanID)
}
