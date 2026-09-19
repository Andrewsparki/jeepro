-- ============================================================================
-- 029_enforce_all_scoped_moderation_rls.sql
-- Production Migration: Enforce Scoped User Moderation across DMs, Study Groups, & Platform Access
-- ============================================================================

-- ─── 1. EXTEND PROFILES TABLE FOR PLATFORM SUSPENSION ────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_reason text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS suspended_until timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_suspended
  ON public.profiles (id)
  WHERE is_suspended = true;

-- ─── 2. RLS POLICIES FOR DIRECT MESSAGES (private_messages) ─────────────────

DROP POLICY IF EXISTS "Users can insert messages into their active conversations" ON public.private_messages;

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
    AND NOT EXISTS (
      SELECT 1 FROM public.user_moderation_scopes ums
      WHERE ums.user_id = auth.uid()
        AND ums.scope = 'direct_messages'
        AND ums.status IN ('restricted', 'banned')
        AND (ums.expires_at IS NULL OR ums.expires_at > timezone('utc'::text, now()))
    )
  );

-- Banned DM users cannot view DMs
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.private_messages;

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
    AND NOT EXISTS (
      SELECT 1 FROM public.user_moderation_scopes ums
      WHERE ums.user_id = auth.uid()
        AND ums.scope = 'direct_messages'
        AND ums.status = 'banned'
        AND (ums.expires_at IS NULL OR ums.expires_at > timezone('utc'::text, now()))
    )
  );

-- ─── 3. RLS POLICIES FOR STUDY GROUPS (group_messages & group_members) ───────

DROP POLICY IF EXISTS "Only group members can send messages" ON public.group_messages;

CREATE POLICY "Only group members can send messages"
  ON public.group_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id
        AND gm.user_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.user_moderation_scopes ums
      WHERE ums.user_id = auth.uid()
        AND ums.scope = 'study_groups'
        AND ums.status IN ('restricted', 'banned')
        AND (ums.expires_at IS NULL OR ums.expires_at > timezone('utc'::text, now()))
    )
  );

-- Banned study group users cannot join group_members
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;

CREATE POLICY "Users can join public groups"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_moderation_scopes ums
      WHERE ums.user_id = auth.uid()
        AND ums.scope = 'study_groups'
        AND ums.status = 'banned'
        AND (ums.expires_at IS NULL OR ums.expires_at > timezone('utc'::text, now()))
    )
  );

-- ─── 4. HELPER FUNCTION TO GET ALL MODERATION SCOPES ───────────────────────

CREATE OR REPLACE FUNCTION public.get_user_active_moderation_scopes(p_user_id uuid)
RETURNS TABLE (
  scope text,
  status text,
  reason text,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ums.scope,
    ums.status,
    ums.reason,
    ums.expires_at
  FROM public.user_moderation_scopes ums
  WHERE ums.user_id = p_user_id
    AND ums.status != 'active'
    AND (ums.expires_at IS NULL OR ums.expires_at > timezone('utc'::text, now()));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_active_moderation_scopes(uuid) TO authenticated;
