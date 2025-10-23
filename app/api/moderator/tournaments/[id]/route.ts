import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        sport:sports(id, name, icon),
        tournament_teams(
          id,
          seed,
          bracket_position,
          team:teams(id, name, logo_url)
        ),
        tournament_rounds(
          id,
          round_number,
          round_name,
          total_matches,
          completed_matches,
          status,
          fixtures:fixtures(
            id,
            team_a_id,
            team_b_id,
            team_a_score,
            team_b_score,
            status,
            winner_id,
            bracket_position,
            team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
            team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url)
          )
        )
      `)
      .eq('id', params.id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tournament data' },
        { status: 500 }
      )
    }

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tournament })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { status } = body

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update tournament
    // Verify tournament exists first
    const { data: existingTournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingTournament) {
      console.error('Tournament not found:', params.id)
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Update tournament
    const { data: tournament, error: updateError } = await supabase
      .from('tournaments')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tournament status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tournament })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()

    // Soft delete by setting deleted_at
    // Verify tournament exists first
    const { data: existingTournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingTournament) {
      console.error('Tournament not found:', params.id)
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('tournaments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete tournament' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}