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
