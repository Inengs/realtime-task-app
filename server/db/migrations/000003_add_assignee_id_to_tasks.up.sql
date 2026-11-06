-- Add assignee_id column to tasks table
-- Separates "who created the task" (user_id) from "who is responsible for doing it" (assignee_id)
-- This enables: "tasks assigned to me" views, team workload views, and assignment notifications

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Backfill existing tasks: default assignee = creator
-- This avoids NULL assignees on historical data
UPDATE tasks SET assignee_id = user_id WHERE assignee_id IS NULL;

-- Index for efficient "tasks assigned to user X" queries
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks (assignee_id);

-- Composite index for common dashboard query: "what's assigned to me and not done?"
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status 
    ON tasks (assignee_id, status) 
    WHERE status != 'done';