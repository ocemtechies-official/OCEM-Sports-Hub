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
    const days = parseInt(searchParams.get("days") || "30")
    
    // Try to get stats using RPC function first, fallback to direct queries
    let stats, error, assignments, assignmentsError
    
    try {
      const statsResult = await supabase
        .rpc('get_moderator_stats', {
          p_user_id: user.id,
          p_days: days
        })
      
      stats = statsResult.data
      error = statsResult.error
    } catch (rpcError) {
      // RPC function doesn't exist yet, use fallback
      console.log("RPC function not found, using fallback stats method")
      
      // Get basic stats from match_updates table if it exists
      const { data: matchUpdates, error: matchUpdatesError } = await supabase
        .from('match_updates')
        .select('*', { count: 'exact' })
        .eq('changed_by', user.id)
        .gte('change_time', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      
      if (matchUpdatesError) {
        // match_updates table doesn't exist yet
        stats = {
          total_updates: 0,
          updates_last_7_days: 0,
          updates_last_30_days: 0,
          most_active_sport: null,
          average_response_time: null
        }
      } else {
        stats = {
          total_updates: matchUpdates?.length || 0,
          updates_last_7_days: matchUpdates?.filter(update => 
            new Date(update.change_time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length || 0,
          updates_last_30_days: matchUpdates?.length || 0,
          most_active_sport: null,
          average_response_time: null
        }
      }
    }

    try {
      const assignmentsResult = await supabase
        .rpc('get_moderator_assignments', {
          p_user_id: user.id
        })
      
      assignments = assignmentsResult.data
      assignmentsError = assignmentsResult.error
    } catch (rpcError) {
      // RPC function doesn't exist yet, use fallback
      console.log("RPC function not found, using fallback assignments method")
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('assigned_sports, assigned_venues')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        assignments = { assigned_sports: [], assigned_venues: [] }
      } else {
        assignments = {
          assigned_sports: profileData?.assigned_sports || [],
          assigned_venues: profileData?.assigned_venues || []
        }
      }
    }

    if (error) {
      console.error("Error fetching moderator stats:", error)
      return NextResponse.json(
        { error: "Failed to fetch stats: " + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      stats: stats || {},
      assignments: assignments || {},
      user: {
        id: user.id,
        name: profile?.full_name,
        role: profile?.role
      }
    })
  } catch (error) {
    console.error("Error in moderator stats API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
