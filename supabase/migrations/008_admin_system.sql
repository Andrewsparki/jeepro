-- ============================================================================
-- 008_admin_system.sql
-- Production Migration: Admin Control Center Schema
-- ============================================================================
-- Adds admin role, system settings, notifications, and audit logging
-- ============================================================================

-- ─── 1. ADMIN ROLE ON PROFILES ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Index for fast admin lookups in middleware
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
  ON public.profiles (id) WHERE is_admin = true;

-- Helper function for RLS policies to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Allow admins to read all profiles (for user management)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Allow admins to read all study sessions (for analytics)
CREATE POLICY "Admins can view all study sessions"
  ON public.study_sessions
  FOR SELECT
  USING (public.is_admin());

-- Allow admins to read all user topic progress (for analytics)
CREATE POLICY "Admins can view all user topic progress"
  ON public.user_topic_progress
  FOR SELECT
  USING (public.is_admin());

-- Allow admins to read all daily missions (for analytics)
CREATE POLICY "Admins can view all daily missions"
  ON public.daily_missions
  FOR SELECT
  USING (public.is_admin());


-- ─── 2. SYSTEM SETTINGS TABLE ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.system_settings (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text        NOT NULL UNIQUE,
  value           jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by      uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Seed the initial system settings row for maintenance mode
INSERT INTO public.system_settings (key, value)
VALUES (
  'maintenance_mode',
  '{"enabled": false, "message": "We are currently performing scheduled maintenance.", "expected_return_time": null}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read system settings (needed for maintenance check)
CREATE POLICY "Authenticated users can view system settings"
  ON public.system_settings
  FOR SELECT
  USING (true);

-- Only admins can modify system settings
CREATE POLICY "Admins can update system settings"
  ON public.system_settings
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can insert system settings"
  ON public.system_settings
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete system settings"
  ON public.system_settings
  FOR DELETE
  USING (public.is_admin());


-- ─── 3. NOTIFICATIONS TABLE ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  message         text        NOT NULL,
  type            text        NOT NULL DEFAULT 'info'
                              CHECK (type IN ('info', 'warning', 'success', 'error')),
  target_type     text        NOT NULL DEFAULT 'all'
                              CHECK (target_type IN ('all', 'user')),
  target_user_id  uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata        jsonb       DEFAULT '{}'::jsonb,
  created_by      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_target_created
  ON public.notifications (target_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_target_user
  ON public.notifications (target_user_id)
  WHERE target_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications (created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can see notifications targeted to them or to all users
CREATE POLICY "Users can view their notifications"
  ON public.notifications
  FOR SELECT
  USING (
    target_type = 'all'
    OR target_user_id = auth.uid()
    OR public.is_admin()
  );

-- Only admins can create notifications
CREATE POLICY "Admins can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update notifications
CREATE POLICY "Admins can update notifications"
  ON public.notifications
  FOR UPDATE
  USING (public.is_admin());

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (public.is_admin());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_notifications_updated ON public.notifications;
CREATE TRIGGER on_notifications_updated
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notifications_updated_at();


-- ─── 4. AUDIT LOGS TABLE ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action          text        NOT NULL,
  target_type     text,
  target_id       text,
  metadata        jsonb       DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user
  ON public.audit_logs (admin_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON public.audit_logs (action);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_admin());

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Audit logs are immutable — no update or delete policies
