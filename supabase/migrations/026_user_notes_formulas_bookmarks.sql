-- Migration 026: User Notes, Formulas & Unified Bookmarks

-- 1. User Notes Table
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  topic_id TEXT,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notes" ON user_notes;
CREATE POLICY "Users can view own notes" ON user_notes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON user_notes;
CREATE POLICY "Users can insert own notes" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON user_notes;
CREATE POLICY "Users can update own notes" ON user_notes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON user_notes;
CREATE POLICY "Users can delete own notes" ON user_notes FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_notes_modtime ON user_notes;
CREATE TRIGGER update_user_notes_modtime
  BEFORE UPDATE ON user_notes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. Formulas Table (Official & User-created)
CREATE TABLE IF NOT EXISTS formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for official reference formulas
  subject_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  topic_id TEXT,
  title TEXT NOT NULL,
  formula TEXT NOT NULL, -- LaTeX string
  description TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  common_mistakes TEXT[] DEFAULT ARRAY[]::TEXT[],
  memory_trick TEXT,
  is_official BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Formulas viewable by official or owner" ON formulas;
CREATE POLICY "Formulas viewable by official or owner" ON formulas FOR SELECT USING (is_official = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own formulas" ON formulas;
CREATE POLICY "Users can insert own formulas" ON formulas FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own formulas" ON formulas;
CREATE POLICY "Users can update own formulas" ON formulas FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own formulas" ON formulas;
CREATE POLICY "Users can delete own formulas" ON formulas FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_formulas_modtime ON formulas;
CREATE TRIGGER update_formulas_modtime
  BEFORE UPDATE ON formulas
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Unified User Bookmarks Table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('note', 'formula', 'chapter', 'topic')),
  item_id TEXT NOT NULL,
  chapter_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can view own bookmarks" ON user_bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can insert own bookmarks" ON user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can update own bookmarks" ON user_bookmarks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON user_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_user_notes_user_chapter ON user_notes(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_formulas_chapter_official ON formulas(chapter_id, is_official);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_type ON user_bookmarks(user_id, item_type);

-- Seed Official Formulas for Core Chapters
INSERT INTO formulas (id, subject_id, chapter_id, title, formula, description, variables, difficulty, tags, common_mistakes, memory_trick, is_official)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'physics',
    'kinematics',
    'First Equation of Motion',
    'v = u + at',
    'Relates final velocity, initial velocity, acceleration, and time under constant acceleration.',
    '[{"name": "Final Velocity", "symbol": "v", "unit": "m/s"}, {"name": "Initial Velocity", "symbol": "u", "unit": "m/s"}, {"name": "Acceleration", "symbol": "a", "unit": "m/s²"}, {"name": "Time", "symbol": "t", "unit": "s"}]'::jsonb,
    'Easy',
    ARRAY['Kinematics', 'Motion', '1D'],
    ARRAY['Using this equation when acceleration is not constant.', 'Forgetting sign conventions for velocity and acceleration.'],
    'v-u-a-t -> sound like "vuat". What is the final velocity?',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'physics',
    'kinematics',
    'Second Equation of Motion',
    's = ut + \frac{1}{2}at^2',
    'Calculates displacement of an object under constant acceleration over a time interval.',
    '[{"name": "Displacement", "symbol": "s", "unit": "m"}, {"name": "Initial Velocity", "symbol": "u", "unit": "m/s"}, {"name": "Acceleration", "symbol": "a", "unit": "m/s²"}, {"name": "Time", "symbol": "t", "unit": "s"}]'::jsonb,
    'Medium',
    ARRAY['Kinematics', 'Displacement', '1D'],
    ARRAY['Confusing displacement (s) with total distance traveled.', 'Forgetting the square on time (t²).'],
    'Displacement has time squared term because acceleration compounds with time.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'physics',
    'kinematics',
    'Third Equation of Motion',
    'v^2 = u^2 + 2as',
    'Relates initial and final velocities with acceleration and displacement, independent of time.',
    '[{"name": "Final Velocity", "symbol": "v", "unit": "m/s"}, {"name": "Initial Velocity", "symbol": "u", "unit": "m/s"}, {"name": "Acceleration", "symbol": "a", "unit": "m/s²"}, {"name": "Displacement", "symbol": "s", "unit": "m"}]'::jsonb,
    'Medium',
    ARRAY['Kinematics', 'Time-Independent'],
    ARRAY['Applying when acceleration varies along displacement.'],
    'Use when time t is not given in the problem statement.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    'physics',
    'kinematics',
    'Projectile Range',
    'R = \frac{u^2 \sin(2\theta)}{g}',
    'Calculates the maximum horizontal distance covered by a projectile launched from level ground.',
    '[{"name": "Range", "symbol": "R", "unit": "m"}, {"name": "Initial Speed", "symbol": "u", "unit": "m/s"}, {"name": "Launch Angle", "symbol": "\theta", "unit": "rad"}, {"name": "Gravity", "symbol": "g", "unit": "m/s²"}]'::jsonb,
    'Hard',
    ARRAY['Kinematics', 'Projectile', '2D'],
    ARRAY['Using sin²(θ) instead of sin(2θ).', 'Using when landing height differs from launch height.'],
    'Maximum range occurs when sin(2θ) = 1, meaning θ = 45°.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    'physics',
    'gravitation',
    'Newton\'s Law of Universal Gravitation',
    'F = G \frac{m_1 m_2}{r^2}',
    'Calculates the attractive gravitational force between two point masses.',
    '[{"name": "Force", "symbol": "F", "unit": "N"}, {"name": "Gravitational Constant", "symbol": "G", "unit": "N·m²/kg²"}, {"name": "Mass 1", "symbol": "m_1", "unit": "kg"}, {"name": "Mass 2", "symbol": "m_2", "unit": "kg"}, {"name": "Distance", "symbol": "r", "unit": "m"}]'::jsonb,
    'Medium',
    ARRAY['Gravitation', 'Force', 'Newton'],
    ARRAY['Using distance from surface instead of center-to-center distance.'],
    'Inverse square law: doubling distance quarters the force.',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  formula = EXCLUDED.formula,
  description = EXCLUDED.description;
