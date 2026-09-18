-- ============================================================================
-- 014_achievements_system.sql
-- Production Migration: JEE Pro Achievements System (Phase 5)
-- ============================================================================
-- Centralized achievement definitions, idempotent user unlocks with strict RLS,
-- server-side atomic evaluation, single XP pool integration, and one-time notifications.
-- ============================================================================

-- ─── 1. ACHIEVEMENTS & USER_ACHIEVEMENTS TABLES ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL, -- Lucide icon identifier (e.g. 'play', 'flame', 'clock')
  category text NOT NULL CHECK (category IN ('study', 'time', 'streak', 'progress', 'xp')),
  requirement_type text NOT NULL CHECK (requirement_type IN ('session_count', 'study_hours', 'streak_days', 'topics_mastered', 'chapters_mastered', 'total_xp')),
  requirement_value numeric NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_achievements UNIQUE (user_id, achievement_id)
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_user_achievements_user
  ON public.user_achievements (user_id, unlocked_at DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_category_req
  ON public.achievements (category, requirement_value ASC);

-- ─── 2. SEED 18 VERIFIABLE ACHIEVEMENTS ─────────────────────────────────────

INSERT INTO public.achievements (key, title, description, icon, category, requirement_type, requirement_value, xp_reward, tier)
VALUES
  -- Category: STUDY (Session counts)
  ('first_session', 'First Step', 'Complete your first focus study session', 'play', 'study', 'session_count', 1, 50, 'bronze'),
  ('sessions_10', 'Consistent Starter', 'Complete 10 focus study sessions', 'flame', 'study', 'session_count', 10, 100, 'silver'),
  ('sessions_50', 'Dedicated Aspirant', 'Complete 50 focus study sessions', 'award', 'study', 'session_count', 50, 250, 'gold'),
  ('sessions_100', 'Centurion Scholar', 'Complete 100 focus study sessions', 'trophy', 'study', 'session_count', 100, 500, 'platinum'),

  -- Category: TIME (Cumulative focus hours)
  ('study_1_hour', 'Hour of Focus', 'Accumulate 1 hour of total study time', 'clock', 'time', 'study_hours', 1, 50, 'bronze'),
  ('study_10_hours', 'Deep Focus', 'Accumulate 10 hours of total study time', 'clock', 'time', 'study_hours', 10, 150, 'silver'),
  ('study_50_hours', 'Immersion', 'Accumulate 50 hours of total study time', 'zap', 'time', 'study_hours', 50, 300, 'gold'),
  ('study_100_hours', 'Master of Time', 'Accumulate 100 hours of total study time', 'star', 'time', 'study_hours', 100, 600, 'platinum'),

  -- Category: STREAK (Consecutive study days)
  ('streak_3', 'Building Momentum', 'Reach a 3-day study streak', 'flame', 'streak', 'streak_days', 3, 50, 'bronze'),
  ('streak_7', 'Unstoppable Habit', 'Reach a 7-day study streak', 'flame', 'streak', 'streak_days', 7, 150, 'silver'),
  ('streak_30', 'Iron Discipline', 'Reach a 30-day study streak', 'flame', 'streak', 'streak_days', 30, 500, 'gold'),

  -- Category: PROGRESS (Topics & chapters mastered)
  ('topic_1', 'First Breakthrough', 'Master your first syllabus topic', 'book-open', 'progress', 'topics_mastered', 1, 50, 'bronze'),
  ('topics_10', 'Topic Explorer', 'Master 10 syllabus topics', 'book-open', 'progress', 'topics_mastered', 10, 150, 'silver'),
  ('topics_50', 'Topic Conqueror', 'Master 50 syllabus topics', 'target', 'progress', 'topics_mastered', 50, 350, 'gold'),
  ('chapter_1', 'Chapter Finisher', 'Master all topics in a syllabus chapter', 'check-circle', 'progress', 'chapters_mastered', 1, 100, 'silver'),
  ('chapters_5', 'Syllabus Bulldozer', 'Master 5 complete syllabus chapters', 'trophy', 'progress', 'chapters_mastered', 5, 300, 'gold'),

  -- Category: XP (Total XP milestones)
  ('xp_1000', 'XP Initiate', 'Earn 1,000 total XP', 'sparkles', 'xp', 'total_xp', 1000, 50, 'bronze'),
  ('xp_5000', 'XP Veteran', 'Earn 5,000 total XP', 'sparkles', 'xp', 'total_xp', 5000, 200, 'silver'),
  ('xp_10000', 'Legendary Aspirant', 'Earn 10,000 total XP', 'crown', 'xp', 'total_xp', 10000, 500, 'gold')
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  requirement_type = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value,
  xp_reward = EXCLUDED.xp_reward,
  tier = EXCLUDED.tier;

-- ─── 3. ROW-LEVEL SECURITY (RLS) ─────────────────────────────────────────────

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements definition: Publicly readable by all authenticated users
DROP POLICY IF EXISTS "Achievements viewable by authenticated users" ON public.achievements;
CREATE POLICY "Achievements viewable by authenticated users"
  ON public.achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- User achievements: Users can only view their own unlocked achievements (or admins)
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Strictly block client-side INSERT/UPDATE/DELETE on user_achievements
-- Unlocking is strictly performed server-side via the evaluate_user_achievements SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Direct user achievement modification blocked" ON public.user_achievements;
CREATE POLICY "Direct user achievement modification blocked"
  ON public.user_achievements
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ─── 4. HELPER: DETERMINISTIC STREAK CALCULATION ─────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_streak integer := 0;
  v_current_check date := CURRENT_DATE;
  v_has_study boolean;
BEGIN
  -- Check if user studied today
  SELECT EXISTS (
    SELECT 1 FROM public.study_sessions
    WHERE user_id = p_user_id
      AND (started_at AT TIME ZONE 'UTC')::date = v_current_check
  ) INTO v_has_study;

  -- If not studied today, check if studied yesterday
  IF NOT v_has_study THEN
    v_current_check := v_current_check - 1;
    SELECT EXISTS (
      SELECT 1 FROM public.study_sessions
      WHERE user_id = p_user_id
        AND (started_at AT TIME ZONE 'UTC')::date = v_current_check
    ) INTO v_has_study;

    IF NOT v_has_study THEN
      RETURN 0;
    END IF;
  END IF;

  -- Count consecutive days backwards
  WHILE v_has_study LOOP
    v_streak := v_streak + 1;
    v_current_check := v_current_check - 1;
    SELECT EXISTS (
      SELECT 1 FROM public.study_sessions
      WHERE user_id = p_user_id
        AND (started_at AT TIME ZONE 'UTC')::date = v_current_check
    ) INTO v_has_study;
  END LOOP;

  RETURN v_streak;
END;
$$;

-- ─── 5. HELPER: TOTAL XP CALCULATION (SINGLE AUTHORITATIVE POOL) ─────────────

CREATE OR REPLACE FUNCTION public.calculate_user_total_xp(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_session_xp bigint := 0;
  v_topic_xp bigint := 0;
  v_mission_xp bigint := 0;
  v_achievement_xp bigint := 0;
BEGIN
  -- 1. Session XP
  SELECT COALESCE(SUM(
    CASE 
      WHEN s.xp_earned IS NOT NULL AND s.xp_earned > 0 THEN s.xp_earned
      ELSE (FLOOR(COALESCE(s.duration_seconds, 0) / 60.0)::int * 2) + 
        CASE COALESCE(s.activity_type, '')
          WHEN 'Study Guide' THEN 5
          WHEN 'Formula Sheet' THEN 8
          WHEN 'Practice' THEN 15
          WHEN 'PYQs' THEN 20
          WHEN 'Flashcards' THEN 10
          WHEN 'Revision' THEN 12
          WHEN 'Mock Test' THEN 50
          ELSE 0
        END
    END
  ), 0) INTO v_session_xp
  FROM public.study_sessions s
  WHERE s.user_id = p_user_id;

  -- 2. Mastered Topics XP (50 XP per topic)
  SELECT COALESCE(COUNT(*) * 50, 0) INTO v_topic_xp
  FROM public.user_topic_progress
  WHERE user_id = p_user_id AND status = 'Mastered';

  -- 3. Daily Missions XP (25 per mission + 100 for all completed)
  SELECT COALESCE(
    SUM(COALESCE(reward_xp, 25)) + (COUNT(DISTINCT CASE WHEN bonus_xp_awarded THEN date END) * 100),
    0
  ) INTO v_mission_xp
  FROM public.daily_missions
  WHERE user_id = p_user_id AND completed = true;

  -- 4. Achievement Rewards XP
  SELECT COALESCE(SUM(a.xp_reward), 0) INTO v_achievement_xp
  FROM public.user_achievements ua
  JOIN public.achievements a ON a.id = ua.achievement_id
  WHERE ua.user_id = p_user_id;

  RETURN v_session_xp + v_topic_xp + v_mission_xp + v_achievement_xp;
END;
$$;

-- ─── 6. SERVER-SIDE EVALUATION & UNLOCKING RPC ───────────────────────────────

CREATE OR REPLACE FUNCTION public.evaluate_user_achievements(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  achievement_id uuid,
  achievement_key text,
  title text,
  description text,
  icon text,
  category text,
  tier text,
  xp_reward integer,
  unlocked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  v_target_user uuid;
  v_session_count numeric;
  v_study_hours numeric;
  v_streak_days numeric;
  v_topics_mastered numeric;
  v_chapters_mastered numeric;
  v_total_xp numeric;
  v_ach record;
  v_new_unlocked_at timestamptz;
BEGIN
  -- Authenticate caller
  v_target_user := COALESCE(p_user_id, auth.uid());
  IF v_target_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated to evaluate achievements';
  END IF;

  IF auth.uid() IS NOT NULL AND auth.uid() <> v_target_user AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot evaluate achievements for other users';
  END IF;

  -- 1. Compute user's authoritative metrics
  SELECT COUNT(*)::numeric INTO v_session_count
  FROM public.study_sessions
  WHERE user_id = v_target_user;

  SELECT FLOOR(COALESCE(SUM(duration_seconds), 0) / 3600.0)::numeric INTO v_study_hours
  FROM public.study_sessions
  WHERE user_id = v_target_user;

  v_streak_days := public.calculate_user_streak(v_target_user)::numeric;

  SELECT COUNT(*)::numeric INTO v_topics_mastered
  FROM public.user_topic_progress
  WHERE user_id = v_target_user AND status = 'Mastered';

  -- Calculate chapters where all topics are Mastered
  WITH chapter_stats AS (
    SELECT 
      st.chapter_id,
      COUNT(st.id) AS total_topics,
      COUNT(utp.topic_id) FILTER (WHERE utp.status = 'Mastered') AS mastered_topics
    FROM public.topics st
    LEFT JOIN public.user_topic_progress utp 
      ON utp.topic_id = st.id AND utp.user_id = v_target_user
    GROUP BY st.chapter_id
  )
  SELECT COALESCE(COUNT(*), 0)::numeric INTO v_chapters_mastered
  FROM chapter_stats
  WHERE total_topics > 0 AND total_topics = mastered_topics;

  v_total_xp := public.calculate_user_total_xp(v_target_user)::numeric;

  -- 2. Find eligible locked achievements and unlock atomically
  FOR v_ach IN
    SELECT a.*
    FROM public.achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      WHERE ua.user_id = v_target_user AND ua.achievement_id = a.id
    )
    AND (
      (a.requirement_type = 'session_count' AND v_session_count >= a.requirement_value) OR
      (a.requirement_type = 'study_hours' AND v_study_hours >= a.requirement_value) OR
      (a.requirement_type = 'streak_days' AND v_streak_days >= a.requirement_value) OR
      (a.requirement_type = 'topics_mastered' AND v_topics_mastered >= a.requirement_value) OR
      (a.requirement_type = 'chapters_mastered' AND v_chapters_mastered >= a.requirement_value) OR
      (a.requirement_type = 'total_xp' AND v_total_xp >= a.requirement_value)
    )
    ORDER BY a.requirement_value ASC
  LOOP
    v_new_unlocked_at := now();

    -- Insert user_achievement record (idempotent ON CONFLICT guard)
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
    VALUES (v_target_user, v_ach.id, v_new_unlocked_at)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    IF FOUND THEN
      -- Create a single one-time notification for the newly unlocked achievement
      INSERT INTO public.notifications (
        user_id,
        target_user_id,
        target_type,
        title,
        message,
        type,
        metadata
      ) VALUES (
        v_target_user,
        v_target_user,
        'user',
        '🏅 Achievement Unlocked!',
        'You unlocked "' || v_ach.title || '" (+' || v_ach.xp_reward || ' XP)',
        'success',
        jsonb_build_object(
          'achievement_id', v_ach.id,
          'achievement_key', v_ach.key,
          'xp_reward', v_ach.xp_reward
        )
      );

      -- Append to return set
      achievement_id := v_ach.id;
      achievement_key := v_ach.key;
      title := v_ach.title;
      description := v_ach.description;
      icon := v_ach.icon;
      category := v_ach.category;
      tier := v_ach.tier;
      xp_reward := v_ach.xp_reward;
      unlocked_at := v_new_unlocked_at;
      RETURN NEXT;
    END IF;
  END LOOP;

  RETURN;
END;
$$;

-- Grant execution
REVOKE ALL ON FUNCTION public.evaluate_user_achievements(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evaluate_user_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_user_achievements(uuid) TO service_role;

-- ─── 7. GET ALL USER ACHIEVEMENTS RPC ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_achievements(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  key text,
  title text,
  description text,
  icon text,
  category text,
  tier text,
  requirement_type text,
  requirement_value numeric,
  xp_reward integer,
  unlocked boolean,
  unlocked_at timestamptz,
  current_progress numeric,
  progress_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  v_target_user uuid;
  v_session_count numeric;
  v_study_hours numeric;
  v_streak_days numeric;
  v_topics_mastered numeric;
  v_chapters_mastered numeric;
  v_total_xp numeric;
BEGIN
  v_target_user := COALESCE(p_user_id, auth.uid());
  IF v_target_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  -- 1. Pre-calculate live metrics once
  SELECT COUNT(*)::numeric INTO v_session_count
  FROM public.study_sessions
  WHERE user_id = v_target_user;

  SELECT FLOOR(COALESCE(SUM(duration_seconds), 0) / 3600.0)::numeric INTO v_study_hours
  FROM public.study_sessions
  WHERE user_id = v_target_user;

  v_streak_days := public.calculate_user_streak(v_target_user)::numeric;

  SELECT COUNT(*)::numeric INTO v_topics_mastered
  FROM public.user_topic_progress
  WHERE user_id = v_target_user AND status = 'Mastered';

  WITH chapter_stats AS (
    SELECT 
      st.chapter_id,
      COUNT(st.id) AS total_topics,
      COUNT(utp.topic_id) FILTER (WHERE utp.status = 'Mastered') AS mastered_topics
    FROM public.topics st
    LEFT JOIN public.user_topic_progress utp 
      ON utp.topic_id = st.id AND utp.user_id = v_target_user
    GROUP BY st.chapter_id
  )
  SELECT COALESCE(COUNT(*), 0)::numeric INTO v_chapters_mastered
  FROM chapter_stats
  WHERE total_topics > 0 AND total_topics = mastered_topics;

  v_total_xp := public.calculate_user_total_xp(v_target_user)::numeric;

  -- 2. Return achievements combined with user status and live progress
  RETURN QUERY
  SELECT 
    a.id,
    a.key,
    a.title,
    a.description,
    a.icon,
    a.category,
    a.tier,
    a.requirement_type,
    a.requirement_value,
    a.xp_reward,
    (ua.id IS NOT NULL) AS unlocked,
    ua.unlocked_at,
    CASE a.requirement_type
      WHEN 'session_count' THEN LEAST(v_session_count, a.requirement_value)
      WHEN 'study_hours' THEN LEAST(v_study_hours, a.requirement_value)
      WHEN 'streak_days' THEN LEAST(v_streak_days, a.requirement_value)
      WHEN 'topics_mastered' THEN LEAST(v_topics_mastered, a.requirement_value)
      WHEN 'chapters_mastered' THEN LEAST(v_chapters_mastered, a.requirement_value)
      WHEN 'total_xp' THEN LEAST(v_total_xp, a.requirement_value)
      ELSE 0
    END AS current_progress,
    CASE 
      WHEN ua.id IS NOT NULL THEN 100::numeric
      ELSE ROUND(
        LEAST(
          100::numeric,
          (
            CASE a.requirement_type
              WHEN 'session_count' THEN v_session_count
              WHEN 'study_hours' THEN v_study_hours
              WHEN 'streak_days' THEN v_streak_days
              WHEN 'topics_mastered' THEN v_topics_mastered
              WHEN 'chapters_mastered' THEN v_chapters_mastered
              WHEN 'total_xp' THEN v_total_xp
              ELSE 0
            END / NULLIF(a.requirement_value, 0)
          ) * 100::numeric
        ),
        1
      )
    END AS progress_percentage
  FROM public.achievements a
  LEFT JOIN public.user_achievements ua 
    ON ua.achievement_id = a.id AND ua.user_id = v_target_user
  ORDER BY 
    (ua.id IS NOT NULL) DESC,
    a.category ASC,
    a.requirement_value ASC;
END;
$$;

-- Grant execution
REVOKE ALL ON FUNCTION public.get_user_achievements(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_achievements(uuid) TO service_role;
