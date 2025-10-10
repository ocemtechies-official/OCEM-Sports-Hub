# Database Migration Guide

This guide explains how to migrate your existing OCEM Sports Hub database to support the enhanced profile and settings functionality.

## Overview

The enhanced profile and settings features require additional fields in the `profiles` table. This migration adds new columns without affecting existing data.

## Migration Steps

### 1. Run the Migration Script

Execute the [07-add-profile-fields.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/07-add-profile-fields.sql) script in your Supabase SQL Editor:

1. Navigate to your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of [07-add-profile-fields.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/07-add-profile-fields.sql)
4. Run the script

### 2. What This Migration Does

The migration script performs the following operations:

- Adds new columns to the `profiles` table:
  - `student_id` (TEXT) - Student identification number
  - `department` (TEXT) - Academic department
  - `semester` (TEXT) - Current semester
  - `contact_number` (TEXT) - Phone number
  - `bio` (TEXT) - User biography
  - `address` (TEXT) - User address
  - `city` (TEXT) - User city
  - `date_of_birth` (DATE) - User date of birth
  - `profile_visibility` (TEXT) - Profile visibility setting (public, private, friends)
  - `notification_preferences` (JSONB) - User notification preferences
  - `theme_preference` (TEXT) - User theme preference (light, dark, system)
  - `language_preference` (TEXT) - User language preference
  - `timezone` (TEXT) - User timezone

- Creates indexes for better query performance on new columns
- Adds a trigger to automatically update the `updated_at` timestamp
- Preserves all existing data

### 3. Verify the Migration

After running the script, you can verify the migration was successful by checking the table structure:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

You should see the new columns in the output.

## Backward Compatibility

This migration is fully backward compatible:

- All existing data is preserved
- Existing applications will continue to work without changes
- New fields are optional and can be populated gradually
- The API has been updated to handle both old and new fields

## Troubleshooting

### Common Issues

1. **Duplicate column error**: If you've already added some of these columns manually, the script will skip them safely due to the `IF NOT EXISTS` clause.

2. **Permission denied**: Ensure you're running the script with a user that has table modification privileges.

3. **Syntax errors**: Make sure you're using a compatible version of PostgreSQL (Supabase uses PostgreSQL).

### Rollback

If you need to rollback the migration, you can remove the new columns:

```sql
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS student_id,
DROP COLUMN IF EXISTS department,
DROP COLUMN IF EXISTS semester,
DROP COLUMN IF EXISTS contact_number,
DROP COLUMN IF EXISTS bio,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS profile_visibility,
DROP COLUMN IF EXISTS notification_preferences,
DROP COLUMN IF EXISTS theme_preference,
DROP COLUMN IF EXISTS language_preference,
DROP COLUMN IF EXISTS timezone;
```

Note: This will permanently delete any data stored in these columns.

## Testing

After migration:

1. Restart your development server
2. Log in to the application
3. Navigate to the profile and settings pages
4. Verify that you can update all new fields
5. Check that existing functionality still works correctly
