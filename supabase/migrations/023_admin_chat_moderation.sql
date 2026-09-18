-- ============================================================================
-- 023_admin_chat_moderation.sql
-- Production Migration: Admin Chat Moderation Schema Extensions
-- ============================================================================
-- Adds mute, ban, and moderation metadata fields to public.profiles.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_muted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mute_reason text,
  ADD COLUMN IF NOT EXISTS ban_reason text;

-- ─── ADMIN UPDATE POLICY FOR MODERATION FIELDS ──────────────────────────────
-- Without this, the admin's session-based client is silently blocked by RLS
-- when trying to update another user's is_muted/is_banned fields.

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

