-- Migration: Add soft delete support for fixtures, quizzes, tournaments, and users
-- This script adds deleted_at columns and updates RLS policies

-- Add deleted_at column to fixtures table
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to tournaments table
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to profiles table (for users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create indexes for better performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_fixtures_deleted_at ON fixtures(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quizzes_deleted_at ON quizzes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tournaments_deleted_at ON tournaments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- Update RLS policies to exclude soft-deleted records

-- Fixtures policies
DROP POLICY IF EXISTS "Users can view fixtures" ON fixtures;
CREATE POLICY "Users can view fixtures" ON fixtures
    FOR SELECT USING (
        deleted_at IS NULL AND (
            auth.role() = 'authenticated'
        )
    );

DROP POLICY IF EXISTS "Admins can manage fixtures" ON fixtures;
CREATE POLICY "Admins can manage fixtures" ON fixtures
    FOR ALL USING (
        deleted_at IS NULL AND (
            auth.role() = 'authenticated' AND 
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        )
    );

-- Quizzes policies
DROP POLICY IF EXISTS "Users can view active quizzes" ON quizzes;
CREATE POLICY "Users can view active quizzes" ON quizzes
    FOR SELECT USING (
        deleted_at IS NULL AND is_active = true AND (
            auth.role() = 'authenticated'
        )
    );

DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;
CREATE POLICY "Admins can manage quizzes" ON quizzes
    FOR ALL USING (
        deleted_at IS NULL AND (
            auth.role() = 'authenticated' AND 
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        )
    );

-- Tournaments policies
DROP POLICY IF EXISTS "Users can view tournaments" ON tournaments;
CREATE POLICY "Users can view tournaments" ON tournaments
    FOR SELECT USING (
        deleted_at IS NULL AND (
            auth.role() = 'authenticated'
        )
    );

DROP POLICY IF EXISTS "Admins can manage tournaments" ON tournaments;
CREATE POLICY "Admins can manage tournaments" ON tournaments
    FOR ALL USING (
        deleted_at IS NULL AND (
            auth.role() = 'authenticated' AND 
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        )
    );

-- Profiles policies (users)
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
    FOR SELECT USING (
        deleted_at IS NULL AND (
            auth.role() = 'authenticated'
        )
    );

DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
CREATE POLICY "Admins can manage profiles" ON profiles
    FOR ALL USING (
        deleted_at IS NULL AND (
            auth.role() = 'authenticated' AND 
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid() 
                AND p.role = 'admin'
            )
        )
    );

-- Create a function to soft delete fixtures
CREATE OR REPLACE FUNCTION soft_delete_fixture(fixture_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE fixtures 
    SET deleted_at = NOW() 
    WHERE id = fixture_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to soft delete quizzes
CREATE OR REPLACE FUNCTION soft_delete_quiz(quiz_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE quizzes 
    SET deleted_at = NOW() 
    WHERE id = quiz_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to soft delete tournaments
CREATE OR REPLACE FUNCTION soft_delete_tournament(tournament_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tournaments 
    SET deleted_at = NOW() 
    WHERE id = tournament_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to soft delete users
CREATE OR REPLACE FUNCTION soft_delete_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET deleted_at = NOW() 
    WHERE id = user_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to restore soft deleted records
CREATE OR REPLACE FUNCTION restore_fixture(fixture_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE fixtures 
    SET deleted_at = NULL 
    WHERE id = fixture_id AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_quiz(quiz_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE quizzes 
    SET deleted_at = NULL 
    WHERE id = quiz_id AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_tournament(tournament_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tournaments 
    SET deleted_at = NULL 
    WHERE id = tournament_id AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET deleted_at = NULL 
    WHERE id = user_id AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users for soft delete functions
GRANT EXECUTE ON FUNCTION soft_delete_fixture(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_quiz(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_tournament(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_user(UUID) TO authenticated;

-- Grant execute permissions for restore functions
GRANT EXECUTE ON FUNCTION restore_fixture(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_quiz(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_tournament(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_user(UUID) TO authenticated;

-- Create views for admins to see deleted records
CREATE OR REPLACE VIEW deleted_fixtures AS
SELECT * FROM fixtures WHERE deleted_at IS NOT NULL;

CREATE OR REPLACE VIEW deleted_quizzes AS
SELECT * FROM quizzes WHERE deleted_at IS NOT NULL;

CREATE OR REPLACE VIEW deleted_tournaments AS
SELECT * FROM tournaments WHERE deleted_at IS NOT NULL;

CREATE OR REPLACE VIEW deleted_users AS
SELECT * FROM profiles WHERE deleted_at IS NOT NULL;

-- Grant access to deleted views for admins only
-- Note: This will be handled by RLS policies in the application layer
