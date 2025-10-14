import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireModerator } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isModerator } = await requireModerator()
    if (!user || !isModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.rpc('rpc_revert_last_fixture_update', {
      p_fixture: params.id,
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Undo failed' }, { status: 400 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



