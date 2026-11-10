package models

import "time"

type DashboardStats struct {
	Total      int      `json:"total"`
	InProgress int      `json:"in_progress"`
	Completed  int      `json:"completed"`
	Overdue    int      `json:"overdue"`
	Deltas     DeltaMap `json:"deltas"` // Deltas is a map of the changes in the stats over time, where the key is the time period (e.g. "day", "week", "month") and the value is the change in the stat for that period.
}

type DeltaMap struct {
	Total      int `json:"total"`
	InProgress int `json:"in_progress"`
	Completed  int `json:"completed"`
	Overdue    int `json:"overdue"`
}

// ─── Recent tasks ────────────────────────────────────────
// Lightweight user info — embedded in DashboardTask so we don't
// need a separate API call to look up users for the avatar.
type TaskUserBrief struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatar_url"` // will be null until S3 avatars are wired up
}

type DashboardTask struct {
	ID        int        `json:"id"`
	Title     string     `json:"title"`
	Status    string     `json:"status"`
	Priority  string     `json:"priority"`
	DueDate   *time.Time `json:"due_date"`
	CreatedAt time.Time  `json:"created_at"`

	// Who created the task
	Creator TaskUserBrief `json:"creator"`

	// Who's responsible for doing it
	// Nullable — a task can exist without an assignee
	Assignee *TaskUserBrief `json:"assignee"`
}

type DashboardProgress struct {
	Completed  int `json:"completed"`
	Total      int `json:"total"`
	Percentage int `json:"percentage"` // Percentage of completed tasks out of total tasks
}

// ─── Trend ──────────────────────────────────────────────
type DashboardTrendPoint struct {
	Date      string `json:"date"`
	Completed int    `json:"completed"`
}


// ─── Aggregate response ─────────────────────────────────
type DashboardResponse struct {
	Stats       DashboardStats          `json:"stats"`
	RecentTasks []DashboardTask         `json:"recent_tasks"`
	Progress    DashboardProgress       `json:"progress"`
	Trend       []DashboardTrendPoint   `json:"trend"`
	Activity    []DashboardActivityItem `json:"activity"`
}

type UpcomingTask struct {
    ID       int        `json:"id"`
    Title    string     `json:"title"`
    Priority string     `json:"priority"`
    DueDate  *time.Time `json:"due_date"`
    DueIn    string     `json:"due_in"`        // human-readable: "today", "tomorrow", "in 3 days"
    Project  string     `json:"project"`
} 