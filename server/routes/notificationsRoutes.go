package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware" // ensure this exists
	"github.com/gin-gonic/gin"
)

func NotificationsAuthRoutes(router *gin.Engine) {
	notifications := router.Group("/notifications", middleware.AuthMiddleware())
	{
		notifications.GET("/:id", controllers.GetUserNotifications)
		notifications.PATCH("/read/:id", controllers.MarkNotificationsRead)
	}
}
