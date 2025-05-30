package main

import (
	"log"

	"github.com/Inengs/realtime-task-app/config"
	"github.com/Inengs/realtime-task-app/db"
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

	router.GET("/", func(c *gin.Context) { // root URL

	})

	router.POST("/register", registerFunc)

	router.POST("/login", func(c *gin.Context) { // for user login

	})

	router.POST("/logout", func(c *gin.Context) { // to end user sessions

	})

	router.GET("/me", func(c *gin.Context) { // to fetch current logged in user info

	})
	users := router.Group("/users")
	users.GET("/", func(c *gin.Context) { // list all users

	})
	users.GET("/:id", func(c *gin.Context) { // get details of a single user

	})

	tasks := router.Group("/tasks")
	tasks.GET("/", func(c *gin.Context) { //list all tasks

	})
	tasks.GET("/:id", func(c *gin.Context) { //get one task by ID

	})
	tasks.POST("/", func(c *gin.Context) { // create a new task

	})
	tasks.PUT("/:id", func(c *gin.Context) { // update a task

	})
	tasks.DELETE("/:id", func(c *gin.Context) { // delete a task

	})
	tasks.PATCH("/:id/status", func(c *gin.Context) { // update task status

	})

	notifications := router.Group("/notifications")
	notifications.GET("/", func(c *gin.Context) { // get user notifications

	})
	notifications.POST("/mark-read", func(c *gin.Context) { // mark notifications as read

	})

	projects := router.Group("/projects")
	projects.GET("/", func(c *gin.Context) { // list all projects

	})
	projects.GET("/:id", func(c *gin.Context) { // details of a project

	})
	projects.POST("/", func(c *gin.Context) { // create a project

	})
	projects.PUT("/:id", func(c *gin.Context) { // update a project

	})
	projects.DELETE("/:id", func(c *gin.Context) { // delete a project

	})

}
