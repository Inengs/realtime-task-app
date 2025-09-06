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

func ListProjects(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	rows, err := db.Query("SELECT id, user_id, name, description, created_at, updated_at FROM projects WHERE user_id = $1", userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var project models.Project
		if err := rows.Scan(&project.ID, &project.UserID, &project.Name, &project.Description, &project.CreatedAt, &project.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		projects = append(projects, project)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Projects retrieved successfully", "projects": projects})
}

func ProjectDetails(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)
	projectIDParam := c.Param("id")

	projectID, err := strconv.Atoi(projectIDParam)

	if err != nil {
		c.JSON(400, gin.H{"message": "Invalid IDs"})
		return
	}

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	var project models.Project
	err = db.QueryRow("SELECT id, user_id, name, description, created_at, updated_at FROM projects WHERE id = $1 AND user_id = $2", projectID, userIDInt).Scan(&project.ID, &project.UserID, &project.Name, &project.Description, &project.CreatedAt, &project.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Project with ID %d not found", projectID)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project retrieved successfully", "project": project})
}

func CreateProject(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDInt, _ := userID.(int)

	var input models.ProjectInput
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

	var project models.Project
	err := db.QueryRow(
		"INSERT INTO projects (name, description, user_id) VALUES ($1, $2, $3) RETURNING id, user_id, name, description, created_at, updated_at",
		input.Name, input.Description, userIDInt,
	).Scan(&project.ID, &project.UserID, &project.Name, &project.Description, &project.CreatedAt, &project.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Send notification and broadcast project
	if err := SendNotification(db, userIDInt, fmt.Sprintf("New project created: %s", project.Name)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}
	manager.BroadcastProject(userIDInt, project, "project_created")

	c.JSON(http.StatusCreated, gin.H{"message": "Project created successfully", "project": project})
}

func UpdateProject(c *gin.Context) {
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	var input models.ProjectInput
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

	var project models.Project
	err = db.QueryRow(
		"UPDATE projects SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING id, user_id, name, description, created_at, updated_at",
		input.Name, input.Description, id, userIDInt,
	).Scan(&project.ID, &project.UserID, &project.Name, &project.Description, &project.CreatedAt, &project.UpdatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Project with ID %d not found", id)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Send notification and broadcast project
	if err := SendNotification(db, userIDInt, fmt.Sprintf("Project updated: %s", project.Name)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}
	manager.BroadcastProject(userIDInt, project, "project_updated")

	c.JSON(http.StatusOK, gin.H{"message": "Project updated successfully", "project": project})
}

func DeleteProject(c *gin.Context) {
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	// Fetch project for broadcasting
	var project models.Project
	err = db.QueryRow(
		"SELECT id, user_id, name, description, created_at, updated_at FROM projects WHERE id = $1 AND user_id = $2",
		id, userIDInt,
	).Scan(&project.ID, &project.UserID, &project.Name, &project.Description, &project.CreatedAt, &project.UpdatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Project with ID %d not found", id)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Delete associated tasks
	_, err = db.Exec("DELETE FROM tasks WHERE project_id = $1 AND user_id = $2", id, userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Delete project
	result, err := db.Exec("DELETE FROM projects WHERE id = $1 AND user_id = $2", id, userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Project with ID %d not found", id)})
		return
	}

	// Send notification and broadcast project deletion
	if err := SendNotification(db, userIDInt, fmt.Sprintf("Project deleted: %s", project.Name)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}
	manager.BroadcastProject(userIDInt, project, "project_deleted")

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
