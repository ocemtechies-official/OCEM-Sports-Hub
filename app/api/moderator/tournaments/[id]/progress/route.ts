import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get tournament details first
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', params.id)
      .single()

    if (tournamentError) throw tournamentError

    // Call the bracket generation function
    const { error: bracketError } = await supabase
      .rpc('generate_tournament_bracket', {
        tournament_id: params.id
      })

    if (bracketError) throw bracketError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}