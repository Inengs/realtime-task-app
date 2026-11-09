package controllers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode"

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

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required,min=6,max=32"`
}

func SanitizeInput(input string) string {
	var sanitized strings.Builder // build a string that will be the sanitized string
	for _, r := range input {
		if !unicode.IsControl(r) || r == '\t' {
			// if the character is not a control character, tab is allowed though
			sanitized.WriteRune(r)
		}
	}
	return strings.TrimSpace(sanitized.String())
}

func SanitizeUsername(username string) (string, error) {
	sanitized := SanitizeInput(username)                   // sanitize the username input
	usernameRe := regexp.MustCompile(`[^a-zA-Z0-9_-]`)     // strips out any charater that is not part of the espression
	sanitized = usernameRe.ReplaceAllString(sanitized, "") // replace them with empty strings
	if len(sanitized) < 3 || len(sanitized) > 20 {
		return "", errors.New("username length must be between 3 and 20 characters")
	}
	return sanitized, nil // return sanitized user name
}

func SanitizeEmail(email string) (string, error) {
	sanitized := SanitizeInput(strings.ToLower(email))
	if !strings.Contains(sanitized, "@") || !strings.Contains(sanitized, ".") {
		return "", errors.New("invalid email format")
	}
	return sanitized, nil
}

func RegisterFunc(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	var user User // creates an empty User struct
	if err := c.ShouldBindJSON(&user); err != nil {
		// reads the json body and fills the struct, if it fails return error
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// cleans up the username the user sent
	var err error // used to hold any error
	user.Username, err = SanitizeUsername(user.Username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// cleans up the email
	user.Email, err = SanitizeEmail(user.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Email = strings.ToLower(strings.TrimSpace(user.Email))

	// cleans up the password
	user.Password = SanitizeInput(user.Password)
	if len(user.Password) < 6 || len(user.Password) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password length must be between 6 and 32 characters"})
		return
	}

	// checks if a username is taken, if the query fails return 500, if it is already taken return 409
	var exists bool
	if err := db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE username=$1)`, user.Username).Scan(&exists); err != nil {
		slog.Error("Username check failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
		return
	}

	if err := db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE email=$1)`, user.Email).Scan(&exists); err != nil {
		slog.Error("Email check failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already taken"})
		return
	}

	// turns the plain password into a secure hash, so you never store the real password.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		slog.Error("Password hash failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"}) // if hashing fails, log 500 error
		return
	}

	token, err := utils.GenerateVerificationToken() // creates a random token, sends to the user to verify their email
	if err != nil {
		slog.Error("Verification token generation failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate verification token"})
		return
	}

	expiry := time.Now().Add(24 * time.Hour) // verification token lasts for a day

	var userID int // holds the new user's id
	// save the user
	err = db.QueryRow(
		`INSERT INTO users (username, email, password, verification_token, verification_token_expiry)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		user.Username, user.Email, string(hashedPassword), token, expiry,
	).Scan(&userID)
	if err != nil {
		slog.Error("User insert failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// send verification email after the user has been saved
	if err := utils.SendVerificationEmail(user.Email, token); err != nil {
		slog.Error("Verification email failed", "email", user.Email, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
		return
	}

	// SUCCESS
	slog.Info("User registered", "user_id", userID, "email", user.Email)
	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered. Please check your email to verify your account.",
		"user_id": userID,
	})
}

// ─── VerifyEmail (unchanged) ───────────────────────────
func VerifyEmail(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)
	token := c.Query("token") // get token from request url

	if token == "" {
		// if token is empty return 400
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	var expiry time.Time
	// look up the user by their verification token and get the tokens expiry time
	err := db.QueryRow(`SELECT verification_token_expiry FROM users WHERE verification_token = $1`, token).Scan(&expiry)
	if err == sql.ErrNoRows {
		slog.Warn("Verification token not found", "token", token)
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid token"})
		return
	}
	if err != nil {
		slog.Error("DB error on token lookup", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// if it has expired, return bad request 400
	if time.Now().After(expiry) {
		slog.Warn("Verification token expired", "token", token, "expiry", expiry)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token expired"})
		return
	}

	// mark user as verified
	result, err := db.Exec(`UPDATE users SET verified = TRUE, verification_token = NULL, verification_token_expiry = NULL WHERE verification_token = $1`, token)
	if err != nil {
		slog.Error("DB error on user update", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// check if the row was actually updated
	if rows, _ := result.RowsAffected(); rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or expired token"})
		return
	}

	slog.Info("Email verified", "token", token)
	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully!"})
}

// ─── LoginFunc (CHANGED — returns JWT instead of session cookie) ─
func LoginFunc(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	var login LoginRequest
	// bind the request to this login struct
	if err := c.ShouldBindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var err error
	// sanitize the email
	login.Email, err = SanitizeEmail(login.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// sanitize the password
	login.Password = SanitizeInput(login.Password)
	if len(login.Password) < 6 || len(login.Password) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password length must be between 6 and 32 characters"})
		return
	}

	var userID int
	var storedHash string
	// find the user
	err = db.QueryRow(`SELECT id, password FROM users WHERE email=$1`, login.Email).Scan(&userID, &storedHash)
	// if not found, return 401
	if err == sql.ErrNoRows {
		slog.Warn("Login failed — user not found", "email", login.Email, "ip", c.ClientIP())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	if err != nil {
		slog.Error("DB error on login", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// compare the hash and the password
	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(login.Password)); err != nil {
		slog.Warn("Login failed — wrong password", "user_id", userID, "ip", c.ClientIP())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// ─── Generate JWT (replaces session cookie) ───
	// this is to prove we have signed up, sent with future requests
	jwtToken, err := utils.GenerateAuthToken(userID)
	if err != nil {
		slog.Error("JWT generation failed", "user_id", userID, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate auth token"})
		return
	}

	slog.Info("User logged in", "user_id", userID, "ip", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user_id": userID,
		"token":   jwtToken,
	})
}

// ─── LogoutFunc (CHANGED — no session to clear, frontend deletes token) ─

func LogoutFunc(c *gin.Context) {
	// With JWT, logout is purely a client-side action.
	// The frontend deletes the token from localStorage.
	// We log it for audit purposes if the user_id is in context (optional auth).
	if userID, exists := c.Get("user_id"); exists {
		slog.Info("User logged out", "user_id", userID, "ip", c.ClientIP())
	}
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

// ─── MeFunc (CHANGED — reads user_id from context, not session) ───
func MeFunc(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	// AuthMiddleware already validated the JWT and set user_id in context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	uid := userID.(int)

	var user models.UserResponse // struct to hold users data
	// fetches user public data
	err := db.QueryRow(`SELECT id, username, email FROM users WHERE id=$1`, uid).Scan(&user.UserID, &user.Username, &user.Email)
	if err == sql.ErrNoRows {
		slog.Warn("User not found in DB", "user_id", uid)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if err != nil {
		slog.Error("DB error fetching user", "user_id", uid, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User info retrieved", "user": user})
}

func ResendVerificationEmail(c *gin.Context) {
	db := c.MustGet("db").(*sql.DB)

	// we only collect their email, so that it can be resent
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email is required"})
		return
	}

	// sanitize the email
	email, err := SanitizeEmail(input.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	// looks up a user for  resend verification email feature
	var userID int
	var verified bool
	var currentToken sql.NullString
	err = db.QueryRow(`SELECT id, verified, verification_token FROM users WHERE email = $1`, email).Scan(&userID, &verified, &currentToken)

	// if the email exists. the email is sent
	if err == sql.ErrNoRows {
		c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a verification link has been sent."})
		return
	}

	// return 500, if any error occurs
	if err != nil {
		slog.Error("DB error on resend verification", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// if already verified, return 400
	if verified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already verified"})
		return
	}

	// regenerate new token
	token, err := utils.GenerateVerificationToken()
	if err != nil {
		// if it dails return error
		slog.Error("Token generation failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// set expiry to a day
	expiry := time.Now().Add(24 * time.Hour)
	if _, err := db.Exec(`UPDATE users SET verification_token = $1, verification_token_expiry = $2 WHERE id = $3`, token, expiry, userID); err != nil {
		slog.Error("Token update failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if err := utils.SendVerificationEmail(email, token); err != nil {
		slog.Error("Email send failed", "email", email, "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
		return
	}

	slog.Info("Verification email resent", "user_id", userID, "email", email)
	c.JSON(http.StatusOK, gin.H{"message": "Verification email resent successfully"})
}
