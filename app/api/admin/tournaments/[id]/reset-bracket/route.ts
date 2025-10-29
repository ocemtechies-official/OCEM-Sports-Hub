import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Await params before using them
    const { id } = await params
    
    // First, delete all fixtures for this tournament
    const { error: fixturesError } = await supabase
      .from('fixtures')
      .delete()
      .eq('tournament_id', id)

    if (fixturesError) {
      console.error('Error deleting tournament fixtures:', fixturesError)
      return NextResponse.json({ error: 'Failed to reset tournament bracket' }, { status: 500 })
    }

    // Then, delete all tournament rounds
    const { error: roundsError } = await supabase
      .from('tournament_rounds')
      .delete()
      .eq('tournament_id', id)

    if (roundsError) {
      console.error('Error deleting tournament rounds:', roundsError)
      return NextResponse.json({ error: 'Failed to reset tournament bracket' }, { status: 500 })
    }

    // Reset the tournament status to draft
    const { error: tournamentError } = await supabase
      .from('tournaments')
      .update({ 
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (tournamentError) {
      console.error('Error updating tournament status:', tournamentError)
      return NextResponse.json({ error: 'Failed to reset tournament bracket' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Tournament bracket reset successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/tournaments/[id]/reset-bracket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}