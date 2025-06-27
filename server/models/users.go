package models

// UserResponse defines the structure for user data returned by API endpoints
type UserResponse struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

