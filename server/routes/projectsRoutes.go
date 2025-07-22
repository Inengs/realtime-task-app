package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/gin-gonic/gin"
)

func TaskProjectRoutes(router *gin.Engine) {
	projects := router.Group("/projects", middleware.AuthMiddleware())

	{
		projects.GET("/", controllers.ListProjects)
		projects.GET("/:id", controllers.ProjectDetails)
		projects.POST("/", controllers.ProjectDetails)
		projects.PUT("/:id", controllers.ProjectDetails)
		projects.DELETE("/:id", controllers.ProjectDetails)
	}
}
