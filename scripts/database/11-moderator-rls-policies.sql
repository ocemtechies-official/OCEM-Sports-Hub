-- Moderator RLS Policies
-- This script adds Row Level Security policies for the moderator system

-- Enable RLS on match_updates table
ALTER TABLE public.match_updates ENABLE ROW LEVEL SECURITY;

-- 1. Match Updates Policies

-- Allow admins to see all match updates
CREATE POLICY "admins can view all match updates"
  ON public.match_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow moderators to see their own updates
CREATE POLICY "moderators can view own match updates"
  ON public.match_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'moderator'
    ) AND changed_by = auth.uid()
  );

-- Allow authenticated users to see match updates for fixtures they can view
CREATE POLICY "users can view match updates for visible fixtures"
  ON public.match_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.fixtures f
      WHERE f.id = match_updates.fixture_id
    )
  );

-- Insert is handled by RPC function, so no direct insert policy needed
-- But we need one for the trigger
CREATE POLICY "system can insert match updates"
  ON public.match_updates FOR INSERT
  WITH CHECK (true);

-- 2. Update Fixtures Policies

-- Drop existing admin-only policy for fixtures updates
DROP POLICY IF EXISTS "Only admins can manage fixtures" ON public.fixtures;

-- Create new policy that allows admins full access
CREATE POLICY "admins can manage fixtures"
  ON public.fixtures FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy for moderators to update via RPC only
-- This prevents direct table updates but allows RPC calls
CREATE POLICY "moderators can update fixtures via RPC"
  ON public.fixtures FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'moderator'
    )
  )
  WITH CHECK (
    -- Only allow updates to specific fields
    team_a_id = team_a_id AND  -- Cannot change teams
    team_b_id = team_b_id AND  -- Cannot change teams
    sport_id = sport_id AND    -- Cannot change sport
    scheduled_at = scheduled_at -- Cannot change scheduled time
  );

-- 3. Profiles Policies for Moderator Management

-- Allow admins to update any profile (for role changes)
CREATE POLICY "admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to update their own profile (but not role)
CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Prevent role changes unless admin
    role = (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Create view for moderator dashboard data
CREATE OR REPLACE VIEW public.moderator_fixtures AS
SELECT 
  f.*,
  s.name as sport_name,
  s.icon as sport_icon,
  ta.name as team_a_name,
  ta.logo_url as team_a_logo,
  ta.color as team_a_color,
  tb.name as team_b_name,
  tb.logo_url as team_b_logo,
  tb.color as team_b_color,
  p.full_name as updated_by_name,
  p.role as updated_by_role
FROM public.fixtures f
LEFT JOIN public.sports s ON f.sport_id = s.id
LEFT JOIN public.teams ta ON f.team_a_id = ta.id
LEFT JOIN public.teams tb ON f.team_b_id = tb.id
LEFT JOIN public.profiles p ON f.updated_by = p.id;

-- Enable RLS on the view
ALTER VIEW public.moderator_fixtures SET (security_invoker = true);

-- 5. Create function to get fixtures for moderator
CREATE OR REPLACE FUNCTION public.get_moderator_fixtures(
  p_user_id UUID DEFAULT auth.uid(),
  p_status TEXT DEFAULT NULL,
  p_sport_name TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  fixture_id UUID,
  sport_name TEXT,
  sport_icon TEXT,
  team_a_name TEXT,
  team_a_logo TEXT,
  team_a_color TEXT,
  team_b_name TEXT,
  team_b_logo TEXT,
  team_b_color TEXT,
  scheduled_at TIMESTAMPTZ,
  venue TEXT,
  status TEXT,
  team_a_score INTEGER,
  team_b_score INTEGER,
  winner_id UUID,
  version INTEGER,
  updated_by_name TEXT,
  updated_by_role TEXT,
  can_moderate BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_profile public.profiles%rowtype;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF user_profile IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN QUERY
  SELECT 
    f.id as fixture_id,
    s.name as sport_name,
    s.icon as sport_icon,
    ta.name as team_a_name,
    ta.logo_url as team_a_logo,
    ta.color as team_a_color,
    tb.name as team_b_name,
    tb.logo_url as team_b_logo,
    tb.color as team_b_color,
    f.scheduled_at,
    f.venue,
    f.status,
    f.team_a_score,
    f.team_b_score,
    f.winner_id,
    f.version,
    p.full_name as updated_by_name,
    p.role as updated_by_role,
    public.can_moderate_fixture(f.id, p_user_id) as can_moderate
  FROM public.fixtures f
  LEFT JOIN public.sports s ON f.sport_id = s.id
  LEFT JOIN public.teams ta ON f.team_a_id = ta.id
  LEFT JOIN public.teams tb ON f.team_b_id = tb.id
  LEFT JOIN public.profiles p ON f.updated_by = p.id
  WHERE 
    -- Filter by status if provided
    (p_status IS NULL OR f.status = p_status)
    -- Filter by sport if provided
    AND (p_sport_name IS NULL OR s.name = p_sport_name)
    -- Authorization check
    AND (
      user_profile.role = 'admin' OR
      (user_profile.role = 'moderator' AND (
        user_profile.assigned_sports IS NULL OR 
        s.name = ANY(user_profile.assigned_sports)
      ))
    )
  ORDER BY f.scheduled_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_moderator_fixtures TO authenticated;

-- 6. Create function to get moderator stats
CREATE OR REPLACE FUNCTION public.get_moderator_stats(
  p_user_id UUID DEFAULT auth.uid(),
  p_days INTEGER DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_profile public.profiles%rowtype;
  total_updates INTEGER;
  updates_today INTEGER;
  fixtures_updated INTEGER;
  most_active_sport TEXT;
  result JSONB;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF user_profile IS NULL THEN
    RETURN '{"error": "User not found"}'::JSONB;
  END IF;
  
  -- Get stats
  SELECT COUNT(*) INTO total_updates
  FROM public.match_updates
  WHERE changed_by = p_user_id
    AND change_time > NOW() - (p_days || ' days')::INTERVAL;
  
  SELECT COUNT(*) INTO updates_today
  FROM public.match_updates
  WHERE changed_by = p_user_id
    AND change_time::DATE = CURRENT_DATE;
  
  SELECT COUNT(DISTINCT fixture_id) INTO fixtures_updated
  FROM public.match_updates
  WHERE changed_by = p_user_id
    AND change_time > NOW() - (p_days || ' days')::INTERVAL;
  
  SELECT s.name INTO most_active_sport
  FROM public.match_updates mu
  JOIN public.fixtures f ON mu.fixture_id = f.id
  JOIN public.sports s ON f.sport_id = s.id
  WHERE mu.changed_by = p_user_id
    AND mu.change_time > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY s.name
  ORDER BY COUNT(*) DESC
  LIMIT 1;
  
  result := jsonb_build_object(
    'total_updates', total_updates,
    'updates_today', updates_today,
    'fixtures_updated', fixtures_updated,
    'most_active_sport', most_active_sport,
    'days_period', p_days
  );
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_moderator_stats TO authenticated;
