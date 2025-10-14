-- ======================================================
-- OCEM Sports Hub - Leaderboard Snapshots (optional cache)
-- ======================================================
-- Stores cached leaderboard rows for faster reads. Canonical values
-- remain computed by views; this table is optional.

BEGIN;

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('tournament','season')),
  scope_id UUID,
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  gender TEXT,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  points NUMERIC NOT NULL DEFAULT 0,
  goal_diff INTEGER,
  nrr NUMERIC,
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_scope
  ON public.leaderboard_snapshots (scope_type, scope_id, sport_id, gender);

-- RLS: readable by all; writable by admins only
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leaderboard_snapshots' AND policyname='leaderboard_snapshots_select_all'
  ) THEN
    EXECUTE 'DROP POLICY "leaderboard_snapshots_select_all" ON public.leaderboard_snapshots';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leaderboard_snapshots' AND policyname='leaderboard_snapshots_write_admin'
  ) THEN
    EXECUTE 'DROP POLICY "leaderboard_snapshots_write_admin" ON public.leaderboard_snapshots';
  END IF;
END$$;

CREATE POLICY "leaderboard_snapshots_select_all" ON public.leaderboard_snapshots
  FOR SELECT USING (true);

CREATE POLICY "leaderboard_snapshots_write_admin" ON public.leaderboard_snapshots
  FOR ALL USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

-- RPC to recompute and write snapshot
CREATE OR REPLACE FUNCTION public.recompute_leaderboard_snapshot(
  p_scope_type TEXT,
  p_scope_id UUID,
  p_sport UUID,
  p_gender TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT public.is_admin_user(auth.uid()) INTO is_admin;
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete previous snapshot rows for this scope
  DELETE FROM public.leaderboard_snapshots
  WHERE scope_type = p_scope_type
    AND (scope_id IS NOT DISTINCT FROM p_scope_id)
    AND sport_id = p_sport
    AND (p_gender IS NULL OR gender = p_gender);

  IF p_scope_type = 'tournament' THEN
    INSERT INTO public.leaderboard_snapshots (
      scope_type, scope_id, sport_id, gender, team_id,
      matches_played, wins, losses, draws, points, goal_diff, nrr, last_computed_at
    )
    SELECT 'tournament', v.tournament_id, v.sport_id, v.gender, v.team_id,
           v.matches_played, v.wins, v.losses, v.draws, v.points, v.goal_diff, v.nrr, now()
    FROM public.v_leaderboard_tournament v
    WHERE v.tournament_id = p_scope_id
      AND v.sport_id = p_sport
      AND (p_gender IS NULL OR v.gender = p_gender);
  ELSIF p_scope_type = 'season' THEN
    -- For season snapshots we store p_scope_id as NULL and rely on season_key filter not stored
    INSERT INTO public.leaderboard_snapshots (
      scope_type, scope_id, sport_id, gender, team_id,
      matches_played, wins, losses, draws, points, goal_diff, nrr, last_computed_at
    )
    SELECT 'season', NULL::uuid, v.sport_id, v.gender, v.team_id,
           v.matches_played, v.wins, v.losses, v.draws, v.points, v.goal_diff, v.nrr, now()
    FROM public.v_leaderboard_season v
    WHERE v.sport_id = p_sport
      AND (p_gender IS NULL OR v.gender = p_gender);
  ELSE
    RAISE EXCEPTION 'Invalid scope_type %', p_scope_type;
  END IF;

  RETURN jsonb_build_object('status','ok');
END;
$$;

COMMIT;


