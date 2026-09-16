-- ============================================================================
-- 011_friends_system.sql
-- Production Migration: JEE Pro Friends System (Phase 2)
-- ============================================================================
-- Creates friendships table with symmetric uniqueness, indexes, Supabase
-- Realtime publication, and strict Row-Level Security (RLS).
-- ============================================================================

-- ─── 1. FRIENDSHIPS TABLE ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.friendships (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at   timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at   timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_friendships_no_self_request CHECK (requester_id != addressee_id)
);

-- ─── 2. PERFORMANCE & SYMMETRIC UNIQUE INDEXES ───────────────────────────────

-- Enforce symmetric uniqueness: A -> B and B -> A cannot both exist simultaneously
CREATE UNIQUE INDEX IF NOT EXISTS uq_friendships_pair
  ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

-- Fast lookup indexes for friend queries and request status
CREATE INDEX IF NOT EXISTS idx_friendships_requester
  ON public.friendships (requester_id, status);

CREATE INDEX IF NOT EXISTS idx_friendships_addressee
  ON public.friendships (addressee_id, status);

CREATE INDEX IF NOT EXISTS idx_friendships_updated_at
  ON public.friendships (updated_at DESC);

-- ─── 3. SUPABASE REALTIME PUBLICATION ────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'friendships'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
  END IF;
END $$;

-- ─── 4. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────────────

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own friendships and admins can view all" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friend requests as themselves" ON public.friendships;
DROP POLICY IF EXISTS "Users and admins can update own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users and admins can delete own friendships" ON public.friendships;

-- SELECT: Authenticated users can view friendships where they are involved; admins can view all
CREATE POLICY "Users can view own friendships and admins can view all"
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id 
    OR auth.uid() = addressee_id 
    OR public.is_admin()
  );

-- INSERT: Authenticated users can only send friend requests as themselves (requester_id = auth.uid())
CREATE POLICY "Users can create friend requests as themselves"
  ON public.friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = requester_id 
    AND requester_id != addressee_id 
    AND status IN ('pending', 'blocked')
  );

-- UPDATE: Users can only update their own relationships
-- (e.g. Addressee accepts/declines, or user blocks)
CREATE POLICY "Users and admins can update own friendships"
  ON public.friendships
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = requester_id 
    OR auth.uid() = addressee_id 
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = requester_id 
    OR auth.uid() = addressee_id 
    OR public.is_admin()
  );

-- DELETE: Users can remove friends, decline requests, or cancel outgoing requests
CREATE POLICY "Users and admins can delete own friendships"
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = requester_id 
    OR auth.uid() = addressee_id 
    OR public.is_admin()
  );
