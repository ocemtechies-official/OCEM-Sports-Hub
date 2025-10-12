import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    const { data: fixture, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        sport:sports(*),
        team_a:teams!fixtures_team_a_id_fkey(*),
        team_b:teams!fixtures_team_b_id_fkey(*)
      `)
      .eq('id', params.id)
      .eq('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching fixture:', error)
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 })
    }

    return NextResponse.json({ data: fixture })
  } catch (error) {
    console.error('Error in GET /api/admin/fixtures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const { 
      sport_id, 
      team_a_id, 
      team_b_id, 
      scheduled_at, 
      venue, 
      status,
      team_a_score,
      team_b_score
    } = body

    // Validate required fields
    if (!sport_id || !team_a_id || !team_b_id || !scheduled_at) {
      return NextResponse.json({ 
        error: 'Missing required fields: sport_id, team_a_id, team_b_id, scheduled_at' 
      }, { status: 400 })
    }

    // Validate that teams are different
    if (team_a_id === team_b_id) {
      return NextResponse.json({ 
        error: 'Team A and Team B must be different' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    const { data: fixture, error } = await supabase
      .from('fixtures')
      .update({
        sport_id,
        team_a_id,
        team_b_id,
        scheduled_at,
        venue: venue || null,
        status: status || 'scheduled',
        team_a_score: team_a_score || 0,
        team_b_score: team_b_score || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('deleted_at', null)
      .select(`
        *,
        sport:sports(*),
        team_a:teams!fixtures_team_a_id_fkey(*),
        team_b:teams!fixtures_team_b_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error updating fixture:', error)
      return NextResponse.json({ error: 'Failed to update fixture' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: fixture,
      message: 'Fixture updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/fixtures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Use the soft delete function
    const { data, error } = await supabase
      .rpc('soft_delete_fixture', { fixture_id: params.id })

    if (error) {
      console.error('Error soft deleting fixture:', error)
      return NextResponse.json({ error: 'Failed to delete fixture' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Fixture deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/fixtures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
