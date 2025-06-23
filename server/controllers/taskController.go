package controllers

import (
	"database/sql"
	"net/http"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
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

}

func CreateNewTask(c *gin.Context) {

}

func UpdateTask(c *gin.Context) {

}

func DeleteTask(c *gin.Context) {

}

func UpdateTaskStatus(c *gin.Context) {

}
