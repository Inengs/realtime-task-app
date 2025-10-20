package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

// Store is a global cookie store for session management
// Exported to be accessible by other packages
// Uses a secure key; in production, load from environment variable
var Store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))

func init() {
    // Configure session options
    Store.Options = &sessions.Options{
        Path:     "/",
        MaxAge:   86400 * 7, // 7 days
        HttpOnly: true,
        Secure:   true, // Set to true in production with HTTPS
        SameSite: http.SameSiteLaxMode,
    }
}

// AuthMiddleware checks for a valid session
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get session from request using the same session name as in routes
		session, err := Store.Get(c.Request, "auth-session")
		if err != nil {
			// Return 500 if session store fails
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Session error"})
			c.Abort()
			return
		}
		// Check if user_id exists in session to verify authentication
		if userID, ok := session.Values["user_id"]; !ok || userID == nil {
			// Return 401 if no valid session exists
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// Set user_id in Gin context for access in downstream handlers
		c.Set("user_id", session.Values["user_id"])

		// go to next handler
		c.Next()

	}
}
