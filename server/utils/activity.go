package utils

import (
	"database/sql"
	"log/slog"
)

// LogActivity inserts a row into activity_log.
// Call this from any controller that creates/updates/deletes an entity.
//
// Example:
//
//	utils.LogActivity(db, userID, "task", taskID, "created", task.Title, nil)
func LogActivity(
	db *sql.DB,
	userID int,
	entityType string,
	entityID int,
	action string,
	target string,
	metadata *string, // nil for most cases; JSON string if you need extra context
) {
	_, err := db.Exec(`
        INSERT INTO activity_log (user_id, entity_type, entity_id, action, target, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, userID, entityType, entityID, action, target, metadata)

	// we wont fail the request when the insert fails
	if err != nil {
		// Activity logging is best-effort — don't fail the actual request
		// just because we couldn't log it.
		slog.Error("Failed to log activity",
			"user_id", userID,
			"entity_type", entityType,
			"entity_id", entityID,
			"action", action,
			"error", err.Error(),
		)
	}
}
