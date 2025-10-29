import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Await params before using them
    const { id } = await params
    
    // Update all fixtures for this tournament with the new status
    const { error } = await supabase
      .from('fixtures')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', id)

    if (error) {
      console.error('Error updating fixture status:', error)
      return NextResponse.json({ error: 'Failed to update fixture status' }, { status: 500 })
    }

    // Get count of affected fixtures
    const { count, error: countError } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', id)
      .eq('status', status)

    const updatedCount = countError ? 0 : count || 0

    return NextResponse.json({ 
      success: true,
      message: `Successfully updated ${updatedCount} fixtures to ${status} status`
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/tournaments/[id]/fixtures/status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}