-- ==========================================
-- OCEM Sports Hub - Moderator RLS Tightening
-- ==========================================
-- Enforce that moderators can only insert match_updates for fixtures
-- they are authorized to manage (by assigned sports/venues), while
-- keeping admins unrestricted. Idempotent and safe to re-run.

BEGIN;

-- Ensure match_updates RLS is enabled
ALTER TABLE public.match_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policies to replace with stricter variant
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='match_updates' AND policyname='match_updates_insert_mod_or_admin'
  ) THEN
    EXECUTE 'DROP POLICY "match_updates_insert_mod_or_admin" ON public.match_updates';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='match_updates' AND policyname='match_updates_insert_owner'
  ) THEN
    EXECUTE 'DROP POLICY "match_updates_insert_owner" ON public.match_updates';
  END IF;
END $$;

-- Stricter insert policy: must be admin or assigned to sport/venue and own the row
CREATE POLICY "match_updates_insert_strict" ON public.match_updates
  FOR INSERT
  WITH CHECK (
    (
      -- Admins always allowed
      public.is_admin_user(auth.uid())
    ) OR (
      -- Moderators must:
      -- 1) be a moderator
      public.is_moderator_user(auth.uid())
      AND created_by = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.fixtures f
        JOIN public.sports s ON s.id = f.sport_id
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE f.id = match_updates.fixture_id
          AND (
            -- If no assigned_sports, treat as global moderator
            p.assigned_sports IS NULL
            OR s.name = ANY(p.assigned_sports)
          )
          AND (
            -- If assigned_venues is set, venue must match; otherwise allow all venues
            p.assigned_venues IS NULL
            OR (f.venue IS NOT NULL AND f.venue = ANY(p.assigned_venues))
          )
      )
    )
  );

COMMIT;


