-- ==========================================
-- OCEM Sports Hub - Registration System RLS Policies
-- ==========================================
-- This script sets up Row Level Security for the registration system
-- Ensures data privacy and proper access control

BEGIN;

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all registration tables
ALTER TABLE public.individual_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_registration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- INDIVIDUAL REGISTRATIONS POLICIES
-- ==========================================

-- Users can view their own individual registrations
CREATE POLICY "Users can view own individual registrations" 
ON public.individual_registrations
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- Users can insert their own individual registrations
CREATE POLICY "Users can create own individual registrations" 
ON public.individual_registrations
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- Users can update their own pending registrations
CREATE POLICY "Users can update own pending individual registrations" 
ON public.individual_registrations
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id 
  AND status IN ('pending', 'withdrawn')
);

-- Admins can view all individual registrations
CREATE POLICY "Admins can view all individual registrations" 
ON public.individual_registrations
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any individual registration (for approval/rejection)
CREATE POLICY "Admins can update individual registrations" 
ON public.individual_registrations
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- TEAM REGISTRATIONS POLICIES
-- ==========================================

-- Users can view their own team registrations
CREATE POLICY "Users can view own team registrations" 
ON public.team_registrations
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- Users can insert their own team registrations
CREATE POLICY "Users can create own team registrations" 
ON public.team_registrations
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- Users can update their own pending team registrations
CREATE POLICY "Users can update own pending team registrations" 
ON public.team_registrations
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id 
  AND status IN ('pending', 'withdrawn')
);

-- Admins can view all team registrations
CREATE POLICY "Admins can view all team registrations" 
ON public.team_registrations
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any team registration (for approval/rejection)
CREATE POLICY "Admins can update team registrations" 
ON public.team_registrations
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- TEAM REGISTRATION MEMBERS POLICIES
-- ==========================================

-- Users can view members of their own team registrations
CREATE POLICY "Users can view own team registration members" 
ON public.team_registration_members
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_registrations tr
    WHERE tr.id = team_registration_id 
    AND tr.user_id = auth.uid()
  )
);

-- Users can insert members for their own team registrations
CREATE POLICY "Users can add members to own team registrations" 
ON public.team_registration_members
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_registrations tr
    WHERE tr.id = team_registration_id 
    AND tr.user_id = auth.uid()
    AND tr.status = 'pending'
  )
);

-- Users can update members of their own pending team registrations
CREATE POLICY "Users can update own team registration members" 
ON public.team_registration_members
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_registrations tr
    WHERE tr.id = team_registration_id 
    AND tr.user_id = auth.uid()
    AND tr.status = 'pending'
  )
);

-- Users can delete members from their own pending team registrations
CREATE POLICY "Users can delete own team registration members" 
ON public.team_registration_members
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_registrations tr
    WHERE tr.id = team_registration_id 
    AND tr.user_id = auth.uid()
    AND tr.status = 'pending'
  )
);

-- Admins can view all team registration members
CREATE POLICY "Admins can view all team registration members" 
ON public.team_registration_members
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any team registration members
CREATE POLICY "Admins can update team registration members" 
ON public.team_registration_members
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- REGISTRATION SETTINGS POLICIES
-- ==========================================

-- Everyone can view registration settings (needed for form validation)
CREATE POLICY "Everyone can view registration settings" 
ON public.registration_settings
FOR SELECT 
USING (true);

-- Only admins can modify registration settings
CREATE POLICY "Admins can modify registration settings" 
ON public.registration_settings
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- HELPER FUNCTIONS FOR VALIDATION
-- ==========================================

-- Function to check if user can register for a sport
CREATE OR REPLACE FUNCTION can_register_for_sport(sport_uuid UUID, reg_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    settings RECORD;
    existing_count INTEGER;
BEGIN
    -- Get registration settings for the sport
    SELECT * INTO settings 
    FROM public.registration_settings 
    WHERE sport_id = sport_uuid;
    
    -- If no settings found, allow registration
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Check if registration is open
    IF NOT settings.registration_open THEN
        RETURN false;
    END IF;
    
    -- Check registration period
    IF settings.registration_start IS NOT NULL AND NOW() < settings.registration_start THEN
        RETURN false;
    END IF;
    
    IF settings.registration_end IS NOT NULL AND NOW() > settings.registration_end THEN
        RETURN false;
    END IF;
    
    -- Check existing registrations for this user and sport
    IF reg_type = 'individual' THEN
        SELECT COUNT(*) INTO existing_count
        FROM public.individual_registrations
        WHERE user_id = auth.uid() 
        AND sport_id = sport_uuid
        AND status NOT IN ('rejected', 'withdrawn');
    ELSE
        SELECT COUNT(*) INTO existing_count
        FROM public.team_registrations
        WHERE user_id = auth.uid() 
        AND sport_id = sport_uuid
        AND status NOT IN ('rejected', 'withdrawn');
    END IF;
    
    -- If user already has a registration, deny
    IF existing_count > 0 THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate team size
CREATE OR REPLACE FUNCTION validate_team_size(team_reg_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    team_reg RECORD;
    settings RECORD;
    member_count INTEGER;
BEGIN
    -- Get team registration details
    SELECT * INTO team_reg 
    FROM public.team_registrations 
    WHERE id = team_reg_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Get sport settings
    SELECT * INTO settings 
    FROM public.registration_settings 
    WHERE sport_id = team_reg.sport_id;
    
    IF NOT FOUND THEN
        RETURN true; -- No restrictions if no settings
    END IF;
    
    -- Count team members
    SELECT COUNT(*) INTO member_count
    FROM public.team_registration_members
    WHERE team_registration_id = team_reg_id;
    
    -- Validate team size
    IF settings.min_team_size IS NOT NULL AND member_count < settings.min_team_size THEN
        RETURN false;
    END IF;
    
    IF settings.max_team_size IS NOT NULL AND member_count > settings.max_team_size THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

NOTIFY pgsql, 'Registration system RLS policies created successfully!';