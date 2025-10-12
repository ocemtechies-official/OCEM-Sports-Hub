# Database Scripts for OCEM Sports Hub

This directory contains SQL scripts for setting up and populating the Supabase database, organized into subdirectories for better management:

- `database/` - Core database setup and migration scripts
- `setup/` - User and administrator setup scripts
- `testing/` - Sample data population and testing scripts
- `utils/` - Utility scripts for checking status and assignments

## Database Scripts (in order)

1. `database/01-create-tables.sql` - Creates all database tables and indexes
2. `database/02-enable-rls.sql` - Enables Row Level Security policies
3. `database/03-seed-data.sql` - Inserts basic seed data (sports and teams)
4. `database/04-create-functions.sql` - Creates database functions and triggers
5. `database/05-sample-data.sql` - Inserts comprehensive sample data for testing
6. `database/06-complete-sample-data.sql` - Complete sample data with players, fixtures, quizzes, and more
7. `database/07-add-profile-fields.sql` - Adds new profile fields for enhanced functionality (run after initial setup)
8. `database/07-tournament-tables.sql` - Tournament system tables
9. `database/08-registration-system-migration.sql` - Registration system migration
10. `database/09-registration-rls-policies.sql` - Registration RLS policies
11. `database/10-moderator-system.sql` - Moderator system tables
12. `database/11-moderator-rls-policies.sql` - Moderator RLS policies
13. `database/12-sports-week-config.sql` - Sports week configuration
14. `database/13-soft-delete-migration.sql` - Soft delete migration

## Setup Scripts

- `setup/create-admin-user.sql` - Creates an administrator user
- `setup/create-test-moderator.sql` - Creates a test moderator
- `setup/quick-setup-moderator.sql` - Quick moderator setup
- `setup/setup-test-moderator.sql` - Test moderator setup
- `setup/simple-test-moderator.sql` - Simple test moderator setup
- `setup/test-moderator-setup.sql` - Another test moderator setup script

## Testing Scripts

- `testing/populate-sample-data.js` - JavaScript script to populate sample data
- `testing/populate-sample-data.ts` - TypeScript script to populate sample data
- `testing/test-profile-fields.js` - JavaScript script to test profile fields
- `testing/test-profile-fields.ts` - TypeScript script to test profile fields

## Utility Scripts

- `utils/check-migration-status.sql` - Check the status of database migrations
- `utils/check-moderator-assignments.sql` - Check moderator assignments

## Usage

### SQL Scripts

To run the SQL scripts directly in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each script in order
4. Run each script

For the most comprehensive sample data, run `database/06-complete-sample-data.sql` after running the first four scripts in the database directory.

For existing installations upgrading to the enhanced profile functionality, run `database/07-add-profile-fields.sql` to add the new profile fields.

### Sample Data Population Script

To populate the database with sample data using the Node.js script:

1. Make sure you have the required environment variables set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Install required dependencies:

   ```bash
   npm install @supabase/supabase-js
   ```

3. Run the script:

   ```bash
   node scripts/testing/populate-sample-data.js
   ```

## Sample Data Overview

The sample data includes:

- **Sports**: All 6 sports (Cricket, Football, Basketball, Badminton, Table Tennis, Chess)
- **Teams**: 8 sample teams with unique names and colors
- **Players**: 40+ sample players assigned to teams with positions
- **Fixtures**: 15+ sample matches for different sports in various statuses (scheduled, live, completed)
- **Quizzes**: 5 sample quizzes with different difficulties
- **Quiz Questions**: 25+ sample questions for the quizzes
- **Chess Games**: 5 sample chess games with different statuses
- **Leaderboard Entries**: Sample leaderboard data for teams

This data provides a comprehensive demonstration of the application's functionality.
