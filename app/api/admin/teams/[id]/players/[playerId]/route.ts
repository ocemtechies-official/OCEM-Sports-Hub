import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; playerId: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Verify the player belongs to this team
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, team_id')
      .eq('id', params.playerId)
      .eq('team_id', params.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found in this team' }, { status: 404 })
    }

    // Remove the player from the team
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', params.playerId)

    if (error) {
      console.error('Error removing player from team:', error)
      return NextResponse.json({ error: 'Failed to remove player from team' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Player removed from team successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/teams/[id]/players/[playerId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
