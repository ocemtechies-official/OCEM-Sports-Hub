import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser, requireAdmin } from "@/lib/auth"
import { z } from "zod"

// Unified team schema
const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  team_type: z.enum(['official', 'student_registered']).default('official'),
  sport_id: z.string().uuid().optional(),
  department: z.string().optional(),
  semester: z.string().optional(),
  gender: z.string().optional(),
  captain_name: z.string().optional(),
  captain_contact: z.string().optional(),
  captain_email: z.string().email().optional(),
  logo_url: z.string().url().optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'pending_approval', 'rejected', 'inactive']).default('active')
})

const teamMemberSchema = z.object({
  member_name: z.string().min(1, "Member name is required"),
  member_contact: z.string().optional(),
  member_position: z.string().optional(),
  member_order: z.number().int().min(0),
  is_captain: z.boolean().default(false),
  is_substitute: z.boolean().default(false)
})

const createTeamSchema = teamSchema.extend({
  members: z.array(teamMemberSchema).optional()
})

type TeamData = z.infer<typeof teamSchema>
type TeamMemberData = z.infer<typeof teamMemberSchema>
type CreateTeamData = z.infer<typeof createTeamSchema>

// GET /api/teams/unified - Get all teams with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const teamType = url.searchParams.get('type') // 'all', 'official', 'student'
    const sportId = url.searchParams.get('sport_id')
    const status = url.searchParams.get('status')
    const includeMembers = url.searchParams.get('include_members') === 'true'

    let query = supabase
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
        )
        ${includeMembers ? ', team_members (*)' : ''}
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (teamType && teamType !== 'all') {
      if (teamType === 'official') {
        query = query.eq('team_type', 'official')
      } else if (teamType === 'student') {
        query = query.eq('team_type', 'student_registered')
      }
    }

    if (sportId) {
      query = query.eq('sport_id', sportId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Non-admin users can only see active teams and their own student teams
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      query = query.or(`status.eq.active,team_type.eq.student_registered`)
    }

    const { data: teams, error } = await query

    if (error) {
      console.error('Get teams error:', error)
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      teams: teams || [],
      count: teams?.length || 0
    })

  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/teams/unified - Create new team
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createTeamSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Start transaction
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        ...validatedData,
        source_type: 'admin_created',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (teamError) {
      console.error('Create team error:', teamError)
      return NextResponse.json(
        { error: "Failed to create team" },
        { status: 500 }
      )
    }

    // Add team members if provided
    if (validatedData.members && validatedData.members.length > 0) {
      const members = validatedData.members.map((member, index) => ({
        ...member,
        team_id: team.id,
        member_order: member.member_order || index,
        created_at: new Date().toISOString()
      }))

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(members)

      if (membersError) {
        console.error('Create team members error:', membersError)
        // Rollback team creation
        await supabase.from('teams').delete().eq('id', team.id)
        return NextResponse.json(
          { error: "Failed to create team members" },
          { status: 500 }
        )
      }
    }

    // Fetch the complete team with members
    const { data: completeTeam, error: fetchError } = await supabase
      .from('teams')
      .select(`
        *,
        sports:sport_id (
          id,
          name,
          icon
        ),
        team_members (*)
      `)
      .eq('id', team.id)
      .single()

    if (fetchError) {
      console.error('Fetch team error:', fetchError)
      return NextResponse.json(
        { error: "Failed to fetch created team" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      team: completeTeam,
      message: "Team created successfully"
    })

  } catch (error) {
    console.error('Create team error:', error)
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
