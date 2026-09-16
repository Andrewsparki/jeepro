-- ============================================================================
-- 010_global_chat.sql
-- Production Migration: JEE Pro Global Chat System (Phase 1)
-- ============================================================================
-- Creates chat_messages and chat_reports tables, enables Supabase Realtime,
-- adds performance indexes, and configures strict Row-Level Security (RLS).
-- ============================================================================

-- ─── 1. CHAT MESSAGES TABLE ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     text        NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 1000),
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at  timestamptz DEFAULT NULL
);

-- Indexes for fast chronological retrieval and filtering
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at_desc
  ON public.chat_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_active
  ON public.chat_messages (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender
  ON public.chat_messages (sender_id);

-- ─── 2. CHAT REPORTS TABLE (MODERATION BASICS) ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_reports (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid        NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  reporter_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      text        NOT NULL,
  details     text,
  status      text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_by uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  CONSTRAINT uq_chat_report_message_reporter UNIQUE (message_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_reports_status
  ON public.chat_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_reports_message
  ON public.chat_reports (message_id);

-- ─── 3. SYSTEM SETTINGS SEED ─────────────────────────────────────────────────

INSERT INTO public.system_settings (key, value)
VALUES (
  'global_chat',
  '{"enabled": true, "disabled_reason": null}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ─── 4. PROFILES RLS FOR SENDER RECOGNITION ─────────────────────────────────

-- Ensure authenticated students can read public profile info (name, avatar) of chat senders
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- ─── 5. SUPABASE REALTIME PUBLICATION ────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;

-- ─── 6. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────────────

-- Enable RLS on chat tables
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-run
DROP POLICY IF EXISTS "Authenticated users can view active chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users and admins can update own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users and admins can delete own chat messages" ON public.chat_messages;

DROP POLICY IF EXISTS "Users can view own reports and admins can view all" ON public.chat_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.chat_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.chat_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.chat_reports;

-- Chat Messages Policies
-- SELECT: Authenticated users can view active messages; admins can view all including soft-deleted
CREATE POLICY "Authenticated users can view active chat messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL OR public.is_admin());

-- INSERT: Authenticated users can only insert messages as themselves
CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- UPDATE: Users can soft-delete their own messages; admins can update any
CREATE POLICY "Users and admins can update own chat messages"
  ON public.chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR public.is_admin())
  WITH CHECK (auth.uid() = sender_id OR public.is_admin());

-- DELETE: Users can hard delete own messages if requested, or admins
CREATE POLICY "Users and admins can delete own chat messages"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR public.is_admin());

-- Chat Reports Policies
-- SELECT: User can view their own reports; admins can view all
CREATE POLICY "Users can view own reports and admins can view all"
  ON public.chat_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR public.is_admin());

-- INSERT: User can file a report with their own auth.uid()
CREATE POLICY "Users can create reports"
  ON public.chat_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- UPDATE: Only admins can review / update report status
CREATE POLICY "Admins can update reports"
  ON public.chat_reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: Only admins can remove reports
CREATE POLICY "Admins can delete reports"
  ON public.chat_reports
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
