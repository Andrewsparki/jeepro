-- Migration: Drop static syllabus tables and convert foreign keys to text slugs

-- 1. Drop foreign key constraints on user_topic_progress
ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;

-- 2. Drop foreign key constraints on study_sessions
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_topic_id_fkey;
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_chapter_id_fkey;

-- 3. Alter topic_id and chapter_id to be TEXT instead of UUID
-- This will safely cast them, though we don't care about existing demo data
ALTER TABLE user_topic_progress ALTER COLUMN topic_id TYPE text;
ALTER TABLE study_sessions ALTER COLUMN topic_id TYPE text;
ALTER TABLE study_sessions ALTER COLUMN chapter_id TYPE text;

-- 4. Truncate user_topic_progress to remove orphaned demo data
TRUNCATE TABLE user_topic_progress;
TRUNCATE TABLE study_sessions;

-- 5. Drop the old static syllabus tables as JSON files are now the single source of truth
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;

-- 6. Add indexes for the new text-based lookups
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_topic_slug ON user_topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_topic_slug ON study_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_chapter_slug ON study_sessions(chapter_id);
