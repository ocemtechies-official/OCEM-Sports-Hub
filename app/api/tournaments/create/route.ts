import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    
    const {
      name,
      description,
      sport_id,
      tournament_type,
      max_teams,
      start_date,
      selected_teams
    } = body

    // Validate required fields
    if (!name || !sport_id || !selected_teams || selected_teams.length < 2) {
      return NextResponse.json(
        { error: 'Missing required fields or insufficient teams' },
        { status: 400 }
      )
    }

    // Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name,
        description,
        sport_id,
        tournament_type,
        max_teams,
        start_date: start_date || null,
        status: 'draft'
      })
      .select()
      .single()

    if (tournamentError) {
      console.error('Tournament creation error:', tournamentError)
      return NextResponse.json(
        { error: 'Failed to create tournament' },
        { status: 500 }
      )
    }

    // Add teams to tournament with seeding
    const tournamentTeams = selected_teams.map((teamId: string, index: number) => ({
      tournament_id: tournament.id,
      team_id: teamId,
      seed: index + 1,
      bracket_position: index + 1
    }))

    const { error: teamsError } = await supabase
      .from('tournament_teams')
      .insert(tournamentTeams)

    if (teamsError) {
      console.error('Tournament teams error:', teamsError)
      // Clean up tournament if team insertion fails
      await supabase.from('tournaments').delete().eq('id', tournament.id)
      return NextResponse.json(
        { error: 'Failed to add teams to tournament' },
        { status: 500 }
      )
    }

    // Create tournament rounds based on type and number of teams
    const rounds = createTournamentRounds(selected_teams.length, tournament_type)
    
    const tournamentRounds = rounds.map((round, index) => ({
      tournament_id: tournament.id,
      round_number: index + 1,
      round_name: round.name,
      total_matches: round.matches,
      status: 'pending'
    }))

    const { error: roundsError } = await supabase
      .from('tournament_rounds')
      .insert(tournamentRounds)

    if (roundsError) {
      console.error('Tournament rounds error:', roundsError)
      return NextResponse.json(
        { error: 'Failed to create tournament rounds' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      tournament: tournament 
    })

  } catch (error) {
    console.error('Tournament creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createTournamentRounds(numTeams: number, tournamentType: string) {
  const rounds = []
  
  if (tournamentType === 'single_elimination') {
    let remainingTeams = numTeams
    let roundNumber = 1
    
    while (remainingTeams > 1) {
      const matches = Math.ceil(remainingTeams / 2)
      
      let roundName = ''
      if (remainingTeams === 2) {
        roundName = 'Final'
      } else if (remainingTeams === 4) {
        roundName = 'Semi-finals'
      } else if (remainingTeams === 8) {
        roundName = 'Quarter-finals'
      } else if (remainingTeams === 16) {
        roundName = 'Round of 16'
      } else {
        roundName = `Round ${roundNumber}`
      }
      
      rounds.push({
        name: roundName,
        matches: matches
      })
      
      remainingTeams = matches
      roundNumber++
    }
  }
  
  return rounds
}