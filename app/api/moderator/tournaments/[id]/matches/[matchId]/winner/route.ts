import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { winnerId } = body

    // Validate required fields
    if (!winnerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Start a transaction to update match and handle progression
    const { data: fixture, error: fixtureError } = await supabase
      .from('fixtures')
      .update({ 
        winner_id: winnerId,
        status: 'completed'
      })
      .eq('id', params.matchId)
      .select(`
        *,
        tournament:tournaments!inner(
          id,
          tournament_type,
          status
        ),
        tournament_round:tournament_rounds!inner(
          id,
          round_number,
          total_matches,
          completed_matches
        )
      `)
      .single()

    if (fixtureError) throw fixtureError

    // Update completed_matches count in tournament_rounds
    const { error: roundError } = await supabase
      .from('tournament_rounds')
      .update({ 
        completed_matches: fixture.tournament_round.completed_matches + 1,
        status: fixture.tournament_round.completed_matches + 1 === fixture.tournament_round.total_matches ? 'completed' : 'active'
      })
      .eq('id', fixture.tournament_round_id)

    if (roundError) throw roundError

    // If this was a final match, update tournament status
    if (fixture.tournament_round.round_number === 
        (fixture.tournament.tournament_type === 'single_elimination' ? 3 : // Final is round 3 in single elim
         fixture.tournament.tournament_type === 'double_elimination' ? 4 : // Final is round 4 in double elim
         null) && // No automatic completion for round robin
        fixture.tournament_round.completed_matches + 1 === fixture.tournament_round.total_matches) {
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({ 
          status: 'completed',
          winner_id: winnerId
        })
        .eq('id', fixture.tournament_id)

      if (tournamentError) throw tournamentError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}