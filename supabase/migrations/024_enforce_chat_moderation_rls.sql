-- ============================================================================
-- 024_enforce_chat_moderation_rls.sql
-- Production Migration: Enforce mute/ban at the RLS level for Global Chat
-- ============================================================================
-- Replaces the INSERT policy on chat_messages so muted AND banned users are
-- rejected at the database level, not only in application code.
-- Also restricts SELECT for banned users so they cannot read chat.
-- ============================================================================

-- ─── 1. INDEX FOR FAST MODERATION LOOKUPS ────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_moderation_status
  ON public.profiles (id)
  WHERE is_muted = true OR is_banned = true;

-- ─── 2. REPLACE INSERT POLICY ON CHAT_MESSAGES ──────────────────────────────
-- Old policy: only checked auth.uid() = sender_id
-- New policy: also rejects muted and banned users

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (is_muted = true OR is_banned = true)
    )
  );

-- ─── 3. REPLACE SELECT POLICY ON CHAT_MESSAGES ─────────────────────────────
-- Banned users should not be able to read Global Chat at all.
-- Muted users CAN still read (they just cannot post).
-- Admins can always read everything including soft-deleted messages.

DROP POLICY IF EXISTS "Authenticated users can view active chat messages" ON public.chat_messages;

CREATE POLICY "Authenticated users can view active chat messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    (
      -- Normal users: not banned, can see non-deleted messages
      NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND is_banned = true
      )
      AND deleted_at IS NULL
    )
    OR
    -- Admins: can see everything including soft-deleted
    public.is_admin()
  );

-- ─── 4. HELPER: check_chat_access() for use in application code ─────────────
-- Returns the user's current moderation status for Global Chat.
-- Used by the frontend hook to display muted/banned state without extra queries.

CREATE OR REPLACE FUNCTION public.get_chat_moderation_status()
RETURNS TABLE (
  is_muted boolean,
  is_banned boolean,
  mute_reason text,
  ban_reason text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(p.is_muted, false),
    COALESCE(p.is_banned, false),
    p.mute_reason,
    p.ban_reason
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_chat_moderation_status() TO authenticated;
