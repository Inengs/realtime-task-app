package middleware

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
)

var Store *sessions.CookieStore

func SetupSessionStore() {
	secret := os.Getenv("SESSION SECRET")
	if secret == "" {
		// if secret is not set in the .env, return error
		log.Fatal("SESSION_SECRET is not set")
	}

	isProd := os.Getenv("APP_ENV") == "production"

	Store = sessions.NewCookieStore([]byte(secret))

	sameSite := http.SameSiteLaxMode // Default: allows cookies on same-site requests and certain cross-site navigations
	if isProd {
		sameSite = http.SameSiteNoneMode // Allows cookies on cross-site requests, e.g., when frontend and backend are on different sites, also this only workd over HTTPS
	}

	Store.Options = &sessions.Options{
		// sets cookie options for session store
		Path:     "/",       // makes the cookie available to all paths on your website
		MaxAge:   86400 * 7, // sets cookie lifetime to 7 days
		HttpOnly: true,      // Prevents JavaScript running in the browser from directly accessing the cookie. This helps protect against cookie theft through certain XSS attacks.
		Secure:   isProd,    // if isProd is true, the browser sends the cookie only over HTTPS. If false, it can also be sent over HTTP
		SameSite: sameSite,  // Controls when the broswer sends the cookie with cross-site requests, using the policy you selected earlier (Lax or None)
	}
}
