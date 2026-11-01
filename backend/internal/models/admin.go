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
	Featured    *bool   `json:"featured,omitempty"`
	ImageURL    *string `json:"imageUrl,omitempty"` // Pointer so admin can clear ("") or update optional image
	AdminNote   *string `json:"adminNote,omitempty"`
}

type AdminCreateStoryRequest struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	Category    string `json:"category"`
	Author      string `json:"author"`
	IsAdminPost bool   `json:"isAdminPost"`
	Featured    bool   `json:"featured"`
	ImageURL    string `json:"imageUrl,omitempty"`
	AdminNote   string `json:"adminNote,omitempty"`
}

