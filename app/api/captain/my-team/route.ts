import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const generalUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  logo_url: z.string().url().or(z.literal("")).optional(),
  color: z.string().optional(),
  captain_contact: z.string().optional(),
  captain_email: z.string().email().optional()
})

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Find team where current user's email matches captain_email (case insensitive)
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        sports:sport_id ( id, name, icon ),
        team_members (*)
      `)
      .eq('team_type', 'student_registered')
      .eq('status', 'active')
      .ilike('captain_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !team) {
      return NextResponse.json({ error: "No team found for current user as captain" }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (err) {
    console.error('Captain my-team GET error:', err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const updates = generalUpdateSchema.parse(body)

    // Find team where current user's email matches captain_email (case insensitive)
    const { data: team } = await supabase
      .from('teams')
      .select('id, status')
      .eq('team_type', 'student_registered')
      .eq('status', 'active')
      .ilike('captain_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!team) {
      return NextResponse.json({ error: "No team found for current user as captain" }, { status: 404 })
    }

    // Clean up empty strings to null for optional fields
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [
        key, 
        value === "" ? null : value
      ])
    )

    // General settings can be updated directly by captain
    const { data: updated, error: updateError } = await supabase
      .from('teams')
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
      .eq('id', team.id)
      .select()
      .single()

    if (updateError) {
      console.error('Captain my-team PUT error:', updateError)
      return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
    }

    return NextResponse.json({ team: updated, message: 'Team updated successfully' })
  } catch (err) {
    console.error('Captain my-team PUT error:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


