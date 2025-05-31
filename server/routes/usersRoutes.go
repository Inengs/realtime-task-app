package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/gin-gonic/gin"
)

func UserAuthRoutes(router *gin.Engine) {
	users := router.Group("/users")
	{
		users.GET("/", middleware.AuthMiddleware(), controllers.UserListFunc)
		users.GET("/:id", middleware.AuthMiddleware(), controllers.UserDetailsFunc)
	}
}
