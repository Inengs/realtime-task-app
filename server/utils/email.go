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

	// Validate environment variables
	if from == "" || username == "" || password == "" || smtpHost == "" || smtpPort == "" {
		return fmt.Errorf("missing SMTP environment variables")
	}

	if AppBaseURL == "" {
		AppBaseURL = "http://localhost:5173" // Frontend URL, not backend
	}

	// Verification link goes to frontend
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", AppBaseURL, token)

	// HTML email template
	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #4CAF50; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">TaskFlow - Email Verification</div>
        <div class="content">
            <p>Hello,</p>
            <p>Thank you for registering with TaskFlow! Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="%s" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4CAF50;">%s</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
            © 2025 TaskFlow. All rights reserved.
        </div>
    </div>
</body>
</html>
`, verificationURL, verificationURL)

	// Email headers and body
	message := []byte(
		"From: " + from + "\r\n" +
			"To: " + toEmail + "\r\n" +
			"Subject: Verify Your TaskFlow Account\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/html; charset=UTF-8\r\n" +
			"\r\n" +
			htmlBody + "\r\n")

	// SMTP authentication
	auth := smtp.PlainAuth("", username, password, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
	if err != nil {
		log.Printf("SMTP Send Error: %v", err)
		return err
	}
	
	log.Printf("Verification email sent to %s with token %s", toEmail, token)
	return nil
}