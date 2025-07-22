package controllers

import (
	"log"
	"net/http"
	"sync"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// ClientManager manages WebSocket connections
type ClientManager struct {
	clients        map[int][]*websocket.Conn // For /ws/notifications
	taskClients    map[int][]*websocket.Conn // For /ws/tasks
	projectClients map[int][]*websocket.Conn // /ws/projects
	mutex          sync.Mutex
}

var manager = ClientManager{
	clients:        make(map[int][]*websocket.Conn),
	taskClients:    make(map[int][]*websocket.Conn),
	projectClients: make(map[int][]*websocket.Conn),
}

// AddClient adds a WebSocket connection for notifications
func (m *ClientManager) AddClient(userID int, conn *websocket.Conn) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	m.clients[userID] = append(m.clients[userID], conn)
}

// RemoveClient removes a WebSocket connection for notifications
func (m *ClientManager) RemoveClient(userID int, conn *websocket.Conn) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	conns := m.clients[userID]
	for i, c := range conns {
		if c == conn {
			m.clients[userID] = append(conns[:i], conns[i+1:]...)
			if len(m.clients[userID]) == 0 {
				delete(m.clients, userID)
			}
			break
		}
	}
}

// AddTaskClient adds a WebSocket connection for tasks
func (m *ClientManager) AddTaskClient(userID int, conn *websocket.Conn) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	m.taskClients[userID] = append(m.taskClients[userID], conn)
}

// RemoveTaskClient removes a WebSocket connection for tasks
func (m *ClientManager) RemoveTaskClient(userID int, conn *websocket.Conn) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	conns := m.taskClients[userID]
	for i, c := range conns {
		if c == conn {
			m.taskClients[userID] = append(conns[:i], conns[i+1:]...)
			if len(m.taskClients[userID]) == 0 {
				delete(m.taskClients, userID)
			}
			break
		}
	}
}

// AddProjectClient adds a WebSocket connection for projects
func (m *ClientManager) AddProjectClient(userID int, conn *websocket.Conn) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	m.projectClients[userID] = append(m.projectClients[userID], conn)
}

// RemoveProjectClient removes a WebSocket connection for projects
func (m *ClientManager) RemoveProjectClient(userID int, conn *websocket.Conn) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	conns := m.projectClients[userID]
	for i, c := range conns {
		if c == conn {
			m.projectClients[userID] = append(conns[:i], conns[i+1:]...)
			if len(m.projectClients[userID]) == 0 {
				delete(m.projectClients, userID)
			}
			break
		}
	}
}

// BroadcastTask sends a task update to all task clients of a user
func (m *ClientManager) BroadcastTask(userID int, task models.Task, messageType string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	message := gin.H{"type": messageType, "data": task}
	for _, conn := range m.taskClients[userID] {
		if err := conn.WriteJSON(message); err != nil {
			log.Printf("Error broadcasting task to user %d: %v", userID, err)
			conn.Close()
		}
	}
	// Also broadcast to notification clients for compatibility
	for _, conn := range m.clients[userID] {
		if err := conn.WriteJSON(message); err != nil {
			log.Printf("Error broadcasting task to notification client user %d: %v", userID, err)
			conn.Close()
		}
	}
}

// BroadcastNotification sends a notification to all notification clients of a user
func (m *ClientManager) BroadcastNotification(userID int, notification models.Notifications) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	message := gin.H{"type": "notification", "data": notification}
	for _, conn := range m.clients[userID] {
		if err := conn.WriteJSON(message); err != nil {
			log.Printf("Error broadcasting notification to user %d: %v", userID, err)
			conn.Close()
		}
	}
}

// BroadcastProjectEvent sends project events to project WebSocket clients
func (m *ClientManager) BroadcastProjectEvent(userID int, eventType string, project interface{}) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	message := gin.H{
		"type": eventType, // e.g. "project_created", "project_updated"
		"data": project,
	}

	for _, conn := range m.projectClients[userID] {
		if err := conn.WriteJSON(message); err != nil {
			log.Printf("Error broadcasting project event to user %d: %v", userID, err)
			conn.Close()
		}
	}
}

// WebSocketHandler handles WebSocket connections for notifications
func WebSocketHandler(c *gin.Context) {
	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Upgrade HTTP to WebSocket
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true }, // Adjust for production
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade to WebSocket"})
		return
	}

	// Register client
	userIDInt, _ := userID.(int)
	manager.AddClient(userIDInt, conn)
	defer func() {
		manager.RemoveClient(userIDInt, conn)
		conn.Close()
	}()

	// Keep connection open, read messages (optional)
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket read error for user %d: %v", userIDInt, err)
			break
		}
	}
}

// WebSocketTaskHandler handles WebSocket connections for tasks
func WebSocketTaskHandler(c *gin.Context) {
	// Get user ID from session
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Upgrade HTTP to WebSocket
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true }, // Adjust for production
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade to WebSocket"})
		return
	}

	// Register task client
	userIDInt, _ := userID.(int)
	manager.AddTaskClient(userIDInt, conn)
	defer func() {
		manager.RemoveTaskClient(userIDInt, conn)
		conn.Close()
	}()

	// Keep connection open, read messages (optional)
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket task read error for user %d: %v", userIDInt, err)
			break
		}
	}
}

// WebSocketProjectHandler handles WebSocket connections for projects
func WebSocketProjectHandler(c *gin.Context) {
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade to WebSocket"})
		return
	}

	userIDInt, _ := userID.(int)
	manager.AddProjectClient(userIDInt, conn)
	defer func() {
		manager.RemoveProjectClient(userIDInt, conn)
		conn.Close()
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket project read error for user %d: %v", userIDInt, err)
			break
		}
	}
}
