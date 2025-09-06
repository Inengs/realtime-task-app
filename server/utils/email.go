package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

func SendVerificationEmail(toEmail, token string) error {
	from := os.Getenv("EMAIL_FROM")
	username := os.Getenv("EMAIL_USERNAME")
	password := os.Getenv("EMAIL_PASSWORD")
	smtpHost := os.Getenv("EMAIL_SMTP_HOST")
	smtpPort := os.Getenv("EMAIL_SMTP_PORT")
	AppBaseURL := os.Getenv("APP_BASE_URL")

	// Log config for debugging (remove sensitive info in prod)
	log.Printf("SMTP Config: Host=%s, Port=%s, From=%s, Username=%s", smtpHost, smtpPort, from, username)

	// Validate environment variables
	if from == "" || username == "" || password == "" || smtpHost == "" || smtpPort == "" {
		return fmt.Errorf("missing SMTP environment variables")
	}

	if AppBaseURL == "" {
		// fallback if env var not set
		AppBaseURL = "http://localhost:8080"
	}

	verificationURL := fmt.Sprintf("%s/auth/verify-email?token=%s", AppBaseURL, token)
	message := []byte("To: " + toEmail + "\r\n" +
		"Subject: Email Verification for Task App\r\n" +
		"\r\n" +
		"Click the link to verify your email:\r\n\r\n" +
		verificationURL + "\r\n")

	// Use username for SMTP authentication
	auth := smtp.PlainAuth("", username, password, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
	if err != nil {
		log.Printf("SMTP Send Error: %v", err)
		return err
	}
	log.Printf("Verification email sent to %s with token %s", toEmail, token)
	return nil
}
