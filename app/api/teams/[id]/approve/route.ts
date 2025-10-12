import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

const approveTeamSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional()
})

type ApproveTeamData = z.infer<typeof approveTeamSchema>

// POST /api/teams/[id]/approve - Approve or reject team
export async function POST(
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
    const validatedData = approveTeamSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        team_registrations!original_registration_id (
          id,
          user_id,
          status
        )
      `)
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Only student teams can be approved/rejected
    if (team.team_type !== 'student_registered') {
      return NextResponse.json(
        { error: "Only student teams can be approved or rejected" },
        { status: 400 }
      )
    }

    // Check if team is in pending state
    if (team.status !== 'pending_approval') {
      return NextResponse.json(
        { error: "Team is not in pending approval state" },
        { status: 400 }
      )
    }

    let newStatus: string
    let registrationStatus: string

    if (validatedData.action === 'approve') {
      newStatus = 'active'
      registrationStatus = 'approved'
    } else {
      newStatus = 'rejected'
      registrationStatus = 'rejected'
    }

    // Update team status
    const { data: updatedTeam, error: updateTeamError } = await supabase
      .from('teams')
      .update({
        status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single()

    if (updateTeamError) {
      console.error('Update team status error:', updateTeamError)
      return NextResponse.json(
        { error: "Failed to update team status" },
        { status: 500 }
      )
    }

    // Update original registration status
    if (team.team_registrations && team.team_registrations.length > 0) {
      const registrationId = team.team_registrations[0].id
      
      const { error: updateRegError } = await supabase
        .from('team_registrations')
        .update({
          status: registrationStatus,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          admin_notes: validatedData.reason ? 
            (team.team_registrations[0].admin_notes || '') + 
            (team.team_registrations[0].admin_notes ? ' | ' : '') + 
            validatedData.reason : 
            team.team_registrations[0].admin_notes
        })
        .eq('id', registrationId)

      if (updateRegError) {
        console.error('Update registration status error:', updateRegError)
        // Rollback team update
        await supabase
          .from('teams')
          .update({
            status: 'pending_approval',
            approved_by: null,
            approved_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamId)
        
        return NextResponse.json(
          { error: "Failed to update registration status" },
          { status: 500 }
        )
      }
    }

    // Fetch complete team data
    const { data: completeTeam, error: fetchError } = await supabase
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

    if (fetchError) {
      console.error('Fetch team error:', fetchError)
      return NextResponse.json(
        { error: "Failed to fetch updated team" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      team: completeTeam,
      message: `Team ${validatedData.action === 'approve' ? 'approved' : 'rejected'} successfully`
    })

  } catch (error) {
    console.error('Approve team error:', error)
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
