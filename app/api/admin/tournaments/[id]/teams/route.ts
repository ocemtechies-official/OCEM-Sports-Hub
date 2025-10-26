import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

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
    const { teams } = body

    // Validate input
    if (!Array.isArray(teams)) {
      return NextResponse.json({ error: 'Invalid teams data' }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Get the tournament to verify it exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id')
      .eq('id', params.id)
      .eq('deleted_at', null)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Delete existing tournament teams
    const { error: deleteError } = await supabase
      .from('tournament_teams')
      .delete()
      .eq('tournament_id', params.id)

    if (deleteError) {
      console.error('Error deleting existing tournament teams:', deleteError)
      return NextResponse.json({ error: 'Failed to update tournament teams' }, { status: 500 })
    }

    // Insert new tournament teams if any provided
    if (teams.length > 0) {
      const tournamentTeamsData = teams.map((team: any, index: number) => ({
        tournament_id: params.id,
        team_id: team.id,
        seed: team.seed || index + 1,
        bracket_position: team.bracket_position || null
      }))

      const { error: insertError } = await supabase
        .from('tournament_teams')
        .insert(tournamentTeamsData)

      if (insertError) {
        console.error('Error inserting tournament teams:', insertError)
        return NextResponse.json({ error: 'Failed to update tournament teams' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: 'Tournament teams updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/tournaments/[id]/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}