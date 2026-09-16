-- ============================================================================
-- 015_private_chat.sql
-- Production Migration: JEE Pro Private Chat System (Phase 6)
-- ============================================================================
-- Creates conversations, conversation_participants, and private_messages tables,
-- enforces symmetric ordering (user1_id < user2_id) and unique constraint,
-- guarantees friend-only access, adds Supabase Realtime publication,
-- configures strict Row-Level Security, and provides race-condition-resistant RPCs.
-- ============================================================================

-- ─── 1. CONVERSATIONS TABLE ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_conversations_distinct CHECK (user1_id < user2_id),
  CONSTRAINT uq_conversations_pair UNIQUE (user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user1
  ON public.conversations (user1_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user2
  ON public.conversations (user2_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON public.conversations (last_message_at DESC);


-- ─── 2. CONVERSATION PARTICIPANTS TABLE ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at       timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  last_read_at    timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
  ON public.conversation_participants (user_id, last_read_at);


-- ─── 3. PRIVATE MESSAGES TABLE ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.private_messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         text        NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 1000),
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at      timestamptz DEFAULT NULL
);

-- Performance indexes for chronological pagination and active message queries
CREATE INDEX IF NOT EXISTS idx_private_messages_conv_created
  ON public.private_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_private_messages_active
  ON public.private_messages (conversation_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_private_messages_sender
  ON public.private_messages (sender_id);


-- ─── 4. SUPABASE REALTIME PUBLICATION ────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'private_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;
  END IF;
END $$;


-- ─── 5. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────────────

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-run
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations with accepted friends" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversation timestamp" ON public.conversations;

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants for their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant state" ON public.conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.private_messages;
DROP POLICY IF EXISTS "Users can insert messages into their active conversations" ON public.private_messages;
DROP POLICY IF EXISTS "Users can soft delete their own messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.private_messages;

-- A. CONVERSATIONS POLICIES
-- SELECT: Only participants can view conversation metadata
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1_id 
    OR auth.uid() = user2_id
  );

-- INSERT: Authenticated users can insert conversations where they are a participant AND an accepted friendship exists
CREATE POLICY "Users can insert conversations with accepted friends"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user1_id OR auth.uid() = user2_id)
    AND user1_id < user2_id
    AND EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
        AND (
          (requester_id = user1_id AND addressee_id = user2_id)
          OR (requester_id = user2_id AND addressee_id = user1_id)
        )
    )
  );

-- UPDATE: Participants can update conversation timestamps (e.g. last_message_at)
CREATE POLICY "Participants can update conversation timestamp"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);


-- B. CONVERSATION PARTICIPANTS POLICIES
-- SELECT: Participants can view participants of their conversations
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_participants.conversation_id 
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- INSERT: Authenticated participants can insert participant rows for their conversations
CREATE POLICY "Users can insert participants for their conversations"
  ON public.conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_participants.conversation_id 
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        AND (user_id = c.user1_id OR user_id = c.user2_id)
    )
  );

-- UPDATE: Users can update their own last_read_at timestamp
CREATE POLICY "Users can update their own participant state"
  ON public.conversation_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- C. PRIVATE MESSAGES POLICIES
-- SELECT: Users can only view messages from conversations they are a participant of
CREATE POLICY "Users can view messages in their conversations"
  ON public.private_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = private_messages.conversation_id 
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- INSERT: User can only insert if:
-- 1. sender_id is auth.uid()
-- 2. user is a participant in this conversation
-- 3. both participants have an active 'accepted' status in public.friendships
CREATE POLICY "Users can insert messages into their active conversations"
  ON public.private_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.friendships f ON (
        (f.requester_id = c.user1_id AND f.addressee_id = c.user2_id)
        OR (f.requester_id = c.user2_id AND f.addressee_id = c.user1_id)
      )
      WHERE c.id = private_messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        AND f.status = 'accepted'
    )
  );

-- UPDATE: Users can only soft-delete / update their own messages
CREATE POLICY "Users can soft delete their own messages"
  ON public.private_messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- DELETE: Users can hard-delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON public.private_messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());


-- ─── 6. STORED RPC: GET OR CREATE CONVERSATION ───────────────────────────────

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_other_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller_id uuid;
  v_conv_id uuid;
  v_friendship_status text;
  v_other_profile record;
  v_created_at timestamptz;
  v_u1 uuid;
  v_u2 uuid;
BEGIN
  -- 1. Validate caller authentication
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  -- 2. Validate parameters
  IF p_other_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid other_user_id: User cannot be null';
  END IF;

  IF v_caller_id = p_other_user_id THEN
    RAISE EXCEPTION 'Invalid conversation: Cannot create private chat with yourself';
  END IF;

  -- 3. Verify other user exists
  SELECT id, full_name, avatar_url, target_exam, target_year
  INTO v_other_profile
  FROM public.profiles
  WHERE id = p_other_user_id;

  IF v_other_profile.id IS NULL THEN
    RAISE EXCEPTION 'User not found: Target user does not exist';
  END IF;

  -- 4. Check friendship status between caller and other user
  SELECT status INTO v_friendship_status
  FROM public.friendships
  WHERE (requester_id = v_caller_id AND addressee_id = p_other_user_id)
     OR (requester_id = p_other_user_id AND addressee_id = v_caller_id)
  LIMIT 1;

  -- Verify accepted friendship
  IF v_friendship_status IS NULL OR v_friendship_status != 'accepted' THEN
    RAISE EXCEPTION 'Unauthorized: Direct messaging requires an accepted friendship';
  END IF;

  -- 5. Determine canonical ordering (user1_id < user2_id)
  v_u1 := LEAST(v_caller_id, p_other_user_id);
  v_u2 := GREATEST(v_caller_id, p_other_user_id);

  -- 6. Find existing conversation
  SELECT id, created_at INTO v_conv_id, v_created_at
  FROM public.conversations
  WHERE user1_id = v_u1 AND user2_id = v_u2
  LIMIT 1;

  -- 7. Atomic race-condition safe creation if not exists
  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations (
      user1_id,
      user2_id,
      last_message_at,
      created_at,
      updated_at
    ) VALUES (
      v_u1,
      v_u2,
      now(),
      now(),
      now()
    )
    ON CONFLICT (user1_id, user2_id)
    DO UPDATE SET updated_at = now()
    RETURNING id, created_at INTO v_conv_id, v_created_at;

    -- Ensure both participant records exist
    INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at, last_read_at)
    VALUES 
      (v_conv_id, v_caller_id, now(), now()),
      (v_conv_id, p_other_user_id, now(), now())
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'conversation_id', v_conv_id,
    'created_at', v_created_at,
    'other_user', jsonb_build_object(
      'id', v_other_profile.id,
      'full_name', v_other_profile.full_name,
      'avatar_url', v_other_profile.avatar_url,
      'target_exam', v_other_profile.target_exam,
      'target_year', v_other_profile.target_year
    ),
    'friendship_status', v_friendship_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(uuid) TO service_role;


-- ─── 7. STORED RPC: GET USER CONVERSATIONS (WITH UNREAD COUNTS) ──────────────

CREATE OR REPLACE FUNCTION public.get_user_conversations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller_id uuid;
  v_result jsonb;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  SELECT jsonb_agg(conv_row ORDER BY conv_row->>'last_message_at' DESC)
  INTO v_result
  FROM (
    SELECT jsonb_build_object(
      'id', c.id,
      'last_message_at', c.last_message_at,
      'created_at', c.created_at,
      'other_user', jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url,
        'target_exam', p.target_exam,
        'target_year', p.target_year
      ),
      'friendship_status', COALESCE(f.status, 'none'),
      'last_message', (
        SELECT jsonb_build_object(
          'id', pm.id,
          'content', pm.content,
          'sender_id', pm.sender_id,
          'created_at', pm.created_at,
          'deleted_at', pm.deleted_at
        )
        FROM public.private_messages pm
        WHERE pm.conversation_id = c.id
          AND pm.deleted_at IS NULL
        ORDER BY pm.created_at DESC
        LIMIT 1
      ),
      'unread_count', (
        SELECT COUNT(*)::int
        FROM public.private_messages pm
        WHERE pm.conversation_id = c.id
          AND pm.created_at > cp.last_read_at
          AND pm.sender_id != v_caller_id
          AND pm.deleted_at IS NULL
      )
    ) AS conv_row
    FROM public.conversations c
    JOIN public.conversation_participants cp 
      ON cp.conversation_id = c.id AND cp.user_id = v_caller_id
    JOIN public.profiles p 
      ON p.id = CASE WHEN c.user1_id = v_caller_id THEN c.user2_id ELSE c.user1_id END
    LEFT JOIN public.friendships f 
      ON (f.requester_id = c.user1_id AND f.addressee_id = c.user2_id)
      OR (f.requester_id = c.user2_id AND f.addressee_id = c.user1_id)
  ) sub;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_conversations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_conversations() TO service_role;


-- ─── 8. STORED RPC: MARK CONVERSATION READ ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller_id uuid;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  UPDATE public.conversation_participants
  SET last_read_at = timezone('utc'::text, now())
  WHERE conversation_id = p_conversation_id
    AND user_id = v_caller_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO service_role;


-- ─── 9. SECURE NOTIFICATION UPDATE FOR DIRECT MESSAGES ───────────────────────

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

    -- For direct message: verify an accepted friendship exists between caller and recipient
    IF v_metadata_type = 'direct_message' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted'
          AND (
            (requester_id = p_target_user_id AND addressee_id = v_actor_id)
            OR (requester_id = v_actor_id AND addressee_id = p_target_user_id)
          )
      ) THEN
        RAISE EXCEPTION 'Unauthorized: Users must be accepted friends to send direct message notifications';
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

REVOKE ALL ON FUNCTION public.create_user_notification(uuid, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_user_notification(uuid, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_notification(uuid, text, text, text, jsonb) TO service_role;
