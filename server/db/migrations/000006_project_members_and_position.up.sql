-- Migration 000006: project_members table, tasks.position, in-review status
--
-- This migration:
--   1. Adds the project_members table (many-to-many users <-> projects)
--   2. Backfills every existing project's creator as 'owner'
--   3. Adds tasks.position for kanban ordering
--   4. Adds 'in-review' to the tasks status check constraint


-- ─── 1. project_members table ───────────────────────────────────────
-- Each row = "user X is a member of project Y with role Z"
-- PK (project_id, user_id) prevents duplicate memberships.
CREATE TABLE IF NOT EXISTS project_members (
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner', 'admin', 'member')),
    joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- "Which projects is this user in?"
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- backfill: each existing project's creator becomes its owner
INSERT INTO project_members (project_id, user_id, role)
SELECT p.id, p.user_id, 'owner'
FROM projects p
WHERE p.user_id IS NOT NULL
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ─── 2. tasks.position ─────────────────────────────────────────────
-- Used for ordering tasks within a kanban column.
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Kanban query: "all tasks in project X, ordered by position within each column"
CREATE INDEX IF NOT EXISTS idx_tasks_project_status_position
    ON tasks (project_id, status, position);

-- ─── 3. Add 'in-review' to tasks status check ──────────────────────
-- Existing constraint allows: pending, in-progress, done
ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks
    ADD CONSTRAINT tasks_status_check
    CHECK (status IN ('pending', 'in-progress', 'in-review', 'done'));