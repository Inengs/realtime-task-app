package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func GetUserNotifications(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	rows, err := db.Query("SELECT ID, UserID, Message, IsRead, CreatedAt FROM Notifications WHERE UserID = $1 ORDER BY CreatedAt DESC", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	// collect notifications into a slice
	var notifications []models.Notifications
	for rows.Next() {
		var notification models.Notifications
		if err := rows.Scan(&notification.ID, &notification.UserID, &notification.Message, notification.IsRead, &notification.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		notifications = append(notifications, notification)
	}

	// Check for iteration errors
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Return notifications
	c.JSON(http.StatusOK, gin.H{"message": "Notifications retrieved successfully", "notifications": notifications})
}

func MarkNotificationsRead(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)

	var NotificationsIDs models.NotificationInput
	if err := c.ShouldBindJSON(&NotificationsIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
	}

	// Validate input using validator
	validate := validator.New()
	if err := validate.Struct(NotificationsIDs); err != nil {
		var errs []string
		for _, err := range err.(validator.ValidationErrors) {
			errs = append(errs, fmt.Sprintf("Field '%s' failed on '%s'", err.Field(), err.Tag()))
		}
		c.JSON(http.StatusBadRequest, gin.H{"errors": errs})
		return
	}

	if NotificationsIDs == (models.NotificationInput{}) {
		result, err := db.Exec("UPDATE notifications SET is_read = true WHERE user_id = $1 AND id = ANY($2)")
	}
}
