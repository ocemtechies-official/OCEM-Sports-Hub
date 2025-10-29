import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before using them
    const { id } = await params

    const supabase = await getSupabaseServerClient()
    
    // Get tournament teams with team details
    const { data: tournamentTeams, error } = await supabase
      .from('tournament_teams')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('tournament_id', id)
      .order('seed', { ascending: true })

    if (error) {
      console.error('Error fetching tournament teams:', error)
      return NextResponse.json({ error: 'Failed to fetch tournament teams' }, { status: 500 })
    }

    return NextResponse.json({ data: tournamentTeams })
  } catch (error) {
    console.error('Error in GET /api/admin/tournaments/[id]/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { teamIds } = body

    if (!teamIds || !Array.isArray(teamIds)) {
      return NextResponse.json({ error: 'teamIds array is required' }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Await params before using them
    const { id } = await params
    
    // First, remove all existing tournament teams
    const { error: deleteError } = await supabase
      .from('tournament_teams')
      .delete()
      .eq('tournament_id', id)

    if (deleteError) {
      console.error('Error deleting existing tournament teams:', deleteError)
      return NextResponse.json({ error: 'Failed to update tournament teams' }, { status: 500 })
    }

    // Then, add the new teams
    if (teamIds.length > 0) {
      const tournamentTeams = teamIds.map((teamId: string, index: number) => ({
        tournament_id: id,
        team_id: teamId,
        seed: index + 1
      }))

      const { error: insertError } = await supabase
        .from('tournament_teams')
        .insert(tournamentTeams)

      if (insertError) {
        console.error('Error inserting tournament teams:', insertError)
        return NextResponse.json({ error: 'Failed to update tournament teams' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: 'Tournament teams updated successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/admin/tournaments/[id]/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}