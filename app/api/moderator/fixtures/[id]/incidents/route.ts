import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireModerator } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || 20)
    const offset = Number(searchParams.get('offset') || 0)

    const { data, error } = await supabase
      .from('match_updates')
      .select('*')
      .eq('fixture_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, isModerator } = await requireModerator()
    if (!user || !isModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { note, type, media_url, player_id } = body

    if (!type && !note) {
      return NextResponse.json({ error: 'Missing incident content' }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const { data, error, status } = await supabase
      .from('match_updates')
      .insert({
        fixture_id: id,
        update_type: 'incident',
        // Tag manual posts distinctly for UI styling
        change_type: 'manual',
        changed_by: user.id,
        note,
        media_url: media_url || null,
        player_id: player_id || null,
        created_by: user.id,
      })
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Insert incident failed:', error)
      // Surface common RLS/permission errors clearly
      const msg = error.message || 'Failed to create incident'
      const code = (status && status >= 400 && status < 600) ? status : 500
      return NextResponse.json({ error: msg }, { status: code })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Incidents POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



