import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fixtureId, teamAId, teamBId } = body

    // Validate input
    if (!fixtureId || !teamAId || !teamBId) {
      return NextResponse.json({ 
        error: 'Missing required fields: fixtureId, teamAId, teamBId' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Update the fixture with new team pairings
    const { error: updateError } = await supabase
      .from('fixtures')
      .update({
        team_a_id: teamAId,
        team_b_id: teamBId,
        updated_at: new Date().toISOString()
      })
      .eq('id', fixtureId)
      .eq('tournament_id', params.id)

    if (updateError) {
      console.error('Error updating fixture:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update fixture',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Fixture updated successfully'
    })

  } catch (error) {
    console.error('Error in PUT /api/admin/tournaments/[id]/fixtures/update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}