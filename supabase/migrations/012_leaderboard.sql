-- ============================================================================
-- 012_leaderboard.sql
-- Production Migration: JEE Pro Competitive Leaderboard (Phase 3)
-- ============================================================================
-- Creates performance indexes, calculates level thresholds deterministically,
-- and provides high-performance, RLS-safe aggregation RPC functions for
-- Global and Friends leaderboards across Weekly, Monthly, and All-Time windows.
-- ============================================================================

-- ─── 1. SUPPORTING COLUMNS & PERFORMANCE INDEXES ─────────────────────────────

-- Ensure session XP and activity tracking columns exist
ALTER TABLE public.study_sessions 
  ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activity_type text;

-- Index study sessions by user and started_at for fast time-window range scans
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_started
  ON public.study_sessions (user_id, started_at DESC);

-- Index mastered topics by user and completion timestamp
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_leaderboard
  ON public.user_topic_progress (user_id, completed_at DESC)
  WHERE status = 'Mastered';

-- Index completed daily missions by user and completion timestamp
CREATE INDEX IF NOT EXISTS idx_daily_missions_leaderboard
  ON public.daily_missions (user_id, completed_at DESC)
  WHERE completed = true;

-- ─── 2. DETERMINISTIC LEVEL CALCULATION FUNCTION ────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_user_level(p_xp bigint)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_level integer := 1;
  v_xp_for_next bigint := 500; -- Base level XP
  v_remaining bigint;
BEGIN
  IF p_xp IS NULL OR p_xp <= 0 THEN
    RETURN 1;
  END IF;
  
  v_remaining := p_xp;
  WHILE v_remaining >= v_xp_for_next LOOP
    v_remaining := v_remaining - v_xp_for_next;
    v_level := v_level + 1;
    v_xp_for_next := FLOOR(v_xp_for_next * 1.5)::bigint;
  END LOOP;
  
  RETURN v_level;
END;
$$;

-- ─── 3. LEADERBOARD AGGREGATION RPC ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_scope text DEFAULT 'global',
  p_period text DEFAULT 'all_time',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
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
SET search_path = public, auth
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
        COALESCE(mx.xp, 0)
      )::bigint AS total_xp
    FROM candidate_users cu
    LEFT JOIN session_xp sx ON sx.user_id = cu.id
    LEFT JOIN topic_xp tx ON tx.user_id = cu.id
    LEFT JOIN mission_xp mx ON mx.user_id = cu.id
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

-- ─── 4. CURRENT USER LEADERBOARD RANK RPC ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_leaderboard_rank(
  p_scope text DEFAULT 'global',
  p_period text DEFAULT 'all_time'
)
RETURNS TABLE (
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
SET search_path = public, auth
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
        COALESCE(mx.xp, 0)
      )::bigint AS total_xp
    FROM candidate_users cu
    LEFT JOIN session_xp sx ON sx.user_id = cu.id
    LEFT JOIN topic_xp tx ON tx.user_id = cu.id
    LEFT JOIN mission_xp mx ON mx.user_id = cu.id
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

-- ─── 5. SECURITY & GRANTS ───────────────────────────────────────────────────

REVOKE ALL ON FUNCTION public.calculate_user_level(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_leaderboard(text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_leaderboard_rank(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.calculate_user_level(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_level(bigint) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, text, integer, integer) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_user_leaderboard_rank(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_leaderboard_rank(text, text) TO service_role;
