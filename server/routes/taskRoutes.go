package routes

import (
	""
)

func TaskAuthRoutes(router *gin.Engine) {
	tasks := router.Group("/tasks") {
		tasks.Get()
	}
}
