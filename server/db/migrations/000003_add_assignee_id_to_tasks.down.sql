-- Reverse: drop assignee_id column and its indexes

DROP INDEX IF EXISTS idx_tasks_assignee_status;
DROP INDEX IF EXISTS idx_tasks_assignee_id;

ALTER TABLE tasks
    DROP COLUMN IF EXISTS assignee_id;