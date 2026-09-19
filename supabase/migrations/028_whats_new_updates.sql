-- Migration 028: In-App "What's New" / Update Channel System

-- 1. App Updates Table
CREATE TABLE IF NOT EXISTS public.app_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Feature', 'Improvement', 'Fix', 'Announcement')) DEFAULT 'Feature',
  status TEXT NOT NULL CHECK (status IN ('Live', 'In Progress', 'Coming Soon')) DEFAULT 'Live',
  icon_name TEXT DEFAULT 'Sparkles',
  image_url TEXT,
  link_url TEXT,
  link_label TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

-- 2. User Update Read Tracking Table
CREATE TABLE IF NOT EXISTS public.user_app_update_reads (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  update_id UUID NOT NULL REFERENCES public.app_updates(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, update_id)
);

ALTER TABLE public.user_app_update_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_updates
DROP POLICY IF EXISTS "Public can view published updates" ON public.app_updates;
CREATE POLICY "Public can view published updates"
  ON public.app_updates FOR SELECT
  USING ((is_published = true AND is_archived = false) OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert app_updates" ON public.app_updates;
CREATE POLICY "Admins can insert app_updates"
  ON public.app_updates FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update app_updates" ON public.app_updates;
CREATE POLICY "Admins can update app_updates"
  ON public.app_updates FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete app_updates" ON public.app_updates;
CREATE POLICY "Admins can delete app_updates"
  ON public.app_updates FOR DELETE
  USING (public.is_admin());

DROP TRIGGER IF EXISTS update_app_updates_modtime ON public.app_updates;
CREATE TRIGGER update_app_updates_modtime
  BEFORE UPDATE ON public.app_updates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies for user_app_update_reads
DROP POLICY IF EXISTS "Users can view own update reads" ON public.user_app_update_reads;
CREATE POLICY "Users can view own update reads"
  ON public.user_app_update_reads FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own update reads" ON public.user_app_update_reads;
CREATE POLICY "Users can insert own update reads"
  ON public.user_app_update_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own update reads" ON public.user_app_update_reads;
CREATE POLICY "Users can delete own update reads"
  ON public.user_app_update_reads FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_updates_published ON public.app_updates (is_published, is_archived, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_update_reads_user ON public.user_app_update_reads (user_id);

-- Seed Initial Product Updates
INSERT INTO public.app_updates (id, title, description, category, status, icon_name, link_url, link_label, is_published, published_at)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Interactive Notes & Formula Sheet Engine',
    'Write, format, and organize chapter notes with live KaTeX mathematical notation. Create custom formulas, bookmark key equations, and sync everything directly across your Study Workspace.',
    'Feature',
    'Live',
    'Sparkles',
    '/dashboard/study',
    'Open Study Workspace',
    true,
    now() - interval '2 days'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Desktop Momentum Scrolling Fix',
    'Resolved a viewport event conflict to ensure smooth mouse-wheel, trackpad, and touch scrolling throughout full-screen workspace views.',
    'Fix',
    'Live',
    'Wrench',
    '/dashboard/study',
    'Try Workspace',
    true,
    now() - interval '1 day'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'AI Tutor Chapter Companion',
    'Real-time AI concept breakdowns, problem-solving step guidance, and personalized revision hints tuned for JEE Main & Advanced curriculum.',
    'Feature',
    'In Progress',
    'Bot',
    '/dashboard/chat',
    'Explore Community',
    true,
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'PYQ Mock Test Engine v2',
    'Full 3-hour timed practice tests with realistic JEE exam interface, instant detailed analysis, and performance analytics.',
    'Feature',
    'Coming Soon',
    'Rocket',
    '/dashboard/planner',
    'Check Schedule',
    true,
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;
