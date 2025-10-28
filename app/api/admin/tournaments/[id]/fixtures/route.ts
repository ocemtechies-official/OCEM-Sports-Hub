import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

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
    
    // Get tournament details - simplified query to avoid join issues
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        tournament_type,
        start_date,
        status,
        sport_id,
        deleted_at
      `)
      .eq('id', id) // Use awaited id
      .is('deleted_at', null)
      .single()

    if (tournamentError || !tournament) {
      console.error('Tournament not found error in fixtures API:', { 
        tournamentError, 
        tournament, 
        id // Use awaited id
      });
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Get tournament rounds and fixtures separately to avoid complex joins
    const { data: tournamentRounds, error: roundsError } = await supabase
      .from('tournament_rounds')
      .select(`
        id,
        round_number,
        round_name,
        total_matches
      `)
      .eq('tournament_id', id) // Use awaited id
      .order('round_number')

    if (roundsError) {
      console.error('Error fetching tournament rounds:', roundsError)
      return NextResponse.json({ error: 'Failed to fetch tournament rounds' }, { status: 500 })
    }

    // Get fixtures for each round
    const roundFixturesPromises = tournamentRounds.map(async (round) => {
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          id,
          team_a_id,
          team_b_id,
          scheduled_at,
          venue,
          bracket_position,
          status
        `)
        .eq('tournament_round_id', round.id)
        .is('deleted_at', null)
      
      if (fixturesError) {
        console.error(`Error fetching fixtures for round ${round.id}:`, fixturesError)
        return { ...round, fixtures: [] }
      }
      
      return { ...round, fixtures }
    })

    const roundsWithFixtures = await Promise.all(roundFixturesPromises)

    let createdFixtures = 0

    // For single elimination tournaments, create fixtures based on seeding
    if (tournament.tournament_type === 'single_elimination') {
      // We'll use the existing fixtures from the tournament_rounds to create the actual fixtures
      for (const round of roundsWithFixtures) {
        for (const fixture of round.fixtures) {
          // Only process fixtures that have teams assigned
          if (fixture.team_a_id || fixture.team_b_id) {
            // Update the existing fixture to make it active
            const { data: updateData, error: fixtureError } = await supabase
              .from('fixtures')
              .update({
                team_a_id: fixture.team_a_id,
                team_b_id: fixture.team_b_id,
                scheduled_at: fixture.scheduled_at || (tournament.start_date || new Date().toISOString()),
                venue: fixture.venue || null,
                status: 'scheduled',
                sport_id: tournament.sport_id,
                updated_at: new Date().toISOString()
              })
              .eq('id', fixture.id)
              .eq('tournament_id', id) // Use awaited id
              .select()

            if (fixtureError) {
              console.error('Error updating fixture:', fixtureError)
            } else if (updateData && updateData.length > 0) {
              // Only count as created if the update actually affected a row
              createdFixtures++
              console.log('Successfully updated fixture:', updateData[0]);
            } else {
              console.log('No fixture was updated for ID:', fixture.id);
            }
          }
        }
      }
    } else {
      // For other tournament types, create placeholder fixtures for all rounds
      for (const round of roundsWithFixtures) {
        const matchesToCreate = round.total_matches
        
        for (let i = 0; i < matchesToCreate; i++) {
          const { data: insertData, error: fixtureError } = await supabase
            .from('fixtures')
            .insert({
              tournament_id: id, // Use awaited id
              tournament_round_id: round.id,
              sport_id: tournament.sport_id,
              status: 'scheduled',
              scheduled_at: tournament.start_date 
                ? new Date(new Date(tournament.start_date).getTime() + (round.round_number * 24 * 60 * 60 * 1000)).toISOString()
                : new Date(Date.now() + (round.round_number * 24 * 60 * 60 * 1000)).toISOString(),
              bracket_position: i + 1
            })
            .select()

          if (fixtureError) {
            console.error('Error creating fixture:', fixtureError)
          } else if (insertData && insertData.length > 0) {
            // Only count as created if the insert actually created a row
            createdFixtures++
            console.log('Successfully created fixture:', insertData[0]);
          } else {
            console.log('No fixture was created');
          }
        }
      }
    }

    // Update tournament status to active if we created fixtures
    if (createdFixtures > 0) {
      const { error: tournamentUpdateError } = await supabase
        .from('tournaments')
        .update({ status: 'active' })
        .eq('id', id) // Use awaited id
      
      if (tournamentUpdateError) {
        console.error('Error updating tournament status:', tournamentUpdateError);
      } else {
        console.log('Successfully updated tournament status to active');
      }
    }

    return NextResponse.json({ 
      success: true,
      createdFixtures,
      message: `Successfully created ${createdFixtures} fixtures`
    })

  } catch (error) {
    console.error('Error in POST /api/admin/tournaments/[id]/fixtures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}