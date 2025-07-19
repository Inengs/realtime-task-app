package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware" // ensure this exists
	"github.com/gin-gonic/gin"
)

func TaskAuthRoutes(router *gin.Engine) {
	tasks := router.Group("/tasks", middleware.AuthMiddleware())
	{
		tasks.GET("/", controllers.TaskListFunc)
		tasks.GET("/:id", controllers.TaskDetailsFunc)
		tasks.POST("/", controllers.CreateNewTask)
		tasks.PUT("/:id", controllers.UpdateTask)
		tasks.DELETE("/:id", controllers.DeleteTask)
		tasks.PATCH("/:id/status", controllers.UpdateTaskStatus)
	}
}
