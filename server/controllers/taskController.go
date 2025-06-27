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

	rows, err := db.Query(`SELECT title, description, status FROM tasks`) // query all tasks from database
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
	}

	defer rows.Close()

	// Collect tasks into a slice of Task structs
	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.Status); err != nil {
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

	c.JSON(http.StatusOK, gin.H{"message": "Tasks retrieved successfully", "users": tasks})
}

func TaskDetailsFunc(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB) // Setup database connection

	// Extract and validate ID from URL parameter
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	// Query task by ID
	var task models.Task
	err = db.QueryRow("SELECT id, title, description, status FROM tasks WHERE id = $1", id).
		Scan(&task.ID, &task.Title, &task.Description, &task.Status)
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
		"INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING id, title, description, status",
		input.Title, input.Description, input.Status,
	).Scan(&task.ID, &task.Title, &task.Description, &task.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Return created task
	c.JSON(http.StatusCreated, gin.H{"message": "Task created successfully", "task": task})
}

func UpdateTask(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB) // Setup database connection

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
		"UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING id, title, description, status",
		input.Title, input.Description, input.Status, id,
	).Scan(&task.ID, &task.Title, &task.Description, &task.Status)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Task with ID %d not found", id)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Return Updated task
	c.JSON(http.StatusOK, gin.H{"message": "Task updated successfully", "task": task})
}

func DeleteTask(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	result, err := db.Exec("DELETE FROM tasks WHERE id = $1", id)
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

	// Return success response
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

func UpdateTaskStatus(c *gin.Context) {

}
