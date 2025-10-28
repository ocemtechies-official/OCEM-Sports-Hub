import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Delete all fixtures for this tournament
    const { error: deleteFixturesError } = await supabase
      .from('fixtures')
      .update({ deleted_at: new Date().toISOString() })
      .eq('tournament_id', params.id)
      .is('deleted_at', null)

    if (deleteFixturesError) {
      console.error('Error deleting fixtures:', deleteFixturesError)
      return NextResponse.json({ error: 'Failed to reset bracket' }, { status: 500 })
    }

    // Reset tournament status to draft
    const { error: updateTournamentError } = await supabase
      .from('tournaments')
      .update({ 
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateTournamentError) {
      console.error('Error updating tournament:', updateTournamentError)
      return NextResponse.json({ error: 'Failed to reset tournament status' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Bracket reset successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/admin/tournaments/[id]/reset-bracket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}