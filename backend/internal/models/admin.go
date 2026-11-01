package models

type AdminLoginRequest struct {
	Password string `json:"password"`
}

type ApproveOrUpdateStoryRequest struct {
	Title       string  `json:"title"`
	Content     string  `json:"content"`
	Category    string  `json:"category"`
	Author      string  `json:"author,omitempty"`
	IsAdminPost *bool   `json:"isAdminPost,omitempty"`
	ImageURL    *string `json:"imageUrl,omitempty"` // Pointer so admin can clear ("") or update optional image
}

type AdminCreateStoryRequest struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	Category    string `json:"category"`
	Author      string `json:"author"`
	IsAdminPost bool   `json:"isAdminPost"`
	ImageURL    string `json:"imageUrl,omitempty"`
}

