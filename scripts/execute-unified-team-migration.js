#!/usr/bin/env node

/**
 * OCEM Sports Hub - Unified Team System Migration Executor
 * 
 * This script executes the unified team system migration safely
 * 
 * Usage:
 *   node scripts/execute-unified-team-migration.js
 * 
 * Prerequisites:
 *   1. Database backup completed
 *   2. All applications stopped
 *   3. Environment variables configured
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeMigration() {
  console.log('🚀 Starting Unified Team System Migration...')
  console.log('=' .repeat(60))

  try {
    // Step 1: Read migration script
    console.log('📖 Reading migration script...')
    const migrationScript = fs.readFileSync(
      path.join(__dirname, 'database', '28-unified-team-system-migration.sql'),
      'utf8'
    )

    // Step 2: Execute migration
    console.log('⚡ Executing migration...')
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationScript
    })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration executed successfully!')

    // Step 3: Verify migration
    console.log('🔍 Verifying migration...')
    await verifyMigration()

    console.log('🎉 Migration completed successfully!')
    console.log('=' .repeat(60))
    console.log('Next steps:')
    console.log('1. Update your application components')
    console.log('2. Test the unified team system')
    console.log('3. Deploy to production')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

async function verifyMigration() {
  const checks = [
    {
      name: 'Teams table has new columns',
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'teams' 
        AND column_name IN ('team_type', 'source_type', 'sport_id', 'status')
      `
    },
    {
      name: 'Team_members table exists',
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'team_members'
      `
    },
    {
      name: 'Backup tables created',
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name IN ('teams_backup', 'team_registrations_backup', 'team_registration_members_backup')
      `
    },
    {
      name: 'Helper functions created',
      query: `
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_name IN ('get_team_by_registration', 'approve_team_registration', 'reject_team_registration')
      `
    }
  ]

  for (const check of checks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: check.query
      })

      if (error) {
        console.error(`❌ ${check.name}: ${error.message}`)
        return false
      }

      if (data && data.length > 0) {
        console.log(`✅ ${check.name}`)
      } else {
        console.error(`❌ ${check.name}: No data returned`)
        return false
      }
    } catch (error) {
      console.error(`❌ ${check.name}: ${error.message}`)
      return false
    }
  }

  return true
}

// Execute migration
executeMigration()
