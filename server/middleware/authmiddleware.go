package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

// Store is a global cookie store for session management
// Exported to be accessible by other packages
// Uses a secure key; in production, load from environment variable
var Store = sessions.NewCookieStore([]byte("your-secret-key")) // Replace with secure key

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
		// Proceed to next handler if authenticated
		c.Next()
	}
}
