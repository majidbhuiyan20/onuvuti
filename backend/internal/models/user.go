package models

import "time"

type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Provider     string    `json:"provider"` // "manual" or "google"
	AvatarURL    string    `json:"avatarUrl,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type GoogleAuthRequest struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	GoogleID  string `json:"googleId"`
	AvatarURL string `json:"avatarUrl,omitempty"`
	IDToken   string `json:"idToken,omitempty"`
}

