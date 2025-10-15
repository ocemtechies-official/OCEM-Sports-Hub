import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Find captain's team
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('team_type', 'student_registered')
      .eq('status', 'active')
      .ilike('captain_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!team) {
      return NextResponse.json({ requests: [] })
    }

    const { data: requests, error } = await supabase
      .from('team_change_requests')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    return NextResponse.json({ requests: requests || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


