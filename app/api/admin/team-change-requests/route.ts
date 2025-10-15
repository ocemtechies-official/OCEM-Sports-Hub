import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()

    // Get all pending team change requests
    const { data: requests, error } = await supabase
      .from('team_change_requests')
      .select(`
        *,
        teams (
          id,
          name,
          captain_name,
          captain_email,
          team_members (*)
        ),
        requested_by_profile:profiles!team_change_requests_requested_by_fkey (
          id,
          full_name,
          email
        ),
        approved_by_profile:profiles!team_change_requests_approved_by_fkey (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get team change requests error:', error)
      return NextResponse.json({ error: "Failed to fetch change requests" }, { status: 500 })
    }

    return NextResponse.json({ requests: requests || [] })
  } catch (err) {
    console.error('Admin team change requests GET error:', err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
