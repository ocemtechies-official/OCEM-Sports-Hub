import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

// POST /api/admin/fixtures - Create a new fixture
export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      sport_id, 
      team_a_id, 
      team_b_id, 
      scheduled_at, 
      venue
    } = body

    // Validate required fields
    if (!sport_id || !team_a_id || !team_b_id || !scheduled_at) {
      return NextResponse.json({ 
        error: 'Missing required fields: sport_id, team_a_id, team_b_id, scheduled_at' 
      }, { status: 400 })
    }

    // Validate that teams are different
    if (team_a_id === team_b_id) {
      return NextResponse.json({ 
        error: 'Team A and Team B must be different' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Validate that both teams belong to the selected sport
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, sport_id')
      .in('id', [team_a_id, team_b_id])

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return NextResponse.json({ 
        error: 'Failed to validate teams' 
      }, { status: 500 })
    }

    // Check if both teams were found
    if (teamsData.length !== 2) {
      return NextResponse.json({ 
        error: 'One or both teams not found' 
      }, { status: 400 })
    }

    // Check if both teams belong to the selected sport
    const teamASport = teamsData.find(team => team.id === team_a_id)?.sport_id
    const teamBSport = teamsData.find(team => team.id === team_b_id)?.sport_id

    if (teamASport !== sport_id || teamBSport !== sport_id) {
      return NextResponse.json({ 
        error: 'Both teams must belong to the selected sport' 
      }, { status: 400 })
    }

    // Try to parse the date to ensure it's valid
    let parsedDate: Date;
    if (typeof scheduled_at === 'string') {
      // Try parsing as ISO string first
      parsedDate = new Date(scheduled_at);
      
      // If that fails, try with appended seconds (for datetime-local inputs)
      if (isNaN(parsedDate.getTime()) && scheduled_at.length === 16) {
        // Format: YYYY-MM-DDTHH:mm
        const withSeconds = scheduled_at + ":00";
        parsedDate = new Date(withSeconds);
      }
      
      // If still invalid, try with Z suffix
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(scheduled_at + "Z");
      }
      
      // Additional check for "null" string
      if (scheduled_at === "null") {
        return NextResponse.json({ 
          error: 'scheduled_at cannot be null' 
        }, { status: 400 })
      }
    } else {
      parsedDate = new Date(scheduled_at);
    }
    
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ 
        error: 'scheduled_at must be a valid ISO date string' 
      }, { status: 400 })
    }

    // Create the fixture
    const fixtureData = {
      sport_id,
      team_a_id,
      team_b_id,
      scheduled_at: parsedDate.toISOString(),
      venue: venue || null,
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdFixture, error: createError } = await supabase
      .from('fixtures')
      .insert(fixtureData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating fixture:', createError)
      return NextResponse.json({ 
        error: 'Failed to create fixture', 
        details: createError.message || createError 
      }, { status: 500 })
    }

    // Now fetch the complete fixture data with related information
    const { data: completeFixture, error: fetchError } = await supabase
      .from('fixtures')
      .select(`
        *,
        sport:sports(*),
        team_a:teams!fixtures_team_a_id_fkey(*),
        team_b:teams!fixtures_team_b_id_fkey(*)
      `)
      .eq('id', createdFixture.id)
      .single()

    if (fetchError) {
      console.error('Error fetching created fixture:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch created fixture', 
        details: fetchError.message || fetchError 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      data: completeFixture,
      message: 'Fixture created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/admin/fixtures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}