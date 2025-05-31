package controllers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
)

// userListFunc handles GET /users to return a list of all users
func UserListFunc(c *gin.Context) {
	// Get database connection from context
	db := c.MustGet("db").(*sql.DB)

	// Query all users from the database
	rows, err := db.Query(`SELECT id, username, email FROM users`)
	if err != nil {
		// Return 500 for database errors
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	// Collect users into a slice
	var users []models.UserResponse
	for rows.Next() {
		var user models.UserResponse
		if err := rows.Scan(&user.UserID, &user.Username, &user.Email); err != nil {
			// Return 500 if scanning fails
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		users = append(users, user)
	}

	// Check for errors during iteration
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// SUCCESS RESPONSE
	// Return 200 with list of users
	c.JSON(http.StatusOK, gin.H{"message": "Users retrieved successfully", "users": users})
}

// userDetailsFunc handles GET /users/:id to return details of a specific user
func UserDetailsFunc(c *gin.Context) {
	// Get database connection from context
	db := c.MustGet("db").(*sql.DB)

	// Get user ID from URL parameter
	idStr := c.Param("id")
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		// Return 400 if ID is not a valid integer
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Query user details by ID
	var user models.UserResponse
	query := `SELECT id, username, email FROM users WHERE id=$1`
	err = db.QueryRow(query, userID).Scan(&user.UserID, &user.Username, &user.Email)
	if err == sql.ErrNoRows {
		// Return 404 if user not found
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if err != nil {
		// Return 500 for database errors
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// SUCCESS RESPONSE
	// Return 200 with user details
	c.JSON(http.StatusOK, gin.H{"message": "User details retrieved", "user": user})
}
