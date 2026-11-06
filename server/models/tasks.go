package models

import "time"

type Task struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	UserID      int        `json:"user_id"`     // Creator
	AssigneeID  *int       `json:"assignee_id"` // Who's responsible (nullable — task can be unassigned)
	ProjectID   int        `json:"project_id"`
	DueDate     *time.Time `json:"due_date"` // Nullable — task may have no deadline
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type TaskInput struct {
	Title       string     `json:"title" binding:"required" validate:"required"`
	Description string     `json:"description"`
	Status      string     `json:"status" binding:"required" validate:"required,oneof=pending in-progress done"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high"`
	AssigneeID  *int       `json:"assignee_id" validate:"omitempty,gt=0"`
	ProjectID   int        `json:"project_id" binding:"required" validate:"required,gt=0"`
	DueDate     *time.Time `json:"due_date"`
}

type StatusInput struct {
	Status string `json:"status" binding:"required" validate:"required,oneof=pending in-progress done"`
}
