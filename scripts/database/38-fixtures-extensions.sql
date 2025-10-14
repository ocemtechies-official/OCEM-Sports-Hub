-- ==========================================
-- OCEM Sports Hub - Fixtures Extensions
-- ==========================================
-- Adds tournament_id, gender, and extra jsonb to public.fixtures.
-- Uses idempotent ALTERs so it is safe to re-run.

BEGIN;

-- Foreign key to tournaments (if table exists); add column first
ALTER TABLE public.fixtures
  ADD COLUMN IF NOT EXISTS tournament_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tournaments'
  ) THEN
    -- Add FK only if tournaments table exists and constraint not yet present
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'fixtures'
        AND constraint_name = 'fixtures_tournament_id_fkey'
    ) THEN
      EXECUTE 'ALTER TABLE public.fixtures
               ADD CONSTRAINT fixtures_tournament_id_fkey
               FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id)
               ON DELETE SET NULL';
    END IF;
  END IF;
END$$;

-- Gender of the fixture (derived from teams but overridable)
-- We keep as TEXT to align with existing usage in routes (gender strings)
ALTER TABLE public.fixtures
  ADD COLUMN IF NOT EXISTS gender TEXT;

-- Sport-specific statistics / payload (e.g., cricket overs/wickets, set scores)
ALTER TABLE public.fixtures
  ADD COLUMN IF NOT EXISTS extra JSONB;

-- Optional helper: season_key derived from scheduled_at year (nullable)
ALTER TABLE public.fixtures
  ADD COLUMN IF NOT EXISTS season_key TEXT;

-- Backfill gender from teams if null (best-effort)
UPDATE public.fixtures f
SET gender = COALESCE(f.gender, tA.gender, tB.gender)
FROM public.teams tA, public.teams tB
WHERE tA.id = f.team_a_id AND tB.id = f.team_b_id
  AND f.gender IS NULL;

-- Backfill season_key from scheduled_at (YYYY)
UPDATE public.fixtures
SET season_key = to_char(scheduled_at, 'YYYY')
WHERE season_key IS NULL AND scheduled_at IS NOT NULL;

COMMIT;


