# Database Fix for RLS Policy Recursion

The error "infinite recursion detected in policy for relation 'profiles'" indicates that the Row Level Security (RLS) policy on the profiles table is causing a recursive loop.

## Quick Fix via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to "Authentication" > "Policies"
3. Find the profiles table policies
4. **Temporarily disable RLS** on the profiles table OR fix the policy

## SQL Commands to Fix (Run in Supabase SQL Editor)

### Option 1: Disable RLS temporarily (for testing)

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### Option 2: Fix the RLS policy

```sql
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create correct policies
CREATE POLICY "Enable read access for users to their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert access for users to their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for users to their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### Option 3: Create the profiles table with correct structure (if it doesn't exist)

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'viewer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for users to their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert access for users to their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for users to their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### Option 4: Create a trigger to automatically create profiles

```sql
-- Function to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'viewer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Recommended Steps

1. **First try Option 1** (disable RLS temporarily) to test if the app works
2. If it works, then **apply Option 2** to create proper policies
3. **Add Option 4** to automatically create profiles for new users
4. Test the login functionality

## Emergency Fix in Code

The app now includes a temporary workaround that creates a basic profile object when RLS policies fail. Use the debug panel buttons to:

- "Get Profile" - Try to fetch the profile via API
- "Fix Profile" - Force create/update the profile
