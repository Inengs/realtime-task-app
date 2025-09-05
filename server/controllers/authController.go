package controllers

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"regexp"

	// "regexp"
	"strings"
	"unicode"

	_ "github.com/Inengs/realtime-task-app/db"
	"github.com/Inengs/realtime-task-app/middleware"
	"github.com/Inengs/realtime-task-app/models"
	"github.com/Inengs/realtime-task-app/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required,min=6,max=32"`
}

// LoginRequest defines the structure for login payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required,min=6,max=32"`
}

// // ValidateEmail checks if the email format is valid using a regex
// func ValidateEmail(f1 validator.FieldLevel) bool {
// 	email := f1.Field().String()
// 	re := `^[a-z0-9]+([._-]?[a-z0-9]+)*@[a-z0-9-]+\.[a-z]{2,}$`
// 	matched, _ := regexp.MatchString(re, email)
// 	return matched
// }

// SanitizeInput removes control characters and trims whitespace
func SanitizeInput(input string) string {
	// Remove control characters (ASCII 0-31, except allowed ones like tab)
	var sanitized strings.Builder
	for _, r := range input {
		if !unicode.IsControl(r) || r == '\t' {
			sanitized.WriteRune(r)
		}
	}
	// Trim leading and trailing whitespace
	return strings.TrimSpace(sanitized.String())
}

// SanitizeUsername ensures only alphanumeric, underscore, and hyphen are allowed
func SanitizeUsername(username string) (string, error) {
	sanitized := SanitizeInput(username)
	// Allow only alphanumeric, underscore, and hyphen
	usernameRe := regexp.MustCompile(`[^a-zA-Z0-9_-]`)
	sanitized = usernameRe.ReplaceAllString(sanitized, "")
	if len(sanitized) < 3 || len(sanitized) > 20 {
		return "", errors.New("username length must be between 3 and 20 characters")
	}
	return sanitized, nil
}

// SanitizeEmail normalizes email to lowercase and removes invalid characters
func SanitizeEmail(email string) (string, error) {
	// Normalize to lowercase
	sanitized := SanitizeInput(strings.ToLower(email))
	// Basic check for email-like structure
	if !strings.Contains(sanitized, "@") || !strings.Contains(sanitized, ".") {
		return "", errors.New("invalid email format")
	}
	return sanitized, nil
}

func RegisterFunc(c *gin.Context) {
	// Get database connection
	db := c.MustGet("db").(*sql.DB)

	// REQUEST BODY EXTRACTION
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// INPUT SANITIZATION
	var err error
	user.Username, err = SanitizeUsername(user.Username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Email, err = SanitizeEmail(user.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Password = SanitizeInput(user.Password)
	if len(user.Password) < 6 || len(user.Password) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password length must be between 6 and 32 characters"})
		return
	}

	// // INPUT VALIDATION
	// validate := validator.New()
	// validate.RegisterValidation("customEmail", ValidateEmail)
	// if err := validate.Struct(user); err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
	// 	return
	// }

	// DUPLICATE USER CHECK
	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM users WHERE username=$1)`
	err = db.QueryRow(query, user.Username).Scan(&exists)
	if err != nil {
		log.Printf("Username check error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
		return
	}

	// Check for duplicate email
	query = `SELECT EXISTS (SELECT 1 FROM users WHERE email=$1)`
	err = db.QueryRow(query, user.Email).Scan(&exists)
	if err != nil {
		log.Printf("Email check error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already taken"})
		return
	}

	// HASH PASSWORD
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Password hash error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	token, err := utils.GenerateVerificationToken()
	if err != nil {
		log.Printf("Token generation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate verification token"})
		return
	}

	// INSERT USER
	var userID int
	err = db.QueryRow(
		`INSERT INTO users (username, email, password, verification_token) 
		 VALUES ($1, $2, $3, $4) RETURNING id`,
		user.Username, user.Email, string(hashedPassword), token,
	).Scan(&userID)
	if err != nil {
		log.Printf("User insert error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	if err := utils.SendVerificationEmail(user.Email, token); err != nil {
		log.Printf("Email sending error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
		return
	}

	// SUCCESS RESPONSE
	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered. Please check your email to verify your account.",
		"user_id": userID,
	})
}

func VerifyEmail(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)
	token := c.Query("token")

	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	result, err := db.Exec(`
		UPDATE users 
		SET verified = TRUE, verification_token = NULL 
		WHERE verification_token = $1
	`, token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully!"})
}

func LoginFunc(c *gin.Context) {
	// Get database connection from context
	db := c.MustGet("db").(*sql.DB)

	// Request Body extraction
	var login LoginRequest
	if err := c.ShouldBindJSON(&login); err != nil {
		// Return 400 if JSON payload is invalid
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// INPUT SANITIZATION
	var err error
	// Sanitize email: remove control characters, normalize to lowercase
	login.Email, err = SanitizeEmail(login.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Sanitize password: remove control characters, preserve exact content
	login.Password = SanitizeInput(login.Password)
	if len(login.Password) < 6 || len(login.Password) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password length must be between 6 and 32 characters"})
		return
	}

	// // INPUT VALIDATION
	// validate := validator.New()
	// validate.RegisterValidation("customEmail", ValidateEmail)
	// if err := validate.Struct(login); err != nil {
	// 	// Return 400 if email format is invalid
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
	// 	return
	// }

	// QUERY USER BY EMAIL
	var userID int
	var storedHash string
	query := `SELECT id, password FROM users WHERE email=$1`
	err = db.QueryRow(query, login.Email).Scan(&userID, &storedHash)
	if err == sql.ErrNoRows {
		// Return 401 for non-existent user or incorrect password to avoid information leakage
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	if err != nil {
		// Return 500 for database errors
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// VERIFY PASSWORD
	err = bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(login.Password))
	if err != nil {
		// Return 401 if password doesn't match
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// CREATE SESSION
	session, err := middleware.Store.Get(c.Request, "auth-session")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "session error"})
		return
	}
	// Store user_id in session
	session.Values["user_id"] = userID
	// Save session and set cookie
	err = session.Save(c.Request, c.Writer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	// SUCCESS RESPONSE
	// Return user ID and success message (no sensitive data like password)
	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user_id": userID})
}

func LogoutFunc(c *gin.Context) {
	// Get session from request
	session, err := middleware.Store.Get(c.Request, "auth-session")
	if err != nil {
		// Return 500 if session store fails
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Session error"})
		return
	}

	// Check if user is authenticated
	if _, ok := session.Values["user_id"]; !ok {
		// Return 401 if no valid session exists
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not logged in"})
		return
	}

	// CLEAR SESSION
	// Remove all session data
	session.Values = make(map[interface{}]interface{})
	// Set MaxAge to -1 to delete the session cookie
	session.Options.MaxAge = -1
	// Save session to persist changes and delete cookie
	err = session.Save(c.Request, c.Writer)
	if err != nil {
		// Return 500 if saving session fails
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear session"})
		return
	}

	// SUCCESS RESPONSE
	// Return 200 with confirmation message
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

func MeFunc(c *gin.Context) {
	// Get database connection from context
	db := c.MustGet("db").(*sql.DB)

	// Get session from request
	session, err := middleware.Store.Get(c.Request, "auth-session")
	if err != nil {
		// Return 500 if session store fails
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Session error"})
		return
	}

	// Get user_id from session (guaranteed by AuthMiddleware)
	userID, _ := session.Values["user_id"].(int)

	// Query user details from database
	var user models.UserResponse
	query := `SELECT id, username, email FROM users WHERE id=$1`
	err = db.QueryRow(query, userID).Scan(&user.UserID, &user.Username, &user.Email)
	if err == sql.ErrNoRows {
		// Return 404 if user not found (handles edge cases like deleted users)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if err != nil {
		// Return 500 for database errors
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// SUCCESS RESPONSE
	// Return user details
	c.JSON(http.StatusOK, gin.H{"message": "User info retrieved", "user": user})
}
