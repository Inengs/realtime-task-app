package controllers

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ListProjects returns the projects the authenticated user is a member of.
//
//	@Summary	List projects
//	@Tags		projects
//	@Produce	json
//	@Security	BearerAuth
//	@Success	200	{object}	map[string]any	"message + projects array"
//	@Failure	401	{object}	map[string]any
//	@Router		/projects [get]
func ListProjects(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	uid, ok := userID.(int)
	if !ok {
		slog.Error("user_id in context is not an int", "endpoint", "/projects")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	rows, err := db.Query(`
	SELECT p.id, p.name, COALESCE(p.description, ''), pm.role,
	       COALESCE(tc.total, 0), COALESCE(tc.done, 0),
	       (SELECT COUNT(*) FROM project_members m WHERE m.project_id = p.id),
	       p.created_at, p.updated_at
	FROM project_members pm
	JOIN projects p ON p.id = pm.project_id
	LEFT JOIN LATERAL (
		SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'done') AS done
		FROM tasks WHERE project_id = p.id
	) tc ON true
	WHERE pm.user_id = $1
	ORDER BY p.updated_at DESC`, uid)
	if err != nil {
		slog.Error("Failed to query projects", "user_id", uid, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load projects"})
		return
	}
	defer rows.Close()

	projects := []models.ProjectListItem{} // empty slice, so JSON is [] not null
	index := map[int]int{}                 // project id -> position in projects
	for rows.Next() {
		var project models.ProjectListItem
		if err := rows.Scan(&project.ID, &project.Name, &project.Description, &project.Role, &project.TaskCount, &project.DoneCount, &project.MemberCount, &project.CreatedAt, &project.UpdatedAt); err != nil {
			slog.Error("Failed to scan project row", "user_id", uid, "error", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load projects"})
			return
		}
		project.Members = []models.TaskUserBrief{}
		index[project.ID] = len(projects)
		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		slog.Error("Error iterating project rows", "user_id", uid, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load projects"})
		return
	}

	// Attach member avatars
	mrows, err := db.Query(`
	SELECT x.project_id, u.id, u.username, COALESCE(u.avatar_url, '')
	FROM (
		SELECT project_id, user_id,
		       ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY joined_at, user_id) AS rn
		FROM project_members
		WHERE project_id IN (SELECT project_id FROM project_members WHERE user_id = $1)
	) x
	JOIN users u ON u.id = x.user_id
	WHERE x.rn <= 4
	ORDER BY x.project_id, x.rn`, uid)
	if err != nil {
		slog.Error("Failed to query project members", "user_id", uid, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load projects"})
		return
	}
	defer mrows.Close()

	for mrows.Next() {
		var projectID int
		var m models.TaskUserBrief
		if err := mrows.Scan(&projectID, &m.ID, &m.Username, &m.AvatarURL); err != nil {
			slog.Error("Failed to scan member row", "user_id", uid, "error", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load projects"})
			return
		}
		if i, found := index[projectID]; found {
			projects[i].Members = append(projects[i].Members, m)
		}
	}

	if err := mrows.Err(); err != nil {
		slog.Error("Error iterating member rows", "user_id", uid, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load projects"})
		return
	}

	slog.Info("Projects loaded", "user_id", uid, "count", len(projects))
	c.JSON(http.StatusOK, gin.H{"message": "Projects loaded", "projects": projects})
}

// ProjectDetails fetches one project by ID
//
//	@Summary	Project details
//	@Tags		projects
//	@Produce	json
//	@Security	SessionCookie
//	@Param		id	path		int	true	"Project ID"
//	@Success	200	{object}	map[string]any
//	@Failure	404	{object}	map[string]any
//	@Router		/projects/{id} [get]
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

// CreateProject creates a project
//
//	@Summary	Create project
//	@Tags		projects
//	@Accept		json
//	@Produce	json
//	@Security	SessionCookie
//	@Param		request	body		models.ProjectInput	true	"Project"
//	@Success	201		{object}	map[string]any
//	@Failure	400		{object}	map[string]any
//	@Router		/projects [post]
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

// UpdateProject updates a project
//
//	@Summary	Update project
//	@Tags		projects
//	@Accept		json
//	@Produce	json
//	@Security	SessionCookie
//	@Param		id		path		int					true	"Project ID"
//	@Param		request	body		models.ProjectInput	true	"Project"
//	@Success	200		{object}	map[string]any
//	@Failure	404		{object}	map[string]any
//	@Router		/projects/{id} [put]
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

// DeleteProject deletes a project and its tasks
//
//	@Summary	Delete project
//	@Tags		projects
//	@Produce	json
//	@Security	SessionCookie
//	@Param		id	path		int	true	"Project ID"
//	@Success	200	{object}	map[string]any
//	@Failure	404	{object}	map[string]any
//	@Router		/projects/{id} [delete]
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
