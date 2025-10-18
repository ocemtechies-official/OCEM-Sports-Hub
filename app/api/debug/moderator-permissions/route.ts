import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireModerator } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, profile } = await requireModerator()
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const supabase = await getSupabaseServerClient()

    // Get detailed user profile information
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Check if helper functions exist
    const { data: functions } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public')
      .in('routine_name', ['is_admin_user', 'is_moderator_user'])

    // Check RLS policies for fixtures
    const { data: policies } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, permissive, qual, with_check')
      .eq('schemaname', 'public')
      .eq('tablename', 'fixtures')

    // Get sports the user is assigned to
    let assignedSportsData: any[] = []
    if (profileData?.assigned_sports && Array.isArray(profileData.assigned_sports)) {
      const { data: sportsData } = await supabase
        .from('sports')
        .select('id, name, icon')
        .in('name', profileData.assigned_sports)
      assignedSportsData = sportsData || []
    }

    // Test fixture update permissions by checking a sample fixture
    let sampleFixtureTest = null
    const { data: sampleFixture } = await supabase
      .from('fixtures')
      .select('id, sport_id, status, venue')
      .limit(1)
      .single()

    if (sampleFixture) {
      // Try a test query to see if user can select for update
      const { data: testUpdate, error: testError } = await supabase
        .from('fixtures')
        .select('id, team_a_score, team_b_score')
        .eq('id', sampleFixture.id)
        .maybeSingle()
      
      sampleFixtureTest = {
        fixtureId: sampleFixture.id,
        canSelect: !testError,
        error: testError?.message || null
      }
    }

    // Check if user can insert match updates
    let matchUpdatesTest = null
    try {
      const { error: matchUpdateError } = await supabase
        .from('match_updates')
        .insert({
          fixture_id: 'test',
          update_type: 'test',
          created_by: user.id,
          prev_team_a_score: 0,
          prev_team_b_score: 0,
          new_team_a_score: 0,
          new_team_b_score: 0,
          prev_status: 'test',
          new_status: 'test'
        })
      
      matchUpdatesTest = {
        canInsert: !matchUpdateError,
        error: matchUpdateError?.message || null
      }
    } catch (e) {
      matchUpdatesTest = {
        canInsert: false,
        error: 'Failed to test match updates insert'
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email,
          role: profileData?.role || 'unknown'
        },
        profile: {
          full_name: profileData?.full_name,
          role: profileData?.role,
          assigned_sports: profileData?.assigned_sports || [],
          assigned_venues: profileData?.assigned_venues || [],
          moderator_notes: profileData?.moderator_notes
        },
        permissions: {
          is_admin: profile?.role === 'admin',
          is_moderator: ['admin', 'moderator'].includes(profile?.role || ''),
          assigned_sports_count: profileData?.assigned_sports?.length || 0,
          assigned_venues_count: profileData?.assigned_venues?.length || 0
        },
        database: {
          helper_functions: functions || [],
          rls_policies: policies || [],
          assigned_sports_details: assignedSportsData
        },
        tests: {
          sample_fixture: sampleFixtureTest,
          match_updates: matchUpdatesTest
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: "Debug check failed",
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireModerator()
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fixtureId } = body

    if (!fixtureId) {
      return NextResponse.json(
        { error: "Fixture ID required" },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServerClient()

    // Test actual fixture update permissions
    const { data: fixture, error: fixtureError } = await supabase
      .from('fixtures')
      .select(`
        id, sport_id, venue, status, team_a_score, team_b_score,
        sport:sports!inner(name)
      `)
      .eq('id', fixtureId)
      .single()

    if (fixtureError || !fixture) {
      return NextResponse.json({
        success: false,
        error: "Fixture not found",
        details: fixtureError?.message
      })
    }

    // Test update permission by trying a no-op update
    const { data: updateTest, error: updateError } = await supabase
      .from('fixtures')
      .update({ 
        team_a_score: fixture.team_a_score,
        team_b_score: fixture.team_b_score 
      })
      .eq('id', fixtureId)
      .select('id')
      .maybeSingle()

    return NextResponse.json({
      success: true,
      test_results: {
        fixture: {
          id: fixture.id,
          sport_name: (fixture.sport as any)?.name || 'Unknown',
          venue: fixture.venue,
          status: fixture.status
        },
        permissions: {
          can_update: !updateError && !!updateTest,
          error: updateError?.message || null,
          error_code: updateError?.code || null
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Debug POST error:', error)
    return NextResponse.json(
      { 
        error: "Permission test failed",
        details: error.message
      },
      { status: 500 }
    )
  }
}