-- ============================================================================
-- FIX DAILY MISSIONS RACE CONDITIONS — Production Migration
-- ============================================================================
-- Issue 1: Chapter Completion Double-Click XP Farming
-- Issue 2: Daily Mission Read-Modify-Write Race
-- ============================================================================

-- RPC for incrementing daily mission progress atomically
CREATE OR REPLACE FUNCTION public.increment_daily_mission(
  p_mission_id uuid,
  p_amount integer
)
RETURNS public.daily_missions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission public.daily_missions;
  v_new_value integer;
  v_target integer;
  v_is_completed boolean;
BEGIN
  -- We lock the row to prevent concurrent updates (Read-Modify-Write Race fix)
  SELECT * INTO v_mission
  FROM public.daily_missions
  WHERE id = p_mission_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission not found or not owned by user.';
  END IF;

  IF v_mission.completed THEN
    -- Already completed, no further XP or progression allowed
    RETURN v_mission;
  END IF;

  v_target := v_mission.target_value;
  v_new_value := v_mission.current_value + p_amount;
  
  IF v_new_value >= v_target THEN
    v_new_value := v_target;
    v_is_completed := true;
  ELSE
    v_is_completed := false;
  END IF;

  UPDATE public.daily_missions
  SET 
    current_value = v_new_value,
    completed = v_is_completed,
    completed_at = CASE WHEN v_is_completed THEN now() ELSE null END,
    updated_at = now()
  WHERE id = p_mission_id
  RETURNING * INTO v_mission;

  RETURN v_mission;
END;
$$;

-- RPC for safely updating topic progress and preventing duplicate completion awards
-- Returns true if AT LEAST ONE topic was newly transitioned to the target status
CREATE OR REPLACE FUNCTION public.upsert_topic_progress_transactional(
  p_topic_ids uuid[],
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topic_id uuid;
  v_changed boolean := false;
  v_old_status text;
BEGIN
  -- Lock all affected topics to avoid race conditions
  -- ORDER BY is used to prevent deadlocks when updating multiple topics concurrently
  FOR v_topic_id IN SELECT unnest FROM unnest(p_topic_ids) ORDER BY 1 LOOP
    SELECT status INTO v_old_status 
    FROM public.user_topic_progress 
    WHERE user_id = auth.uid() AND topic_id = v_topic_id 
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO public.user_topic_progress (user_id, topic_id, status, completed_at)
      VALUES (
        auth.uid(), 
        v_topic_id, 
        p_status, 
        CASE WHEN p_status = 'Mastered' THEN now() ELSE null END
      );
      
      IF p_status = 'Mastered' THEN
        v_changed := true;
      END IF;
    ELSIF v_old_status IS DISTINCT FROM p_status THEN
      UPDATE public.user_topic_progress
      SET 
        status = p_status,
        completed_at = CASE WHEN p_status = 'Mastered' THEN now() ELSE null END
      WHERE user_id = auth.uid() AND topic_id = v_topic_id;

      IF p_status = 'Mastered' THEN
        v_changed := true;
      END IF;
    END IF;
  END LOOP;

  RETURN v_changed;
END;
$$;
