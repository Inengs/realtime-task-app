-- Reverse: drop due_date and priority columns

DROP INDEX IF EXISTS idx_tasks_due_date;

ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_priority_check;

ALTER TABLE tasks
    DROP COLUMN IF EXISTS priority;

ALTER TABLE tasks
    DROP COLUMN IF EXISTS due_date;