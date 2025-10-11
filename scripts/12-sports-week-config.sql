-- Migration script to add sports week configuration table
-- This table will store the start date for sports week that can be configured by admins

-- Create the sports_week_config table
CREATE TABLE IF NOT EXISTS public.sports_week_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  name TEXT DEFAULT 'Sports Week',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sports_week_config table
DROP TRIGGER IF EXISTS update_sports_week_config_updated_at ON public.sports_week_config;
CREATE TRIGGER update_sports_week_config_updated_at
    BEFORE UPDATE ON public.sports_week_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a default configuration if none exists
INSERT INTO public.sports_week_config (start_date, end_date, name, description)
SELECT 
  NOW() + INTERVAL '7 days',  -- Default to next week
  NOW() + INTERVAL '14 days',  -- Default to 7-day event
  'Sports Week 2025',
  'Annual sports week event'
WHERE NOT EXISTS (SELECT 1 FROM public.sports_week_config);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sports_week_config_active ON public.sports_week_config(is_active);
CREATE INDEX IF NOT EXISTS idx_sports_week_config_dates ON public.sports_week_config(start_date, end_date);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.sports_week_config TO authenticated;
GRANT ALL ON public.sports_week_config TO service_role;

-- Add RLS policies
ALTER TABLE public.sports_week_config ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage configuration
CREATE POLICY "Admins can manage sports week config" 
ON public.sports_week_config 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy for everyone to read active configuration
CREATE POLICY "Everyone can read active sports week config" 
ON public.sports_week_config 
FOR SELECT 
TO authenticated 
USING (is_active = TRUE);

-- Verification query
-- SELECT 'Sports week config table created' as status, COUNT(*) as config_count FROM public.sports_week_config;