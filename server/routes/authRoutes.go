package routes

import (
	"database/sql"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"unicode"

	_ "github.com/Inengs/realtime-task-app/db"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,customEmail" `
	Password string `json:"password" binding:"required,min=6,max=32"`
}

func ValidateEmail(f1 validator.FieldLevel) bool {
	email := f1.Field().String()
	re := `^[a-z0-9]+([.-_]?[a-z0-9]+)*@[a-z0-9-]+\.[a-z]{2,}$`
	matched, _ := regexp.MatchString(re, email)

	return matched
}

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

// SanitizeUsername	removes control characters and whitespace
func SanitizeUsername(username string) (string, error) {
	sanitized := SanitizeInput(username)
	// uses a regexp to only allow alphanumeric characters, underscores and hyphens
	usernameRe := regexp.MustCompile(`a-zA-Z0-9_-`)

	sanitized = usernameRe.ReplaceAllString(sanitized, "")
	// check length constraints
	if len(sanitized) < 3 || len(sanitized) > 20 {
		return "", gin.Error{Err: errors.New("username length must be between 3 and 20 characters"), Meta: http.StatusBadRequest}
	}
	return sanitized, nil
}

// SanitizeEmail removes control characters and whitespace
func SanitizeEmail(email string) (string, error) {
	sanitized := SanitizeInput(strings.ToLower(email))

	if !strings.Contains(sanitized, "@") || !strings.Contains(sanitized, ".") {
		return "", gin.Error{Err: errors.New("invalid email"), Meta: http.StatusBadRequest}
	}

	return sanitized, nil
}

func registerFunc(c *gin.Context) {
	// Get database connection
	db := c.MustGet("db").(*sql.DB)

	// REQUEST BODY EXTRACTION
	var user User
	if err := c.ShouldBindJSON(&user); err != nil { // remember to send the registered user details as json
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// INPUT VALIDATION
	validate := validator.New()
	validate.RegisterValidation("customEmail", ValidateEmail)

	if err := validate.Struct(user); err != nil {
		//Handle validation error
		c.JSON(400, gin.H{"error": "Invalid email format"})
		return
	}

	// DUPLICATE USER CHECK
	var exists bool
	// Check for duplicate username
	query := `SELECT EXISTS (SELECT 1 FROM users WHERE username=$1)`
	err = db.QueryRow(query, user.Username).Scan(&exists)
	if err != nil {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	// INSERT USER
	var userID int
	err = db.QueryRow(
		"INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
		user.Username, user.Email, string(hashedPassword),
	).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// SUCCESS RESPONSE
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "user_id": userID})
}
