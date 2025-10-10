import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { z } from 'zod'

const updateRegistrationSchema = z.object({
  status: z.enum(['approved', 'rejected', 'withdrawn']),
  adminNotes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const registrationId = params.id
    const url = new URL(request.url)
    const type = url.searchParams.get('type') // 'individual' or 'team'

    if (!type || !['individual', 'team'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid registration type' },
        { status: 400 }
      )
    }

    let registration
    let error

    if (type === 'individual') {
      const result = await supabase
        .from('individual_registrations')
        .select(`
          *,
          sports:sport_id (
            id,
            name,
            icon
          )
        `)
        .eq('id', registrationId)
        .single()
      
      registration = result.data
      error = result.error
    } else {
      const result = await supabase
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
        .eq('id', registrationId)
        .single()
      
      registration = result.data
      error = result.error
    }

    if (error || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Check if user owns this registration or is admin
    const userIsAdmin = await isAdmin()
    if (registration.user_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      registration: registration
    })

  } catch (error) {
    console.error('Get registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const registrationId = params.id
    const body = await request.json()
    const validatedData = updateRegistrationSchema.parse(body)

    const url = new URL(request.url)
    const type = url.searchParams.get('type') // 'individual' or 'team'

    if (!type || !['individual', 'team'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid registration type' },
        { status: 400 }
      )
    }

    // Check if user is admin for approval/rejection
    const userIsAdmin = await isAdmin()
    if (['approved', 'rejected'].includes(validatedData.status) && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Admin access required for approval/rejection' },
        { status: 403 }
      )
    }

    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString()
    }

    // Set admin fields for approval/rejection
    if (validatedData.status === 'approved') {
      updateData.approved_at = new Date().toISOString()
      updateData.approved_by = user.id
      if (validatedData.adminNotes) {
        updateData.admin_notes = validatedData.adminNotes
      }
    } else if (validatedData.status === 'rejected') {
      updateData.rejected_at = new Date().toISOString()
      updateData.rejected_by = user.id
      if (validatedData.adminNotes) {
        updateData.admin_notes = validatedData.adminNotes
      }
    }

    let updatedRegistration
    let error

    if (type === 'individual') {
      const result = await supabase
        .from('individual_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single()
      
      updatedRegistration = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('team_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single()
      
      updatedRegistration = result.data
      error = result.error
    }

    if (error) {
      console.error('Update registration error:', error)
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      )
    }

    // If team registration is approved, create official team
    if (type === 'team' && validatedData.status === 'approved' && updatedRegistration) {
      const { data: teamReg } = await supabase
        .from('team_registrations')
        .select(`
          *,
          team_registration_members (*)
        `)
        .eq('id', registrationId)
        .single()

      if (teamReg && !teamReg.official_team_id) {
        // Create official team
        const { data: officialTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            name: teamReg.team_name,
            color: '#3b82f6' // Default color
          })
          .select()
          .single()

        if (officialTeam && !teamError) {
          // Link official team to registration
          await supabase
            .from('team_registrations')
            .update({ official_team_id: officialTeam.id })
            .eq('id', registrationId)

          // Create players from team members
          const playersToInsert = teamReg.team_registration_members.map((member: any) => ({
            team_id: officialTeam.id,
            name: member.member_name,
            position: member.is_captain ? 'Captain' : 'Player'
          }))

          await supabase
            .from('players')
            .insert(playersToInsert)
        }
      }
    }

    return NextResponse.json({
      message: 'Registration updated successfully',
      registration: updatedRegistration
    })

  } catch (error) {
    console.error('Update registration error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const registrationId = params.id
    const url = new URL(request.url)
    const type = url.searchParams.get('type') // 'individual' or 'team'

    if (!type || !['individual', 'team'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid registration type' },
        { status: 400 }
      )
    }

    // Check if user owns this registration or is admin
    const userIsAdmin = await isAdmin()
    
    let registration
    if (type === 'individual') {
      const { data } = await supabase
        .from('individual_registrations')
        .select('user_id, status')
        .eq('id', registrationId)
        .single()
      registration = data
    } else {
      const { data } = await supabase
        .from('team_registrations')
        .select('user_id, status')
        .eq('id', registrationId)
        .single()
      registration = data
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (registration.user_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Only allow deletion of pending or withdrawn registrations
    if (!['pending', 'withdrawn'].includes(registration.status) && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Can only delete pending or withdrawn registrations' },
        { status: 400 }
      )
    }

    let error
    if (type === 'individual') {
      const result = await supabase
        .from('individual_registrations')
        .delete()
        .eq('id', registrationId)
      error = result.error
    } else {
      const result = await supabase
        .from('team_registrations')
        .delete()
        .eq('id', registrationId)
      error = result.error
    }

    if (error) {
      console.error('Delete registration error:', error)
      return NextResponse.json(
        { error: 'Failed to delete registration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Registration deleted successfully'
    })

  } catch (error) {
    console.error('Delete registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}