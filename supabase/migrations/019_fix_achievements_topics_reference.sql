-- ============================================================================
-- 019_fix_achievements_topics_reference.sql
-- Production Migration: JEE Pro Achievements System Fix & Synchronization
-- ============================================================================
-- 1. Create compatibility view for syllabus_topics -> topics
-- 2. Ensure calculate_user_streak & calculate_user_total_xp are SECURITY DEFINER
-- 3. Update evaluate_user_achievements and get_user_achievements to use public.topics
-- 4. Enable self-healing evaluation in get_user_achievements
-- ============================================================================

-- ─── 1. COMPATIBILITY VIEW ───────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.syllabus_topics AS
SELECT * FROM public.topics;

-- ─── 2. RE-CREATE calculate_user_streak RPC (SECURITY DEFINER) ───────────────

CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
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

-- ─── 3. RE-CREATE calculate_user_total_xp RPC (SECURITY DEFINER) ─────────────

CREATE OR REPLACE FUNCTION public.calculate_user_total_xp(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  v_session_xp bigint := 0;
  v_topic_xp bigint := 0;
  v_chapter_xp bigint := 0;
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

  -- 3. Chapter XP (200 XP per fully mastered chapter)
  WITH chapter_stats AS (
    SELECT 
      t.chapter_id,
      COUNT(t.id) AS total_topics,
      COUNT(utp.topic_id) FILTER (WHERE utp.status = 'Mastered') AS mastered_topics
    FROM public.topics t
    LEFT JOIN public.user_topic_progress utp 
      ON utp.topic_id = t.id AND utp.user_id = p_user_id
    GROUP BY t.chapter_id
  )
  SELECT COALESCE(COUNT(*) * 200, 0) INTO v_chapter_xp
  FROM chapter_stats
  WHERE total_topics > 0 AND total_topics = mastered_topics;

  -- 4. Daily Missions XP (25 per mission + 100 for all completed)
  SELECT COALESCE(
    SUM(COALESCE(reward_xp, 25)) + (COUNT(DISTINCT CASE WHEN bonus_xp_awarded THEN date END) * 100),
    0
  ) INTO v_mission_xp
  FROM public.daily_missions
  WHERE user_id = p_user_id AND completed = true;

  -- 5. Achievement Rewards XP
  SELECT COALESCE(SUM(a.xp_reward), 0) INTO v_achievement_xp
  FROM public.user_achievements ua
  JOIN public.achievements a ON a.id = ua.achievement_id
  WHERE ua.user_id = p_user_id;

  RETURN v_session_xp + v_topic_xp + v_chapter_xp + v_mission_xp + v_achievement_xp;
END;
$$;

-- ─── 4. RE-CREATE evaluate_user_achievements RPC ────────────────────────────

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
#variable_conflict use_column
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

  -- Calculate chapters where all topics are Mastered using public.topics
  WITH chapter_stats AS (
    SELECT 
      t.chapter_id,
      COUNT(t.id) AS total_topics,
      COUNT(utp.topic_id) FILTER (WHERE utp.status = 'Mastered') AS mastered_topics
    FROM public.topics t
    LEFT JOIN public.user_topic_progress utp 
      ON utp.topic_id = t.id AND utp.user_id = v_target_user
    GROUP BY t.chapter_id
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
    ON CONFLICT ON CONSTRAINT uq_user_achievements DO NOTHING;

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

-- ─── 5. RE-CREATE get_user_achievements RPC (Self-Healing) ───────────────────

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

  -- 1. Self-healing: evaluate and persist any newly qualified achievements first
  PERFORM public.evaluate_user_achievements(v_target_user);

  -- 2. Pre-calculate live metrics once
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

  -- Calculate chapters where all topics are Mastered using public.topics
  WITH chapter_stats AS (
    SELECT 
      t.chapter_id,
      COUNT(t.id) AS total_topics,
      COUNT(utp.topic_id) FILTER (WHERE utp.status = 'Mastered') AS mastered_topics
    FROM public.topics t
    LEFT JOIN public.user_topic_progress utp 
      ON utp.topic_id = t.id AND utp.user_id = v_target_user
    GROUP BY t.chapter_id
  )
  SELECT COALESCE(COUNT(*), 0)::numeric INTO v_chapters_mastered
  FROM chapter_stats
  WHERE total_topics > 0 AND total_topics = mastered_topics;

  v_total_xp := public.calculate_user_total_xp(v_target_user)::numeric;

  -- 3. Return achievements combined with user status and live progress
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
    CASE 
      WHEN ua.id IS NOT NULL THEN a.requirement_value
      ELSE 
        CASE a.requirement_type
          WHEN 'session_count' THEN LEAST(v_session_count, a.requirement_value)
          WHEN 'study_hours' THEN LEAST(v_study_hours, a.requirement_value)
          WHEN 'streak_days' THEN LEAST(v_streak_days, a.requirement_value)
          WHEN 'topics_mastered' THEN LEAST(v_topics_mastered, a.requirement_value)
          WHEN 'chapters_mastered' THEN LEAST(v_chapters_mastered, a.requirement_value)
          WHEN 'total_xp' THEN LEAST(v_total_xp, a.requirement_value)
          ELSE 0
        END
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

-- ─── 6. PERMISSIONS ──────────────────────────────────────────────────────────

REVOKE ALL ON FUNCTION public.calculate_user_streak(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.calculate_user_total_xp(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_user_total_xp(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_total_xp(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.evaluate_user_achievements(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evaluate_user_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_user_achievements(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.get_user_achievements(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_achievements(uuid) TO service_role;
