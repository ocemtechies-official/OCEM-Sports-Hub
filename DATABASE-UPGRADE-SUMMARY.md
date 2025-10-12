# Database Upgrade Summary

This document summarizes the changes made to add database support for the enhanced profile and settings functionality while preserving existing data and functionality.

## Overview

The upgrade adds new fields to the `profiles` table to support the enhanced profile and settings pages without affecting any existing data or functionality.

## Files Modified

### 1. Database Migration Script

**File**: [scripts/07-add-profile-fields.sql](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/07-add-profile-fields.sql)

Adds new columns to the profiles table:

- `student_id` (TEXT)
- `department` (TEXT)
- `semester` (TEXT)
- `contact_number` (TEXT)
- `bio` (TEXT)
- `address` (TEXT)
- `city` (TEXT)
- `date_of_birth` (DATE)
- `profile_visibility` (TEXT)
- `notification_preferences` (JSONB)
- `theme_preference` (TEXT)
- `language_preference` (TEXT)
- `timezone` (TEXT)

Also adds:

- Indexes for better query performance
- Trigger to automatically update `updated_at` timestamp
- Backward compatibility with existing data

### 2. Sports Week Configuration Migration Script

**File**: [scripts/12-sports-week-config.sql](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/12-sports-week-config.sql)

Adds a new table to store sports week configuration:

- `sports_week_config` table with start and end dates
- Support for multiple configurations (active/inactive)
- Admin management capabilities
- Row Level Security policies

### 3. Profile API Route

**File**: [app/api/profile/route.ts](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/app/api/profile/route.ts)

Updated to handle all new profile fields:

- Added new fields to the request parsing
- Updated the database update operation to include all new fields

### 4. Documentation Updates

#### README.md

Updated to include the new migration script in the setup instructions.

#### scripts/README.md

Updated to include the new migration script in the script order.

## New Files Created

### 1. Database Migration Script for Sports Week Configuration

**File**: [scripts/12-sports-week-config.sql](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/12-sports-week-config.sql)

Adds a new table to store sports week configuration:

- `sports_week_config` table with:
  - `start_date` (TIMESTAMPTZ) - The start date of the sports week
  - `end_date` (TIMESTAMPTZ) - The end date of the sports week
  - `name` (TEXT) - Name of the sports week event
  - `description` (TEXT) - Description of the event
  - `is_active` (BOOLEAN) - Whether this configuration is active
  - `created_at` (TIMESTAMPTZ) - When the configuration was created
  - `updated_at` (TIMESTAMPTZ) - When the configuration was last updated

Also adds:

- Indexes for better query performance
- Trigger to automatically update `updated_at` timestamp
- Row Level Security policies for admin management
- Default configuration data

### 2. Migration Guide

**File**: [scripts/MIGRATION-GUIDE.md](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/MIGRATION-GUIDE.md)

Comprehensive guide for migrating existing databases to support the new functionality, including:

- Step-by-step migration instructions
- Explanation of what the migration does
- Backward compatibility information
- Troubleshooting guide
- Rollback instructions

### 3. Test Scripts

**Files**:

- [scripts/test-profile-fields.js](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/test-profile-fields.js)
- [scripts/test-profile-fields.ts](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/test-profile-fields.ts)

Test scripts to verify the new profile fields work correctly:

- Insert test profile with new fields
- Query and verify all new fields
- Update specific fields
- Clean up test data

## Backward Compatibility

This upgrade is fully backward compatible:

- All existing data is preserved
- Existing applications continue to work without changes
- New fields are optional and can be populated gradually
- The AuthProvider automatically fetches all profile fields

## Migration Steps

1. Run the [07-add-profile-fields.sql](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/07-add-profile-fields.sql) script in your Supabase SQL Editor
2. Run the [12-sports-week-config.sql](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/12-sports-week-config.sql) script in your Supabase SQL Editor
3. No code changes are required in existing applications
4. The enhanced profile and settings functionality will automatically work

## Testing

To verify the migration:

1. Run one of the test scripts:

   ```bash
   # JavaScript version
   node scripts/test-profile-fields.js
   
   # TypeScript version
   npx ts-node scripts/test-profile-fields.ts
   ```

2. Or manually test by:
   - Logging into the application
   - Navigating to the profile page
   - Updating profile information with new fields
   - Verifying the data is saved and retrieved correctly

## Support

If you encounter any issues with this upgrade, please refer to the [MIGRATION-GUIDE.md](file:///d%3A/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/MIGRATION-GUIDE.md) or create a GitHub issue with details about the problem.