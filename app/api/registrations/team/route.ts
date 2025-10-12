import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for team registration
const teamRegistrationSchema = z.object({
  sportId: z.string().min(1),
  teamName: z.string().min(3, "Team name must be at least 3 characters"),
  department: z.string().min(1, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
  gender: z.enum(['male', 'female', 'other', 'mixed']),
  captainName: z.string().min(2, "Captain name is required"),
  captainContact: z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit phone number"),
  captainEmail: z.string().email("Must be a valid email address"),
  members: z.array(z.string().min(2, "Member name is required")).min(1, "At least one member is required")
})

type TeamRegistrationData = z.infer<typeof teamRegistrationSchema>

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData = teamRegistrationSchema.parse(body)

    // Map sport identifiers to proper names
    const sportNameMap: Record<string, string> = {
      'cricket': 'Cricket',
      'football': 'Football',
      'basketball': 'Basketball',
      'volleyball': 'Volleyball',
      'tug-of-war': 'Tug of War',
      'table-tennis': 'Table Tennis',
      'badminton': 'Badminton',
      'chess': 'Chess',
      'quiz': 'Quiz'
    }

    const sportName = sportNameMap[validatedData.sportId] || validatedData.sportId

    // Look up sport UUID from sport name
    const { data: sport, error: sportError } = await supabase
      .from('sports')
      .select('id')
      .eq('name', sportName)
      .single()
      
    if (sportError || !sport) {
        return NextResponse.json(
          { error: 'Invalid sport specified' },
          { status: 400 }
        )
    }
      
    const sportUuid = sport.id

    // Check if user can register for this sport
    const { data: canRegister } = await supabase
      .rpc('can_register_for_sport', {
        sport_uuid: sportUuid,
        reg_type: 'team'
      })

    if (!canRegister) {
      return NextResponse.json(
        { error: 'Registration not allowed for this sport at this time' },
        { status: 400 }
      )
    }

    // Check for existing registration
    const { data: existingRegistration } = await supabase
      .from('team_registrations')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('sport_id', sportUuid)
      .single()

    if (existingRegistration && existingRegistration.status !== 'rejected' && existingRegistration.status !== 'withdrawn') {
      return NextResponse.json(
        { error: 'You have already registered a team for this sport' },
        { status: 400 }
      )
    }

    // Get sport settings to validate team size
    const { data: sportSettings } = await supabase
      .from('registration_settings')
      .select('min_team_size, max_team_size')
      .eq('sport_id', sportUuid)
      .single()

    if (sportSettings) {
      const memberCount = validatedData.members.length
      if (sportSettings.min_team_size && memberCount < sportSettings.min_team_size) {
        return NextResponse.json(
          { error: `Team must have at least ${sportSettings.min_team_size} members` },
          { status: 400 }
        )
      }
      if (sportSettings.max_team_size && memberCount > sportSettings.max_team_size) {
        return NextResponse.json(
          { error: `Team cannot have more than ${sportSettings.max_team_size} members` },
          { status: 400 }
        )
      }
    }

    // Start transaction for team registration
    const { data: registration, error: registrationError } = await supabase
      .from('team_registrations')
      .insert({
        user_id: user.id,
        sport_id: sportUuid,
        team_name: validatedData.teamName,
        department: validatedData.department,
        semester: validatedData.semester,
        gender: validatedData.gender,
        captain_name: validatedData.captainName,
        captain_contact: validatedData.captainContact,
        captain_email: validatedData.captainEmail,
        required_members: validatedData.members.length,
        registered_members: validatedData.members.length,
        status: 'pending'
      })
      .select()
      .single()

    if (registrationError) {
      console.error('Create team registration error:', registrationError)
      return NextResponse.json(
        { error: 'Failed to create team registration' },
        { status: 500 }
      )
    }

    // Create team in unified teams table
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: validatedData.teamName,
        team_type: 'student_registered',
        source_type: 'student_registration',
        sport_id: sportUuid,
        department: validatedData.department,
        semester: validatedData.semester,
        gender: validatedData.gender,
        captain_name: validatedData.captainName,
        captain_contact: validatedData.captainContact,
        captain_email: validatedData.captainEmail,
        status: 'pending_approval',
        original_registration_id: registration.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (teamError) {
      console.error('Create team error:', teamError)
      // Rollback registration
      await supabase.from('team_registrations').delete().eq('id', registration.id)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    // Update registration with team reference
    const { error: updateRegError } = await supabase
      .from('team_registrations')
      .update({
        official_team_id: team.id
      })
      .eq('id', registration.id)

    if (updateRegError) {
      console.error('Update registration error:', updateRegError)
      // Don't fail the request for this
    }

    // Insert team members in registration table
    const membersToInsert = validatedData.members.map((memberName, index) => ({
      team_registration_id: registration.id,
      member_name: memberName,
      member_order: index + 1,
      is_captain: index === 0 // First member is typically the captain
    }))

    const { error: membersError } = await supabase
      .from('team_registration_members')
      .insert(membersToInsert)

    if (membersError) {
      console.error('Team members error:', membersError)
      // Rollback team and registration
      await supabase.from('teams').delete().eq('id', team.id)
      await supabase.from('team_registrations').delete().eq('id', registration.id)
      return NextResponse.json(
        { error: 'Failed to register team members' },
        { status: 500 }
      )
    }

    // Insert team members in unified teams table
    const teamMembersToInsert = validatedData.members.map((memberName, index) => ({
      team_id: team.id,
      member_name: memberName,
      member_order: index + 1,
      is_captain: index === 0, // First member is captain
      is_substitute: false,
      created_at: new Date().toISOString()
    }))

    const { error: teamMembersError } = await supabase
      .from('team_members')
      .insert(teamMembersToInsert)

    if (teamMembersError) {
      console.error('Team members error:', teamMembersError)
      // Rollback everything
      await supabase.from('team_members').delete().eq('team_id', team.id)
      await supabase.from('team_registration_members').delete().eq('team_registration_id', registration.id)
      await supabase.from('teams').delete().eq('id', team.id)
      await supabase.from('team_registrations').delete().eq('id', registration.id)
      return NextResponse.json(
        { error: 'Failed to create team members' },
        { status: 500 }
      )
    }

    // Update user profile if needed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        department: validatedData.department,
        semester: validatedData.semester,
        gender: validatedData.gender === 'mixed' ? null : validatedData.gender,
        contact_number: validatedData.captainContact,
        registration_completed: true
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Don't fail the registration if profile update fails
    }

    return NextResponse.json(
      {
        message: 'Team registration submitted successfully',
        registration: registration
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Team registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const sportId = url.searchParams.get('sportId')

    let query = supabase
      .from('team_registrations')
      .select(`
        *,
        sports:sport_id (
          id,
          name,
          icon
        ),
        team_registration_members (
          id,
          member_name,
          member_order,
          is_captain,
          is_substitute
        )
      `)
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false })

    if (sportId) {
      query = query.eq('sport_id', sportId)
    }

    const { data: registrations, error } = await query

    if (error) {
      console.error('Fetch team registrations error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team registrations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      registrations: registrations || []
    })

  } catch (error) {
    console.error('Get team registrations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}