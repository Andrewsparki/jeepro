-- ============================================================================
-- 021_support_tickets.sql
-- Production Migration: Support Ticket System Schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category        text        NOT NULL DEFAULT 'general'
                              CHECK (category IN ('general', 'account', 'billing', 'study_planner', 'bug_report', 'feature_request')),
  subject         text        NOT NULL,
  description     text        NOT NULL,
  status          text        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority        text        NOT NULL DEFAULT 'normal'
                              CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at     timestamptz,
  resolved_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id
  ON public.support_tickets (user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created
  ON public.support_tickets (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at
  ON public.support_tickets (created_at DESC);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own support tickets
CREATE POLICY "Users can view own support tickets"
  ON public.support_tickets
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- Policy 2: Authenticated users can create support tickets for themselves
CREATE POLICY "Users can create own support tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- Policy 3: Only admins can update support tickets (e.g. status updates)
CREATE POLICY "Admins can update support tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (
    public.is_admin()
  );

-- Policy 4: Only admins can delete support tickets
CREATE POLICY "Admins can delete support tickets"
  ON public.support_tickets
  FOR DELETE
  USING (
    public.is_admin()
  );

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_support_tickets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_support_tickets_updated ON public.support_tickets;
CREATE TRIGGER on_support_tickets_updated
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_support_tickets_updated_at();
