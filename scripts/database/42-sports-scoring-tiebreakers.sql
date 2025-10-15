-- ==========================================
-- OCEM Sports Hub - Sports Scoring Tiebreakers
-- ==========================================
-- Extends public.sports.scoring_rules with tiebreakers arrays per sport.
-- Idempotent: merges only when keys are missing.

BEGIN;

-- Helper: merge tiebreakers if missing
CREATE OR REPLACE FUNCTION public.merge_sport_tiebreakers()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  tb jsonb;
BEGIN
  FOR r IN SELECT id, name, scoring_rules FROM public.sports LOOP
    tb := COALESCE(r.scoring_rules, '{}'::jsonb);
    IF tb ? 'tiebreakers' THEN
      CONTINUE;
    END IF;
    IF lower(r.name) = 'cricket' THEN
      tb := tb || jsonb_build_object('tiebreakers', jsonb_build_array('points','nrr','goal_diff','goals_scored'));
    ELSIF lower(r.name) IN ('football','soccer') THEN
      tb := tb || jsonb_build_object('tiebreakers', jsonb_build_array('points','goal_diff','goals_scored','head_to_head'));
    ELSIF lower(r.name) = 'basketball' THEN
      tb := tb || jsonb_build_object('tiebreakers', jsonb_build_array('points','point_diff','points_scored','head_to_head'));
    ELSIF lower(r.name) IN ('volleyball','tennis','badminton') THEN
      tb := tb || jsonb_build_object('tiebreakers', jsonb_build_array('points','sets_ratio','points_ratio','head_to_head'));
    ELSIF lower(r.name) = 'chess' THEN
      tb := tb || jsonb_build_object('tiebreakers', jsonb_build_array('points','buchholz','sonneborn_berger'));
    ELSE
      tb := tb || jsonb_build_object('tiebreakers', jsonb_build_array('points','goal_diff'));
    END IF;
    UPDATE public.sports SET scoring_rules = tb WHERE id = r.id;
  END LOOP;
END;
$$;

SELECT public.merge_sport_tiebreakers();

COMMIT;


