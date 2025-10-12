import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireModerator } from "@/lib/auth"

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const status = searchParams.get("status")
    const sport = searchParams.get("sport")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    
    // Try to get fixtures using RPC function first, fallback to direct query
    let fixtures, error
    
    try {
      const rpcResult = await supabase
        .rpc('get_moderator_fixtures', {
          p_user_id: user.id,
          p_status: status,
          p_sport_name: sport,
          p_limit: limit,
          p_offset: offset
        })
      
      fixtures = rpcResult.data
      error = rpcResult.error
    } catch (rpcError) {
      // RPC function doesn't exist yet, use fallback
      console.log("RPC function not found, using fallback query method")
      
      let query = supabase
        .from('fixtures')
        .select(`
          *,
          sport:sports(id, name, icon),
          team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
          team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
          updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
        `)
        .order('scheduled_at', { ascending: true })
        .range(offset, offset + limit - 1)
      
      // Apply status filter
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }
      
      // Apply sport filter
      if (sport && sport !== 'all') {
        query = query.eq('sport_id', sport)
      }
      
      // For moderators (non-admins), check their assignments
      if (profile.role !== 'admin') {
        // Check if moderator assignment columns exist
        const { data: profileData } = await supabase
          .from('profiles')
          .select('assigned_sports, assigned_venues')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          const assignedSports = profileData.assigned_sports || []
          const assignedVenues = profileData.assigned_venues || []
          
          // If moderator has specific assignments, filter by them
          if (assignedSports.length > 0) {
            query = query.in('sport_id', assignedSports)
          } else {
            // If moderator has no assigned sports, return empty result
            fixtures = []
            error = null
            return
          }
          
          if (assignedVenues.length > 0) {
            query = query.in('venue', assignedVenues)
          }
        } else {
          // If no profile data found, return empty result for safety
          fixtures = []
          error = null
          return
        }
      }
      
      const fallbackResult = await query
      fixtures = fallbackResult.data
      error = fallbackResult.error
    }

    if (error) {
      console.error("Error fetching moderator fixtures:", error)
      return NextResponse.json(
        { error: "Failed to fetch fixtures: " + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      fixtures: fixtures || [],
      total: fixtures?.length || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error("Error in moderator fixtures API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
