package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendVerificationEmail(toEmail, token string) error {
	from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASSWORD")
	smtpHost := os.Getenv("EMAIL_SMTP_HOST") // e.g., smtp.gmail.com
	smtpPort := os.Getenv("EMAIL_SMTP_PORT") // e.g., 587

	verificationURL := fmt.Sprintf("http://localhost:8080/verify-email?token=%s", token)
	body := fmt.Sprintf("Subject: Email Verification\n\nClick the link to verify your email:\n\n%s", verificationURL)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, []byte(body))
}
