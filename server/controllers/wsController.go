package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/Inengs/realtime-task-app/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// allowedOrigin lets only our own frontend open sockets.
// Browsers always send Origin on a WebSocket handshake; non-browser
// clients (curl, tests) send none and still have to pass authentication.
func allowedOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	return origin == strings.TrimRight(os.Getenv("FRONTEND_URL"), "/")
}

// timing controls keep-alive behaviour. It lives on the manager (not in globals)
// so tests can use short values without affecting anything else.
type timing struct {
	writeWait  time.Duration // max time allowed to write one message
	pongWait   time.Duration // drop a client that stays silent this long
	pingPeriod time.Duration // how often we ping; must be shorter than pongWait
}

var defaultTiming = timing{
	writeWait:  10 * time.Second,
	pongWait:   60 * time.Second,
	pingPeriod: 30 * time.Second,
}

const (
	sendBuffer = 32   // queued messages per client before it is considered too slow
	readLimit  = 1024 // clients never need to send us anything large
)

var upgrader = websocket.Upgrader{CheckOrigin: allowedOrigin}

// channel is one of the three sockets the frontend opens.
type channel string

const (
	chNotifications channel = "notifications"
	chTasks         channel = "tasks"
	chProjects      channel = "projects"
)

// room says who should receive an event. Today a room is one user's connections
// on one channel. For shared projects it will become one project's members.
type room struct {
	ch     channel
	userID int
}

// event is the JSON the browser receives: {"type": "...", "data": {...}}
type event struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

// client is one open socket. Only its writePump goroutine writes to conn.
type client struct {
	conn *websocket.Conn
	send chan []byte
	t    timing
}

// ClientManager tracks open sockets by room and delivers events to them.
type ClientManager struct {
	mu    sync.RWMutex
	rooms map[room]map[*client]struct{}
	t     timing
}

func newClientManager() *ClientManager {
	return &ClientManager{rooms: make(map[room]map[*client]struct{}), t: defaultTiming}
}

var manager = newClientManager()

func (m *ClientManager) subscribe(rm room, c *client) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.rooms[rm] == nil {
		m.rooms[rm] = make(map[*client]struct{})
	}
	m.rooms[rm][c] = struct{}{}
}

func (m *ClientManager) unsubscribe(rm room, c *client) {
	m.mu.Lock()
	defer m.mu.Unlock()
	set := m.rooms[rm]
	if _, ok := set[c]; !ok {
		return
	}
	delete(set, c)
	// Safe: publishers hold the read lock while sending, so none can reach c now.
	close(c.send)
	if len(set) == 0 {
		delete(m.rooms, rm)
	}
}

// publish sends one event to everyone in a room. It never blocks on a slow client.
func (m *ClientManager) publish(rm room, msgType string, data any) {
	payload, err := json.Marshal(event{Type: msgType, Data: data})
	if err != nil {
		log.Printf("ws: cannot encode %q event: %v", msgType, err)
		return
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	for c := range m.rooms[rm] {
		select {
		case c.send <- payload:
		default:
			// Not keeping up. Closing the socket ends its pumps and removes it.
			c.conn.Close()
		}
	}
}

// BroadcastTask sends a task event to the user's task sockets.
func (m *ClientManager) BroadcastTask(userID int, task models.Task, messageType string) {
	m.publish(room{chTasks, userID}, messageType, task)
}

// BroadcastProject sends a project event to the user's project sockets.
func (m *ClientManager) BroadcastProject(userID int, project models.Project, messageType string) {
	m.publish(room{chProjects, userID}, messageType, project)
}

// BroadcastNotification sends a notification to the user's notification sockets.
func (m *ClientManager) BroadcastNotification(userID int, notification models.Notifications) {
	m.publish(room{chNotifications, userID}, "notification", notification)
}

// serve upgrades the request and runs the socket until it closes.
func (m *ClientManager) serve(w http.ResponseWriter, r *http.Request, ch channel, userID int) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		// Upgrade has already sent the HTTP error response, so don't write another.
		log.Printf("ws %s: upgrade failed: %v", ch, err)
		return
	}
	c := &client{conn: conn, send: make(chan []byte, sendBuffer), t: m.t}
	rm := room{ch, userID}
	m.subscribe(rm, c)
	go c.writePump()
	c.readPump() // blocks until the socket dies
	m.unsubscribe(rm, c)
	conn.Close()
}

// readPump reads (and discards) incoming frames. Its real job is to notice dead
// connections: the read deadline is pushed forward every time a pong arrives.
func (c *client) readPump() {
	c.conn.SetReadLimit(readLimit)
	c.conn.SetReadDeadline(time.Now().Add(c.t.pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(c.t.pongWait))
	})
	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			if websocket.IsUnexpectedCloseError(err,
				websocket.CloseNormalClosure,
				websocket.CloseGoingAway,
				websocket.CloseNoStatusReceived) {
				log.Printf("ws: unexpected close: %v", err)
			}
			return
		}
	}
}

// writePump is the only goroutine that writes to the socket. It sends queued
// events and a ping every pingPeriod so proxies and phones don't drop idle sockets.
func (c *client) writePump() {
	ticker := time.NewTicker(c.t.pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(c.t.writeWait))
			if !ok { // manager closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(c.t.writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveFromContext reads the logged-in user (set by the auth middleware) and serves.
func serveFromContext(c *gin.Context, ch channel) {
	v, _ := c.Get("user_id")
	userID, ok := v.(int)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	manager.serve(c.Writer, c.Request, ch, userID)
}

// WebSocketHandler handles /ws/notifications
func WebSocketHandler(c *gin.Context) { serveFromContext(c, chNotifications) }

// WebSocketTaskHandler handles /ws/tasks
func WebSocketTaskHandler(c *gin.Context) { serveFromContext(c, chTasks) }

// WebSocketProjectHandler handles /ws/projects
func WebSocketProjectHandler(c *gin.Context) { serveFromContext(c, chProjects) }
