package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/gin-gonic/gin"
)

func DashboardRoutes(router *gin.Engine) {
	dashboard := router.Group("/dashboard", middleware.AuthMiddleware())
	{
		dashboard.GET("stats", controllers.GetDashboardStats)
		dashboard.GET("/recent-tasks", controllers.GetDashboardRecentTasks)
	}
}
