-- Activity log: records every meaningful action in the app.
-- Used by: dashboard activity feed, future audit trail, future notifications.

CREATE TABLE IF NOT EXISTS activity_log (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type  VARCHAR(50) NOT NULL,   -- 'task', 'project', 'comment', etc.
    entity_id    INTEGER NOT NULL,        -- ID of the entity (task.id, project.id, etc.)
    action       VARCHAR(50) NOT NULL,    -- 'created', 'updated', 'completed', 'deleted', 'assigned'
    target       TEXT NOT NULL,           -- Display name of the entity (task title, project name, etc.)
    metadata     JSONB,                   -- Optional: extra context (e.g., old status, new status)
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for the common dashboard query:
--   "recent activity for user X, ordered by created_at DESC"
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
    ON activity_log (user_id, created_at DESC);

-- Index for future: "show all activity for entity Y"
CREATE INDEX IF NOT EXISTS idx_activity_log_entity
    ON activity_log (entity_type, entity_id);