-- ==========================================
-- OCEM Sports Hub - Migration Status Check
-- ==========================================
-- Run this to verify the registration system migration was successful

\echo 'Checking OCEM Sports Hub Registration System Migration Status...'
\echo ''

-- Check if new tables exist
\echo '📋 Checking New Tables:'
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'individual_registrations') 
        THEN '✅ individual_registrations'
        ELSE '❌ individual_registrations MISSING'
    END as "Individual Registrations Table";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_registrations') 
        THEN '✅ team_registrations'
        ELSE '❌ team_registrations MISSING'
    END as "Team Registrations Table";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_registration_members') 
        THEN '✅ team_registration_members'
        ELSE '❌ team_registration_members MISSING'
    END as "Team Members Table";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registration_settings') 
        THEN '✅ registration_settings'
        ELSE '❌ registration_settings MISSING'
    END as "Registration Settings Table";

\echo ''
\echo '🔧 Checking Profile Extensions:'
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'student_id') 
        THEN '✅ student_id column added'
        ELSE '❌ student_id column MISSING'
    END as "Student ID Column";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department') 
        THEN '✅ department column added'
        ELSE '❌ department column MISSING'
    END as "Department Column";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') 
        THEN '✅ gender column added'
        ELSE '❌ gender column MISSING'
    END as "Gender Column";

\echo ''
\echo '🔒 Checking RLS Status:'
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'team_registrations', 'team_registration_members', 'registration_settings')
ORDER BY tablename;

\echo ''
\echo '⚙️ Checking Registration Settings:'
SELECT 
    s.name as "Sport Name",
    rs.registration_open as "Open",
    rs.min_team_size as "Min Size",
    rs.max_team_size as "Max Size"
FROM registration_settings rs
JOIN sports s ON s.id = rs.sport_id
ORDER BY s.name;

\echo ''
\echo '📊 Data Summary:'
SELECT 'Existing Sports' as "Category", COUNT(*) as "Count" FROM sports
UNION ALL
SELECT 'Existing Teams' as "Category", COUNT(*) as "Count" FROM teams
UNION ALL
SELECT 'Existing Profiles' as "Category", COUNT(*) as "Count" FROM profiles
UNION ALL
SELECT 'Registration Settings' as "Category", COUNT(*) as "Count" FROM registration_settings
UNION ALL
SELECT 'Individual Registrations' as "Category", COUNT(*) as "Count" FROM individual_registrations
UNION ALL
SELECT 'Team Registrations' as "Category", COUNT(*) as "Count" FROM team_registrations;

\echo ''
\echo '🎯 Migration Status Summary:'
DO $$
DECLARE
    all_tables_exist BOOLEAN;
    all_columns_exist BOOLEAN;
    rls_enabled BOOLEAN;
    settings_populated BOOLEAN;
BEGIN
    -- Check tables
    SELECT COUNT(*) = 4 INTO all_tables_exist
    FROM information_schema.tables 
    WHERE table_name IN ('individual_registrations', 'team_registrations', 'team_registration_members', 'registration_settings');
    
    -- Check columns
    SELECT COUNT(*) >= 4 INTO all_columns_exist
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name IN ('student_id', 'department', 'semester', 'gender');
    
    -- Check RLS
    SELECT COUNT(*) >= 3 INTO rls_enabled
    FROM pg_tables 
    WHERE tablename IN ('individual_registrations', 'team_registrations', 'team_registration_members')
    AND rowsecurity = true;
    
    -- Check settings
    SELECT COUNT(*) > 0 INTO settings_populated
    FROM registration_settings;
    
    IF all_tables_exist AND all_columns_exist AND rls_enabled AND settings_populated THEN
        RAISE NOTICE '🎉 MIGRATION SUCCESSFUL! All components are in place.';
        RAISE NOTICE '✅ Tables: Created';
        RAISE NOTICE '✅ Columns: Added';
        RAISE NOTICE '✅ Security: Enabled';
        RAISE NOTICE '✅ Settings: Configured';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Registration system is ready to use!';
    ELSE
        RAISE NOTICE '⚠️  MIGRATION INCOMPLETE:';
        IF NOT all_tables_exist THEN
            RAISE NOTICE '❌ Some tables are missing';
        END IF;
        IF NOT all_columns_exist THEN
            RAISE NOTICE '❌ Some profile columns are missing';
        END IF;
        IF NOT rls_enabled THEN
            RAISE NOTICE '❌ RLS is not enabled on all tables';
        END IF;
        IF NOT settings_populated THEN
            RAISE NOTICE '❌ Registration settings are not populated';
        END IF;
    END IF;
END $$;