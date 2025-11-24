# 🚀 Real-Time Task Management API

A production-ready RESTful API built with Go that provides real-time task and project management capabilities with WebSocket support for instant updates.

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://golang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-316192?style=flat&logo=postgresql)](https://postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- **🔐 Secure Authentication**: Session-based auth with bcrypt password hashing
- **📧 Email Verification**: Token-based email verification system with expiry
- **⚡ Real-Time Updates**: WebSocket connections for instant notifications
- **🛡️ Security First**: Rate limiting, input sanitization, and CORS protection
- **📊 Project Management**: Organize tasks within projects
- **🔔 Notifications**: Real-time user notifications for all activities
- **🎯 Task Tracking**: Full CRUD operations with status management
- **🔄 Concurrent Handling**: Mutex-protected WebSocket client management

## 🏗️ Architecture

```
Client Layer (Web/Mobile)
        ↓
Middleware (Auth, CORS, Rate Limiting)
        ↓
API Layer (Gin Framework)
    ├── Controllers
    ├── WebSocket Manager
    └── Business Logic
        ↓
PostgreSQL Database + SMTP Service
```

## 🛠️ Tech Stack

- **Language**: Go 1.21+
- **Web Framework**: Gin
- **Database**: PostgreSQL
- **Real-Time**: Gorilla WebSocket
- **Session Management**: Gorilla Sessions
- **Email**: SMTP (configurable)
- **Security**: bcrypt, rate limiting, input sanitization

## 📋 Prerequisites

- Go 1.21 or higher
- PostgreSQL 13 or higher
- SMTP server credentials (Gmail, SendGrid, etc.)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/realtime-task-app.git
cd realtime-task-app
```

### 2. Install dependencies

```bash
go mod download
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=taskapp
DB_SSLMODE=disable

# Session Secret (generate a secure random string)
SESSION_SECRET=your-super-secure-secret-key-change-this

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_USERNAME=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587

# Frontend URL (for email verification links)
APP_BASE_URL=http://localhost:5173
```

### 4. Create the database

```bash
createdb taskapp
```

The application will automatically create the required tables on first run.

### 5. Run the application

```bash
go run main.go
```

The server will start on `http://localhost:8080`

## 📚 API Documentation

### Base URL

```
http://localhost:8080
```

### Authentication Endpoints

#### Register a new user

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201)**:

```json
{
  "message": "User registered. Please check your email to verify your account.",
  "user_id": 1
}
```

#### Verify email

```http
GET /auth/verify-email?token=your-verification-token
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200)**:

```json
{
  "message": "Login successful",
  "user_id": 1
}
```

#### Get current user

```http
GET /auth/me
```

**Response (200)**:

```json
{
  "message": "User info retrieved",
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Logout

```http
POST /auth/logout
```

#### Resend verification email

```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

### Project Endpoints

All project endpoints require authentication.

#### List all projects

```http
GET /projects
```

#### Get project details

```http
GET /projects/:id
```

#### Create a new project

```http
POST /projects
Content-Type: application/json

{
  "name": "Mobile App Redesign",
  "description": "Complete UI/UX overhaul for iOS and Android"
}
```

#### Update a project

```http
PUT /projects/:id
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### Delete a project

```http
DELETE /projects/:id
```

**Note**: Deleting a project will also delete all associated tasks.

---

### Task Endpoints

All task endpoints require authentication.

#### List all tasks

```http
GET /tasks
```

**Response (200)**:

```json
{
  "message": "Tasks retrieved successfully",
  "tasks": [
    {
      "id": 1,
      "title": "Design new login screen",
      "description": "Create modern UI with dark mode",
      "status": "pending",
      "user_id": 1,
      "project_id": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get task details

```http
GET /tasks/:id
```

#### Create a new task

```http
POST /tasks
Content-Type: application/json

{
  "title": "Design new login screen",
  "description": "Create modern UI with dark mode support",
  "status": "pending",
  "project_id": 1
}
```

**Valid status values**: `pending`, `in-progress`, `done`

#### Update a task

```http
PUT /tasks/:id
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in-progress",
  "project_id": 1
}
```

#### Update task status only

```http
PATCH /tasks/:id/status
Content-Type: application/json

{
  "status": "done"
}
```

#### Delete a task

```http
DELETE /tasks/:id
```

---

### Notification Endpoints

#### Get user notifications

```http
GET /notifications/:userId
```

**Response (200)**:

```json
{
  "message": "Notifications retrieved successfully",
  "notifications": [
    {
      "id": 1,
      "userID": 1,
      "message": "New task created: Design new login screen",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Mark notifications as read

```http
PATCH /notifications/read/:userId
Content-Type: application/json

{
  "notificationIDs": [1, 2, 3]
}
```

To mark all notifications as read, send an empty array:

```json
{
  "notificationIDs": []
}
```

---

### WebSocket Endpoints

All WebSocket endpoints require authentication.

#### Connect to notifications WebSocket

```
ws://localhost:8080/ws/notifications
```

#### Connect to tasks WebSocket

```
ws://localhost:8080/ws/tasks
```

#### Connect to projects WebSocket

```
ws://localhost:8080/ws/projects
```

**WebSocket Message Format**:

```json
{
  "type": "task_update",
  "data": {
    "id": 1,
    "title": "Design new login screen",
    "status": "in-progress",
    ...
  }
}
```

**Message Types**:

- `task_update`: Task created or updated
- `task_deleted`: Task deleted
- `project_created`: New project created
- `project_updated`: Project updated
- `project_deleted`: Project deleted
- `notification`: New notification

---

### User Endpoints

#### List all users

```http
GET /users
```

#### Get user details

```http
GET /users/:id
```

---

## 🔒 Security Features

### Rate Limiting

- **Registration/Login**: 10 requests per minute per IP
- Automatic cleanup of stale IP entries
- 429 status code with `Retry-After` header

### Input Sanitization

- Username: Alphanumeric, underscore, hyphen only (3-20 chars)
- Email: Normalized to lowercase, validated format
- Password: 6-32 characters, bcrypt hashed
- Control character removal from all inputs

### Session Security

- HttpOnly cookies
- Secure flag (enable in production)
- SameSite protection
- 7-day session expiry

### Database Security

- Prepared statements (SQL injection prevention)
- CASCADE deletes for data integrity
- Foreign key constraints

## 🧪 Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"securepass123"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","password":"securepass123"}'

# Create Task
curl -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Task","description":"Test","status":"pending","project_id":1}'
```

### Using Postman

1. Import the provided Postman collection
2. Set up environment variables
3. Run the collection

## 📁 Project Structure

```
.
├── server/
│   ├── config/
│   │   └── db.go              # Database configuration
│   ├── controllers/
│   │   ├── authController.go  # Authentication logic
│   │   ├── taskController.go  # Task CRUD operations
│   │   ├── projectsController.go
│   │   ├── notificationsController.go
│   │   ├── usersController.go
│   │   └── wsController.go    # WebSocket management
│   ├── db/
│   │   └── init.go            # Database schema initialization
│   ├── middleware/
│   │   ├── authmiddleware.go  # Session validation
│   │   └── rate_limiter.go    # Rate limiting
│   ├── models/
│   │   ├── users.go
│   │   ├── tasks.go
│   │   ├── projects.go
│   │   └── notifications.go
│   ├── routes/
│   │   ├── authRoutes.go
│   │   ├── taskRoutes.go
│   │   ├── projectsRoutes.go
│   │   ├── notificationsRoutes.go
│   │   ├── usersRoutes.go
│   │   └── wsRoutes.go
│   └── utils/
│       ├── email.go           # Email sending utilities
│       └── token.go           # Token generation
├── main.go                     # Application entry point
├── go.mod
├── go.sum
├── .env.example
└── README.md
```

## 🔧 Configuration

### Database Schema

The application automatically creates these tables:

- **users**: User accounts with verification
- **projects**: Project organization
- **tasks**: Task management with status
- **notifications**: User notifications

All tables include `created_at` and `updated_at` timestamps.

### SMTP Configuration

For Gmail:

```env
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Note**: For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833).

### CORS Configuration

Default allowed origins:

- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Create React App)

To modify, edit `main.go`:

```go
router.Use(cors.New(cors.Config{
    AllowOrigins: []string{"https://your-frontend.com"},
    // ... other settings
}))
```

## 🚦 Error Handling

### Standard Error Responses

**400 Bad Request**:

```json
{
  "error": "Invalid request body"
}
```

**401 Unauthorized**:

```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**:

```json
{
  "error": "Task with ID 5 not found"
}
```

**409 Conflict**:

```json
{
  "error": "Email already taken"
}
```

**429 Too Many Requests**:

```json
{
  "error": "Too many registration attempts, try again later."
}
```

**500 Internal Server Error**:

```json
{
  "error": "Database error"
}
```

## 🚀 Deployment

### Production Checklist

- [ ] Set strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Set `Secure: true` in session options
- [ ] Configure production database
- [ ] Set up proper SMTP service
- [ ] Configure CORS for production domain
- [ ] Enable database SSL mode
- [ ] Set up logging and monitoring
- [ ] Configure rate limits appropriately
- [ ] Review and update trusted proxies

### Environment Variables for Production

```env
PORT=8080
DB_SSLMODE=require
SESSION_SECRET=<generate-strong-random-key>
APP_BASE_URL=https://your-domain.com
```

### Docker Support (Optional)

```dockerfile
FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**

- GitHub: [@Inengs](https://github.com/Inengs)
- LinkedIn: [Emmanuel Inengiye](www.linkedin.com/in/emmanuel-inengiye-3a206a289)
- Email: inengiye@proton.me

## 🙏 Acknowledgments

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [Gorilla WebSocket](https://github.com/gorilla/websocket)
- [PostgreSQL](https://www.postgresql.org/)
- [Go Community](https://golang.org/community)

## 📞 Support

For support, email or open an issue in the GitHub repository.

---

**⭐ If you find this project useful, please consider giving it a star!**
