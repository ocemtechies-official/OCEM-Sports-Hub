# Database Scripts for OCEM Sports Hub

This directory contains SQL scripts for setting up and populating the Supabase database.

## Script Order

1. `01-create-tables.sql` - Creates all database tables and indexes
2. `02-enable-rls.sql` - Enables Row Level Security policies
3. `03-seed-data.sql` - Inserts basic seed data (sports and teams)
4. `04-create-functions.sql` - Creates database functions and triggers
5. `05-sample-data.sql` - Inserts comprehensive sample data for testing
6. `06-complete-sample-data.sql` - Complete sample data with players, fixtures, quizzes, and more

## Usage

### SQL Scripts

To run the SQL scripts directly in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each script in order
4. Run each script

For the most comprehensive sample data, run `06-complete-sample-data.sql` after running the first four scripts.

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
   node scripts/populate-sample-data.js
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
