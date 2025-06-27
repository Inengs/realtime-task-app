package models

type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

type TaskInput struct {
	Title       string `json:"title" binding:"required" validate:"required"`
	Description string `json:"description"`
	Status      string `json:"status" binding:"required" validate:"required,oneof=pending in-progress done"`
}

type StatusInput struct {
	Status string `json:"status" binding:"required" validate:"required,oneof=pending in-progress done"`
}
