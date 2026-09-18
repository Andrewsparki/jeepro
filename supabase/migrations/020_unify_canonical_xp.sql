-- ==============================================================================
-- Migration 020: Unify Canonical XP & Leaderboard Across All Surfaces
-- 
-- 1. Remove 19 phantom/duplicate seed topics and 3 phantom seed chapters (0 user progress).
-- 2. Update calculate_user_total_xp with authoritative 5-component formula.
-- 3. Update get_leaderboard and get_user_leaderboard_rank to include chapter & achievement XP.
-- ==============================================================================

-- ─── 1. Clean up phantom seed topics and dummy chapters ───────────────────────
-- These rows originated from supabase/seed.sql before 004_seed_syllabus.sql.
-- None of them have any user progress, session associations, or bookmarks.

DELETE FROM public.topics WHERE id IN (
  '00000000-0000-0000-0010-000000000001', -- Rectilinear Motion (kinematics duplicate)
  '00000000-0000-0000-0010-000000000003', -- Relative Velocity in 1D and 2D (kinematics duplicate)
  '00000000-0000-0000-0010-000000000004', -- First, Second and Third Laws (phantom chapter)
  '00000000-0000-0000-0010-000000000005', -- Friction (phantom chapter)
  '00000000-0000-0000-0010-000000000006', -- Circular Motion Dynamics (phantom chapter)
  '00000000-0000-0000-0010-000000000011', -- Zeroth and First Law (thermodynamics duplicate)
  '00000000-0000-0000-0010-000000000013', -- Carnot Engine (thermodynamics duplicate)
  '00000000-0000-0000-0010-000000000014', -- Bohr Model (atomic-structure casing duplicate)
  '00000000-0000-0000-0010-000000000015', -- Quantum Numbers (atomic-structure casing duplicate)
  '00000000-0000-0000-0010-000000000016', -- Electronic Configuration (atomic-structure casing duplicate)
  '00000000-0000-0000-0010-000000000017', -- VSEPR Theory (phantom chapter)
  '00000000-0000-0000-0010-000000000018', -- Valence Bond Theory (phantom chapter)
  '00000000-0000-0000-0010-000000000019', -- Molecular Orbital Theory (phantom chapter)
  '00000000-0000-0000-0010-000000000020', -- Indefinite Integrals (phantom chapter)
  '00000000-0000-0000-0010-000000000021', -- Definite Integrals (phantom chapter)
  '00000000-0000-0000-0010-000000000022', -- Area under curves (phantom chapter)
  '00000000-0000-0000-0010-000000000023', -- Matrix Operations (matrices casing duplicate)
  '00000000-0000-0000-0010-000000000024', -- Inverse of Matrix (matrices duplicate)
  '00000000-0000-0000-0010-000000000025'  -- System of Linear Equations (matrices duplicate)
);

DELETE FROM public.chapters WHERE id IN (
  '00000000-0000-0000-0001-000000000002', -- newtons-laws-of-motion (real slug is laws-of-motion)
  '00000000-0000-0000-0002-000000000002', -- chemical-bonding (real slug is chemical-bonding-and-molecular-structure)
  '00000000-0000-0000-0003-000000000001'  -- calculus-integration (real slug is integral-calculus)
);

-- ─── 2. Update calculate_user_total_xp RPC ───────────────────────────────────

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
  -- 1. Session XP: duration + activity bonus fallback
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
  WITH user_mastered_topics AS (
    SELECT 
      t.chapter_id,
      COUNT(utp.topic_id) AS user_mastered
    FROM public.user_topic_progress utp
    JOIN public.topics t ON t.id = utp.topic_id
    WHERE utp.user_id = p_user_id AND utp.status = 'Mastered'
    GROUP BY t.chapter_id
  ),
  chapter_topic_counts AS (
    SELECT chapter_id, COUNT(id) AS total_topics
    FROM public.topics
    GROUP BY chapter_id
  )
  SELECT COALESCE(COUNT(*) * 200, 0) INTO v_chapter_xp
  FROM user_mastered_topics umt
  JOIN chapter_topic_counts ctc ON ctc.chapter_id = umt.chapter_id
  WHERE ctc.total_topics > 0 AND umt.user_mastered = ctc.total_topics;

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

-- ─── 3. Update get_leaderboard RPC ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_scope text DEFAULT 'global'::text,
  p_period text DEFAULT 'all_time'::text,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  rank bigint,
  user_id uuid,
  full_name text,
  avatar_url text,
  target_exam text,
  target_year integer,
  total_xp bigint,
  level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  v_start_time timestamptz := NULL;
  v_calling_user uuid;
BEGIN
  v_calling_user := auth.uid();
  IF v_calling_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User must be authenticated to view leaderboard';
  END IF;

  -- Bounded limit protection
  IF p_limit IS NULL OR p_limit < 1 THEN
    p_limit := 50;
  ELSIF p_limit > 100 THEN
    p_limit := 100;
  END IF;

  IF p_offset IS NULL OR p_offset < 0 THEN
    p_offset := 0;
  END IF;

  -- Determine time filter window
  IF p_period = 'weekly' THEN
    v_start_time := now() - interval '7 days';
  ELSIF p_period = 'monthly' THEN
    v_start_time := now() - interval '30 days';
  ELSE
    v_start_time := NULL;
  END IF;

  RETURN QUERY
  WITH candidate_users AS (
    SELECT 
      p.id, 
      p.full_name, 
      p.avatar_url, 
      p.target_exam, 
      p.target_year, 
      p.created_at
    FROM public.profiles p
    WHERE (
      p_scope = 'global'
      OR (
        p_scope = 'friends'
        AND (
          p.id = v_calling_user
          OR p.id IN (
            SELECT CASE WHEN f.requester_id = v_calling_user THEN f.addressee_id ELSE f.requester_id END
            FROM public.friendships f
            WHERE f.status = 'accepted'
              AND (f.requester_id = v_calling_user OR f.addressee_id = v_calling_user)
          )
        )
      )
    )
  ),
  session_xp AS (
    SELECT
      s.user_id,
      SUM(
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
      )::bigint AS xp
    FROM public.study_sessions s
    JOIN candidate_users cu ON cu.id = s.user_id
    WHERE (v_start_time IS NULL OR s.started_at >= v_start_time)
    GROUP BY s.user_id
  ),
  topic_xp AS (
    SELECT
      utp.user_id,
      (COUNT(*) * 50)::bigint AS xp
    FROM public.user_topic_progress utp
    JOIN candidate_users cu ON cu.id = utp.user_id
    WHERE utp.status = 'Mastered'
      AND (v_start_time IS NULL OR COALESCE(utp.completed_at, utp.updated_at) >= v_start_time)
    GROUP BY utp.user_id
  ),
  chapter_xp AS (
    WITH user_mastered_topics AS (
      SELECT 
        utp.user_id,
        t.chapter_id,
        COUNT(utp.topic_id) AS user_mastered,
        MAX(COALESCE(utp.completed_at, utp.updated_at)) AS latest_completed_at
      FROM public.user_topic_progress utp
      JOIN public.topics t ON t.id = utp.topic_id
      JOIN candidate_users cu ON cu.id = utp.user_id
      WHERE utp.status = 'Mastered'
      GROUP BY utp.user_id, t.chapter_id
    ),
    chapter_topic_counts AS (
      SELECT chapter_id, COUNT(id) AS total_topics
      FROM public.topics
      GROUP BY chapter_id
    )
    SELECT
      umt.user_id,
      (COUNT(*) * 200)::bigint AS xp
    FROM user_mastered_topics umt
    JOIN chapter_topic_counts ctc ON ctc.chapter_id = umt.chapter_id
    WHERE ctc.total_topics > 0 AND umt.user_mastered = ctc.total_topics
      AND (v_start_time IS NULL OR umt.latest_completed_at >= v_start_time)
    GROUP BY umt.user_id
  ),
  mission_xp AS (
    SELECT
      dm.user_id,
      (
        SUM(COALESCE(dm.reward_xp, 25)) + 
        (COUNT(DISTINCT CASE WHEN dm.bonus_xp_awarded THEN dm.date END) * 100)
      )::bigint AS xp
    FROM public.daily_missions dm
    JOIN candidate_users cu ON cu.id = dm.user_id
    WHERE dm.completed = true
      AND (
        v_start_time IS NULL 
        OR COALESCE(dm.completed_at, (dm.date::text || 'T12:00:00Z')::timestamptz) >= v_start_time
      )
    GROUP BY dm.user_id
  ),
  achievement_xp AS (
    SELECT
      ua.user_id,
      COALESCE(SUM(a.xp_reward), 0)::bigint AS xp
    FROM public.user_achievements ua
    JOIN public.achievements a ON a.id = ua.achievement_id
    JOIN candidate_users cu ON cu.id = ua.user_id
    WHERE (v_start_time IS NULL OR ua.unlocked_at >= v_start_time)
    GROUP BY ua.user_id
  ),
  aggregated AS (
    SELECT
      cu.id AS user_id,
      COALESCE(NULLIF(trim(cu.full_name), ''), 'JEE Aspirant') AS full_name,
      cu.avatar_url,
      cu.target_exam,
      cu.target_year,
      cu.created_at,
      (
        COALESCE(sx.xp, 0) +
        COALESCE(tx.xp, 0) +
        COALESCE(cx.xp, 0) +
        COALESCE(mx.xp, 0) +
        COALESCE(ax.xp, 0)
      )::bigint AS total_xp
    FROM candidate_users cu
    LEFT JOIN session_xp sx ON sx.user_id = cu.id
    LEFT JOIN topic_xp tx ON tx.user_id = cu.id
    LEFT JOIN chapter_xp cx ON cx.user_id = cu.id
    LEFT JOIN mission_xp mx ON mx.user_id = cu.id
    LEFT JOIN achievement_xp ax ON ax.user_id = cu.id
  ),
  ranked AS (
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY a.total_xp DESC, a.created_at ASC, a.user_id ASC
      ) AS r_rank,
      a.user_id AS r_user_id,
      a.full_name AS r_full_name,
      a.avatar_url AS r_avatar_url,
      a.target_exam AS r_target_exam,
      a.target_year AS r_target_year,
      a.total_xp AS r_total_xp,
      public.calculate_user_level(a.total_xp) AS r_level
    FROM aggregated a
  )
  SELECT
    r.r_rank AS rank,
    r.r_user_id AS user_id,
    r.r_full_name AS full_name,
    r.r_avatar_url AS avatar_url,
    r.r_target_exam AS target_exam,
    r.r_target_year AS target_year,
    r.r_total_xp AS total_xp,
    r.r_level AS level
  FROM ranked r
  ORDER BY r.r_rank ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ─── 4. Update get_user_leaderboard_rank RPC ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_leaderboard_rank(
  p_scope text DEFAULT 'global'::text,
  p_period text DEFAULT 'all_time'::text
)
RETURNS TABLE(
  rank bigint,
  user_id uuid,
  full_name text,
  avatar_url text,
  target_exam text,
  target_year integer,
  total_xp bigint,
  level integer,
  total_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  v_start_time timestamptz := NULL;
  v_calling_user uuid;
BEGIN
  v_calling_user := auth.uid();
  IF v_calling_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User must be authenticated to check user rank';
  END IF;

  IF p_period = 'weekly' THEN
    v_start_time := now() - interval '7 days';
  ELSIF p_period = 'monthly' THEN
    v_start_time := now() - interval '30 days';
  ELSE
    v_start_time := NULL;
  END IF;

  RETURN QUERY
  WITH candidate_users AS (
    SELECT 
      p.id, 
      p.full_name, 
      p.avatar_url, 
      p.target_exam, 
      p.target_year, 
      p.created_at
    FROM public.profiles p
    WHERE (
      p_scope = 'global'
      OR (
        p_scope = 'friends'
        AND (
          p.id = v_calling_user
          OR p.id IN (
            SELECT CASE WHEN f.requester_id = v_calling_user THEN f.addressee_id ELSE f.requester_id END
            FROM public.friendships f
            WHERE f.status = 'accepted'
              AND (f.requester_id = v_calling_user OR f.addressee_id = v_calling_user)
          )
        )
      )
    )
  ),
  session_xp AS (
    SELECT
      s.user_id,
      SUM(
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
      )::bigint AS xp
    FROM public.study_sessions s
    JOIN candidate_users cu ON cu.id = s.user_id
    WHERE (v_start_time IS NULL OR s.started_at >= v_start_time)
    GROUP BY s.user_id
  ),
  topic_xp AS (
    SELECT
      utp.user_id,
      (COUNT(*) * 50)::bigint AS xp
    FROM public.user_topic_progress utp
    JOIN candidate_users cu ON cu.id = utp.user_id
    WHERE utp.status = 'Mastered'
      AND (v_start_time IS NULL OR COALESCE(utp.completed_at, utp.updated_at) >= v_start_time)
    GROUP BY utp.user_id
  ),
  chapter_xp AS (
    WITH user_mastered_topics AS (
      SELECT 
        utp.user_id,
        t.chapter_id,
        COUNT(utp.topic_id) AS user_mastered,
        MAX(COALESCE(utp.completed_at, utp.updated_at)) AS latest_completed_at
      FROM public.user_topic_progress utp
      JOIN public.topics t ON t.id = utp.topic_id
      JOIN candidate_users cu ON cu.id = utp.user_id
      WHERE utp.status = 'Mastered'
      GROUP BY utp.user_id, t.chapter_id
    ),
    chapter_topic_counts AS (
      SELECT chapter_id, COUNT(id) AS total_topics
      FROM public.topics
      GROUP BY chapter_id
    )
    SELECT
      umt.user_id,
      (COUNT(*) * 200)::bigint AS xp
    FROM user_mastered_topics umt
    JOIN chapter_topic_counts ctc ON ctc.chapter_id = umt.chapter_id
    WHERE ctc.total_topics > 0 AND umt.user_mastered = ctc.total_topics
      AND (v_start_time IS NULL OR umt.latest_completed_at >= v_start_time)
    GROUP BY umt.user_id
  ),
  mission_xp AS (
    SELECT
      dm.user_id,
      (
        SUM(COALESCE(dm.reward_xp, 25)) + 
        (COUNT(DISTINCT CASE WHEN dm.bonus_xp_awarded THEN dm.date END) * 100)
      )::bigint AS xp
    FROM public.daily_missions dm
    JOIN candidate_users cu ON cu.id = dm.user_id
    WHERE dm.completed = true
      AND (
        v_start_time IS NULL 
        OR COALESCE(dm.completed_at, (dm.date::text || 'T12:00:00Z')::timestamptz) >= v_start_time
      )
    GROUP BY dm.user_id
  ),
  achievement_xp AS (
    SELECT
      ua.user_id,
      COALESCE(SUM(a.xp_reward), 0)::bigint AS xp
    FROM public.user_achievements ua
    JOIN public.achievements a ON a.id = ua.achievement_id
    JOIN candidate_users cu ON cu.id = ua.user_id
    WHERE (v_start_time IS NULL OR ua.unlocked_at >= v_start_time)
    GROUP BY ua.user_id
  ),
  aggregated AS (
    SELECT
      cu.id AS user_id,
      COALESCE(NULLIF(trim(cu.full_name), ''), 'JEE Aspirant') AS full_name,
      cu.avatar_url,
      cu.target_exam,
      cu.target_year,
      cu.created_at,
      (
        COALESCE(sx.xp, 0) +
        COALESCE(tx.xp, 0) +
        COALESCE(cx.xp, 0) +
        COALESCE(mx.xp, 0) +
        COALESCE(ax.xp, 0)
      )::bigint AS total_xp
    FROM candidate_users cu
    LEFT JOIN session_xp sx ON sx.user_id = cu.id
    LEFT JOIN topic_xp tx ON tx.user_id = cu.id
    LEFT JOIN chapter_xp cx ON cx.user_id = cu.id
    LEFT JOIN mission_xp mx ON mx.user_id = cu.id
    LEFT JOIN achievement_xp ax ON ax.user_id = cu.id
  ),
  ranked AS (
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY a.total_xp DESC, a.created_at ASC, a.user_id ASC
      ) AS r_rank,
      a.user_id AS r_user_id,
      a.full_name AS r_full_name,
      a.avatar_url AS r_avatar_url,
      a.target_exam AS r_target_exam,
      a.target_year AS r_target_year,
      a.total_xp AS r_total_xp,
      public.calculate_user_level(a.total_xp) AS r_level,
      COUNT(*) OVER() AS r_total_count
    FROM aggregated a
  )
  SELECT
    r.r_rank AS rank,
    r.r_user_id AS user_id,
    r.r_full_name AS full_name,
    r.r_avatar_url AS avatar_url,
    r.r_target_exam AS target_exam,
    r.r_target_year AS target_year,
    r.r_total_xp AS total_xp,
    r.r_level AS level,
    r.r_total_count AS total_users
  FROM ranked r
  WHERE r.r_user_id = v_calling_user
  LIMIT 1;
END;
$$;
