package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

const (
	requestsPerMinute = 5
	cleanupInterval   = 10 * time.Minute
)

type Client struct {
	Limiter  *rate.Limiter
	LastSeen time.Time
}

var (
	clients = make(map[string]*Client)
	mu      sync.Mutex
)

// getLimiter retrieves or creates a rate limiter for the IP
func getLimiter(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	client, exists := clients[ip]
	if !exists {
		limiter := rate.NewLimiter(rate.Every(time.Minute/time.Duration(requestsPerMinute)), requestsPerMinute)
		clients[ip] = &Client{
			Limiter:  limiter,
			LastSeen: time.Now(),
		}
		return limiter
	}

	client.LastSeen = time.Now()
	return client.Limiter
}

// RateLimitMiddleware creates a Gin middleware handler
func RateLimitMiddleware() gin.HandlerFunc {
	go cleanupStaleClients()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := getLimiter(ip)

		if !limiter.Allow() {
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many registration attempts, try again later.",
			})
			return
		}
		c.Next()
	}
}

// cleanupStaleClients periodically removes old IP entries
func cleanupStaleClients() {
	for {
		time.Sleep(cleanupInterval)
		mu.Lock()
		for ip, client := range clients {
			if time.Since(client.LastSeen) > cleanupInterval {
				delete(clients, ip)
			}
		}
		mu.Unlock()
	}
}
