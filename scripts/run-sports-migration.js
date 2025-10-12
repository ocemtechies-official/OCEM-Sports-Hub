const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSportsMigration() {
  try {
    console.log('🚀 Starting Sports Enhancement Migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'database', '30-sports-enhancement.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Execute the migration
    console.log('⚡ Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Migration result:', data);
    
    // Verify the migration by checking if new columns exist
    console.log('🔍 Verifying migration...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'sports')
      .eq('table_schema', 'public');
    
    if (columnError) {
      console.error('❌ Failed to verify migration:', columnError);
      process.exit(1);
    }
    
    const columnNames = columns.map(col => col.column_name);
    const expectedColumns = ['is_team_sport', 'min_players', 'max_players', 'description', 'rules', 'is_active'];
    
    console.log('📋 Current sports table columns:', columnNames);
    
    const missingColumns = expectedColumns.filter(col => !columnNames.includes(col));
    if (missingColumns.length > 0) {
      console.error('❌ Missing expected columns:', missingColumns);
      process.exit(1);
    }
    
    console.log('✅ All expected columns are present!');
    
    // Check sports data
    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('*')
      .order('name');
    
    if (sportsError) {
      console.error('❌ Failed to fetch sports:', sportsError);
      process.exit(1);
    }
    
    console.log('🏆 Sports in database:');
    sports.forEach(sport => {
      console.log(`   • ${sport.name} (${sport.is_team_sport ? 'Team' : 'Individual'}) - ${sport.is_active ? 'Active' : 'Inactive'}`);
    });
    
    console.log('🎉 Sports Enhancement Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Test the registration page to see only database sports');
    console.log('   2. Test the admin sports management page');
    console.log('   3. Add new sports through the admin interface');
    
  } catch (error) {
    console.error('❌ Migration failed with error:', error);
    process.exit(1);
  }
}

runSportsMigration();
