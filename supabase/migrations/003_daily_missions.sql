-- ============================================================================
-- DAILY MISSIONS — Production Migration
-- ============================================================================
-- Paste this entire script into the Supabase SQL Editor and click Run.
-- ============================================================================


-- ─── TABLE ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.daily_missions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date              date        NOT NULL,
  mission_type      text        NOT NULL
                                CHECK (mission_type IN (
                                  'study_duration',
                                  'focus_sessions',
                                  'chapter_completion',
                                  'pomodoro_sessions',
                                  'planner_completion'
                                )),
  title             text        NOT NULL,
  target_value      integer     NOT NULL,
  current_value     integer     NOT NULL DEFAULT 0,
  completed         boolean     NOT NULL DEFAULT false,
  reward_xp         integer     NOT NULL,
  bonus_xp_awarded  boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at        timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  completed_at      timestamptz,

  UNIQUE (user_id, date, mission_type)
);


-- ─── INDEXES ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date
  ON public.daily_missions (user_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_missions_user_completed
  ON public.daily_missions (user_id, completed)
  WHERE completed = true;

CREATE INDEX IF NOT EXISTS idx_daily_missions_created_at
  ON public.daily_missions (created_at);


-- ─── TRIGGER FUNCTION ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_daily_missions_updated_at()
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


-- ─── TRIGGER ────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_daily_missions_updated ON public.daily_missions;

CREATE TRIGGER on_daily_missions_updated
  BEFORE UPDATE ON public.daily_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_daily_missions_updated_at();


-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily missions"
  ON public.daily_missions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily missions"
  ON public.daily_missions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily missions"
  ON public.daily_missions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily missions"
  ON public.daily_missions
  FOR DELETE
  USING (auth.uid() = user_id);
