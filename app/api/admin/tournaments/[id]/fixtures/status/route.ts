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
    
    // Check if fixtures exist for this tournament
    const { data: existingFixtures, error: checkError } = await supabase
      .from('fixtures')
      .select('id')
      .eq('tournament_id', params.id)
      .is('deleted_at', null)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing fixtures:', checkError)
      return NextResponse.json({ error: 'Failed to check existing fixtures' }, { status: 500 })
    }

    return NextResponse.json({ 
      hasFixtures: existingFixtures && existingFixtures.length > 0
    })

  } catch (error) {
    console.error('Error in GET /api/admin/tournaments/[id]/fixtures/status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}