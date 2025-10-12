import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        sport:sports(*),
        winner:teams!tournaments_winner_id_fkey(*),
        tournament_teams(
          *,
          team:teams(*)
        ),
        tournament_rounds(
          *,
          tournament_matches(
            *,
            team_a:teams!tournament_matches_team_a_id_fkey(*),
            team_b:teams!tournament_matches_team_b_id_fkey(*)
          )
        )
      `)
      .eq('id', params.id)
      .eq('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching tournament:', error)
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json({ data: tournament })
  } catch (error) {
    console.error('Error in GET /api/admin/tournaments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      sport_id, 
      tournament_type, 
      start_date, 
      end_date, 
      status,
      winner_id
    } = body

    // Validate required fields
    if (!name || !sport_id || !tournament_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, sport_id, tournament_type' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .update({
        name,
        description: description || null,
        sport_id,
        tournament_type,
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || 'draft',
        winner_id: winner_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('deleted_at', null)
      .select(`
        *,
        sport:sports(*),
        winner:teams!tournaments_winner_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error updating tournament:', error)
      return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: tournament,
      message: 'Tournament updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/tournaments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Use the soft delete function
    const { data, error } = await supabase
      .rpc('soft_delete_tournament', { tournament_id: params.id })

    if (error) {
      console.error('Error soft deleting tournament:', error)
      return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Tournament deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/tournaments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
