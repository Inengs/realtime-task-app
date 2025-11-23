package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.Engine) {
	auth := router.Group("/auth")

	auth.POST("/register", middleware.RateLimitMiddleware(), controllers.RegisterFunc)
	auth.POST("/login", middleware.RateLimitMiddleware(), controllers.LoginFunc)
	auth.POST("/logout", middleware.AuthMiddleware(), controllers.LogoutFunc)
	auth.GET("/me", middleware.AuthMiddleware(), controllers.MeFunc)
	auth.GET("/verify-email", controllers.VerifyEmail)
	auth.POST("/resend-verification", middleware.RateLimitMiddleware(), controllers.ResendVerificationEmail)
}
