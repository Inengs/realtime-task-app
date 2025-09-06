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

func TaskListFunc(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB) // Setup database connection

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	rows, err := db.Query(`SELECT id, user_id, title, description, status, created_at, updated_at FROM tasks WHERE user_id = $1`, userIDInt) // query all tasks from database
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	defer rows.Close()

	// Collect tasks into a slice of Task structs
	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.ID, &task.UserID, &task.ProjectID, &task.Title, &task.Description, &task.Status, &task.CreatedAt, &task.UpdatedAt); err != nil {
			// Return 500 if scanning fails
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tasks retrieved successfully", "tasks": tasks})
}

func TaskDetailsFunc(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB) // Setup database connection

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	// Extract and validate ID from URL parameter
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	// Query task by ID
	var task models.Task
	err = db.QueryRow("SELECT id, user_id, project_id, title, description, status, created_at, updated_at FROM tasks WHERE id = $1 AND user_id = $2", id, userIDInt).
		Scan(&task.ID, &task.UserID, &task.ProjectID, &task.Title, &task.Description, &task.Status, &task.CreatedAt, &task.UpdatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Task with ID %d not found", id)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Return task details
	c.JSON(http.StatusOK, gin.H{"message": "Task retrieved successfully", "task": task})
}

func CreateNewTask(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB) // Setup database connection

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	// Bind and validate request body
	var input models.TaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate input using validator
	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		var errs []string
		for _, err := range err.(validator.ValidationErrors) {
			errs = append(errs, fmt.Sprintf("Field '%s' failed on '%s'", err.Field(), err.Tag()))
		}
		c.JSON(http.StatusBadRequest, gin.H{"errors": errs})
		return
	}

	// Insert task into database
	var task models.Task
	err := db.QueryRow(
		"INSERT INTO tasks (title, description, status, user_id, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, project_id, title, description, status, created_at, updated_at",
		input.Title, input.Description, input.Status, userIDInt, input.ProjectID,
	).Scan(&task.ID, &task.UserID, &task.ProjectID, &task.Title, &task.Description, &task.Status, &task.CreatedAt, &task.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Send notification and broadcast task
	if err := SendNotification(db, userIDInt, fmt.Sprintf("New task created: %s", task.Title)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}
	manager.BroadcastTask(userIDInt, task, "task_update")

	// Return created task
	c.JSON(http.StatusCreated, gin.H{"message": "Task created successfully", "task": task})
}

func UpdateTask(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB) // Setup database connection

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	// Extract and validate ID from URL parameter
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	// Bind and validate request body
	var input models.TaskInput
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

	// Update task in database
	var task models.Task
	err = db.QueryRow(
		"UPDATE tasks SET title = $1, description = $2, status = $3, project_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING id, user_id, project_id, title, description, status, created_at, updated_at",
		input.Title, input.Description, input.Status, input.ProjectID, id, userIDInt,
	).Scan(&task.ID, &task.UserID, &task.ProjectID, &task.Title, &task.Description, &task.Status, &task.CreatedAt, &task.UpdatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Task with ID %d not found", id)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Send notification and broadcast task
	if err := SendNotification(db, userIDInt, fmt.Sprintf("Task updated: %s", task.Title)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}
	manager.BroadcastTask(userIDInt, task, "task_update")

	// Return Updated task
	c.JSON(http.StatusOK, gin.H{"message": "Task updated successfully", "task": task})
}

func DeleteTask(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	var task models.Task
	err = db.QueryRow(
		"SELECT id, user_id, project_id, title, description, status, created_at, updated_at FROM tasks WHERE id = $1 AND user_id = $2",
		id, userIDInt,
	).Scan(&task.ID, &task.UserID, &task.ProjectID, &task.Title, &task.Description, &task.Status, &task.CreatedAt, &task.UpdatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Task with ID %d not found", id)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	result, err := db.Exec("DELETE FROM tasks WHERE id = $1 and user_id = $2", id, userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if task was deleted
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Task with ID %d not found", id)})
		return
	}

	// Send notification and broadcast task deletion
	if err := SendNotification(db, userIDInt, fmt.Sprintf("Task deleted: %s", task.Title)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}
	manager.BroadcastTask(userIDInt, task, "task_deleted")

	// Return success response
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

func UpdateTaskStatus(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB) // Setup database connection

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	var status models.StatusInput
	if err := c.ShouldBindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	validate := validator.New()
	if err := validate.Struct(status); err != nil {
		var errs []string
		for _, err := range err.(validator.ValidationErrors) {
			errs = append(errs, fmt.Sprintf("Field '%s' failed on '%s'", err.Field(), err.Tag()))
		}
		c.JSON(http.StatusBadRequest, gin.H{"errors": errs})
		return
	}

	// Update task status in database
	var task models.Task
	err = db.QueryRow(
		"UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING id, user_id, project_id, title, description, status, created_at, updated_at",
		status.Status, id, userIDInt,
	).Scan(&task.ID, &task.UserID, &task.ProjectID, &task.Title, &task.Description, &task.Status, &task.CreatedAt, &task.UpdatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Task with ID %d not found", id)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Send notification and broadcast task
	if err := SendNotification(db, userIDInt, fmt.Sprintf("Task status updated to %s: %s", task.Status, task.Title)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}
	manager.BroadcastTask(userIDInt, task, "task_update")

	// Return updated task
	c.JSON(http.StatusOK, gin.H{"message": "Task status updated successfully", "task": task})
}
