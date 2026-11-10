package controllers

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	// Implementation for fetching dashboard statistics
	db := c.MustGet("db").(*sql.DB)

	// AuthMiddleware already validated the JWT and set user_id in context
	userID, exists := c.Get("user_id")
	if !exists {
		slog.Warn("Unauthorized dashboard access attempt",
			"endpoint", "/dashboard/stats",
			"ip", c.ClientIP(),
		)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	uid, ok := userID.(int)
	if !ok {
		slog.Error("user_id in context is not an int",
			"type", fmt.Sprintf("%T", userID),
			"endpoint", "/dashboard/stats",
		)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	var stats models.DashboardStats
	err := db.QueryRow(`SELECT COUNT(*), 
	COUNT(*) FILTER (WHERE status = 'in-progress'), 
	COUNT(*) FILTER (WHERE status = 'done'), 
	COUNT(*) FILTER (WHERE due_date IS NOT NULL AND due_date < NOW() AND status != 'done')
	FROM tasks
	WHERE user_id = $1	
	`, uid).Scan(&stats.Total, &stats.InProgress, &stats.Completed, &stats.Overdue)
	if err != nil {
		slog.Error("Failed to query dashboard stats",
			"user_id", uid,
			"error", err.Error(),
		)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load stats"})
		return
	}

	// ─── Previous period counts (for delta calculation) ──────
	// Compare current month vs previous month.
	// Delta = ((current - previous) / previous) *
	var previousStats models.DashboardStats
	err = db.QueryRow(`
        SELECT
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
                               AND created_at < date_trunc('month', NOW())),
            COUNT(*) FILTER (WHERE status = 'in-progress'
                               AND created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
                               AND created_at < date_trunc('month', NOW())),
            COUNT(*) FILTER (WHERE status = 'done'
                               AND created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
                               AND created_at < date_trunc('month', NOW())),
            COUNT(*) FILTER (WHERE due_date IS NOT NULL AND due_date < NOW() AND status != 'done'
                               AND created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
                               AND created_at < date_trunc('month', NOW()))
        FROM tasks
        WHERE user_id = $1
    `, uid).Scan(&previousStats.Total, &previousStats.InProgress, &previousStats.Completed, &previousStats.Overdue)
	if err != nil {
		// Don't fail the request if delta query fails — just return zeros
		slog.Warn("Delta query failed, returning zeros",
			"user_id", uid,
			"error", err.Error(),
		)
		stats.Deltas = models.DeltaMap{}
	} else {
		stats.Deltas = models.DeltaMap{
			Total:      computeDelta(previousStats.Total, stats.Total),
			InProgress: computeDelta(previousStats.InProgress, stats.InProgress),
			Completed:  computeDelta(previousStats.Completed, stats.Completed),
			Overdue:    computeDelta(previousStats.Overdue, stats.Overdue),
		}
	}

	slog.Info("Dashboard stats loaded",
		"user_id", uid,
		"total", stats.Total,
		"in_progress", stats.InProgress,
		"completed", stats.Completed,
		"overdue", stats.Overdue,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Stats loaded",
		"stats":   stats,
	})
}

func computeDelta(previous, current int) int {
	if previous == 0 {
		return 0
	}
	return int((float64(current-previous) / float64(previous))) * 100
}

// GetDashboardRecentTasks returns the 5 most recently created tasks for the user.
// Includes creator + assignee info via a double JOIN on the users table.
func GetDashboardRecentTasks(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	userID, exists := c.Get("user_id")
	if !exists {
		slog.Warn("Unauthorized dashboard access attempt",
			"endpoint", "/dashboard/recent-tasks",
			"ip", c.ClientIP(),
		)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	uid, ok := userID.(int)

	if !ok {
		slog.Error("user_id in context is not an int",
			"type", fmt.Sprintf("%T", userID),
			"endpoint", "/dashboard/recent-tasks",
		)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// ─── Double JOIN on users ───────────────────────────────
	// We join users table twice:
	//   - "creator" (u1) via tasks.user_id
	//   - "assignee" (u2) via tasks.assignee_id (LEFT JOIN because assignee can be NULL)
	// COALESCE(t.priority, 'medium')  - defaults to medium when the column is showing null, this is for tasks that were created before we created the priority column
	rows, err := db.Query(`
		SELECT 
			t.id,
			t.title,
			t.status,
			COALESCE(t.priority, 'medium'),
			t.due_date,
			t.created_at,
			u1.id, u1.username, u1.avatar_url,
			u2.id, u2.username, u2.avatar_url
		FROM tasks t
		INNER JOIN users u1 ON t.user_id = u1.id
		LEFT JOIN users u2 ON t.assignee_id = u2.id
		WHERE t.user_id = $1
		ORDER BY t.created_at DESC
		LIMIT 5
	`, uid)
	if err != nil {
		slog.Error("Failed to query recent tasks",
			"user_id", uid,
			"error", err.Error(),
		)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load tasks"})
		return
	}
	defer rows.Close()

	var tasks []models.DashboardTask

	for rows.Next() {
		var task models.DashboardTask
		var assigneeID sql.NullInt64
		var assigneeUsername, assigneeAvatarURL sql.NullString
		var dueDate sql.NullTime

		// attach this to the necessary struct
		if err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Status,
			&task.Priority,
			&dueDate,
			&task.CreatedAt,
			&task.Creator.ID, &task.Creator.Username, &task.Creator.AvatarURL,
			&assigneeID, &assigneeUsername, &assigneeAvatarURL,
		); err != nil {
			slog.Error("Failed to scan task row",
				"user_id", uid,
				"error", err.Error(),
			)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load tasks"})
			return
		}

		// Convert nullable due_date
		// if the due_date is empty, fill it in as nil in the struct
		if dueDate.Valid {
			task.DueDate = &dueDate.Time
		} else {
			task.DueDate = nil
		}

		// convert nullable assignee
		// if the assignee is empty, fill it as nil
		if assigneeID.Valid {
			task.Assignee = &models.TaskUserBrief{
				ID:        int(assigneeID.Int64),
				Username:  assigneeUsername.String,
				AvatarURL: assigneeAvatarURL.String,
			}
		} else {
			task.Assignee = nil
		}

		tasks = append(tasks, task)
	}

	// Check if the loop exited due to an error (not just end of rows)
	if err := rows.Err(); err != nil {
		slog.Error("Error iterating task rows",
			"user_id", uid,
			"error", err.Error(),
		)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load tasks"})
		return
	}

	// Empty slice (not nil) so JSON returns [] instead of null
	if tasks == nil {
		tasks = []models.DashboardTask{}
	}

	slog.Info("Recent tasks loaded",
		"user_id", uid,
		"count", len(tasks),
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Recent tasks loaded",
		"tasks":   tasks,
	})
}
