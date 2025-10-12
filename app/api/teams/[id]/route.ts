import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser, requireAdmin } from "@/lib/auth"
import { z } from "zod"

const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").optional(),
  sport_id: z.string().uuid().optional(),
  department: z.string().optional(),
  semester: z.string().optional(),
  gender: z.string().optional(),
  captain_name: z.string().optional(),
  captain_contact: z.string().optional(),
  captain_email: z.string().email().optional(),
  logo_url: z.string().url().optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'pending_approval', 'rejected', 'inactive']).optional()
})

type UpdateTeamData = z.infer<typeof updateTeamSchema>

// GET /api/teams/[id] - Get specific team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const teamId = params.id

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        sports:sport_id (
          id,
          name,
          icon
        ),
        approved_by_profile:approved_by (
          id,
          full_name
        ),
        team_members (*)
      `)
      .eq('id', teamId)
      .single()

    if (error) {
      console.error('Get team error:', error)
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Check if user can access this team
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Non-admin users can only see active teams and their own student teams
      if (team.status !== 'active' && team.team_type !== 'student_registered') {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }

      // For student teams, check if user owns the registration
      if (team.team_type === 'student_registered') {
        const { data: registration } = await supabase
          .from('team_registrations')
          .select('user_id')
          .eq('id', team.original_registration_id)
          .single()

        if (registration?.user_id !== user.id) {
          return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
          )
        }
      }
    }

    return NextResponse.json({ team })

  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/teams/[id] - Update team
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const teamId = params.id
    const body = await request.json()
    const validatedData = updateTeamSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Check if team exists
    const { data: existingTeam, error: fetchError } = await supabase
      .from('teams')
      .select('id, team_type')
      .eq('id', teamId)
      .single()

    if (fetchError || !existingTeam) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Update team
    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single()

    if (updateError) {
      console.error('Update team error:', updateError)
      return NextResponse.json(
        { error: "Failed to update team" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      team,
      message: "Team updated successfully"
    })

  } catch (error) {
    console.error('Update team error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id] - Delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const teamId = params.id
    const supabase = await getSupabaseServerClient()

    // Check if team exists
    const { data: existingTeam, error: fetchError } = await supabase
      .from('teams')
      .select('id, team_type')
      .eq('id', teamId)
      .single()

    if (fetchError || !existingTeam) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Delete team (cascade will handle team_members)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (deleteError) {
      console.error('Delete team error:', deleteError)
      return NextResponse.json(
        { error: "Failed to delete team" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Team deleted successfully"
    })

  } catch (error) {
    console.error('Delete team error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
