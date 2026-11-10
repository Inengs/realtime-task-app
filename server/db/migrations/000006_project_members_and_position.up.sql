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
