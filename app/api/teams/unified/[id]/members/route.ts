import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser, requireAdmin } from "@/lib/auth"
import { z } from "zod"

const teamMemberSchema = z.object({
  member_name: z.string().min(1, "Member name is required"),
  member_contact: z.string().optional(),
  member_position: z.string().optional(),
  member_order: z.number().int().min(0),
  is_captain: z.boolean().default(false),
  is_substitute: z.boolean().default(false)
})

const updateTeamMembersSchema = z.object({
  members: z.array(teamMemberSchema)
})

type TeamMemberData = z.infer<typeof teamMemberSchema>
type UpdateTeamMembersData = z.infer<typeof updateTeamMembersSchema>

// GET /api/teams/unified/[id]/members - Get team members
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

    // Check if team exists and user has access
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, team_type, status, original_registration_id')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Check access permissions
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

    // Get team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('member_order', { ascending: true })

    if (membersError) {
      console.error('Get team members error:', membersError)
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      members: members || [],
      count: members?.length || 0
    })

  } catch (error) {
    console.error('Get team members error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/teams/unified/[id]/members - Update team members
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
    const validatedData = updateTeamMembersSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Check if team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, team_type')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Delete existing members
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)

    if (deleteError) {
      console.error('Delete team members error:', deleteError)
      return NextResponse.json(
        { error: "Failed to update team members" },
        { status: 500 }
      )
    }

    // Insert new members
    if (validatedData.members.length > 0) {
      const members = validatedData.members.map((member, index) => ({
        ...member,
        team_id: teamId,
        member_order: member.member_order || index,
        created_at: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('team_members')
        .insert(members)

      if (insertError) {
        console.error('Insert team members error:', insertError)
        return NextResponse.json(
          { error: "Failed to update team members" },
          { status: 500 }
        )
      }
    }

    // Update team member count
    const { error: updateTeamError } = await supabase
      .from('teams')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)

    if (updateTeamError) {
      console.error('Update team error:', updateTeamError)
      // Don't fail the request for this
    }

    // Fetch updated members
    const { data: members, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('member_order', { ascending: true })

    if (fetchError) {
      console.error('Fetch team members error:', fetchError)
      return NextResponse.json(
        { error: "Failed to fetch updated team members" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      members: members || [],
      count: members?.length || 0,
      message: "Team members updated successfully"
    })

  } catch (error) {
    console.error('Update team members error:', error)
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
