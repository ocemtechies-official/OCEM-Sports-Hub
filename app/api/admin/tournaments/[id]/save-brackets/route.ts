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

    const body = await request.json()
    const { rounds } = body

    // Log the received data for debugging
    console.log('Received bracket data:', { rounds, tournamentId: id });

    if (!rounds || !Array.isArray(rounds)) {
      return NextResponse.json({ error: 'Invalid rounds data' }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Get tournament details - simplified query
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, sport_id, deleted_at')
      .eq('id', id) // Use awaited id
      .is('deleted_at', null)
      .single()

    if (tournamentError || !tournament) {
      console.error('Tournament not found error in save-brackets:', { tournamentError, tournament, id });
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Track created fixtures for response
    let createdFixturesCount = 0;
    let updatedFixturesCount = 0;

    console.log(`Starting to process ${rounds.length} rounds`);

    // Update each round with the fixture information
    for (const round of rounds) {
      console.log(`Processing round: ${round.id} with ${round.fixtures.length} fixtures`);
      for (const fixture of round.fixtures) {
        // Log each fixture for debugging
        console.log('Processing fixture:', fixture);
        
        // Skip fixtures without teams
        if (!fixture.teamA && !fixture.teamB) {
          console.log('Skipping fixture without teams');
          continue;
        }
        
        // For bracket management, we always create new fixtures with the provided data
        // This is because we're saving the bracket structure that was generated in the UI
        console.log('Creating/updating fixture:', fixture);
        
        // Check if this is an existing fixture (valid UUID) or a temporary one
        const isExistingFixture = fixture.id && !fixture.id.startsWith('temp-');
        
        if (isExistingFixture) {
          // Update existing fixture
          console.log('Updating existing fixture:', fixture.id);
          const { data: updateData, error: updateError } = await supabase
            .from('fixtures')
            .update({
              team_a_id: fixture.teamA?.id || null,
              team_b_id: fixture.teamB?.id || null,
              scheduled_at: fixture.scheduledAt ? new Date(fixture.scheduledAt).toISOString() : null,
              venue: fixture.venue || null,
              sport_id: tournament.sport_id,
              bracket_position: fixture.bracketPosition,
              updated_at: new Date().toISOString()
            })
            .eq('id', fixture.id)
            .eq('tournament_id', id) // Use awaited id
            .select()
          
          if (updateError) {
            console.error('Error updating fixture:', updateError)
          } else {
            updatedFixturesCount++;
            console.log('Successfully updated fixture:', updateData);
          }
        } else {
          // Create new fixture
          console.log('Creating new fixture');
          const { data: insertData, error: insertError } = await supabase
            .from('fixtures')
            .insert({
              tournament_id: id, // Use awaited id
              tournament_round_id: round.id,
              team_a_id: fixture.teamA?.id || null,
              team_b_id: fixture.teamB?.id || null,
              scheduled_at: fixture.scheduledAt ? new Date(fixture.scheduledAt).toISOString() : null,
              venue: fixture.venue || null,
              sport_id: tournament.sport_id,
              bracket_position: fixture.bracketPosition,
              status: 'scheduled'
            })
            .select()
          
          if (insertError) {
            console.error('Error creating fixture:', insertError)
          } else {
            createdFixturesCount++;
            console.log('Successfully created fixture:', insertData);
          }
        }
      }
    }

    console.log('Finished processing brackets:', { createdFixturesCount, updatedFixturesCount });

    return NextResponse.json({ 
      success: true,
      createdFixtures: createdFixturesCount,
      updatedFixtures: updatedFixturesCount,
      message: `Brackets saved successfully (${createdFixturesCount} created, ${updatedFixturesCount} updated)`
    })

  } catch (error) {
    console.error('Error in POST /api/admin/tournaments/[id]/save-brackets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}