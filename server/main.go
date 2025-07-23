package main

import (
	"log"
	"os"

	"github.com/Inengs/realtime-task-app/config"
	"github.com/Inengs/realtime-task-app/db"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/Inengs/realtime-task-app/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"
)

func main() {
	// Connect to database
	database, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize database schema
	if err := db.InitDB(database); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Set up Gin router
	router := gin.Default()

	// Attach database to context
	router.Use(func(c *gin.Context) {
		c.Set("db", database)
		c.Next()
	})

	// Configure CORS for frontend
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// Initialize session store
	middleware.Store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))
	if middleware.Store == nil {
		log.Fatalf("Failed to initialize session store")
	}

	// Register routes
	routes.RegisterAuthRoutes(router) // /login, /auth/check
	routes.UserAuthRoutes(router)     // /users/:id/notifications, /users/:id/notifications/read
	routes.TaskAuthRoutes(router)     // /tasks, /tasks/:id, etc.
	routes.ProjectAuthRoutes(router)  // /projects, /projects/:id, etc.
	routes.WsAuthRoutes(router)       // /ws/notifications, /ws/tasks, /ws/projects
	routes.NotificationsAuthRoutes(router)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
