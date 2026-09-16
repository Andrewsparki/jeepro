-- ============================================================================
-- 007_planner_events.sql
-- Production Migration: Planner Events Schema, Constraints, Indexes & RLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.planner_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text        NOT NULL,
  event_type      text        NOT NULL CHECK (event_type IN (
                                'Study Session',
                                'Revision Session',
                                'Formula Review',
                                'PYQ Practice',
                                'Mock Test',
                                'Custom Task'
                              )),
  subject_id      uuid        REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id      uuid        REFERENCES public.chapters(id) ON DELETE SET NULL,
  start_time      timestamptz NOT NULL,
  end_time        timestamptz NOT NULL,
  status          text        NOT NULL CHECK (status IN ('pending', 'completed', 'missed')) DEFAULT 'pending',
  google_event_id text,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ─── INDEXES ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_planner_events_user_start
  ON public.planner_events (user_id, start_time ASC);

CREATE INDEX IF NOT EXISTS idx_planner_events_user_status
  ON public.planner_events (user_id, status);

CREATE INDEX IF NOT EXISTS idx_planner_events_chapter
  ON public.planner_events (chapter_id)
  WHERE chapter_id IS NOT NULL;

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'planner_events' AND policyname = 'Users can view own planner events'
  ) THEN
    CREATE POLICY "Users can view own planner events"
      ON public.planner_events FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'planner_events' AND policyname = 'Users can insert own planner events'
  ) THEN
    CREATE POLICY "Users can insert own planner events"
      ON public.planner_events FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'planner_events' AND policyname = 'Users can update own planner events'
  ) THEN
    CREATE POLICY "Users can update own planner events"
      ON public.planner_events FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'planner_events' AND policyname = 'Users can delete own planner events'
  ) THEN
    CREATE POLICY "Users can delete own planner events"
      ON public.planner_events FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
