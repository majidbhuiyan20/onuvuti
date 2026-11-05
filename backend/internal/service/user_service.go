package service

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/config"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/sanitizer"
	"github.com/onuvuti/backend/internal/repository"
)

type UserService struct {
	repo *repository.Repository
	cfg  *config.Config
}

func NewUserService(repo *repository.Repository, cfg *config.Config) *UserService {
	return &UserService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *UserService) ListUsers() []models.User {
	return s.repo.ListUsers()
}

func (s *UserService) hashPassword(password string) string {
	h := sha256.Sum256([]byte("onuvuti-salt-2026:" + password + ":" + s.cfg.AdminTokenSecret))
	return hex.EncodeToString(h[:])
}

func (s *UserService) issueUserToken(userID string) string {
	mac := sha256.Sum256([]byte("user-token:" + userID + ":" + s.cfg.AdminTokenSecret))
	return userID + "." + hex.EncodeToString(mac[:16])
}

func (s *UserService) VerifyUserToken(tokenStr string) (string, bool) {
	parts := strings.Split(strings.TrimSpace(tokenStr), ".")
	if len(parts) != 2 || parts[0] == "" {
		return "", false
	}
	expected := s.issueUserToken(parts[0])
	if tokenStr == expected {
		return parts[0], true
	}
	return "", false
}

func (s *UserService) RegisterManual(req models.RegisterRequest) (*models.User, string, error) {
	name := sanitizer.Text(req.Name, 80)
	email := strings.ToLower(strings.TrimSpace(sanitizer.Text(req.Email, 140)))
	password := strings.TrimSpace(req.Password)

	if len([]rune(name)) < 2 {
		return nil, "", errors.New("অনুগ্রহ করে আপনার নাম লিখুন (অন্তত ২ অক্ষর)।")
	}
	if len(email) < 5 || !strings.Contains(email, "@") {
		return nil, "", errors.New("অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস দিন।")
	}
	if len(password) < 6 {
		return nil, "", errors.New("নিরাপত্তার জন্য অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।")
	}

	if existing := s.repo.FindUserByEmail(email); existing != nil {
		return nil, "", errors.New("এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।")
	}

	user := models.User{
		ID:           fmt.Sprintf("u-%d", time.Now().UnixMilli()),
		Name:         name,
		Email:        email,
		PasswordHash: s.hashPassword(password),
		Provider:     "manual",
		CreatedAt:    time.Now(),
	}

	saved := s.repo.CreateOrUpdateUser(user)
	token := s.issueUserToken(saved.ID)
	return &saved, token, nil
}

func (s *UserService) LoginManual(req models.UserLoginRequest) (*models.User, string, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := strings.TrimSpace(req.Password)

	user := s.repo.FindUserByEmail(email)
	if user == nil {
		return nil, "", errors.New("এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।")
	}
	if user.Provider == "google" && user.PasswordHash == "" {
		return nil, "", errors.New("এই অ্যাকাউন্টটি Google দিয়ে খোলা হয়েছে। অনুগ্রহ করে 'Sign in with Google' বাটন ব্যবহার করুন।")
	}

	if user.PasswordHash != s.hashPassword(password) {
		return nil, "", errors.New("ইমেইল বা পাসওয়ার্ড সঠিক নয়।")
	}

	token := s.issueUserToken(user.ID)
	return user, token, nil
}

func (s *UserService) LoginWithGoogle(req models.GoogleAuthRequest) (*models.User, string, error) {
	email := strings.ToLower(strings.TrimSpace(sanitizer.Text(req.Email, 140)))
	name := sanitizer.Text(req.Name, 80)

	if email == "" || !strings.Contains(email, "@") {
		return nil, "", errors.New("Google অ্যাকাউন্টের ইমেইল পাওয়া যায়নি।")
	}
	if name == "" {
		name = strings.Split(email, "@")[0]
	}

	existing := s.repo.FindUserByEmail(email)
	if existing != nil {
		if req.AvatarURL != "" && existing.AvatarURL == "" {
			existing.AvatarURL = sanitizer.Text(req.AvatarURL, 300)
			updated := s.repo.CreateOrUpdateUser(*existing)
			existing = &updated
		}
		token := s.issueUserToken(existing.ID)
		return existing, token, nil
	}

	newUser := models.User{
		ID:        fmt.Sprintf("u-ggl-%d", time.Now().UnixMilli()),
		Name:      name,
		Email:     email,
		Provider:  "google",
		AvatarURL: sanitizer.Text(req.AvatarURL, 300),
		CreatedAt: time.Now(),
	}

	saved := s.repo.CreateOrUpdateUser(newUser)
	token := s.issueUserToken(saved.ID)
	return &saved, token, nil
}

func (s *UserService) GetUserProfileAndStories(userID string) (*models.User, []models.Story) {
	u := s.repo.FindUserByID(userID)
	if u == nil {
		return nil, nil
	}
	stories := s.repo.ListStoriesByUserID(userID)
	if stories == nil {
		stories = []models.Story{}
	}
	return u, stories
}

