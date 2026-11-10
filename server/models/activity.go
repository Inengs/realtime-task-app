package models

import "time"

// ActivityLog represents one row in the activity_log table.
// Used by the dashboard activity feed.
type ActivityLog struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	EntityType string    `json:"entity_type"` // 'task', 'project', etc.
	EntityID   int       `json:"entity_id"`
	Action     string    `json:"action"`   // 'created', 'completed', etc.
	Target     string    `json:"target"`   // task title or project name
	Metadata   *string   `json:"metadata"` // JSONB as raw string (nullable)
	CreatedAt  time.Time `json:"created_at"`
}

// DashboardActivityItem is the frontend-facing shape (with user info joined).
type DashboardActivityItem struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	UserName  string    `json:"user_name"`
	AvatarURL string    `json:"avatar_url"`
	Action    string    `json:"action"`
	Target    string    `json:"target"`
	Timestamp time.Time `json:"timestamp"`
}
