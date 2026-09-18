-- ============================================================================
-- 022_reset_user_account_progress.sql
-- Production Migration: Atomic Account Progress Reset RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reset_user_account_progress(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  v_target_user uuid;
BEGIN
  -- Authenticate caller
  v_target_user := COALESCE(p_user_id, auth.uid());
  IF v_target_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated to reset account progress';
  END IF;

  -- Ensure user can only reset their own account unless admin
  IF auth.uid() IS NOT NULL AND auth.uid() <> v_target_user AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot reset progress for another user';
  END IF;

  -- Atomic deletions across all learning/progression tables
  DELETE FROM public.user_topic_progress WHERE user_id = v_target_user;
  DELETE FROM public.study_sessions WHERE user_id = v_target_user;
  DELETE FROM public.user_achievements WHERE user_id = v_target_user;
  DELETE FROM public.daily_missions WHERE user_id = v_target_user;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'progress') THEN
    DELETE FROM public.progress WHERE user_id = v_target_user;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_progress') THEN
    DELETE FROM public.daily_progress WHERE user_id = v_target_user;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'xp_history') THEN
    DELETE FROM public.xp_history WHERE user_id = v_target_user;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_resume_state') THEN
    DELETE FROM public.user_resume_state WHERE user_id = v_target_user;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'planner_events') THEN
    UPDATE public.planner_events SET status = 'pending' WHERE user_id = v_target_user AND status = 'completed';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    DELETE FROM public.notifications 
    WHERE user_id = v_target_user 
      AND (
        type IN ('achievement', 'level_up', 'mission_completed', 'milestone', 'system_event')
        OR metadata->>'achievement_id' IS NOT NULL
      );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_target_user,
    'reset_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reset_user_account_progress(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_user_account_progress(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_account_progress(uuid) TO service_role;
