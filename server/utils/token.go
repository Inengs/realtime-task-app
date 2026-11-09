package utils

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// ─── Email verification tokens (existing) ──────────────
func GenerateVerificationToken() (string, error) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ─── JWT auth tokens (new) ─────────────

// JWTClaims defines what we store in the token.
type JWTClaims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

// getJWTSecret reads the secret from env (falls back to a dev secret).
// In production, JWT_SECRET must be set — main.go's validateEnv() enforces this.
func getJWTSecret() []byte {
	return []byte(os.Getenv("JWT_SECRET"))
}

// GenerateAuthToken creates a signed JWT for the given user ID.
// Token expires in 7 days. The frontend stores it in localStorage
// and sends it as `Authorization: Bearer <token>` on every request.
func GenerateAuthToken(userID int) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "taskflow",
			Subject:   fmt.Sprintf("user-%d", userID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

// ParseAuthToken validates a JWT and returns the user ID.
// Returns an error if the token is invalid, expired, or malformed.
func ParseAuthToken(tokenString string) (int, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify the signing method is HMAC (not RSA, etc.)
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getJWTSecret(), nil
	})

	if err != nil {
		return 0, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return 0, errors.New("invalid token claims")
	}

	return claims.UserID, nil
}
