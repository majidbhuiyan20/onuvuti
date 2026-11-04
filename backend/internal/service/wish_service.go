package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/repository"
)

type WishService struct {
	repo *repository.Repository
}

func NewWishService(repo *repository.Repository) *WishService {
	return &WishService{repo: repo}
}

func (s *WishService) CreateWish(req models.CreateWishRequest) (*models.BirthdayWish, error) {
	recipient := strings.TrimSpace(req.RecipientName)
	if recipient == "" {
		return nil, errors.New("যার জন্মদিন তার নাম আবশ্যক")
	}

	sender := strings.TrimSpace(req.SenderName)
	if sender == "" {
		sender = "তোমার এক প্রিয়জন"
	}

	msg := strings.TrimSpace(req.Message)
	if msg == "" {
		return nil, errors.New("জন্মদিনের শুভেচ্ছা বার্তা বা চিঠি আবশ্যক")
	}

	rel := strings.TrimSpace(req.Relationship)
	if rel == "" {
		rel = "বিশেষ কেউ"
	}

	theme := strings.TrimSpace(req.Theme)
	if theme == "" {
		theme = "vintage_rose"
	}

	randBytes := make([]byte, 4)
	_, _ = rand.Read(randBytes)
	id := fmt.Sprintf("bday_%s", hex.EncodeToString(randBytes))

	wish := models.BirthdayWish{
		ID:            id,
		RecipientName: recipient,
		SenderName:    sender,
		Relationship:  rel,
		Message:       msg,
		Theme:         theme,
		ViewsCount:    0,
	}

	return s.repo.CreateWish(wish)
}

func (s *WishService) GetWishByID(id string) (*models.BirthdayWish, error) {
	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("চিঠির আইডি দেওয়া হয়নি")
	}
	return s.repo.GetWishByID(cleanID)
}
