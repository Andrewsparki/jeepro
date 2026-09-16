-- ============================================================================
-- 013_secure_notifications.sql
-- Production Migration: Secure Cross-User Notification Creation RPC
-- ============================================================================
-- Provides a hardened SECURITY DEFINER function allowing authenticated users
-- to create legitimate cross-user notifications (e.g. friend requests &
-- acceptances) while strictly preserving table-level Row-Level Security (RLS)
-- and preventing arbitrary impersonation or notification spamming.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_user_notification(
  p_target_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_actor_id uuid;
  v_type text;
  v_existing_id uuid;
  v_result public.notifications;
  v_metadata_type text;
BEGIN
  -- 1. Authenticate caller boundary: ensure calling user is logged in
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated to create notifications';
  END IF;

  -- 2. Validate recipient target
  IF p_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid target_user_id: Recipient cannot be null';
  END IF;

  -- Ensure recipient exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_target_user_id) THEN
    RAISE EXCEPTION 'Invalid target_user_id: Recipient user does not exist';
  END IF;

  -- 3. Validate title and message content
  IF p_title IS NULL OR length(trim(p_title)) = 0 OR length(p_title) > 200 THEN
    RAISE EXCEPTION 'Invalid notification title: Must be between 1 and 200 characters';
  END IF;

  IF p_message IS NULL OR length(trim(p_message)) = 0 OR length(p_message) > 1000 THEN
    RAISE EXCEPTION 'Invalid notification message: Must be between 1 and 1000 characters';
  END IF;

  -- 4. Sanitize notification type against table check constraint
  v_type := lower(trim(COALESCE(p_type, 'info')));
  IF v_type NOT IN ('info', 'warning', 'success', 'error') THEN
    v_type := 'info';
  END IF;

  -- 5. Context-specific relationship validation for cross-user notifications
  IF v_actor_id <> p_target_user_id THEN
    v_metadata_type := COALESCE(p_metadata->>'type', '');

    -- For friend acceptance: verify an accepted friendship actually exists
    IF v_metadata_type = 'friend_accepted' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted'
          AND (
            (requester_id = p_target_user_id AND addressee_id = v_actor_id)
            OR (requester_id = v_actor_id AND addressee_id = p_target_user_id)
          )
      ) THEN
        RAISE EXCEPTION 'Unauthorized: No accepted friendship exists between caller % and recipient %', v_actor_id, p_target_user_id;
      END IF;
    END IF;

    -- For friend request: verify a pending request from caller to recipient actually exists
    IF v_metadata_type = 'friend_request' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'pending'
          AND requester_id = v_actor_id
          AND addressee_id = p_target_user_id
      ) THEN
        RAISE EXCEPTION 'Unauthorized: No pending friend request exists from caller % to recipient %', v_actor_id, p_target_user_id;
      END IF;
    END IF;
  END IF;

  -- 6. Deduplication check: return existing row if identical notification sent in last 15 seconds
  SELECT id INTO v_existing_id
  FROM public.notifications
  WHERE user_id = p_target_user_id
    AND title = p_title
    AND created_at >= (now() - interval '15 seconds')
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    SELECT * INTO v_result
    FROM public.notifications
    WHERE id = v_existing_id;
    RETURN v_result;
  END IF;

  -- 7. Insert notification with guaranteed server-derived actor identity
  INSERT INTO public.notifications (
    user_id,
    target_user_id,
    target_type,
    title,
    message,
    type,
    metadata,
    created_by,
    seen_at,
    created_at,
    updated_at
  ) VALUES (
    p_target_user_id,
    p_target_user_id,
    'user',
    p_title,
    p_message,
    v_type,
    COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('actor_id', v_actor_id),
    v_actor_id,
    NULL,
    now(),
    now()
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Revoke execute from public, grant to authenticated and service_role
REVOKE ALL ON FUNCTION public.create_user_notification(uuid, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_user_notification(uuid, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_notification(uuid, text, text, text, jsonb) TO service_role;
