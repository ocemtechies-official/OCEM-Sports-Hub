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
    
    // First, get the tournament with rounds
    const { data: tournament, error: tournamentError } = await supabase
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
          *
        )
      `)
      .eq('id', params.id)
      .is('deleted_at', null)
      .single()

    if (tournamentError) {
      console.error('Error fetching tournament:', tournamentError)
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // If we have rounds, get the fixtures for each round, filtering out deleted ones
    if (tournament.tournament_rounds && tournament.tournament_rounds.length > 0) {
      const roundIds = tournament.tournament_rounds.map((round: any) => round.id)
      
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          *,
          team_a:teams!fixtures_team_a_id_fkey(*),
          team_b:teams!fixtures_team_b_id_fkey(*)
        `)
        .in('tournament_round_id', roundIds)
        .is('deleted_at', null)
        .order('bracket_position', { ascending: true })

      if (!fixturesError) {
        // Group fixtures by round
        const fixturesByRound: { [key: string]: any[] } = {}
        fixtures.forEach((fixture: any) => {
          if (!fixturesByRound[fixture.tournament_round_id]) {
            fixturesByRound[fixture.tournament_round_id] = []
          }
          fixturesByRound[fixture.tournament_round_id].push(fixture)
        })

        // Attach fixtures to their respective rounds
        tournament.tournament_rounds = tournament.tournament_rounds.map((round: any) => ({
          ...round,
          fixtures: fixturesByRound[round.id] || []
        }))
      }
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
      .is('deleted_at', null) // Use .is() for proper null checking
      .select(`
        *,
        sport:sports(*),
        winner:teams!tournaments_winner_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error updating tournament:', error)
      return NextResponse.json({ 
        error: 'Failed to update tournament',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    // Check if tournament was actually updated (might have been deleted)
    if (!tournament) {
      return NextResponse.json({ 
        error: 'Tournament not found or has been deleted' 
      }, { status: 404 })
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