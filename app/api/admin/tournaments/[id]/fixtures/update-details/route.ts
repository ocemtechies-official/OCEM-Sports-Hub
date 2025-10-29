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
    const { fixtureId, scheduledAt, venue, status } = body

    // Validate input
    if (!fixtureId) {
      return NextResponse.json({ 
        error: 'Missing required field: fixtureId' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Await params before using them
    const { id } = await params
    
    // Build update data object - only include fields that are provided
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Add optional fields if provided
    if (scheduledAt !== undefined) {
      updateData.scheduled_at = scheduledAt ? new Date(scheduledAt).toISOString() : null
    }
    
    if (venue !== undefined) {
      updateData.venue = venue || null
    }
    
    if (status !== undefined) {
      updateData.status = status || 'scheduled'
    }

    // Update the fixture with new details
    const { error: updateError } = await supabase
      .from('fixtures')
      .update(updateData)
      .eq('id', fixtureId)
      .eq('tournament_id', id)

    if (updateError) {
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}