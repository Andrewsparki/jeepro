-- ============================================================================
-- 025_scoped_user_moderation.sql
-- Production Migration: Scoped User Moderation System
-- ============================================================================
-- Extends user moderation to support granular feature scopes:
-- - global_chat (mute, ban)
-- - direct_messages (restrict, ban)
-- - study_groups (remove, restrict, ban)
-- - platform_access (suspend account)
-- Stores structured moderation entries with duration/expiration support.
-- ============================================================================

-- ─── 1. USER MODERATION SCOPES TABLE ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_moderation_scopes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scope        text        NOT NULL CHECK (scope IN ('global_chat', 'direct_messages', 'study_groups', 'platform_access')),
  status       text        NOT NULL CHECK (status IN ('active', 'muted', 'restricted', 'banned', 'suspended')),
  reason       text        DEFAULT NULL,
  duration_mins integer    DEFAULT NULL, -- NULL means permanent until explicitly lifted
  expires_at   timestamptz DEFAULT NULL,
  created_at   timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at   timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,

  CONSTRAINT uq_user_moderation_scope UNIQUE (user_id, scope)
);

-- Index for fast lookup by user and scope
CREATE INDEX IF NOT EXISTS idx_user_moderation_user_scope
  ON public.user_moderation_scopes (user_id, scope);

CREATE INDEX IF NOT EXISTS idx_user_moderation_status
  ON public.user_moderation_scopes (status)
  WHERE status != 'active';

-- Enable RLS
ALTER TABLE public.user_moderation_scopes ENABLE ROW LEVEL SECURITY;

-- ─── 2. RLS POLICIES ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can view own moderation status" ON public.user_moderation_scopes;
CREATE POLICY "Authenticated users can view own moderation status"
  ON public.user_moderation_scopes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage moderation scopes" ON public.user_moderation_scopes;
CREATE POLICY "Only admins can manage moderation scopes"
  ON public.user_moderation_scopes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── 3. HELPER FUNCTION: check_user_scope_moderation() ──────────────────────
-- Helper to inspect active moderation for a given user & scope.

CREATE OR REPLACE FUNCTION public.get_user_scope_moderation(p_user_id uuid, p_scope text)
RETURNS TABLE (
  is_restricted boolean,
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
    (
      ums.status != 'active' AND
      (ums.expires_at IS NULL OR ums.expires_at > timezone('utc'::text, now()))
    ) AS is_restricted,
    ums.status,
    ums.reason,
    ums.expires_at
  FROM public.user_moderation_scopes ums
  WHERE ums.user_id = p_user_id AND ums.scope = p_scope;

  IF NOT FOUND THEN
    -- Default fallback if row does not exist
    RETURN QUERY SELECT false, 'active'::text, NULL::text, NULL::timestamptz;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_scope_moderation(uuid, text) TO authenticated;
