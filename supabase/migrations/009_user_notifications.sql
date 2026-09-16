-- ============================================================================
-- 009_user_notifications.sql
-- Production Migration: Persistent User Notification Center
-- ============================================================================
-- Extends notifications with user ownership, read state (seen_at), indexes,
-- Supabase Realtime publication, and user-scoped Row-Level Security (RLS).
-- ============================================================================

-- ─── 1. EXTEND NOTIFICATIONS TABLE ─────────────────────────────────────────

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS seen_at timestamptz DEFAULT NULL;

-- Backfill user_id from target_user_id where target_user_id was specified
UPDATE public.notifications
SET user_id = target_user_id
WHERE user_id IS NULL AND target_user_id IS NOT NULL;

-- Make created_by and target_type optional for client/service event notifications
ALTER TABLE public.notifications
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN target_type DROP NOT NULL;

-- ─── 2. PERFORMANCE INDEXES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_seen
  ON public.notifications (user_id, seen_at);

-- ─── 3. SUPABASE REALTIME ENABLEMENT ───────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ─── 4. ROW LEVEL SECURITY (RLS) POLICIES ──────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Clean up older restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users and admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications read state" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users and admins can delete notifications" ON public.notifications;

-- SELECT: Authenticated users can only read their own notifications or admins can view all
CREATE POLICY "Users can select own notifications"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = target_user_id
    OR (target_type = 'all' AND (user_id IS NULL OR user_id = auth.uid()))
    OR public.is_admin()
  );

-- INSERT: Authenticated users can insert notifications for themselves, or admins for anyone
CREATE POLICY "Users and admins can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- UPDATE: Authenticated users can update read-state (seen_at) on their own notifications
CREATE POLICY "Users can update own notifications read state"
  ON public.notifications
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() = target_user_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = target_user_id
    OR public.is_admin()
  );

-- DELETE: Notification owner or admins can delete
CREATE POLICY "Users and admins can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );
