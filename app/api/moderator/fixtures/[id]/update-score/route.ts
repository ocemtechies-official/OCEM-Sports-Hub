import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireModerator } from "@/lib/auth"
import { z } from "zod"

const updateScoreSchema = z.object({
  team_a_score: z.number().int().min(0),
  team_b_score: z.number().int().min(0),
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled']),
  expected_version: z.number().int().min(1),
  note: z.string().max(500).optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is moderator or admin
    const { user, profile, isModerator } = await requireModerator()
    
    if (!user || !isModerator) {
      return NextResponse.json(
        { error: "Unauthorized - Moderator access required" },
        { status: 401 }
      )
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    
    // Validate request body
    const validatedData = updateScoreSchema.parse(body)
    
    const {
      team_a_score,
      team_b_score,
      status,
      expected_version,
      note
    } = validatedData

    // Try to call the RPC function first (if it exists)
    let updatedFixture, error
    
    try {
      const rpcResult = await supabase
        .rpc('rpc_update_fixture_score', {
          p_fixture: params.id,
          p_team_a_score: team_a_score,
          p_team_b_score: team_b_score,
          p_status: status,
          p_expected_version: expected_version,
          p_note: note || null
        })
      
      updatedFixture = rpcResult.data
      error = rpcResult.error
    } catch (rpcError) {
      // RPC function doesn't exist yet, fall back to direct update
      console.log("RPC function not found, using fallback update method")
      
      // Check if user is admin or has permission to update this fixture
      if (profile.role !== 'admin') {
        // For moderators, check if they're assigned to this fixture's sport
        const { data: fixture } = await supabase
          .from('fixtures')
          .select('sport_id, venue')
          .eq('id', params.id)
          .single()
        
        if (!fixture) {
          return NextResponse.json(
            { error: "Fixture not found" },
            { status: 404 }
          )
        }
        
        // Check moderator assignments (if columns exist)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('assigned_sports, assigned_venues')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          const assignedSports = profileData.assigned_sports || []
          const assignedVenues = profileData.assigned_venues || []
          
          // If moderator has specific assignments, check them
          if (assignedSports.length > 0 && !assignedSports.includes(fixture.sport_id)) {
            return NextResponse.json(
              { error: "You are not authorized to update this fixture" },
              { status: 403 }
            )
          }
          
          if (assignedVenues.length > 0 && !assignedVenues.includes(fixture.venue)) {
            return NextResponse.json(
              { error: "You are not authorized to update this fixture" },
              { status: 403 }
            )
          }
        }
      }
      
      // Direct update fallback
      let winnerId = null
      if (status === 'completed') {
        if (team_a_score > team_b_score) {
          // Get team_a_id for winner
          const { data: fixtureData } = await supabase
            .from('fixtures')
            .select('team_a_id')
            .eq('id', params.id)
            .single()
          winnerId = fixtureData?.team_a_id
        } else if (team_b_score > team_a_score) {
          // Get team_b_id for winner
          const { data: fixtureData } = await supabase
            .from('fixtures')
            .select('team_b_id')
            .eq('id', params.id)
            .single()
          winnerId = fixtureData?.team_b_id
        }
      }
      
      const updateData: any = {
        team_a_score,
        team_b_score,
        status,
        winner_id: winnerId,
        updated_at: new Date().toISOString()
      }
      
      // Add updated_by and version if columns exist
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'fixtures')
        .eq('table_schema', 'public')
        .in('column_name', ['updated_by', 'version'])
      
      if (columns?.some(col => col.column_name === 'updated_by')) {
        updateData.updated_by = user.id
      }
      
      if (columns?.some(col => col.column_name === 'version')) {
        updateData.version = expected_version + 1
      }
      
      const updateResult = await supabase
        .from('fixtures')
        .update(updateData)
        .eq('id', params.id)
        .select(`
          *,
          sport:sports(id, name, icon),
          team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
          team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
          updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
        `)
        .single()
      
      updatedFixture = updateResult.data
      error = updateResult.error
    }

    if (error) {
      console.error("Error updating fixture score:", error)
      
      // Handle specific error cases
      if (error.message.includes('version_mismatch')) {
        return NextResponse.json(
          { error: "Fixture was updated by another user. Please refresh and try again." },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json(
          { error: "Too many updates. Please wait a few minutes before updating again." },
          { status: 429 }
        )
      }
      
      if (error.message.includes('Not authorized')) {
        return NextResponse.json(
          { error: "You are not authorized to update this fixture." },
          { status: 403 }
        )
      }
      
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: "Insufficient permissions to update fixtures." },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to update fixture score: " + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      fixture: updatedFixture,
      message: "Score updated successfully"
    })
  } catch (error) {
    console.error("Error in update score API:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
