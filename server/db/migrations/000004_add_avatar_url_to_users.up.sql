-- Add avatar_url column to users table
-- Stores S3 URL for user-uploaded avatars
-- Empty string default until user uploads one (frontend renders initials as fallback)

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
