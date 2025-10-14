import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireModerator } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || 20)
    const offset = Number(searchParams.get('offset') || 0)

    const { data, error } = await supabase
      .from('match_updates')
      .select('*')
      .eq('fixture_id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const { user, isModerator } = await requireModerator()
    if (!user || !isModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { note, type, media_url, player_id } = body

    if (!type && !note) {
      return NextResponse.json({ error: 'Missing incident content' }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
      .from('match_updates')
      .insert({
        fixture_id: params.id,
        update_type: 'incident',
        note,
        media_url: media_url || null,
        player_id: player_id || null,
        created_by: user.id,
      })

    if (error) {
      console.error('Insert incident failed:', error)
      return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Incidents POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



