-- ============================================================================
-- 034_security_and_rate_limits.sql
-- Production Migration: Durable Per-User AI Rate Limiting & Formula Data Fix
-- ============================================================================

-- ─── 1. AI RATE LIMITS TABLE ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT 'ai_assistant',
  window_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, action)
);

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own rate limits" ON public.ai_rate_limits;
CREATE POLICY "Users can manage own rate limits"
  ON public.ai_rate_limits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 2. ATOMIC CHECK-AND-INCREMENT RPC ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_and_increment_ai_rate_limit(
  p_user_id uuid,
  p_max_requests integer DEFAULT 10,
  p_window_seconds integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_now timestamptz := timezone('utc'::text, now());
  v_record public.ai_rate_limits;
  v_reset_at timestamptz;
BEGIN
  -- Authenticate caller boundary: ensure calling user matches target or is authenticated
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Caller % does not match target user %', auth.uid(), p_user_id;
  END IF;

  SELECT * INTO v_record
  FROM public.ai_rate_limits
  WHERE user_id = p_user_id AND action = 'ai_assistant'
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.ai_rate_limits (user_id, action, window_start, request_count)
    VALUES (p_user_id, 'ai_assistant', v_now, 1);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'reset_at', v_now + (p_window_seconds || ' seconds')::interval,
      'retry_after_seconds', 0
    );
  END IF;

  -- Check if current window has expired
  IF v_now >= (v_record.window_start + (p_window_seconds || ' seconds')::interval) THEN
    -- Reset window
    UPDATE public.ai_rate_limits
    SET window_start = v_now,
        request_count = 1
    WHERE user_id = p_user_id AND action = 'ai_assistant';

    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'reset_at', v_now + (p_window_seconds || ' seconds')::interval,
      'retry_after_seconds', 0
    );
  END IF;

  -- Window is still active
  v_reset_at := v_record.window_start + (p_window_seconds || ' seconds')::interval;

  IF v_record.request_count < p_max_requests THEN
    UPDATE public.ai_rate_limits
    SET request_count = v_record.request_count + 1
    WHERE user_id = p_user_id AND action = 'ai_assistant';

    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - (v_record.request_count + 1),
      'reset_at', v_reset_at,
      'retry_after_seconds', 0
    );
  ELSE
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_reset_at,
      'retry_after_seconds', GREATEST(1, EXTRACT(EPOCH FROM (v_reset_at - v_now))::integer)
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_ai_rate_limit(uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_increment_ai_rate_limit(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_ai_rate_limit(uuid, integer, integer) TO service_role;

-- ─── 3. DATA INTEGRITY FIX FOR EXISTING DATABASES ───────────────────────────
-- Ensure formula theta variables are unescaped for already-applied databases
UPDATE public.formulas
SET variables = '[{"name": "Range", "symbol": "\\theta", "unit": "rad"}, {"name": "Initial Speed", "symbol": "u", "unit": "m/s"}, {"name": "Launch Angle", "symbol": "\\theta", "unit": "rad"}, {"name": "Gravity", "symbol": "g", "unit": "m/s²"}]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000104';
