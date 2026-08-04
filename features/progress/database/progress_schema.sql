-- Progress Engine Base Schema

-- 1. Modify existing study_sessions table
ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES topics(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS activity_type text CHECK (activity_type IN ('Study Guide', 'Formula Sheet', 'Practice', 'PYQs', 'Flashcards', 'AI Tutor', 'Revision', 'Mock Test', 'Planner')),
ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0;

-- 2. New table: progress
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  section_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Mastered', 'Needs Revision')) DEFAULT 'Not Started',
  time_spent_seconds integer DEFAULT 0,
  sessions_completed integer DEFAULT 0,
  progress_percentage integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  revision_count integer DEFAULT 0,
  last_studied_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, subject_id, chapter_id, section_id, activity_type)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own progress" ON progress FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_progress_modtime
BEFORE UPDATE ON progress
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. New table: daily_progress
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_spent_seconds integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  sessions_completed integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_id ON daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);

ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own daily progress" ON daily_progress FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_progress_modtime
BEFORE UPDATE ON daily_progress
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. New table: xp_history
CREATE TABLE IF NOT EXISTS xp_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  source text NOT NULL,
  reference_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);

ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own xp history" ON xp_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own xp history" ON xp_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. New table: user_resume_state
CREATE TABLE IF NOT EXISTS user_resume_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  section_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  activity_type text,
  current_tab text,
  scroll_position integer DEFAULT 0,
  study_timer_seconds integer DEFAULT 0,
  planner_event_id uuid REFERENCES planner_events(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_resume_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own resume state" ON user_resume_state FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_user_resume_state_modtime
BEFORE UPDATE ON user_resume_state
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
