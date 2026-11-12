-- Reverse migration: drop project_members, tasks.position, restore old status constraint
UPDATE tasks SET status = 'in-progress' WHERE status = 'in-review';
DROP INDEX IF EXISTS idx_tasks_project_status_position;
ALTER TABLE tasks DROP COLUMN IF EXISTS position;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
    CHECK (status IN ('pending', 'in-progress', 'done'));
DROP INDEX IF EXISTS idx_project_members_user;
DROP TABLE IF EXISTS project_members;