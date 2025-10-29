import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before using them
    const { id } = await params

    const supabase = await getSupabaseServerClient()
    
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        sport:sports(*),
        captain:profiles!teams_captain_id_fkey(*),
        team_players(
          *,
          player:profiles!team_players_player_id_fkey(*)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching team:', error)
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json({ data: team })
  } catch (error) {
    console.error('Error in GET /api/admin/teams/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, sport_id, description, is_active, captain_id } = body

    // Validate required fields
    if (!name || !sport_id) {
      return NextResponse.json({ 
        error: 'Team name and sport are required' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Await params before using them
    const { id } = await params
    
    const { data: team, error } = await supabase
      .from('teams')
      .update({
        name,
        sport_id,
        description: description || null,
        is_active: is_active !== undefined ? is_active : true,
        captain_id: captain_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select(`
        *,
        sport:sports(*),
        captain:profiles!teams_captain_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: team,
      message: 'Team updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/teams/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Await params before using them
    const { id } = await params
    
    // First, delete all team players
    const { error: playersError } = await supabase
      .from('team_players')
      .delete()
      .eq('team_id', id)

    if (playersError) {
      console.error('Error deleting team players:', playersError)
      return NextResponse.json({ error: 'Failed to delete team players' }, { status: 500 })
    }

    // Then, soft delete the team
    const { data, error } = await supabase
      .rpc('soft_delete_team', { team_id: id })

    if (error) {
      console.error('Error soft deleting team:', error)
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Team deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/teams/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}