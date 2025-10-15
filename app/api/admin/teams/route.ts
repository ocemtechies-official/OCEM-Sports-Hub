import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*, team_members(count)')
      .order('name')

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    return NextResponse.json({ data: teams })
  } catch (error) {
    console.error('Error in GET /api/admin/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
      .insert({
        name,
        color: color || '#3b82f6',
        logo_url: logo_url || null
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating team:', error)
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: team,
      message: 'Team created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/admin/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
