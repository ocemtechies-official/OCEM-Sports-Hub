import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    const { data: fixture, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        sport:sports(*),
        team_a:teams!fixtures_team_a_id_fkey(*),
        team_b:teams!fixtures_team_b_id_fkey(*)
      `)
      .eq('id', resolvedParams.id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching fixture:', error)
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 })
    }

    return NextResponse.json({ data: fixture })
  } catch (error) {
    console.error('Error in GET /api/admin/fixtures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    
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
      venue, 
      status
      // IMPORTANT: Do not destructure team_a_score or team_b_score
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
    
    // Validate fixture ID
    if (!resolvedParams.id || resolvedParams.id === "null" || resolvedParams.id === "") {
      return NextResponse.json({ 
        error: 'Invalid fixture ID provided' 
      }, { status: 400 });
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

    // First, check if the fixture exists and is not deleted
    const { data: existingFixture, error: fetchError } = await supabase
      .from('fixtures')
      .select('id')
      .eq('id', resolvedParams.id)
      .is('deleted_at', null)
      .single()
    
    // Handle the case where no record is found
    if (fetchError) {
      // Check if it's a "record not found" error
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Fixture not found or already deleted' 
        }, { status: 404 });
      } else {
        // It's a different error
        console.error('Error fetching fixture:', fetchError);
        return NextResponse.json({ 
          error: 'Database error while checking fixture', 
          details: fetchError.message || fetchError,
          code: fetchError.code
        }, { status: 500 });
      }
    }
    
    if (!existingFixture) {
      return NextResponse.json({ 
        error: 'Fixture not found or already deleted' 
      }, { status: 404 });
    }
    
    // Try to parse the date to ensure it's valid
    // Handle different date formats that might come from the frontend
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

    // Build update data object - only include fields that are provided
    const updateData: any = {
      sport_id,
      team_a_id,
      team_b_id,
      scheduled_at: parsedDate.toISOString(),
      updated_at: new Date().toISOString() // Always set updated_at to current time
    }
    
    // Handle venue - only include if explicitly provided
    if (venue !== undefined) {
      // Ensure we're not setting venue to the string "null"
      if (venue === "null") {
        updateData.venue = null;
      } else if (venue === null || venue === "") {
        updateData.venue = null;
      } else {
        updateData.venue = venue;
      }
    }
    
    // Handle status - only include if explicitly provided
    if (status !== undefined) {
      // Ensure we're not setting status to the string "null"
      if (status === "null") {
        updateData.status = "scheduled";
      } else if (status === null || status === "") {
        updateData.status = "scheduled";
      } else {
        updateData.status = status;
      }
    }
    
    // Explicitly ensure we're not setting any field to the string "null"
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === "null") {
        updateData[key] = null;
      }
    });
    
    // Ensure we never try to update deleted_at
    if ('deleted_at' in updateData) {
      delete updateData.deleted_at;
    }
    
    // Perform the update
    const { data: updateResult, error: updateError } = await supabase
      .from('fixtures')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .is('deleted_at', null)
      
    if (updateError) {
      console.error('Error updating fixture:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update fixture', 
        details: updateError,
        updateData: updateData 
      }, { status: 500 })
    }

    // Now fetch the updated fixture
    const { data: fixture, error: selectError } = await supabase
      .from('fixtures')
      .select(`
        *,
        sport:sports(*),
        team_a:teams!fixtures_team_a_id_fkey(*),
        team_b:teams!fixtures_team_b_id_fkey(*)
      `)
      .eq('id', resolvedParams.id)
      .is('deleted_at', null)
      .single()

    if (selectError) {
      console.error('Error fetching updated fixture:', selectError)
      return NextResponse.json({ 
        error: 'Failed to fetch updated fixture', 
        details: selectError
      }, { status: 500 })
    }

    return NextResponse.json({ 
      data: fixture,
      message: 'Fixture updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/fixtures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // First, check if the fixture exists (including deleted ones)
    // This helps us provide more specific error messages
    const { data: anyFixture, error: anyFixtureError } = await supabase
      .from('fixtures')
      .select('id, deleted_at')
      .eq('id', resolvedParams.id)

    if (anyFixtureError) {
      console.error('Error fetching fixture:', anyFixtureError)
      return NextResponse.json({ error: 'Database error while checking fixture' }, { status: 500 })
    }

    // If no fixture found at all
    if (!anyFixture || anyFixture.length === 0) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 })
    }

    // If fixture is already deleted
    if (anyFixture[0].deleted_at !== null) {
      return NextResponse.json({ error: 'Fixture already deleted' }, { status: 404 })
    }

    // Now try to soft delete the fixture using our stored procedure
    const { data, error } = await supabase
      .rpc('soft_delete_fixture', { fixture_id: resolvedParams.id })

    if (error) {
      console.error('Error soft deleting fixture:', error)
      return NextResponse.json({ error: 'Failed to delete fixture' }, { status: 500 })
    }

    // The function should return true if successful
    if (data !== true) {
      return NextResponse.json({ error: 'Fixture not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Fixture deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/fixtures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}