import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

// Define types for our data
interface TournamentTeam {
  id: string
  team_id: string
  seed: number
  team: {
    id: string
    name: string
  }
}

interface Tournament {
  id: string
  name: string
  tournament_type: string
  start_date: string
  deleted_at: string | null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Updated type
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before using them
    const { id } = await params

    const supabase = await getSupabaseServerClient()
    
    // Get tournament details - simplified query
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        tournament_type,
        start_date,
        sport_id,
        deleted_at
      `)
      .eq('id', id) // Use awaited id
      .is('deleted_at', null)
      .single()

    if (tournamentError || !tournament) {
      console.error('Tournament not found error in generate-bracket:', { tournamentError, tournament, id });
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Get tournament teams separately to avoid complex joins
    const { data: tournamentTeams, error: teamsError } = await supabase
      .from('tournament_teams')
      .select(`
        id,
        team_id,
        seed
      `)
      .eq('tournament_id', id) // Use awaited id

    if (teamsError) {
      console.error('Error fetching tournament teams:', teamsError)
      return NextResponse.json({ error: 'Failed to fetch tournament teams' }, { status: 500 })
    }

    // Get team details
    let tournamentTeamsWithDetails: TournamentTeam[] = []
    if (tournamentTeams && tournamentTeams.length > 0) {
      const teamIds = tournamentTeams.map(tt => tt.team_id)
      const { data: teams, error: teamDetailsError } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds)

      if (teamDetailsError) {
        console.error('Error fetching team details:', teamDetailsError)
        return NextResponse.json({ error: 'Failed to fetch team details' }, { status: 500 })
      }

      // Combine tournament teams with team details
      tournamentTeamsWithDetails = tournamentTeams.map(tt => {
        const team = teams?.find(t => t.id === tt.team_id)
        return {
          ...tt,
          team: team || { id: tt.team_id, name: 'Unknown Team' }
        }
      })
    }

    // For single elimination tournaments, create bracket structure
    if (tournament.tournament_type === 'single_elimination') {
      // Calculate number of rounds needed
      const numTeams = tournamentTeamsWithDetails.length
      const numRounds = Math.ceil(Math.log2(numTeams))
      const totalMatches = numTeams - 1 // For single elimination
      
      // Create rounds if they don't exist
      let rounds: any[] = []
      
      // Check if rounds already exist
      const { data: existingRounds, error: roundsError } = await supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', id) // Use awaited id
        .order('round_number')
      
      if (roundsError) {
        console.error('Error fetching existing rounds:', roundsError)
        return NextResponse.json({ error: 'Failed to fetch tournament rounds' }, { status: 500 })
      }
      
      if (existingRounds && existingRounds.length > 0) {
        rounds = existingRounds
      } else {
        // Create rounds
        for (let i = 1; i <= numRounds; i++) {
          let roundName = `Round ${i}`
          let matchesInRound = Math.pow(2, numRounds - i)
          
          // Special names for later rounds
          if (i === numRounds) roundName = "Final"
          else if (i === numRounds - 1) roundName = "Semi-finals"
          else if (i === numRounds - 2) roundName = "Quarter-finals"
          
          const { data: newRound, error: roundError } = await supabase
            .from('tournament_rounds')
            .insert({
              tournament_id: id, // Use awaited id
              round_number: i,
              round_name: roundName,
              total_matches: matchesInRound
            })
            .select()
            .single()
            
          if (roundError) {
            console.error('Error creating round:', roundError)
            return NextResponse.json({ error: 'Failed to create tournament round' }, { status: 500 })
          }
          
          rounds.push(newRound)
        }
        
        // Create placeholder fixtures for all rounds
        for (const round of rounds) {
          const matchesInRound = round.total_matches
          
          // Create fixtures for this round
          for (let i = 0; i < matchesInRound; i++) {
            const { error: fixtureError } = await supabase
              .from('fixtures')
              .insert({
                tournament_id: id, // Use awaited id
                tournament_round_id: round.id,
                sport_id: tournament.sport_id,
                status: 'scheduled',
                bracket_position: i + 1
              })
            
            if (fixtureError) {
              console.error('Error creating fixture:', fixtureError)
              // Continue creating other fixtures even if one fails
            }
          }
        }
      }
      
      // Sort teams by seed
      const seededTeams = tournamentTeamsWithDetails
        .sort((a: any, b: any) => (a.seed || 999) - (b.seed || 999))
      
      // Create local rounds structure for frontend
      const localRounds = rounds.map((round: any) => {
        const matchesInRound = round.total_matches
        const fixtures: Array<{
          id: string;
          teamA: { id: string; name: string } | null;
          teamB: { id: string; name: string } | null;
          scheduledAt: Date;
          venue: string;
          bracketPosition: number;
        }> = []
        
        // Create placeholder fixtures for this round
        for (let i = 0; i < matchesInRound; i++) {
          fixtures.push({
            id: `temp-${round.id}-${i}`,
            teamA: null,
            teamB: null,
            scheduledAt: tournament.start_date ? new Date(tournament.start_date) : new Date(),
            venue: "",
            bracketPosition: i + 1
          })
        }
        
        // For the first round, pair teams based on seeding
        if (round.round_number === 1) {
          const numTeams = seededTeams.length
          const matchesToCreate = Math.floor(numTeams / 2)
          
          for (let i = 0; i < matchesToCreate; i++) {
            const teamA = seededTeams[i]
            const teamB = seededTeams[numTeams - 1 - i]
            
            if (teamA && teamB && fixtures[i]) {
              fixtures[i] = {
                ...fixtures[i],
                teamA: { id: teamA.team_id, name: teamA.team.name },
                teamB: { id: teamB.team_id, name: teamB.team.name }
              }
            }
          }
        }
        // For semi-finals and finals, add placeholder teams
        else if (round.round_number > 1) {
          for (let i = 0; i < fixtures.length; i++) {
            fixtures[i] = {
              ...fixtures[i],
              teamA: { id: `placeholder-a-${round.id}-${i}`, name: "Team A (Winner of previous match)" },
              teamB: { id: `placeholder-b-${round.id}-${i}`, name: "Team B (Winner of previous match)" }
            }
          }
        }
        
        return {
          id: round.id,
          roundNumber: round.round_number,
          roundName: round.round_name,
          fixtures
        }
      })
      
      return NextResponse.json({ 
        success: true,
        localRounds,
        message: 'Bracket structure generated successfully'
      })
    } else {
      return NextResponse.json({ 
        error: 'Only single elimination tournaments are supported for bracket generation' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in POST /api/admin/tournaments/[id]/generate-bracket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}