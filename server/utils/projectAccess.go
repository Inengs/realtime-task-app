package utils

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

var (
	ErrNotProjectMember = errors.New("not a project member")
	ErrInsufficientRole = errors.New("insufficient project role")
)

// Higher number = more power. Unknown roles rank 0 and never pass.
var roleRank = map[string]int{"member": 1, "admin": 2, "owner": 3}

// RequireProjectRole returns the user's role in the project, or an error if
// they aren't a member (ErrNotProjectMember) or their role is below minRole
// (ErrInsufficientRole). Any other error is a database failure.
func RequireProjectRole(db *sql.DB, projectID, userID int, minRole string) (string, error) {
	if _, ok := roleRank[minRole]; !ok {
		return "", errors.New("unknown minimum role: " + minRole)
	}

	var role string
	err := db.QueryRow(
		`SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
		projectID, userID,
	).Scan(&role)
	if errors.Is(err, sql.ErrNoRows) {
		return "", ErrNotProjectMember
	}
	if err != nil {
		return "", err
	}
	if roleRank[role] < roleRank[minRole] {
		return role, ErrInsufficientRole
	}
	return role, nil
}

// RespondProjectAccessError maps the helper's errors to HTTP responses.
// Non-members get 404 (not 403) so a project's existence isn't leaked.
func RespondProjectAccessError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrNotProjectMember):
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
	case errors.Is(err, ErrInsufficientRole):
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to do that"})
	default:
		slog.Error("Project access check failed", "error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
	}
}
