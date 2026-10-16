-- ============================================================================
-- 032_update_study_session_transaction.sql
-- Production Migration: Study Session Transaction Update (XP & Activity Type)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.end_study_session_transaction(
  p_user_id uuid,
  p_duration_seconds integer,
  p_started_at timestamptz,
  p_ended_at timestamptz,
  p_chapter_id uuid DEFAULT NULL,
  p_topic_id uuid DEFAULT NULL,
  p_xp_earned integer DEFAULT 0,
  p_activity_type text DEFAULT 'deep_work'
)
RETURNS public.study_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_session public.study_sessions;
  v_calling_user uuid;
BEGIN
  -- Authenticate caller boundary: ensure calling user matches target or is authenticated
  v_calling_user := auth.uid();
  IF v_calling_user IS NOT NULL AND v_calling_user <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Caller % does not match target user %', v_calling_user, p_user_id;
  END IF;

  -- Validate parameters
  IF p_duration_seconds IS NULL OR p_duration_seconds < 0 THEN
    RAISE EXCEPTION 'Invalid duration_seconds: %', p_duration_seconds;
  END IF;

  IF p_started_at IS NULL OR p_ended_at IS NULL THEN
    RAISE EXCEPTION 'started_at and ended_at timestamps are required';
  END IF;

  -- 1. Idempotency Check: Prevent duplicate inserts for identical session window
  SELECT * INTO v_session
  FROM public.study_sessions
  WHERE user_id = p_user_id
    AND started_at = p_started_at
    AND duration_seconds = p_duration_seconds
  LIMIT 1;

  IF FOUND THEN
    -- Already recorded (e.g. client retried offline sync), return existing row safely
    RETURN v_session;
  END IF;

  -- 2. Insert study session with xp_earned and activity_type
  INSERT INTO public.study_sessions (
    user_id,
    duration_seconds,
    started_at,
    ended_at,
    chapter_id,
    topic_id,
    xp_earned,
    activity_type
  ) VALUES (
    p_user_id,
    p_duration_seconds,
    p_started_at,
    p_ended_at,
    p_chapter_id,
    p_topic_id,
    COALESCE(p_xp_earned, 0),
    COALESCE(p_activity_type, 'deep_work')
  )
  RETURNING * INTO v_session;

  RETURN v_session;
END;
$$;

-- Grant execution permissions
REVOKE ALL ON FUNCTION public.end_study_session_transaction(uuid, integer, timestamptz, timestamptz, uuid, uuid, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.end_study_session_transaction(uuid, integer, timestamptz, timestamptz, uuid, uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_study_session_transaction(uuid, integer, timestamptz, timestamptz, uuid, uuid, integer, text) TO service_role;
