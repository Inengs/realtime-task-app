package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/lib/pq"
)

// GetUserNotifications lists notifications for the authenticated user
func GetUserNotifications(c *gin.Context) {
	db, ok := c.MustGet("db").(*sql.DB)
	if !ok {
		log.Printf("Failed to get database from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}

	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Printf("Invalid user ID: %s, error: %v", userIDStr, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// ✅ Use snake_case column names to match the DB schema
	rows, err := db.Query(
		`SELECT id, user_id, message, is_read, created_at, updated_at
		 FROM notifications
		 WHERE user_id = $1
		 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		log.Printf("Database query error for user_id %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var notifications []models.Notifications
	for rows.Next() {
		var notification models.Notifications
		if err := rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.Message,
			&notification.IsRead,
			&notification.CreatedAt,
			&notification.UpdatedAt,
		); err != nil {
			log.Printf("Error scanning notification for user_id %d: %v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		notifications = append(notifications, notification)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Row iteration error for user_id %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	log.Printf("Retrieved %d notifications for user_id %d", len(notifications), userID)
	c.JSON(http.StatusOK, gin.H{
		"message":       "Notifications retrieved successfully",
		"notifications": notifications,
	})
}

// MarkNotificationsRead marks notifications as read
func MarkNotificationsRead(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input models.NotificationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		var errs []string
		for _, err := range err.(validator.ValidationErrors) {
			errs = append(errs, fmt.Sprintf("Field '%s' failed on '%s'", err.Field(), err.Tag()))
		}
		c.JSON(http.StatusBadRequest, gin.H{"errors": errs})
		return
	}

	// ✅ Use snake_case column names
	var result sql.Result
	if len(input.NotificationIDs) > 0 {
		result, err = db.Exec(
			`UPDATE notifications SET is_read = true
			 WHERE user_id = $1 AND id = ANY($2)`,
			userID, pq.Array(input.NotificationIDs),
		)
	} else {
		result, err = db.Exec(
			`UPDATE notifications SET is_read = true WHERE user_id = $1`,
			userID,
		)
	}
	if err != nil {
		log.Printf("Failed to mark notifications read for user_id %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No notifications found to mark as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notifications marked as read"})
}

// SendNotification inserts a notification and broadcasts it
func SendNotification(db *sql.DB, userID int, message string) error {
	var notification models.Notifications
	// ✅ SendNotification was already using snake_case — kept as-is, just cleaned up
	err := db.QueryRow(
		`INSERT INTO notifications (user_id, message, is_read)
		 VALUES ($1, $2, false)
		 RETURNING id, user_id, message, is_read, created_at, updated_at`,
		userID, message,
	).Scan(
		&notification.ID,
		&notification.UserID,
		&notification.Message,
		&notification.IsRead,
		&notification.CreatedAt,
		&notification.UpdatedAt,
	)
	if err != nil {
		return err
	}
	manager.BroadcastNotification(userID, notification)
	return nil
}
