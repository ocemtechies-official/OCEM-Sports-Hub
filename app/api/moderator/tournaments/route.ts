import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: tournaments } = await supabase
      .from('tournaments')
      .select(`
        *,
        sport:sports(id, name, icon),
        tournament_teams(count),
        tournament_rounds(
          id,
          round_name,
          total_matches,
          completed_matches
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    return NextResponse.json({ tournaments })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { name, description, sportId, tournamentType, maxTeams } = body

    // Validate required fields
    if (!name || !sportId || !tournamentType || !maxTeams) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create tournament
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        description,
        sport_id: sportId,
        tournament_type: tournamentType,
        max_teams: maxTeams,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ tournament })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}