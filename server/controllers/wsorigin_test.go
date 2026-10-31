package controllers

import (
	"net/http/httptest"
	"testing"
)

func TestAllowedOrigin(t *testing.T) {
	t.Setenv("FRONTEND_URL", "https://taskflow.example.com/")

	cases := []struct {
		origin string
		want   bool
	}{
		{"https://taskflow.example.com", true},
		{"", true}, // non-browser client
		{"https://evil.example", false},
		{"https://taskflow.example.com.evil.example", false},
	}
	for _, c := range cases {
		r := httptest.NewRequest("GET", "/ws/tasks", nil)
		if c.origin != "" {
			r.Header.Set("Origin", c.origin)
		}
		if got := allowedOrigin(r); got != c.want {
			t.Errorf("origin %q: got %v, want %v", c.origin, got, c.want)
		}
	}
}
