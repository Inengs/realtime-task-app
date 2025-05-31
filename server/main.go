package main

import (
	"log"

	"github.com/Inengs/realtime-task-app/config"
	"github.com/Inengs/realtime-task-app/db"
	"github.com/Inengs/realtime-task-app/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to database
	database, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize database schema
	err = db.InitDB(database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	router := gin.Default() // creates a router

	routes.RegisterAuthRoutes(router)

	users := router.Group("/users")
	{
		users.GET("/", func(c *gin.Context) {})
		users.GET("/:id", func(c *gin.Context) {})
	}

	tasks := router.Group("/tasks")
	{
		tasks.GET("/", func(c *gin.Context) {})
		tasks.GET("/:id", func(c *gin.Context) {})
		tasks.POST("/", func(c *gin.Context) {})
		tasks.PUT("/:id", func(c *gin.Context) {})
		tasks.DELETE("/:id", func(c *gin.Context) {})
		tasks.PATCH("/:id/status", func(c *gin.Context) {})
	}

	notifications := router.Group("/notifications")
	{
		notifications.GET("/", func(c *gin.Context) {})
		notifications.POST("/mark-read", func(c *gin.Context) {})
	}

	projects := router.Group("/projects")
	{
		projects.GET("/", func(c *gin.Context) {})
		projects.GET("/:id", func(c *gin.Context) {})
		projects.POST("/", func(c *gin.Context) {})
		projects.PUT("/:id", func(c *gin.Context) {})
		projects.DELETE("/:id", func(c *gin.Context) {})
	}

	router.Run(":8080")

}
