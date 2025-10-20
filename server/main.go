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

func validateEnv() {
    required := []string{
        "SESSION_SECRET",
        "EMAIL_FROM",
        "EMAIL_USERNAME",
        "EMAIL_PASSWORD",
        "EMAIL_SMTP_HOST",
        "EMAIL_SMTP_PORT",
    }
    
    for _, key := range required {
        if os.Getenv(key) == "" {
            log.Fatalf("Required environment variable %s is missing", key)
        }
    }
}

func main() {
	validateEnv()

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

	// Check if SESSION_SECRET IS MISSING
	if os.Getenv("SESSION_SECRET") == "" {
		log.Fatal("SESSION_SECRET is required")
	}

	// Configure CORS for frontend
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"}, // Add Vite default port
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Cookie"},
		ExposeHeaders:    []string{"Set-Cookie"},
		AllowCredentials: true,
	}))

	// Initialize session store
	middleware.Store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))
	if middleware.Store == nil {
		log.Fatalf("Failed to initialize session store")
	}

	// Register routes
	routes.RegisterAuthRoutes(router)
	routes.UserAuthRoutes(router)
	routes.TaskAuthRoutes(router)
	routes.ProjectAuthRoutes(router)
	routes.WsAuthRoutes(router)
	routes.NotificationsAuthRoutes(router)

	// Set trusted proxies
	if err := router.SetTrustedProxies([]string{"127.0.0.1"}); err != nil {
		log.Fatalf("Failed to set trusted proxies: %v", err)
	}

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
