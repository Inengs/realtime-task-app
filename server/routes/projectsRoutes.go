package routes

import (
	"github.com/Inengs/realtime-task-app/controllers"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/gin-gonic/gin"
)

func ProjectAuthRoutes(router *gin.Engine) {
	projects := router.Group("/projects", middleware.AuthMiddleware())

	{
		projects.GET("/", controllers.ListProjects)
		projects.GET("/:id", controllers.ProjectDetails)
		projects.POST("/", controllers.CreateProject)
		projects.PUT("/:id", controllers.UpdateProject)
		projects.DELETE("/:id", controllers.DeleteProject)
	}
}
