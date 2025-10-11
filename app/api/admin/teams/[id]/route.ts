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
    
    const { data: team, error } = await supabase
      .from('teams')
      .select('*, players(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching team:', error)
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json({ data: team })
  } catch (error) {
    console.error('Error in GET /api/admin/teams/[id]:', error)
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
    const { name, color, logo_url } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'Team name is required' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    const { data: team, error } = await supabase
      .from('teams')
      .update({
        name,
        color: color || '#3b82f6',
        logo_url: logo_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: team,
      message: 'Team updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/teams/[id]:', error)
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
    
    // Check if team is used in any fixtures
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id')
      .or(`team_a_id.eq.${params.id},team_b_id.eq.${params.id}`)
      .limit(1)

    if (fixturesError) {
      console.error('Error checking team usage:', fixturesError)
      return NextResponse.json({ error: 'Failed to check team usage' }, { status: 500 })
    }

    if (fixtures && fixtures.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete team that is used in fixtures. Please remove all fixtures first.' 
      }, { status: 400 })
    }

    // Hard delete the team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting team:', error)
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Team deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/teams/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
