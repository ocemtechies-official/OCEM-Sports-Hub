import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { teams } = body

    if (!teams || !Array.isArray(teams)) {
      return NextResponse.json(
        { error: 'Invalid teams data' },
        { status: 400 }
      )
    }

    // Get tournament first to validate max_teams
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('max_teams')
      .eq('id', params.id)
      .single()

    if (tournamentError) throw tournamentError

    if (teams.length > tournament.max_teams) {
      return NextResponse.json(
        { error: `Maximum ${tournament.max_teams} teams allowed` },
        { status: 400 }
      )
    }

    // Insert teams with seeding
    const { data: tournamentTeams, error } = await supabase
      .from('tournament_teams')
      .insert(
        teams.map((teamId: string, index: number) => ({
          tournament_id: params.id,
          team_id: teamId,
          seed: index + 1,
          bracket_position: index + 1
        }))
      )
      .select()

    if (error) throw error

    return NextResponse.json({ tournamentTeams })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: tournamentTeams, error } = await supabase
      .from('tournament_teams')
      .select(`
        *,
        team:teams(
          id,
          name,
          logo_url
        )
      `)
      .eq('tournament_id', params.id)
      .order('seed')

    if (error) throw error

    return NextResponse.json({ tournamentTeams })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}