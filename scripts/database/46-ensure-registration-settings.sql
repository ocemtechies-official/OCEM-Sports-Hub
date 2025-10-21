-- ==========================================
-- OCEM Sports Hub - Ensure Registration Settings
-- ==========================================
-- This script ensures all active sports have registration settings
-- Run this script to create missing registration settings for sports

BEGIN;

-- Insert registration settings for sports that don't have them
INSERT INTO public.registration_settings (
    sport_id,
    registration_open,
    registration_start,
    registration_end,
    min_team_size,
    max_team_size,
    allow_mixed_gender,
    allow_mixed_department,
    requires_approval,
    max_registrations_per_sport
)
SELECT 
    s.id as sport_id,
    true as registration_open,  -- Registration open by default
    NOW() - INTERVAL '1 day' as registration_start,  -- Started yesterday
    NOW() + INTERVAL '30 days' as registration_end,  -- Ends in 30 days
    CASE 
        WHEN s.is_team_sport THEN COALESCE(s.min_players, 5)
        ELSE NULL
    END as min_team_size,
    CASE 
        WHEN s.is_team_sport THEN COALESCE(s.max_players, 15)
        ELSE NULL
    END as max_team_size,
    true as allow_mixed_gender,
    true as allow_mixed_department,
    true as requires_approval,
    NULL as max_registrations_per_sport
FROM public.sports s
WHERE s.is_active = true
AND s.id NOT IN (
    SELECT sport_id FROM public.registration_settings
)
ON CONFLICT (sport_id) DO NOTHING;

-- Update existing registration settings with default values where needed
UPDATE public.registration_settings rs
SET 
    registration_open = COALESCE(rs.registration_open, true),
    registration_start = COALESCE(rs.registration_start, NOW() - INTERVAL '1 day'),
    registration_end = COALESCE(rs.registration_end, NOW() + INTERVAL '30 days'),
    allow_mixed_gender = COALESCE(rs.allow_mixed_gender, true),
    allow_mixed_department = COALESCE(rs.allow_mixed_department, true),
    requires_approval = COALESCE(rs.requires_approval, true)
WHERE rs.registration_open IS NULL 
   OR rs.registration_start IS NULL 
   OR rs.registration_end IS NULL 
   OR rs.allow_mixed_gender IS NULL 
   OR rs.allow_mixed_department IS NULL 
   OR rs.requires_approval IS NULL;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check how many sports have registration settings
SELECT 
    COUNT(s.id) as total_active_sports,
    COUNT(rs.id) as sports_with_settings
FROM public.sports s
LEFT JOIN public.registration_settings rs ON s.id = rs.sport_id
WHERE s.is_active = true;

-- List sports and their registration status
SELECT 
    s.name,
    s.is_team_sport,
    rs.registration_open,
    rs.registration_start,
    rs.registration_end,
    rs.min_team_size,
    rs.max_team_size
FROM public.sports s
LEFT JOIN public.registration_settings rs ON s.id = rs.sport_id
WHERE s.is_active = true
ORDER BY s.name;