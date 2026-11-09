package middleware

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/Inengs/realtime-task-app/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates a JWT from the Authorization header.
//
// Expected header format:
//
//	Authorization: Bearer <token>
//
// If valid, attaches user_id to the Gin context so downstream handlers
// can access it via c.Get("user_id").
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ─── Step 1: Extract the Authorization header ───
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		// validates 2 parts: Bearer and eyJhbG...
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.Next()
			return
		}

		// validates JWT signature, checks expiry, extracts the user_id
		userID, err := utils.ParseAuthToken(parts[1])
		if err != nil {
			// logs the failure
			slog.Warn("invalid JWT",
				"endpoint", c.Request.URL.Path,
				"error", err.Error(),
				"ip", c.ClientIP(),
			)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		c.Set("user_id", userID) // on success, store the user id in Gins context
		c.Next()
	}
}
