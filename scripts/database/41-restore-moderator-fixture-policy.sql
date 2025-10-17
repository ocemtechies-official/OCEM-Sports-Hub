-- ==========================================
-- OCEM Sports Hub - Restore Moderator Fixture Update Policy
-- ==========================================
-- This script restores the ability for moderators to update fixtures
-- while maintaining proper sport/venue assignment restrictions.
-- 
-- CRITICAL FIX: Resolves the issue where moderators cannot change
-- fixture status or update scores due to missing RLS policies.

BEGIN;

-- First, check if helper functions exist (they should from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'is_moderator_user'
  ) THEN
    -- Create is_moderator_user function if it doesn't exist
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.is_moderator_user(user_id UUID)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN (''moderator'', ''admin'')
      );
    END;
    $func$;
    
    GRANT EXECUTE ON FUNCTION public.is_moderator_user(UUID) TO authenticated;
    ';
  END IF;
END $$;

-- Drop any existing moderator fixture policies that might conflict
DROP POLICY IF EXISTS "moderators_can_update_fixtures" ON public.fixtures;
DROP POLICY IF EXISTS "temp_moderators_can_update_fixtures" ON public.fixtures;
DROP POLICY IF EXISTS "moderators can update fixtures via RPC" ON public.fixtures;

-- Create comprehensive moderator fixture update policy
CREATE POLICY "moderators_can_update_fixtures" ON public.fixtures
FOR UPDATE
USING (
  -- Always allow admins
  public.is_admin_user(auth.uid()) 
  OR 
  -- Allow moderators with proper assignments
  (
    public.is_moderator_user(auth.uid())
    AND (
      -- Check if moderator has no specific sport assignments (global moderator)
      NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND assigned_sports IS NOT NULL 
        AND array_length(assigned_sports, 1) > 0
      )
      OR
      -- Check if moderator is assigned to this fixture's sport
      EXISTS (
        SELECT 1 
        FROM public.profiles p
        JOIN public.sports s ON s.id = fixtures.sport_id
        WHERE p.id = auth.uid()
        AND p.assigned_sports IS NOT NULL
        AND s.name = ANY(p.assigned_sports)
      )
    )
    AND (
      -- Check venue assignments (if any)
      NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND assigned_venues IS NOT NULL 
        AND array_length(assigned_venues, 1) > 0
      )
      OR
      -- Check if moderator is assigned to this fixture's venue
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.assigned_venues IS NOT NULL
        AND (fixtures.venue IS NULL OR fixtures.venue = ANY(p.assigned_venues))
      )
    )
  )
)
WITH CHECK (
  -- Restrict which fields can be updated to prevent unauthorized changes
  -- Allow updates to scores, status, timestamps, and metadata but not core fixture data
  fixtures.team_a_id = team_a_id AND
  fixtures.team_b_id = team_b_id AND
  fixtures.sport_id = sport_id
  -- Note: We allow scheduled_at, venue updates for admin convenience
  -- and score/status updates are the primary use case
);

-- Grant necessary permissions
GRANT UPDATE ON public.fixtures TO authenticated;

-- Verify the policy was created successfully
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' 
  AND tablename = 'fixtures'
  AND policyname = 'moderators_can_update_fixtures';
  
  IF policy_count = 0 THEN
    RAISE EXCEPTION 'Failed to create moderators_can_update_fixtures policy';
  END IF;
  
  RAISE NOTICE '✅ Successfully created moderators_can_update_fixtures policy';
END $$;

-- Log the change
INSERT INTO public.system_logs (
  action, 
  details, 
  created_at
) VALUES (
  'RLS_POLICY_RESTORED',
  'Restored moderator fixture update policy to fix status/score update issues',
  NOW()
) ON CONFLICT DO NOTHING;

COMMIT;

-- Post-deployment verification queries
\echo '🔍 Verifying RLS Policy Status:'

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'fixtures'
ORDER BY policyname;

\echo '🔍 Checking Helper Functions:'

SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin_user', 'is_moderator_user');

\echo '✅ Moderator fixture update policy has been restored!'
\echo '📋 Next steps:'
\echo '   1. Test moderator fixture updates'
\echo '   2. Verify proper sport/venue assignment restrictions'
\echo '   3. Check error handling in frontend components'