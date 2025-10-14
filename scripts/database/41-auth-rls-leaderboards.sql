-- ==========================================
-- OCEM Sports Hub - Auth/RLS for leaderboard RPCs
-- ==========================================
-- Ensure read access to views via SECURITY DEFINER RPCs already added.
-- Here we optionally expose read on views to all for convenience, if desired.

BEGIN;

-- Views are readable via RPCs; no-op if policies control base tables.
-- Optionally, grant select on views to anon/authenticated roles.
DO $$
BEGIN
  BEGIN
    EXECUTE 'GRANT SELECT ON TABLE public.v_leaderboard_tournament TO anon, authenticated';
  EXCEPTION WHEN undefined_table THEN
    -- ignore
  END;
  BEGIN
    EXECUTE 'GRANT SELECT ON TABLE public.v_leaderboard_season TO anon, authenticated';
  EXCEPTION WHEN undefined_table THEN
    -- ignore
  END;
END$$;

COMMIT;


