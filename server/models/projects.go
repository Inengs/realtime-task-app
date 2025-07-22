package models

import "time"

// Project represents a project entity in the database
type Project struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	UserID      int       `json:"user_id"` // Creator or owner
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ProjectInput is used for creating/updating a project from a request body
type ProjectInput struct {
	Name        string `json:"name" binding:"required" validate:"required"`
	Description string `json:"description"`
}
