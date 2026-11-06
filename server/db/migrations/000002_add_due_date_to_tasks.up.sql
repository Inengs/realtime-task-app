-- Add due_date column to tasks table
-- Allows tracking task deadlines and computing "overdue" status

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;

-- Add index for efficient overdue queries
-- (WHERE due_date < NOW() AND status != 'done')
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);

-- Add priority column too (needed by dashboard)
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';

-- Constraint: priority must be one of these values
ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks
    ADD CONSTRAINT tasks_priority_check
    CHECK (priority IN ('low', 'medium', 'high'));