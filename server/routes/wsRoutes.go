package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/gin-gonic/gin"
)

func WsAuthRoutes(router *gin.Engine) {
	ws := router.Group("/ws")
	{
		ws.GET("/notifications", middleware.AuthMiddleware(), controllers.WebSocketHandler)
		ws.GET("/tasks", middleware.AuthMiddleware(), controllers.WebSocketTaskHandler)
		ws.GET("/tasks", middleware.AuthMiddleware(), controllers.WebSocketProjectHandler)
	}
}
