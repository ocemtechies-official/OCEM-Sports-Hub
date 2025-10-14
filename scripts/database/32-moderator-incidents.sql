-- ==========================================
-- OCEM Sports Hub - Moderator Incidents/Audit
-- ==========================================
-- Creates match_updates table (if missing), indexes, policies
-- Safe to run multiple times

BEGIN;

-- Ensure uuid generator is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: match_updates
CREATE TABLE IF NOT EXISTS public.match_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  note TEXT
);

-- Ensure required columns exist even if table pre-existed
ALTER TABLE public.match_updates
  ADD COLUMN IF NOT EXISTS fixture_id UUID,
  ADD COLUMN IF NOT EXISTS update_type TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS player_id UUID,
  ADD COLUMN IF NOT EXISTS prev_team_a_score INTEGER,
  ADD COLUMN IF NOT EXISTS prev_team_b_score INTEGER,
  ADD COLUMN IF NOT EXISTS prev_status TEXT,
  ADD COLUMN IF NOT EXISTS new_team_a_score INTEGER,
  ADD COLUMN IF NOT EXISTS new_team_b_score INTEGER,
  ADD COLUMN IF NOT EXISTS new_status TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_match_updates_fixture_created_at
  ON public.match_updates(fixture_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_by
  ON public.match_updates(created_by);

-- Enable RLS
ALTER TABLE public.match_updates ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent drop/create)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='match_updates' AND policyname='match_updates_select_all'
  ) THEN
    EXECUTE 'DROP POLICY "match_updates_select_all" ON public.match_updates';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='match_updates' AND policyname='match_updates_insert_mod_or_admin'
  ) THEN
    EXECUTE 'DROP POLICY "match_updates_insert_mod_or_admin" ON public.match_updates';
  END IF;
END $$;

-- Readable by everyone
CREATE POLICY "match_updates_select_all" ON public.match_updates
  FOR SELECT USING (true);

-- Insert by moderators/admins only
CREATE POLICY "match_updates_insert_mod_or_admin" ON public.match_updates
  FOR INSERT WITH CHECK (
    public.is_moderator_user(auth.uid()) = true
  );

-- Ensure created_by equals the inserting user
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='match_updates' AND policyname='match_updates_insert_owner'
  ) THEN
    EXECUTE 'DROP POLICY "match_updates_insert_owner" ON public.match_updates';
  END IF;
END $$;

CREATE POLICY "match_updates_insert_owner" ON public.match_updates
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Helper view (optional) for latest incidents per fixture
DO $body$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='match_updates' AND column_name='update_type'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='v_fixture_incidents'
    ) THEN
      EXECUTE 'DROP VIEW public.v_fixture_incidents';
    END IF;
    EXECUTE 'CREATE VIEW public.v_fixture_incidents AS '
         || 'SELECT mu.* FROM public.match_updates mu '
         || 'WHERE mu.update_type = ''incident''';
  END IF;
END
$body$;

COMMIT;



