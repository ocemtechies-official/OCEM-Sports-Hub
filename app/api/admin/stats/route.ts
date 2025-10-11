import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Fetch real-time stats
    const [
      { count: totalUsers },
      { count: liveFixtures },
      { count: pendingRegistrations },
      { count: activeTournaments },
      { count: totalQuizzes },
      { count: totalTeams }
    ] = await Promise.all([
      // Total active users
      supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('deleted_at', null),
      
      // Live fixtures
      supabase.from('fixtures')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'live')
        .eq('deleted_at', null),
      
      // Pending registrations (assuming we have a registrations table)
      supabase.from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      // Active tournaments
      supabase.from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('deleted_at', null),
      
      // Total quizzes
      supabase.from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('deleted_at', null),
      
      // Total teams
      supabase.from('teams')
        .select('*', { count: 'exact', head: true })
    ])

    const stats = {
      activeUsers: totalUsers || 0,
      liveFixtures: liveFixtures || 0,
      pendingRegistrations: pendingRegistrations || 0,
      activeTournaments: activeTournaments || 0,
      totalQuizzes: totalQuizzes || 0,
      totalTeams: totalTeams || 0,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
